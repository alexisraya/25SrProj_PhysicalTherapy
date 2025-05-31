<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';
  import { currentMonth } from '$stores/monthlyrecap';
  import StatBlock from '$lib/design-system/components/StatBlock.svelte';
  import Bg from '$lib/assets/background-images/recap/ExercisesBg.svg';

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
  <div class="bg">
    <svg viewBox="0 0 1440 541" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M787.782 123.56C886.428 -23.6026 1168.21 -21.1317 1440 37.1925V536.794C1440 539.003 1438.21 540.794 1436 540.794H4C1.79094 540.794 0.000131984 539.003 0 536.794V355.768C232.461 317.823 673.375 294.235 787.782 123.56Z"
        fill="#BE9AEC"
      />
    </svg>
  </div>
{/if}

<style>
  h3,
  p {
    text-align: center;
  }
  .exercise-recap-container {
    margin: 16px auto 0;
    overflow: hidden;
  }
  .exercise-recap-header {
    margin: auto;
  }
  .exercise-recap-body {
    display: flex;
    flex-direction: column;
    gap: 48px;
    justify-content: center;
    z-index: 5;
    padding: 64px 16px 16px;
  }
  :global(.program-stat-container) {
    z-index: 80;
  }
  .first-stat {
    align-self: flex-start;
    z-index: 4;
  }
  .last-stat {
    align-self: flex-end;
    z-index: 4;
  }
  .bg {
    position: fixed;
    bottom: -10vh;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    height: 70vh;
    pointer-events: none;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .bg svg {
    height: 100%;
    width: auto;
  }
  @media screen and (min-width: 1400px) {
    .bg {
      height: 80vh;
    }
  }
</style>
