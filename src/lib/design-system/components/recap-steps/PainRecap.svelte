<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';
  import { currentMonth } from '$stores/monthlyrecap';
  import RecapPainCheckInItem from '../RecapPainCheckInItem.svelte';
  import RecapLineChart from '../RecapLineChart.svelte';

  let recaps: (MonthlyRecap | null)[] = [];
  let userId = '';
  let checkInsData;
  let lastMonthCheckinData;
  let rating: number;
  let data;
  $: {
    if (recaps && recaps.length > 0 && $currentMonth > 0 && $currentMonth - 1 < recaps.length) {
      checkInsData = recaps[$currentMonth - 1]?.checkIns;
      if ($currentMonth > 1) {
        lastMonthCheckinData = recaps[$currentMonth - 2]?.checkIns;
      }
      rating = Math.round(checkInsData?.painAverage ?? 0);
    }
  }

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
      recaps = await getAllMonthlyRecaps(userId, 5);
      console.log('Loaded recaps:', recaps);

      if (recaps && recaps.length > 0 && $currentMonth >= 0 && $currentMonth < recaps.length) {
        checkInsData = recaps[$currentMonth]?.checkIns;
        if ($currentMonth > 1) {
          lastMonthCheckinData = recaps[$currentMonth - 2]?.checkIns;
        }
        console.log('Check Ins data:', checkInsData);

        // Check if unlocked exists before trying to access it
        if (checkInsData) {
          if (lastMonthCheckinData) {
            data = [
              { x: 1, y: lastMonthCheckinData.painAverage },
              { x: 2, y: checkInsData.painAverage }
            ];
            console.log('First last ID:', checkInsData);
          }
          console.log('First checkInsData ID:', checkInsData);
        }
      }
    } catch (err) {
      console.error('Error loading recaps:', err);
    }
  }
</script>

{#if checkInsData}
  <div class="pain-recap-container">
    {#if $currentMonth == 1 || checkInsData.painChange == 0}
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        You've been tracking your pain
      </h3>
      <p>Here's your average rating</p>
      <div class="pain">
        <RecapPainCheckInItem {rating} />
      </div>
    {:else}
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        You've reported having {checkInsData.painChange < 0 ? 'less' : 'more'} pain
      </h3>
      <p>
        Here's your average rating comparison accross month {$currentMonth - 1} and {$currentMonth}
      </p>
      {#if data}
        <div class="pain">
          <RecapLineChart coordinates={data} />
        </div>
      {/if}
    {/if}
  </div>
  <div class="bg">
    <svg viewBox="0 0 1440 481" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M1016.43 154.966C916.835 55.0164 827.877 -34.262 640.489 13.5001C532.013 41.1488 472.93 116.381 417.237 187.298C326.501 302.836 244.762 406.918 -26.9246 275.097L-298.773 774.848C-227.543 1016.08 -116.51 1294.12 11.2902 1545.64L1180.97 1807.8C1262.32 1678.59 1341.94 1532.54 1417.15 1381.85L1462.95 349.78C1396.08 358.317 1328.4 354.952 1264.5 332.5C1154.99 294.027 1083.31 222.09 1016.43 154.966Z"
      />
    </svg>
  </div>
{/if}

<style>
  .pain-recap-container {
    margin: 16px auto;
    display: grid;
    justify-items: center;
  }
  p,
  h3 {
    text-align: center;
  }
  .bg {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    height: 50vh;
    pointer-events: none;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .bg svg {
    height: 100%;
    width: auto;
    fill: var(--text-primary);
  }
  .pain {
    position: fixed;
    top: 40%;
    z-index: 5;
  }
  @media screen and (min-width: 1400px) {
    .bg {
      height: 70vh;
      bottom: -50px;
    }
    .pain {
      position: fixed;
      top: 30%;
      z-index: 5;
    }
  }
</style>
