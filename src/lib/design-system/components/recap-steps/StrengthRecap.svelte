<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';
  import { currentMonth } from '$stores/monthlyrecap';
  import { getTone } from '$lib/helpers/toneContext';
  import RecapBarChart from '../RecapBarChart.svelte';

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
      if ($currentMonth > 1) {
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
  <p>Loading...</p>
{:else if error}
  <p>{error}</p>
{:else if metricsData?.strength}
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
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        Your strength has decreased
      </h3>
      <p>{descreaseText}</p>
    {:else}
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
            yAxisTitle="Rating"
          />
        </div>
        <div class="bottom-screen"></div>
      </div>
    {:else}
      <p>Insufficient data to display chart</p>
    {/if}
  </div>
{:else}
  <p>No strength data available</p>
{/if}

<style>
  .strength-recap-container {
    margin: 16px auto;
  }
  h3,
  p {
    text-align: center;
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
    position: relative;
    top: 64px;
    z-index: 1;
  }
  .bottom-screen {
    background-color: var(--color-blue-525);
    height: 160px;
    margin: 0 16px;
    border-radius: 24px;
    z-index: 0;
  }
</style>
