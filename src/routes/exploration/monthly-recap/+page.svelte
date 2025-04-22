<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';

  let loading = true;
  let error: string | null = null;
  let recaps: (MonthlyRecap | null)[] = [];
  let userId = '';

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        error = 'You need to be logged in to view this page';
        loading = false;
        return;
      }

      userId = user.uid;
      await loadRecaps();
    });

    return unsubscribe;
  });

  async function loadRecaps() {
    try {
      loading = true;
      error = null;

      recaps = await getAllMonthlyRecaps(userId, 5);
      console.log('Loaded recaps:', recaps);
    } catch (err) {
      console.error('Error loading recaps:', err);
      error = 'Failed to load monthly recaps';
    } finally {
      loading = false;
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
</script>

<div>
  <h1>Monthly Recaps</h1>

  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p>{error}</p>
    <button on:click={loadRecaps}>Try Again</button>
  {:else if recaps.length === 0}
    <p>No recap data available yet.</p>
  {:else}
    {#each recaps as recap, i}
      <div style="margin-bottom: 40px; border: 1px solid #ccc; padding: 15px;">
        <h2>Month {i + 1}</h2>
        {#if recap === null}
          <p>No data for this month yet</p>
        {:else}
          <p>Date Range: {formatDate(recap.startDate)} - {formatDate(recap.endDate)}</p>

          <h3>Achievements</h3>
          {#if recap.achievements.count === 0}
            <p>No achievements unlocked</p>
          {:else}
            <p>
              {recap.achievements.count === 1
                ? '1 achievement unlocked'
                : recap.achievements.count === 2
                  ? '2 achievements unlocked'
                  : `${recap.achievements.count} achievements unlocked`}
            </p>
            <ul>
              {#each recap.achievements.unlocked as achievement}
                <li>{achievement.name}</li>
              {/each}
            </ul>
          {/if}

          <h3>Check-ins</h3>
          {#if recap.checkIns.count === 0}
            <p>No check-ins completed</p>
          {:else}
            <p>Check-ins completed: {recap.checkIns.count}</p>
            <p>
              Pain Average: {recap.checkIns.painAverage.toFixed(1)}/10
              {#if recap.checkIns.painChange !== null}
                ({recap.checkIns.painChange > 0 ? '+' : ''}{recap.checkIns.painChange.toFixed(1)}%)
              {/if}
            </p>
            <p>
              Common Mood: {recap.checkIns.commonMood}
              {#if recap.checkIns.moodChange}
                (previously: {recap.checkIns.moodChange})
              {/if}
            </p>
          {/if}

          <h3>User Metrics</h3>
          <p>
            Range of Motion:
            {#if recap.metrics.rangeOfMotion.value !== null}
              {recap.metrics.rangeOfMotion.value} degrees
              {#if recap.metrics.rangeOfMotion.change !== null}
                ({recap.metrics.rangeOfMotion.change > 0 ? '+' : ''}{recap.metrics.rangeOfMotion
                  .change} degrees)
              {/if}
            {:else}
              No data
            {/if}
          </p>
          <p>
            Strength:
            {#if recap.metrics.strength.value !== null}
              {recap.metrics.strength.value}/5
              {#if recap.metrics.strength.change !== null}
                ({recap.metrics.strength.change > 0 ? '+' : ''}{recap.metrics.strength.change})
              {/if}
            {:else}
              No data
            {/if}
          </p>

          <h3>Exercises</h3>
          <p>Completed exercises: {recap.progress.exercisesCompleted}</p>
          <p>Completed programs: {recap.progress.programsCompleted}</p>

          <h3>Goals</h3>
          {#if recap.goals.count === 0}
            <p>No goals unlocked</p>
          {:else}
            <p>{recap.goals.count} goals unlocked</p>
            <ul>
              {#each recap.goals.unlocked as goal}
                <li>{goal.name}</li>
              {/each}
            </ul>
          {/if}
        {/if}
      </div>
    {/each}
  {/if}
</div>
