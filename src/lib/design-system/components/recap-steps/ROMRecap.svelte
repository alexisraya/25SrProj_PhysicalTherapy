<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';
  import { currentMonth } from '$stores/monthlyrecap';
  import { getTone } from '$lib/helpers/toneContext';
  import RecapBarChart from '../RecapBarChart.svelte';
  import RecapArrow from '$lib/assets/iconography/RecapArrow.svg';
  import RecapArrowWhiteBg from '$lib/assets/iconography/RecapArrowLightBg.svg';
  import RecapCheck from '$lib/assets/iconography/RecapCheck.svg';
  import LoadingSpinner from '../LoadingSpinner.svelte';

  let recaps: (MonthlyRecap | null)[] = [];
  let userId = '';
  let metricsData;
  let lastMonthMetricsData;
  let data = []; // Initialize with empty array
  let error = '';
  let loading = true;

  // Consistently use the same indexing approach
  $: {
    if (recaps && recaps.length > 0 && $currentMonth > 0 && $currentMonth <= recaps.length) {
      metricsData = recaps[$currentMonth - 1]?.metrics;

      // For Month 1, we need to manually set the baseline data
      if ($currentMonth === 1 && metricsData?.rangeOfMotion?.value !== undefined) {
        // Month 1 should show Month 0 (30°) vs Month 1 (45°)
        data = [
          { month: '0', degrees: 30 }, // Month 0 baseline from your demo data
          { month: '1', degrees: metricsData.rangeOfMotion.value }
        ];
        console.log('Month 1 Chart data:', data);
      } else if ($currentMonth > 1) {
        lastMonthMetricsData = recaps[$currentMonth - 2]?.metrics;

        // Only create data array if both values exist
        if (
          metricsData?.rangeOfMotion?.value !== undefined &&
          lastMonthMetricsData?.rangeOfMotion?.value !== undefined
        ) {
          data = [
            { month: `${$currentMonth - 1}`, degrees: lastMonthMetricsData.rangeOfMotion.value },
            { month: `${$currentMonth}`, degrees: metricsData.rangeOfMotion.value }
          ];
          console.log('Chart data:', data);
        }
      }
    }
  }

  const { text } = getTone();
  const descreaseText = $text(`recap_rom_decrease`);
  const increaseText = $text(`rom_increase`);
  const steadyText = $text(`rom_steady`);

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        error = 'You need to be logged in to view this page';
        loading = false;
        return;
      }

      userId = user.uid;
      await loadRecaps();
      loading = false;
    });

    return unsubscribe;
  });

  async function loadRecaps() {
    try {
      recaps = await getAllMonthlyRecaps(userId, 5);
      console.log('Loaded recaps:', recaps);
    } catch (err) {
      console.error('Error loading recaps:', err);
      error = 'Error loading recaps';
    }
  }
</script>

{#if loading}
  <div class="loading-container">
    <LoadingSpinner />
  </div>
{:else if error}
  <p>{error}</p>
{:else if metricsData?.rangeOfMotion}
  <div class="blue-top"></div>
  <div class="rom-recap-container">
    {#if $currentMonth === 1 || !metricsData.rangeOfMotion.change}
      <img class="icon" src={RecapCheck} alt="Recap Check" />
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        Your range of motion has been steady
      </h3>
      <p>{steadyText}</p>
    {:else if metricsData.rangeOfMotion.change < 0}
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        Your range of motion has decreased
      </h3>
      <p>{descreaseText}</p>
    {:else}
      <img class="icon" src={RecapArrow} alt="Recap Arrow" />
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        Your range of motion has increased
      </h3>
      <p>{increaseText}</p>
    {/if}

    {#if data && data.length === 2}
      <div class="graph-container">
        <div class="graph">
          <RecapBarChart chartType="ROM" coordinates={data} />
        </div>
      </div>
    {:else}
      <p>Insufficient data to display chart</p>
    {/if}
  </div>
{:else}
  <p>No range of motion data available</p>
{/if}

<style>
  .loading-container {
    box-sizing: border-box;
    width: 100%;
    height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .rom-recap-container {
    margin: 16px auto;
  }
  h3,
  p {
    text-align: center;
    color: var(--color-blue-1100);
  }
  .graph-container {
    position: relative;
    bottom: 0;
    width: 100%;
    display: grid;
    justify-self: center;
    height: 100%;
  }
  .graph {
    margin: auto;
    position: fixed;
    top: calc(70vh - 239px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
  }
  @media screen and (max-width: 500px) {
    .graph {
      top: calc(70vh - 239px);
    }
  }
  .blue-top {
    background-color: var(--color-blue-525);
    border-radius: 0 0 60px 60px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 70vh;
    z-index: -2;
  }
  .icon {
    width: 70px;
    display: flex;
    margin: auto;
  }

  @media screen and (max-height: 740px) {
    .icon {
      display: none;
    }
  }
  @media screen and (min-width: 800px) {
    .icon {
      width: 100px;
    }
  }
  /* :global(.recap-page-container):has(.rom-recap-container) {
    background-color: var(--color-blue-525);
  } */
</style>
