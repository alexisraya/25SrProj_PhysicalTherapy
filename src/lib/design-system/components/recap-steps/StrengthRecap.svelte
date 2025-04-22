<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';
  import { currentMonth } from '$stores/monthlyrecap';
  import { getTone } from '$lib/helpers/toneContext';
  import BarChart from '$lib/design-system/components/BarChart.svelte';

  let recaps: (MonthlyRecap | null)[] = [];
  let userId = '';
  let metricsData;
  $: {
    if (recaps && recaps.length > 0 && $currentMonth > 0 && $currentMonth - 1 < recaps.length) {
      metricsData = recaps[$currentMonth - 1]?.metrics;
    }
  }

  const { text } = getTone();
  const descreaseText = $text(`recap_strength_decrease`);
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
    });

    return unsubscribe;
  });

  async function loadRecaps() {
    try {
      recaps = await getAllMonthlyRecaps(userId, 5);
      console.log('Loaded recaps:', recaps);

      if (recaps && recaps.length > 0 && $currentMonth >= 0 && $currentMonth < recaps.length) {
        metricsData = recaps[$currentMonth]?.metrics;
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
  <div class="pain-recap-container">
    {#if $currentMonth == 1 || metricsData.strength.change == 0 || metricsData.strength.change == null}
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        You're strength has been steady
      </h3>
      <p>{steadyText}</p>
    {:else if metricsData.strength.change < 0}
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        You're strength has decreased
      </h3>
      <p>{descreaseText}</p>
    {:else}
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        You're strength has increased
      </h3>
      <p>{increaseText}</p>
    {/if}
    <BarChart dataArr={[40, 65]} yLabel="Degrees" type="rom" title="Strength Progress" />
  </div>
{/if}
