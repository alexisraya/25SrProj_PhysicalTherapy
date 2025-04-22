<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';
  import { currentMonth } from '$stores/monthlyrecap';
  import StatBlock from '$lib/design-system/components/StatBlock.svelte';

  let recaps: (MonthlyRecap | null)[] = [];
  let userId = '';
  let metricsData;
  $: {
    if (recaps && recaps.length > 0 && $currentMonth > 0 && $currentMonth - 1 < recaps.length) {
      metricsData = recaps[$currentMonth - 1]?.progress;
    }
  }

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        return;
      }

      userId = user.uid;
      await loadRecaps();
    });

    return unsubscribe;
  });

  async function loadRecaps() {
    try {
      recaps = await getAllMonthlyRecaps(userId, 5);
      console.log('Loaded recaps:', recaps);

      if (recaps && recaps.length > 0 && $currentMonth >= 0 && $currentMonth < recaps.length) {
        metricsData = recaps[$currentMonth]?.progress;
        console.log('Metrics data:', metricsData);

        // Check if unlocked exists before trying to access it
        if (metricsData) {
          console.log('First metricsData ID:', metricsData);
        }
      }
    } catch (err) {
      console.error('Error loading recaps:', err);
    }
  }
</script>

{#if metricsData}
  <div class="exercise-recap-container">
    <div class="exercise-recap-header">
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        You've been working towards your recovery
      </h3>
      <p>You've completed...</p>
    </div>
    <div class="exercise-recap-body">
      <div class="first-stat">
        <StatBlock
          statTitle="Exercises"
          stat={metricsData.exercisesCompleted}
          type="recap"
          position="first"
        />
      </div>
      <div class="last-stat">
        <StatBlock
          statTitle="Programs"
          stat={metricsData.programsCompleted}
          type="recap"
          position="second"
        />
      </div>
    </div>
  </div>
{/if}

<style>
  .exercise-recap-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .first-stat {
    align-self: flex-start;
  }
  .last-stat {
    align-self: flex-end;
  }
</style>
