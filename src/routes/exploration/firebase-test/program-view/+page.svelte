<script lang="ts">
    import { onMount } from "svelte";
    import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
    import { authStore } from "$stores/authStore";
    import type { AssignedExercise } from "$firebase/userService";

    let userData = null;
    let isLoading = true;
    let exercises: AssignedExercise[] = [];
    let programEstimatedTime = 0;
    const db = getFirestore();

    async function fetchUserProgram(userId: string) {
        try {
            const programRef = doc(db, "users", userId, "program", "currentProgram");
            const programSnap = await getDoc(programRef);

            if (programSnap.exists()) {
                userData = programSnap.data();
                exercises = userData.exercises.sort((a, b) => a.order - b.order);
                programEstimatedTime = userData.estimatedTime;
                console.log("Fetched program data:", userData);
            } else {
                console.error("No current program found for user.");
            }
        } catch (error) {
            console.error("Error fetching user program:", error);
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        const unsubscribe = authStore.subscribe(async (store) => {
            if (!store.isLoading && store.currentUser) {
                await fetchUserProgram(store.currentUser.uid);
            }
        });

        return () => unsubscribe();
    });

    async function handleReorder(event: CustomEvent) {
        const { oldIndex, newIndex } = event.detail;

        if (!userData) return;

        // Update local state
        const exerciseToMove = exercises[oldIndex];
        exercises.splice(oldIndex, 1);
        exercises.splice(newIndex, 0, exerciseToMove);
        exercises = exercises.map((ex, index) => ({ ...ex, order: index }));

        try {
            // Update Firestore
            const programRef = doc(db, "users", userData.userId, "program", "currentProgram");
            await updateDoc(programRef, {
                exercises: exercises,
            });

            console.log("Updated exercise order:", exercises);
        } catch (error) {
            console.error("Error updating exercise order:", error);
            // Revert local state on failure
            exercises = exercises.sort((a, b) => a.order - b.order);
        }
    }

    function handleStartProgram() {
        if (exercises.length > 0) {
            // Navigate to exercise flow
            window.location.href = `/exploration/firebase-test/exercise-flow/${exercises[0].exerciseId}`;
        }
    }
</script>

<div class="program-container">
    <h1>Your Program</h1>

    {#if isLoading}
        <p>Loading your program...</p>
    {:else if exercises.length > 0}
        <div class="program-header">
            <p>Estimated time: {programEstimatedTime} minutes</p>
            <button class="start-btn" on:click={handleStartProgram}>
                Start Program
            </button>
        </div>

        <div class="exercise-list">
            {#each exercises as exercise, i}
                <div class="exercise-item">
                    <h3>{exercise.exerciseName}</h3>
                    <p>
                        {#if exercise.exerciseType === 'distance'}
                            {exercise.sets} sets of {exercise.steps} steps
                        {:else if exercise.exerciseType === 'weight'}
                            {exercise.sets} sets of {exercise.reps} reps at {exercise.weight}lbs
                        {:else}
                            {exercise.reps} times, {exercise.seconds} seconds each
                        {/if}
                    </p>
                    <div class="exercise-controls">
                        <button on:click={() => handleReorder({ detail: { oldIndex: i, newIndex: i - 1 } })} disabled={i === 0}>↑</button>
                        <button on:click={() => handleReorder({ detail: { oldIndex: i, newIndex: i + 1 } })} disabled={i === exercises.length - 1}>↓</button>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p>No program assigned yet.</p>
    {/if}
</div>

<style>
    .program-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }

    .program-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .start-btn {
        padding: 0.75rem 1.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }

    .exercise-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .exercise-item {
        padding: 1rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
    }

    .exercise-controls {
        display: flex;
        gap: 0.5rem;
    }

    .exercise-controls button {
        padding: 0.25rem 0.5rem;
        background-color: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 0.25rem;
        cursor: pointer;
    }
</style>
