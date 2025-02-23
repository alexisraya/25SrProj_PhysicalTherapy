<script lang="ts">
    import { onMount } from "svelte";
    import { getUser, getCurrentProgram, completeExercise, skipExercise, type Program } from "$firebase/userService";
    import { authStore } from "$stores/authStore";

    let userId = "";
    let program: Program | null = null;
    let isLoading = true;
    let error: string | null = null;

    onMount(() => {
        const unsubscribe = authStore.subscribe(async (store) => {
            if (!store.isLoading && store.currentUser) {
                userId = store.currentUser.uid;
                try {
                    program = await getCurrentProgram(userId);
                } catch (err) {
                    console.error("Error fetching program:", err);
                    error = "Failed to load program";
                } finally {
                    isLoading = false;
                }
            }
        });

        return () => unsubscribe();
    });

    function formatDate(dateString: string | undefined): string {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    }

    async function handleCompleteExercise(exerciseId: string) {
        try {
            await completeExercise(userId, exerciseId);
            // Refresh program data
            program = await getCurrentProgram(userId);
        } catch (error) {
            console.error("Error completing exercise:", error);
        }
    }

    async function handleSkipExercise(exerciseId: string) {
        try {
            await skipExercise(userId, exerciseId);
            // Refresh program data
            program = await getCurrentProgram(userId);
        } catch (error) {
            console.error("Error skipping exercise:", error);
        }
    }
</script>

<div class="exercise-view-container">
    <h2>My Program</h2>

    {#if isLoading}
        <p>Loading program...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else if program}
        <div class="program-info">
            <p>Estimated time: {program.estimatedTime} minutes</p>
            <p>Assigned: {formatDate(program.assignedAt)}</p>
        </div>

        {#if program.exercises.length > 0}
            <div class="exercise-list">
                {#each program.exercises as exercise (exercise.exerciseId)}
                    <div class="exercise-card">
                        <div class="exercise-header">
                            <h3>{exercise.exerciseName}</h3>
                            {#if exercise.equipment}
                                <span class="equipment">Equipment: {exercise.equipment}</span>
                            {/if}
                        </div>

                        <div class="exercise-details">
                            {#if exercise.exerciseType === 'distance'}
                                <p>{exercise.sets} sets of {exercise.steps} steps</p>
                            {:else if exercise.exerciseType === 'weight'}
                                <p>{exercise.sets} sets of {exercise.reps} reps at {exercise.weight}lbs</p>
                            {:else}
                                <p>{exercise.reps} times, {exercise.seconds} seconds each</p>
                            {/if}
                        </div>

                        <div class="exercise-status">
                            {#if exercise.completed}
                                <span class="completed">✓ Completed {formatDate(exercise.completedAt)}</span>
                            {:else if exercise.skipped}
                                <span class="skipped">Skipped</span>
                            {:else}
                                <div class="exercise-actions">
                                    <button 
                                        class="complete-btn"
                                        on:click={() => handleCompleteExercise(exercise.exerciseId)}
                                    >
                                        Complete
                                    </button>
                                    <button 
                                        class="skip-btn"
                                        on:click={() => handleSkipExercise(exercise.exerciseId)}
                                    >
                                        Skip
                                    </button>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
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
        margin-top: 2rem;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }
    
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    
    th {
        background-color: #f2f2f2;
    }
    
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    
    button {
        padding: 5px 10px;
        background-color: #4CAF50;
        color: white;
        border: none;
        cursor: pointer;
    }
    
    button:hover {
        background-color: #45a049;
    }
</style>