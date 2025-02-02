<script lang="ts">
    import { onMount } from "svelte";
    import { auth } from "../../lib/helpers/firebase";
    import { addExercise, getExercise, getAllExercises, updateExercise, deleteExercise } from "../../firebase/exerciseService";
  
    let userId = "";
    let isLoading = true; // Track loading state
  
    // Ensure Firebase waits until auth is ready
    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                userId = user.uid;
                console.log("✅ User is logged in:", userId);
            } else {
                console.error("❌ No user logged in! Please sign in first.");
            }
            isLoading = false; // Done loading
        });
  
        return () => unsubscribe(); // Cleanup listener
    });
  
    async function testAddExercise() {
        if (!userId) return console.error("❌ No authenticated user!");
  
        const exercise = {
            exerciseId: "exercise001",
            exerciseName: "Knee Extension",
            exerciseTime: 10,
            order: 1,
            completed: false,
            skipped: false,
            tooPainful: false,
            adjustedSets: 3,
            adjustedReps: 10
        };
  
        try {
            await addExercise(userId, exercise);
            console.log("✅ Exercise added!");
        } catch (error) {
            console.error("🔥 Error adding exercise:", error);
        }
    }
  
    async function testGetExercise() {
        if (!userId) return console.error("❌ No authenticated user!");
        try {
            const exercise = await getExercise(userId, "exercise001");
            console.log("✅ Retrieved Exercise:", exercise);
        } catch (error) {
            console.error("🔥 Error retrieving exercise:", error);
        }
    }
  </script>
  
  {#if isLoading}
    <p>Loading authentication status...</p>
  {:else}
    {#if userId}
      <h1>Exercise Service Test</h1>
      <button on:click={testAddExercise}>Test Add Exercise</button>
      <button on:click={testGetExercise}>Test Get Exercise</button>
    {:else}
      <p>Please log in first to test Firebase.</p>
    {/if}
  {/if}  