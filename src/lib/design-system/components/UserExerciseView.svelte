<script lang="ts">
  import { onMount } from 'svelte';
  import {
    checkAndResetProgress,
    getUserStats,
    getWeeklyProgress
  } from '$firebase/services/statService';
  import { getCurrentProgram, updateProgram } from '$firebase/services/programService';
  import { completeExercise, skipExercise } from '$firebase/services/userexerciseService';
  import type { Program } from '$firebase/types/userType';
  import type { UserStats } from '$firebase/types/userType';
  import { authStore } from '$stores/authStore';
  import { writable } from 'svelte/store';
  import { goto } from '$app/navigation';

  let program = writable<Program | null>(null);
  let stats = writable<UserStats | null>(null);
  let weeklyProgress = writable<any>(null);
  let userId = '';
  let isLoading = writable(true);
  let error = writable<string | null>(null);

  let isBulkCompleteMode = false;
  let selectedExercises: Record<string, boolean> = {};
  let isSaving = false;

  $: hasIncompleteExercises =
    $program?.exercises?.some((ex) => !ex.completed && !ex.skipped) || false;
  $: hasStartedProgram = $program?.exercises?.some((ex) => ex.completed || ex.skipped) || false;
  $: programCompleted = $program?.completed || false;

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (store) => {
      if (!store.isLoading && store.currentUser) {
        userId = store.currentUser.uid;

        try {
          await checkAndResetProgress(userId);

          const [programData, statsData, weeklyData] = await Promise.all([
            getCurrentProgram(userId),
            getUserStats(userId),
            getWeeklyProgress(userId)
          ]);

          program.set(programData);
          stats.set(statsData);
          weeklyProgress.set(weeklyData);

          if (programData) {
            resetSelections();
          }
        } catch (err) {
          console.error('Error loading data:', err);
          error.set(err instanceof Error ? err.message : 'Failed to load program');
        } finally {
          isLoading.set(false);
        }
      }
    });

    return () => unsubscribe();
  });

  function formatDate(dateString: string | undefined): string {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  }

  function startProgram() {
    if (!$program?.exercises || $program.exercises.length === 0) {
      console.log('No exercises found');
      return;
    }

    const firstIncomplete = $program.exercises.find((ex) => !ex.completed && !ex.skipped);
    if (firstIncomplete) {
      goto(`/exploration/firebase-test/exercise-flow/${firstIncomplete.exerciseId}`);
    } else {
      goto('/exploration/firebase-test/program-complete');
    }
  }

  async function handleCompleteExercise(exerciseId: string) {
    try {
      isLoading.set(true);
      await completeExercise(userId, exerciseId);

      const [programData, statsData, weeklyData] = await Promise.all([
        getCurrentProgram(userId),
        getUserStats(userId),
        getWeeklyProgress(userId)
      ]);

      program.set(programData);
      stats.set(statsData);
      weeklyProgress.set(weeklyData);
    } catch (err) {
      console.error('Error completing exercise:', err);
      error.set(err instanceof Error ? err.message : 'Failed to complete exercise');
    } finally {
      isLoading.set(false);
    }
  }

  async function handleSkipExercise(exerciseId: string) {
    try {
      isLoading.set(true);
      await skipExercise(userId, exerciseId);

      // Refresh data
      const [programData, statsData, weeklyData] = await Promise.all([
        getCurrentProgram(userId),
        getUserStats(userId),
        getWeeklyProgress(userId)
      ]);

      program.set(programData);
      stats.set(statsData);
      weeklyProgress.set(weeklyData);
    } catch (err) {
      console.error('Error skipping exercise:', err);
      error.set(err instanceof Error ? err.message : 'Failed to skip exercise');
    } finally {
      isLoading.set(false);
    }
  }

  async function handleMoveExercise(exerciseId: string, direction: 'up' | 'down') {
    if (!$program) return;

    let exercises = [...$program.exercises];
    const index = exercises.findIndex((ex) => ex.exerciseId === exerciseId);

    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < exercises.length - 1)
    ) {
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [exercises[index], exercises[swapIndex]] = [exercises[swapIndex], exercises[index]];

      const updatedExercises = exercises.map((ex, i) => ({
        ...ex,
        order: i
      }));

      try {
        isLoading.set(true);
        await updateProgram(userId, { exercises: updatedExercises });

        const programData = await getCurrentProgram(userId);
        program.set(programData);
      } catch (err) {
        console.error('Error updating exercise order:', err);
        error.set(err instanceof Error ? err.message : 'Error updating exercise order');
      } finally {
        isLoading.set(false);
      }
    }
  }

  function toggleBulkCompleteMode() {
    isBulkCompleteMode = !isBulkCompleteMode;
    if (!isBulkCompleteMode) {
      resetSelections();
    }
  }

  function resetSelections() {
    if (!$program) return;

    selectedExercises = {};
    $program.exercises.forEach((ex) => {
      if (!ex.completed && !ex.skipped) {
        selectedExercises[ex.exerciseId] = false;
      }
    });
  }

  function handleCheckboxChange(exerciseId: string, checked: boolean) {
    selectedExercises[exerciseId] = checked;
  }

  function getCheckedValue(event: Event): boolean {
    return (event.currentTarget as HTMLInputElement).checked;
  }

  async function saveBulkCompletions() {
    if (!$program) return;

    try {
      isSaving = true;

      const promises = Object.entries(selectedExercises)
        .filter(([_, isSelected]) => isSelected)
        .map(([exerciseId, _]) => {
          const exercise = $program?.exercises.find((ex) => ex.exerciseId === exerciseId);
          if (!exercise) return null;

          const adjustedValues = {
            sets: exercise.sets || 0,
            reps: exercise.reps || 0,
            steps: exercise.steps || 0,
            seconds: exercise.seconds || 0,
            weight: exercise.weight || 0
          };

          return completeExercise(userId, exerciseId, adjustedValues);
        })
        .filter(Boolean);

      await Promise.all(promises);

      const [programData, statsData, weeklyData] = await Promise.all([
        getCurrentProgram(userId),
        getUserStats(userId),
        getWeeklyProgress(userId)
      ]);

      program.set(programData);
      stats.set(statsData);
      weeklyProgress.set(weeklyData);

      isBulkCompleteMode = false;
      resetSelections();

      if (programData?.exercises.every((ex) => ex.completed || ex.skipped)) {
        goto('/exploration/firebase-test/program-complete');
      }
    } catch (err) {
      console.error('Error saving bulk completions:', err);
      error.set(err instanceof Error ? err.message : 'Failed to mark exercises as complete');
    } finally {
      isSaving = false;
    }
  }

  function getExerciseDetails(exercise: any): string {
    if (exercise.exerciseType === 'distance') {
      return `${exercise.sets || 0} sets of ${exercise.steps || 0} steps`;
    } else if (exercise.exerciseType === 'weight') {
      return `${exercise.sets || 0} sets of ${exercise.reps || 0} reps at ${exercise.weight || 0}lbs`;
    } else {
      return `${exercise.reps || 0} times, ${exercise.seconds || 0} seconds each`;
    }
  }
</script>

<!-- UI -->
<div class="exercise-view-container">
  <h2>Your Program</h2>
  {#if $isLoading}
    <p>Loading program...</p>
  {:else if $error}
    <p class="error">{$error}</p>
  {:else if $program}
    <div class="program-info">
      <p>Estimated time: {$program.estimatedTime} minutes</p>
      <p>Assigned: {formatDate($program.assignedAt)}</p>
    </div>
    {#if $weeklyProgress}
      <div class="weekly-progress">
        <h3>Weekly Progress</h3>
        <div class="progress-bar">
          <div
            class="progress-fill"
            style="width: {(($weeklyProgress?.daysCompleted ?? 0) / 5) * 100}%"
          ></div>
        </div>
        <p>
          {$weeklyProgress?.daysCompleted ?? 0}/5 days completed this week
        </p>
        <p>
          Days needed for streak: {$weeklyProgress?.daysNeededForStreak ?? 'N/A'}
        </p>
      </div>
    {/if}
    <div class="program-actions">
      {#if hasIncompleteExercises}
        {#if isBulkCompleteMode}
          <button
            class="bulk-action-btn save"
            on:click={saveBulkCompletions}
            disabled={isSaving || Object.values(selectedExercises).every((v) => !v)}
          >
            {isSaving ? 'Saving...' : 'Save Completions'}
          </button>
          <button
            class="bulk-action-btn cancel"
            on:click={toggleBulkCompleteMode}
            disabled={isSaving}
          >
            Cancel
          </button>
        {:else}
          <div class="action-row">
            <button class="start-program-btn" on:click={startProgram}>
              {hasStartedProgram ? 'Continue Program' : "Start Today's Program"}
            </button>
            <button class="bulk-mode-btn" on:click={toggleBulkCompleteMode}>
              Mark them complete here
            </button>
          </div>
        {/if}
      {:else if programCompleted}
        <div class="program-complete-message">
          <p>You've completed all exercises for today!</p>
          <button
            class="view-summary-btn"
            on:click={() => goto('/exploration/firebase-test/program-complete')}
          >
            View Summary
          </button>
        </div>
      {/if}
    </div>
    {#if $program.exercises.length > 0}
      <div class="exercise-list-section">
        <h3>Exercises</h3>
        <div class="exercise-list">
          {#each $program.exercises as exercise, i (exercise.exerciseId)}
            <div
              class="exercise-card {exercise.completed ? 'completed' : ''} {exercise.skipped
                ? 'skipped'
                : ''}"
            >
              {#if isBulkCompleteMode && !exercise.completed && !exercise.skipped}
                <div class="checkbox-container">
                  <input
                    type="checkbox"
                    bind:checked={selectedExercises[exercise.exerciseId]}
                    on:change={(e) => handleCheckboxChange(exercise.exerciseId, getCheckedValue(e))}
                  />
                </div>
              {/if}
              <div class="exercise-info">
                <h4>{exercise.exerciseName}</h4>
                <p>{getExerciseDetails(exercise)}</p>
                {#if exercise.equipment}
                  <small>Equipment: {exercise.equipment}</small>
                {/if}
              </div>
              <div class="exercise-status">
                {#if exercise.completed}
                  <span class="status completed"
                    >✓ Completed {formatDate(exercise.completedAt)}</span
                  >
                {:else if exercise.skipped}
                  <span class="status skipped">Skipped</span>
                {:else if !isBulkCompleteMode}
                  <div class="exercise-actions">
                    <button
                      class="complete-btn"
                      on:click={() =>
                        goto(`/exploration/firebase-test/exercise-flow/${exercise.exerciseId}`)}
                    >
                      Start
                    </button>
                    <button
                      class="order-btn"
                      on:click={() => handleMoveExercise(exercise.exerciseId, 'up')}
                      disabled={i === 0}
                    >
                      ↑
                    </button>
                    <button
                      class="order-btn"
                      on:click={() => handleMoveExercise(exercise.exerciseId, 'down')}
                      disabled={i === $program.exercises.length - 1}
                    >
                      ↓
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <p>No exercises assigned yet.</p>
    {/if}
  {:else}
    <p>No program found.</p>
  {/if}
</div>

<style>
  .exercise-view-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  .program-info {
    margin-bottom: 1rem;
  }

  .weekly-progress {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    margin: 0.5rem 0;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s ease;
  }

  .program-actions {
    margin-bottom: 1.5rem;
  }

  .action-row {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .start-program-btn {
    padding: 0.75rem 1.5rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }

  .bulk-mode-btn {
    padding: 0.5rem 1rem;
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .bulk-action-btn {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    font-size: 1rem;
    margin-right: 0.5rem;
  }

  .bulk-action-btn.save {
    background-color: #3b82f6;
    color: white;
  }

  .bulk-action-btn.cancel {
    background-color: #ef4444;
    color: white;
  }

  .program-complete-message {
    text-align: center;
    padding: 1rem;
    background-color: #ecfdf5;
    border-radius: 0.25rem;
  }

  .view-summary-btn {
    padding: 0.75rem 1.5rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  .exercise-list-section {
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .exercise-list {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .exercise-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.5rem;
  }

  .checkbox-container {
    margin-right: 1rem;
  }

  .checkbox-container input[type='checkbox'] {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
  }

  .exercise-card.completed {
    background: #ecfdf5;
  }

  .exercise-card.skipped {
    background: #fef2f2;
  }

  .exercise-info h4 {
    margin: 0 0 0.25rem 0;
  }

  .exercise-info p {
    margin: 0;
    color: #6b7280;
  }

  .exercise-info small {
    color: #9ca3af;
  }

  .exercise-status {
    display: flex;
  }

  .status {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }

  .status.completed {
    background: #d1fae5;
    color: #047857;
  }

  .status.skipped {
    background: #fee2e2;
    color: #b91c1c;
  }

  .exercise-actions {
    display: flex;
    gap: 0.5rem;
  }

  .complete-btn,
  .order-btn {
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .complete-btn {
    background: #3b82f6;
    color: white;
  }

  .order-btn {
    background: #e5e7eb;
    color: #374151;
  }

  .order-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    color: #ef4444;
  }
</style>
