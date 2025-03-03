<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { authStore } from "$stores/authStore";
    import { getCurrentProgram } from "$firebase/services/programService";
    import {
        completeExercise,
        skipExercise,
    } from "$firebase/services/userexerciseService";
    import {
        getUserStats,
        checkAndResetProgress,
    } from "$firebase/services/statService";
    import type {
        Program,
        UserStats,
        AssignedExercise,
    } from "$firebase/types/userType";

    let currentExercise: AssignedExercise | null = null;
    let program: Program | null = null;
    let stats: UserStats | null = null;
    let loading = true;
    let error: string | null = null;
    let adjustedValues = {
        sets: 0,
        reps: 0,
        steps: 0,
        seconds: 0,
        weight: 0,
    };
    let isCompleting = false;

    onMount(async () => {
        try {
            if (!$authStore.currentUser) return;
            await checkAndResetProgress($authStore.currentUser.uid);
            const exerciseId = $page.params.exerciseId;

            if (!exerciseId) {
                error = "No exercise ID provided";
                return;
            }

            const [programData, statsData] = await Promise.all([
                getCurrentProgram($authStore.currentUser.uid),
                getUserStats($authStore.currentUser.uid),
            ]);

            program = programData;
            stats = statsData;

            if (!program) {
                error = "No program found";
                return;
            }

            currentExercise =
                program?.exercises.find((ex) => ex.exerciseId === exerciseId) ??
                null;

            if (!currentExercise) {
                error = "Exercise not found in your program";
                return;
            }

            adjustedValues = {
                sets: currentExercise.sets || 0,
                reps: currentExercise.reps || 0,
                steps: currentExercise.steps || 0,
                seconds: currentExercise.seconds || 0,
                weight: currentExercise.weight || 0,
            };
        } catch (err) {
            console.error("Error loading exercise:", err);
            error =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
        } finally {
            loading = false;
        }
    });

    function getProgressPercentage(): number {
        if (!program || !currentExercise) return 0;

        const currentIndex = program.exercises.findIndex(
            (ex) => ex.exerciseId === currentExercise?.exerciseId,
        );

        return currentIndex !== -1
            ? ((currentIndex + 1) / program.exercises.length) * 100
            : 0;
    }

    async function handleComplete() {
        if (!$authStore.currentUser || !currentExercise) {
            error = "No exercise selected.";
            return;
        }

        try {
            isCompleting = true;
            await completeExercise(
                $authStore.currentUser.uid,
                currentExercise.exerciseId,
                adjustedValues,
            );

            await navigateToNext();
        } catch (err) {
            console.error("Error completing exercise:", err);
            error =
                err instanceof Error
                    ? err.message
                    : "Failed to complete exercise";
        } finally {
            isCompleting = false;
        }
    }

    async function handleSkip() {
        if (!$authStore.currentUser || !currentExercise) {
            error = "No exercise selected.";
            return;
        }

        try {
            await skipExercise(
                $authStore.currentUser.uid,
                currentExercise.exerciseId,
            );
            await navigateToNext();
        } catch (err) {
            console.error("Error skipping exercise:", err);
            error =
                err instanceof Error ? err.message : "Failed to skip exercise";
        }
    }

    async function navigateToNext() {
        if (!$authStore.currentUser || !currentExercise) return;

        try {
            program = await getCurrentProgram($authStore.currentUser.uid);

            if (!program || !program.exercises.length) {
                console.error("No exercises found.");
                goto("/exploration/firebase-test/program-view");
                return;
            }

            const currentIndex = program.exercises.findIndex(
                (ex) => ex.exerciseId === currentExercise?.exerciseId,
            );

            if (currentIndex === -1) {
                console.error("Current exercise not found in program.");
                goto("/exploration/firebase-test/program-view");
                return;
            }

            const allCompleted = program.exercises.every(
                (ex) => ex.completed || ex.skipped,
            );
            if (allCompleted) {
                goto("/exploration/firebase-test/program-complete");
                return;
            }

            let nextIndex = -1;

            for (let i = currentIndex + 1; i < program.exercises.length; i++) {
                if (
                    !program.exercises[i].completed &&
                    !program.exercises[i].skipped
                ) {
                    nextIndex = i;
                    break;
                }
            }

            if (nextIndex === -1) {
                for (let i = 0; i < currentIndex; i++) {
                    if (
                        !program.exercises[i].completed &&
                        !program.exercises[i].skipped
                    ) {
                        nextIndex = i;
                        break;
                    }
                }
            }

            if (nextIndex !== -1) {
                goto(
                    `/exploration/firebase-test/exercise-flow/${program.exercises[nextIndex].exerciseId}`,
                );
            } else {
                goto("/exploration/firebase-test/program-complete");
            }
        } catch (err) {
            console.error("Error navigating to next exercise:", err);
            goto("/exploration/firebase-test/program-view");
        }
    }
</script>

<div class="exercise-flow-container">
    {#if loading}
        <p>Loading exercise...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else if program && currentExercise}
        <div class="progress-overview">
            <div class="progress-bar">
                <div
                    class="progress-fill"
                    style="width: {getProgressPercentage()}%"
                ></div>
            </div>
            <p class="progress-text">
                Exercise {program.exercises.findIndex(
                    (ex) => ex.exerciseId === currentExercise?.exerciseId,
                ) + 1}
                of {program.exercises.length}
            </p>
        </div>
        <div class="exercise-details">
            <h2>{currentExercise?.exerciseName ?? "Exercise Not Found"}</h2>
            {#if currentExercise?.equipment}
                <p class="equipment">
                    Equipment needed: {currentExercise.equipment}
                </p>
            {/if}
            <div class="exercise-form">
                <h3>Exercise Settings</h3>
                {#if currentExercise.exerciseType === "distance"}
                    <div class="form-group">
                        <label>
                            Sets:
                            <input
                                type="number"
                                bind:value={adjustedValues.sets}
                                min="1"
                            />
                        </label>
                        <label>
                            Steps per set:
                            <input
                                type="number"
                                bind:value={adjustedValues.steps}
                                min="1"
                            />
                        </label>
                    </div>
                {:else if currentExercise.exerciseType === "weight"}
                    <div class="form-group">
                        <label>
                            Sets:
                            <input
                                type="number"
                                bind:value={adjustedValues.sets}
                                min="1"
                            />
                        </label>
                        <label>
                            Reps per set:
                            <input
                                type="number"
                                bind:value={adjustedValues.reps}
                                min="1"
                            />
                        </label>
                        <label>
                            Weight (lbs):
                            <input
                                type="number"
                                bind:value={adjustedValues.weight}
                                min="0"
                                step="5"
                            />
                        </label>
                    </div>
                {:else}
                    <div class="form-group">
                        <label>
                            Times to perform:
                            <input
                                type="number"
                                bind:value={adjustedValues.reps}
                                min="1"
                            />
                        </label>
                        <label>
                            Seconds to hold:
                            <input
                                type="number"
                                bind:value={adjustedValues.seconds}
                                min="1"
                            />
                        </label>
                    </div>
                {/if}
            </div>
            {#if stats}
                <div class="stats-preview">
                    <h3>Stats Preview</h3>
                    <div class="stats-grid">
                        {#if currentExercise.exerciseType === "distance"}
                            <div class="stat-item">
                                <span>Current Total Distance</span>
                                <span>{stats.totalDistance} steps</span>
                            </div>
                            <div class="stat-item">
                                <span>After Completion</span>
                                <span
                                    >{stats.totalDistance +
                                        adjustedValues.sets *
                                            adjustedValues.steps} steps</span
                                >
                            </div>
                        {:else if currentExercise.exerciseType === "weight"}
                            <div class="stat-item">
                                <span>Current Total Weight</span>
                                <span>{stats.totalWeight} lbs</span>
                            </div>
                            <div class="stat-item">
                                <span>After Completion</span>
                                <span>
                                    {stats.totalWeight +
                                        adjustedValues.sets *
                                            adjustedValues.reps *
                                            adjustedValues.weight} lbs
                                </span>
                            </div>
                        {:else}
                            <div class="stat-item">
                                <span>Current Total Time</span>
                                <span>{stats.totalTime} seconds</span>
                            </div>
                            <div class="stat-item">
                                <span>After Completion</span>
                                <span
                                    >{stats.totalTime +
                                        adjustedValues.reps *
                                            adjustedValues.seconds} seconds</span
                                >
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
            <div class="action-buttons">
                <button
                    class="complete-btn"
                    on:click={handleComplete}
                    disabled={isCompleting}
                >
                    {isCompleting ? "Completing..." : "Complete Exercise"}
                </button>
                <button class="skip-btn" on:click={handleSkip}>
                    Skip Exercise
                </button>
            </div>
        </div>
    {:else}
        <p>Exercise not found</p>
    {/if}
</div>

<style>
    .exercise-flow-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }

    .progress-overview {
        margin-bottom: 2rem;
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: #3b82f6;
        transition: width 0.3s ease;
    }

    .progress-text {
        text-align: center;
        color: #6b7280;
        margin-top: 0.5rem;
    }

    .exercise-details {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .equipment {
        color: #6b7280;
        margin-bottom: 1rem;
    }

    .exercise-form {
        margin: 1.5rem 0;
    }

    .form-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    input {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.25rem;
    }

    .stats-preview {
        margin: 1.5rem 0;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 0.5rem;
    }

    .stats-grid {
        display: grid;
        gap: 1rem;
        margin-top: 1rem;
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        background: white;
        border-radius: 0.25rem;
    }

    .action-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .complete-btn,
    .skip-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-weight: 500;
    }

    .complete-btn {
        background: #3b82f6;
        color: white;
        flex: 2;
    }

    .complete-btn:hover {
        background: #2563eb;
    }

    .complete-btn:disabled {
        background: #9ca3af;
        cursor: not-allowed;
    }

    .skip-btn {
        background: #ef4444;
        color: white;
        flex: 1;
    }

    .skip-btn:hover {
        background: #dc2626;
    }

    .error {
        color: #ef4444;
    }
</style>
