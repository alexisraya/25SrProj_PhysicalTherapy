// testing if exercise library exists

<script lang="ts">
    import { onMount } from "svelte";
    import { populateExerciseLibrary, getAllExercisesFromLibrary, type Exercise } from "../../../firebase/exerciseLibraryService";  // ✅ Use relative path


  
    let exercises: Exercise[] = [];
    let isLoading = true;
  
    async function loadExercises() {
        isLoading = true;
        exercises = await getAllExercisesFromLibrary();
        isLoading = false;
    }
  
    onMount(() => {
        loadExercises();
    });
  
    async function populateAndReload() {
        await populateExerciseLibrary();
        await loadExercises();
    }
  </script>
  
  <h1>Exercise Library</h1>
  
  <button on:click={populateAndReload}>Populate Dummy Exercises</button>
  
  {#if isLoading}
      <p>Loading exercises...</p>
  {:else}
      {#if exercises.length > 0}
          <ul>
              {#each exercises as exercise}
                  <li>
                      <strong>{exercise.exerciseName}</strong> - {exercise.description}  
                      <br /> Equipment: {exercise.equipment}  
                      <br /> Sets: {exercise.defaultSets} | Reps: {exercise.defaultReps}
                  </li>
              {/each}
          </ul>
      {:else}
          <p>No exercises found.</p>
      {/if}
  {/if}
  