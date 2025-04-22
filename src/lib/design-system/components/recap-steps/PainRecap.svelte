<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';
  import { currentMonth } from '$stores/monthlyrecap';
  import RecapPainCheckInItem from '../RecapPainCheckInItem.svelte';

  let recaps: (MonthlyRecap | null)[] = [];
  let userId = '';
  let checkInsData;
  let rating: number;
  $: {
    if (recaps && recaps.length > 0 && $currentMonth > 0 && $currentMonth - 1 < recaps.length) {
      checkInsData = recaps[$currentMonth - 1]?.checkIns;
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
        console.log('Check Ins data:', checkInsData);

        // Check if unlocked exists before trying to access it
        if (checkInsData) {
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
      <RecapPainCheckInItem {rating} />
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
    {/if}
  </div>
{/if}
