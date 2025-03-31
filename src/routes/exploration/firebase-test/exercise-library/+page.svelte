<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getAllExercisesFromLibrary,
    isDistanceExercise,
    isWeightExercise,
    isTimeExercise,
  } from '$firebase/services/exerciseService';
  import type { Exercise } from '$firebase/types/exerciseType';

  let exercises: Exercise[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      console.log('Fetching exercises...');
      exercises = await getAllExercisesFromLibrary();
      console.log('Fetched exercises:', exercises);
      loading = false;
    } catch (err) {
      console.error('Error fetching exercises:', err);
      error = 'Error loading exercises';
      loading = false;
    }
  });

  function getExerciseDetails(exercise: Exercise): string {
    if (isDistanceExercise(exercise)) {
      return `${exercise.defaultSets || 0} sets of ${exercise.defaultSteps || 0} steps`;
    } else if (isWeightExercise(exercise)) {
      return `${exercise.defaultSets || 0} sets of ${exercise.defaultReps || 0} reps at ${exercise.defaultWeight || 0}lbs`;
    } else if (isTimeExercise(exercise)) {
      return `${exercise.defaultSets || 0} set of ${exercise.defaultReps || 0} reps, holding for ${exercise.defaultSeconds || 0} seconds`;
    }
    return '';
  }
</script>

<h1>Exercise Library</h1>
<h2>(For Dev to see that Exercises are being properly populated and retrieved from database)</h2>
{#if loading}
  <p>Loading exercises...</p>
{:else if error}
  <p class="error">{error}</p>
{:else if exercises.length > 0}
  <div class="exercise-grid">
    {#each exercises as exercise}
      <div class="exercise-card">
        <div class="exercise-header">
          <h2>{exercise.exerciseName}</h2>
          <span class="type-badge {exercise.exerciseType}">
            {exercise.exerciseType}
          </span>
        </div>
        <div class="exercise-content">
          <p class="exercise-details">
            Default: {getExerciseDetails(exercise)}
          </p>
          {#if exercise.equipment}
            <p class="equipment">
              <strong>Equipment:</strong>
              {exercise.equipment}
            </p>
          {/if}
          <div class="info-section">
            <h3>Instructions:</h3>
            <p>{exercise.instructions}</p>
          </div>
          <div class="info-section">
            <h3>Information:</h3>
            <p>{exercise.information}</p>
          </div>
          <div class="info-section">
            <h3>Modification:</h3>
            <p>{exercise.modification}</p>
          </div>
          <div class="debug-info">
            <small>Exercise ID: {exercise.exerciseId}</small>
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else}
  <p>No exercises found in the library.</p>
  <p class="debug-info">Debug info: exercises array is empty</p>
{/if}

<style>
  .exercise-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .exercise-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    background-color: white;
  }

  .exercise-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .exercise-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  .type-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
  }

  .type-badge.distance {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .type-badge.weight {
    background-color: #fef3c7;
    color: #92400e;
  }

  .type-badge.time {
    background-color: #dcfce7;
    color: #166534;
  }

  .exercise-details {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .equipment {
    margin-bottom: 1rem;
    color: #4b5563;
  }

  .info-section {
    margin-top: 1rem;
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }

  .info-section h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: #4b5563;
  }

  .info-section p {
    font-size: 0.875rem;
    color: #4b5563;
    white-space: pre-wrap;
  }

  .error {
    color: #dc2626;
    padding: 1rem;
  }

  .debug-info {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: #6b7280;
  }
</style>
