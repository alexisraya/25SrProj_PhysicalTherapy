<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { getUser, updateUser } from '$firebase/userService';
    import { authStore } from '$stores/authStore';
    import type { AssignedExercise } from '$firebase/userService';

    let currentExercise: AssignedExercise | null = null;
    let progress = 0;
    let loading = true;
    let error: string | null = null;
    let adjustedValues = {
        sets: 0,
        reps: 0,
        steps: 0,
        seconds: 0,
        weight: 0
    };
    let isAdjusting = false;

    onMount(async () => {
        const exerciseId = $page.params.exerciseId;
        const authUser = $authStore.currentUser;

        if (!authUser) {
            goto('/login');
            return;
        }

        try {
            const userData = await getUser(authUser.uid);
            if (!userData?.currentProgram) {
                error = "No active program found";
                return;
            }

            currentExercise = userData.currentProgram.exercises.find(
                ex => ex.exerciseId === exerciseId
            ) || null;

            if (currentExercise) {
                // Initialize adjusted values with current values
                adjustedValues = {
                    sets: currentExercise.sets || 0,
                    reps: currentExercise.reps || 0,
                    steps: currentExercise.steps || 0,
                    seconds: currentExercise.seconds || 0,
                    weight: currentExercise.weight || 0
                };

                // Calculate progress
                const totalExercises = userData.currentProgram.exercises.length;
                const currentIndex = userData.currentProgram.exercises.findIndex(
                    ex => ex.exerciseId === exerciseId
                );
                progress = ((currentIndex + 1) / totalExercises) * 100;
            } else {
                error = "Exercise not found";
            }
        } catch (err) {
            console.error('Error loading exercise:', err);
            error = "Error loading exercise";
        } finally {
            loading = false;
        }
    });

    async function handleComplete() {
        if (!currentExercise || !$authStore.currentUser) return;

        try {
            const userData = await getUser($authStore.currentUser.uid);
            if (!userData?.currentProgram) return;

            // Update the completed exercise with adjusted values
            const updatedExercises = userData.currentProgram.exercises.map(ex => {
                if (ex.exerciseId === currentExercise.exerciseId) {
                    return {
                        ...ex,
                        completed: true,
                        completedAt: new Date().toISOString(),
                        // Include adjusted values
                        sets: adjustedValues.sets || ex.sets,
                        reps: adjustedValues.reps || ex.reps,
                        steps: adjustedValues.steps || ex.steps,
                        seconds: adjustedValues.seconds || ex.seconds,
                        weight: adjustedValues.weight || ex.weight
                    };
                }
                return ex;
            });

            // Find next exercise
            const currentIndex = updatedExercises.findIndex(
                ex => ex.exerciseId === currentExercise.exerciseId
            );
            const nextExercise = updatedExercises[currentIndex + 1];

            // Update program
            await updateUser(userData.userId, {
                currentProgram: {
                    ...userData.currentProgram,
                    exercises: updatedExercises
                }
            });

            // Navigate to next exercise or end
            if (nextExercise) {
                goto(`/exploration/firebase-test/exercise-flow/${nextExercise.exerciseId}`);
            } else {
                goto('/exploration/firebase-test/program-complete');
            }
        } catch (err) {
            console.error('Error completing exercise:', err);
            error = "Error completing exercise";
        }
    }

    async function handleSkip(skipReason: 'tooHard' | 'addToEnd') {
        if (!currentExercise || !$authStore.currentUser) return;

        try {
            const userData = await getUser($authStore.currentUser.uid);
            if (!userData?.currentProgram) return;

            let updatedExercises = [...userData.currentProgram.exercises];
            const currentIndex = updatedExercises.findIndex(
                ex => ex.exerciseId === currentExercise.exerciseId
            );

            if (skipReason === 'addToEnd') {
                // Move current exercise to end
                const [exercise] = updatedExercises.splice(currentIndex, 1);
                updatedExercises.push({
                    ...exercise,
                    order: updatedExercises.length
                });
            } else {
                // Mark as skipped
                updatedExercises[currentIndex] = {
                    ...updatedExercises[currentIndex],
                    skipped: true,
                    skipReason
                };
            }

            // Find next exercise
            const nextExercise = updatedExercises[currentIndex + 1];

            // Update program
            await updateUser(userData.userId, {
                currentProgram: {
                    ...userData.currentProgram,
                    exercises: updatedExercises
                }
            });

            // Navigate to next exercise or end
            if (nextExercise) {
                goto(`/exploration/firebase-test/exercise-flow/${nextExercise.exerciseId}`);
            } else {
                goto('/exploration/firebase-test/program-complete');
            }
        } catch (err) {
            console.error('Error skipping exercise:', err);
            error = "Error skipping exercise";
        }
    }
</script>

{#if loading}
    <div class="loading">Loading exercise...</div>
{:else if error}
    <div class="error">{error}</div>
{:else if currentExercise}
    <div class="exercise-container">
        <div class="progress-bar">
            <div class="progress" style="width: {progress}%"></div>
        </div>

        <div class="exercise-content">
            <h1>{currentExercise.exerciseName}</h1>

            {#if currentExercise.equipment}
                <div class="equipment">
                    Equipment needed: {currentExercise.equipment}
                </div>
            {/if}

            <div class="exercise-details">
                {#if !isAdjusting}
                    <div class="prescribed-values">
                        {#if currentExercise.exerciseType === 'distance'}
                            <p>{adjustedValues.sets} sets of {adjustedValues.steps} steps</p>
                        {:else if currentExercise.exerciseType === 'weight'}
                            <p>{adjustedValues.sets} sets of {adjustedValues.reps} reps at {adjustedValues.weight}lbs</p>
                        {:else}
                            <p>{adjustedValues.reps} times, holding for {adjustedValues.seconds} seconds</p>
                        {/if}
                        <button class="adjust-btn" on:click={() => isAdjusting = true}>
                            Adjust Values
                        </button>
                    </div>
                {:else}
                    <div class="value-adjustment">
                        {#if currentExercise.exerciseType === 'distance'}
                            <label>
                                Sets:
                                <input type="number" bind:value={adjustedValues.sets} min="1" />
                            </label>
                            <label>
                                Steps:
                                <input type="number" bind:value={adjustedValues.steps} min="1" />
                            </label>
                        {:else if currentExercise.exerciseType === 'weight'}
                            <label>
                                Sets:
                                <input type="number" bind:value={adjustedValues.sets} min="1" />
                            </label>
                            <label>
                                Reps:
                                <input type="number" bind:value={adjustedValues.reps} min="1" />
                            </label>
                            <label>
                                Weight (lbs):
                                <input type="number" bind:value={adjustedValues.weight} min="0" step="5" />
                            </label>
                        {:else}
                            <label>
                                Times to perform:
                                <input type="number" bind:value={adjustedValues.reps} min="1" />
                            </label>
                            <label>
                                Seconds to hold:
                                <input type="number" bind:value={adjustedValues.seconds} min="1" />
                            </label>
                        {/if}
                        <button class="save-btn" on:click={() => isAdjusting = false}>
                            Save Adjustments
                        </button>
                    </div>
                {/if}
            </div>

            <div class="action-buttons">
                <button class="complete-btn" on:click={handleComplete}>
                    Complete Exercise
                </button>
                
                <div class="skip-options">
                    <button class="skip-btn" on:click={() => handleSkip('addToEnd')}>
                        Move to End
                    </button>
                    <button class="skip-btn" on:click={() => handleSkip('tooHard')}>
                        Too Hard to Complete
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .exercise-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background-color: #e5e7eb;
        border-radius: 4px;
        margin-bottom: 2rem;
    }

    .progress {
        height: 100%;
        background-color: #3b82f6;
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .exercise-content {
        padding: 2rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
    }

    .equipment {
        margin: 1rem 0;
        padding: 0.5rem;
        background-color: #f3f4f6;
        border-radius: 0.25rem;
    }

    .exercise-details {
        margin: 2rem 0;
    }

    .prescribed-values {
        text-align: center;
        font-size: 1.25rem;
    }

    .value-adjustment {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 300px;
        margin: 0 auto;
    }

    label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }

    input[type="number"] {
        width: 100px;
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.25rem;
    }

    .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 2rem;
    }

    .complete-btn {
        padding: 1rem;
        background-color: #10b981;
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-size: 1.125rem;
        cursor: pointer;
    }

    .complete-btn:hover {
        background-color: #059669;
    }

    .skip-options {
        display: flex;
        gap: 1rem;
    }

    .skip-btn {
        flex: 1;
        padding: 0.75rem;
        background-color: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        cursor: pointer;
    }

    .skip-btn:hover {
        background-color: #e5e7eb;
    }

    .adjust-btn, .save-btn {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .adjust-btn:hover, .save-btn:hover {
        background-color: #2563eb;
    }

    .loading, .error {
        text-align: center;
        padding: 2rem;
    }

    .error {
        color: #dc2626;
    }
</style>