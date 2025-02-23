<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { authStore } from '$stores/authStore';
    import { 
        getCurrentProgram, 
        completeExercise,
        skipExercise,
        getUserStats 
    } from '$firebase/userService';
    import { getExercise } from '$firebase/services/exerciseService';

    let currentExercise = null;
    let program = null;
    let stats = null;
    let loading = true;
    let error = null;
    let adjustedValues = {
        sets: 0,
        reps: 0,
        steps: 0,
        seconds: 0,
        weight: 0
    };
    let isCompleting = false;

    onMount(async () => {
        try {
            if (!$authStore.currentUser) return;

            const exerciseId = $page.params.exerciseId;
            const [programData, exerciseData, statsData] = await Promise.all([
                getCurrentProgram($authStore.currentUser.uid),
                getExercise(exerciseId),
                getUserStats($authStore.currentUser.uid)
            ]);

            program = programData;
            currentExercise = program?.exercises.find(ex => ex.exerciseId === exerciseId);
            stats = statsData;

            // Initialize adjusted values with current exercise values
            if (currentExercise) {
                adjustedValues = {
                    sets: currentExercise.sets || 0,
                    reps: currentExercise.reps || 0,
                    steps: currentExercise.steps || 0,
                    seconds: currentExercise.seconds || 0,
                    weight: currentExercise.weight || 0
                };
            }
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    });

    async function handleComplete() {
        if (!$authStore.currentUser || !currentExercise) return;

        try {
            isCompleting = true;
            await completeExercise(
                $authStore.currentUser.uid,
                currentExercise.exerciseId,
                adjustedValues
            );

            // Refresh stats after completion
            stats = await getUserStats($authStore.currentUser.uid);
            
            // Redirect back to program view
            window.location.href = '/exploration/firebase-test/program-view';
        } catch (err) {
            error = err.message;
        } finally {
            isCompleting = false;
        }
    }

    async function handleSkip() {
        if (!$authStore.currentUser || !currentExercise) return;

        try {
            await skipExercise($authStore.currentUser.uid, currentExercise.exerciseId);
            window.location.href = '/exploration/firebase-test/program-view';
        } catch (err) {
            error = err.message;
        }
    }

    function getProgressPercentage(): number {
        if (!program?.exercises) return 0;
        const currentIndex = program.exercises.findIndex(ex => ex.exerciseId === currentExercise?.exerciseId);
        return ((currentIndex + 1) / program.exercises.length) * 100;
    }
</script>

<div class="exercise-flow-container">
    {#if loading}
        <p>Loading exercise...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else if currentExercise}
        <!-- Progress Overview -->
        <div class="progress-overview">
            <div class="progress-bar">
                <div 
                    class="progress-fill"
                    style="width: {getProgressPercentage()}%"
                ></div>
            </div>
            <p class="progress-text">
                Exercise {program.exercises.findIndex(ex => ex.exerciseId === currentExercise.exerciseId) + 1} 
                of {program.exercises.length}
            </p>
        </div>

        <!-- Exercise Details -->
        <div class="exercise-details">
            <h2>{currentExercise.exerciseName}</h2>
            {#if currentExercise.equipment}
                <p class="equipment">Equipment needed: {currentExercise.equipment}</p>
            {/if}

            <!-- Exercise Values Form -->
            <div class="exercise-form">
                <h3>Exercise Settings</h3>
                {#if currentExercise.exerciseType === 'distance'}
                    <div class="form-group">
                        <label>
                            Sets:
                            <input type="number" bind:value={adjustedValues.sets} min="1" />
                        </label>
                        <label>
                            Steps per set:
                            <input type="number" bind:value={adjustedValues.steps} min="1" />
                        </label>
                    </div>
                {:else if currentExercise.exerciseType === 'weight'}
                    <div class="form-group">
                        <label>
                            Sets:
                            <input type="number" bind:value={adjustedValues.sets} min="1" />
                        </label>
                        <label>
                            Reps per set:
                            <input type="number" bind:value={adjustedValues.reps} min="1" />
                        </label>
                        <label>
                            Weight (lbs):
                            <input type="number" bind:value={adjustedValues.weight} min="0" step="5" />
                        </label>
                    </div>
                {:else}
                    <div class="form-group">
                        <label>
                            Times to perform:
                            <input type="number" bind:value={adjustedValues.reps} min="1" />
                        </label>
                        <label>
                            Seconds to hold:
                            <input type="number" bind:value={adjustedValues.seconds} min="1" />
                        </label>
                    </div>
                {/if}
            </div>

            <!-- Stats Preview -->
            {#if stats}
                <div class="stats-preview">
                    <h3>Stats Preview</h3>
                    <div class="stats-grid">
                        {#if currentExercise.exerciseType === 'distance'}
                            <div class="stat-item">
                                <span>Current Total Distance</span>
                                <span>{stats.totalDistance} steps</span>
                            </div>
                            <div class="stat-item">
                                <span>After Completion</span>
                                <span>{stats.totalDistance + (adjustedValues.sets * adjustedValues.steps)} steps</span>
                            </div>
                        {:else if currentExercise.exerciseType === 'weight'}
                            <div class="stat-item">
                                <span>Current Total Weight</span>
                                <span>{stats.totalWeight} lbs</span>
                            </div>
                            <div class="stat-item">
                                <span>After Completion</span>
                                <span>
                                    {stats.totalWeight + (adjustedValues.sets * adjustedValues.reps * adjustedValues.weight)} lbs
                                </span>
                            </div>
                        {:else}
                            <div class="stat-item">
                                <span>Current Total Time</span>
                                <span>{stats.totalTime} seconds</span>
                            </div>
                            <div class="stat-item">
                                <span>After Completion</span>
                                <span>{stats.totalTime + (adjustedValues.reps * adjustedValues.seconds)} seconds</span>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}

            <!-- Action Buttons -->
            <div class="action-buttons">
                <button 
                    class="complete-btn"
                    on:click={handleComplete}
                    disabled={isCompleting}
                >
                    {isCompleting ? 'Completing...' : 'Complete Exercise'}
                </button>
                <button 
                    class="skip-btn"
                    on:click={handleSkip}
                >
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

    .complete-btn, .skip-btn {
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