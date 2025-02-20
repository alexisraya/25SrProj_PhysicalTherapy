<script lang="ts">
    import { onMount } from "svelte";
    import { getUser, updateUser } from "$firebase/userService";
    import { authStore } from "$stores/authStore";

    let userId = "";
    let userData = null;
    let isLoading = true;

    onMount(() => {
        const unsubscribe = authStore.subscribe(async (store) => {
            if (!store.isLoading && store.currentUser) {
                userId = store.currentUser.uid;
                userData = await getUser(userId);
                console.log("Fetched User Data:", userData);
            } else {
                console.warn("No user signed in!");
            }
            isLoading = false;
        });

        return () => unsubscribe();
    });

    function formatDate(dateString) {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    }

    async function markExerciseComplete(index: number) {
        try {
            if (!userData || !userData.assignedExercises) return;
            
            const updatedExercises = [...userData.assignedExercises];
            updatedExercises[index] = {
                ...updatedExercises[index],
                completed: true,
                completedAt: new Date().toISOString()
            };
            
            await updateUser(userId, {
                assignedExercises: updatedExercises
            });
            
            userData.assignedExercises = updatedExercises;
        } catch (error) {
            console.error("Error marking exercise as complete:", error);
        }
    }
</script>

<div class="exercise-view-container">
    <h2>My Exercises</h2>

    {#if isLoading}
        <p>Loading exercises...</p>
    {:else}
        {#if userData}
            {#if userData.assignedExercises && userData.assignedExercises.length > 0}
                <table>
                    <thead>
                        <tr>
                            <th>Exercise</th>
                            <th>Reps</th>
                            <th>Assigned</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each userData.assignedExercises as exercise, i}
                            <tr>
                                <td>{exercise.exerciseName}</td>
                                <td>{exercise.reps}</td>
                                <td>{formatDate(exercise.assigned)}</td>
                                <td>
                                    {#if exercise.completed}
                                        ✓ Completed ({formatDate(exercise.completedAt)})
                                    {:else}
                                        Pending
                                    {/if}
                                </td>
                                <td>
                                    {#if !exercise.completed}
                                        <button on:click={() => markExerciseComplete(i)}>
                                            Mark Complete
                                        </button>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {:else}
                <p>No exercises assigned yet.</p>
            {/if}
        {:else}
            <p>Unable to load exercise data.</p>
        {/if}
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