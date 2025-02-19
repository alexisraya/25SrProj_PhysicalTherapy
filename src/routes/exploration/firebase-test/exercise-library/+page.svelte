<script lang="ts">
    import { onMount } from "svelte";
    import { getAllExercisesFromLibrary, type Exercise } from "$firebase/exerciseService";

    let exercises: Exercise[] = [];

    onMount(async () => {
        try {
            exercises = await getAllExercisesFromLibrary();
            console.log("Fetched exercises:", exercises);
        } catch (error) {
            console.error("Error fetching exercises:", error);
        }
    });
</script>

<h1>Exercise Library</h1>

{#if exercises.length > 0}
    <ul>
        {#each exercises as exercise}
            <li>
                <strong>{exercise.exerciseName}</strong> ({exercise.exerciseId})
            </li>
        {/each}
    </ul>
{:else}
    <p>No exercises found.</p>
{/if}