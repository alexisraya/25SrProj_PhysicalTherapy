<script lang="ts">
    import { onMount } from "svelte";
    import { populateExerciseLibrary, getAllExercisesFromLibrary } from "$firebase/exerciseService";

    let exercises = [];

    async function loadExercises() {
        exercises = await getAllExercisesFromLibrary();
        console.log("📌 Loaded exercises:", exercises);
    }

    async function populate() {
        await populateExerciseLibrary();
        await loadExercises();  // ✅ Refresh UI after populating
    }

    onMount(loadExercises);
</script>

<h1>Exercise Library</h1>

<button on:click={populate}>Populate Exercise Library</button>

{#if exercises.length}
    <ul>
        {#each exercises as exercise}
            <li>{exercise.exerciseName}</li>
        {/each}
    </ul>
{:else}
    <p>Loading exercises...</p>
{/if}
