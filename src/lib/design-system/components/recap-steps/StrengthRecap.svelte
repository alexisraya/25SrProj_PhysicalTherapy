<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';
  import { currentMonth } from '$stores/monthlyrecap';
  import { getTone } from '$lib/helpers/toneContext';
  import RecapBarChart from '../RecapBarChart.svelte';
  import RecapArrow from '$lib/assets/iconography/RecapArrow.svg';
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
      if ($currentMonth === 1 && metricsData?.strength?.value !== undefined) {
        // Month 1 should show Month 0 (1) vs Month 1 (2)
        data = [
          { month: '0', degrees: 1 }, // Month 0 baseline from your demo data
          { month: '1', degrees: metricsData.strength.value }
        ];
        console.log('Month 1 Chart data:', data);
      } else if ($currentMonth > 1) {
        lastMonthMetricsData = recaps[$currentMonth - 2]?.metrics;

        // Only create data array if both values exist
        if (
          metricsData?.strength?.value !== undefined &&
          lastMonthMetricsData?.strength?.value !== undefined
        ) {
          data = [
            { month: `${$currentMonth - 1}`, degrees: lastMonthMetricsData.strength.value },
            { month: `${$currentMonth}`, degrees: metricsData.strength.value }
          ];
          console.log('Chart data:', data);
        }
      }
    }
  }

  const { text } = getTone();
  const descreaseText = $text(`strength_decrease`);
  const increaseText = $text(`strength_increase`);
  const steadyText = $text(`strength_steady`);

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
{:else if metricsData?.strength}
  <div class="blue-top"></div>
  <div class="strength-recap-container">
    {#if $currentMonth === 1 || !metricsData.strength.change}
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        Your strength has been steady
      </h3>
      <p>{steadyText}</p>
    {:else if metricsData.strength.change < 0}
      <img class="icon" src={RecapCheck} alt="Recap Check" />
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        Your strength has decreased
      </h3>
      <p>{descreaseText}</p>
    {:else}
      <img class="icon" src={RecapArrow} alt="Recap Arrow" />
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        You’ve gotten stronger
      </h3>
      <p>{increaseText}</p>
    {/if}

    {#if data && data.length === 2}
      <div class="graph-container">
        <div class="graph">
          <RecapBarChart
            coordinates={data}
            chartType="Strength"
            yAxisMax={5}
            yAxisTicks={[1, 2, 3, 4, 5]}
            yAxisTitle="Strength Scale"
          />
        </div>
      </div>
    {:else}
      <p>Insufficient data to display chart</p>
    {/if}
  </div>
{:else}
  <p>No strength data available</p>
{/if}

<style>
  .loading-container {
    width: 100%;
    height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .strength-recap-container {
    position: relative;
    margin: 16px auto;
    z-index: 5;
  }
  h3,
  p {
    text-align: center;
    color: var(--text-primary);
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
    background-color: var(--background);
    border-radius: 0 0 60px 60px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 70vh;
    z-index: 0;
  }
  :global(.recap-page-container):has(.strength-recap-container) {
    background-color: var(--color-blue-525);
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
</style>
