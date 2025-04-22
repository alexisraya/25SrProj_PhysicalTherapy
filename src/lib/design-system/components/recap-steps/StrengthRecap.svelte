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
  <p>Loading...</p>
{:else if error}
  <p>{error}</p>
{:else if metricsData?.strength}
  <div class="pain-recap-container">
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
        Your strength has increased
      </h3>
      <p>{increaseText}</p>
    {/if}

    {#if data && data.length === 2}
      <RecapBarChart
        coordinates={data}
        xAxisColor="var(--color-blue-1100)"
        yAxisColor="var(--text-primary)"
        yAxisMax={5}
        yAxisTicks={[1, 2, 3, 4, 5]}
        yAxisTitle="Rating"
      />
    {:else}
      <p>Insufficient data to display chart</p>
    {/if}
  </div>
{:else}
  <p>No strength data available</p>
{/if}
