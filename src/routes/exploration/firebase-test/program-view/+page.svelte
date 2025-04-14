<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$stores/authStore';
  import { checkAndResetProgress } from '$firebase/services/statService';
  import UserExerciseView from '$lib/design-system/components/UserExerciseView.svelte';

  let loading = true;
  let error: string | null = null;

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (store) => {
      if (!store.isLoading && store.currentUser) {
        try {
          await checkAndResetProgress(store.currentUser.uid);
          loading = false;
        } catch (err) {
          console.error('Error checking progress:', err);
          error = err instanceof Error ? err.message : 'An unknown error occurred';
          loading = false;
        }
      }
    });

    return unsubscribe;
  });
</script>

<div class="program-container">
  {#if loading}
    <div class="loading">
      <p>Loading your exercise program...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={() => location.reload()}>Try Again</button>
    </div>
  {:else}
    <h1>Your Daily Exercise Program</h1>
    <p class="instruction">Complete all exercises to maintain your streak</p>
    <UserExerciseView />
  {/if}
</div>

<style>
  .program-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .instruction {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }

  .error {
    color: #ef4444;
    padding: 1rem;
    background-color: #fee2e2;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .error button {
    margin-top: 0.5rem;
    padding: 0.375rem 0.75rem;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }
</style>
