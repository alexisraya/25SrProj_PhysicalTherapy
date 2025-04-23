<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';
  import { currentMonth } from '$stores/monthlyrecap';
  import RecapMoodItem from '$lib/design-system/components/RecapMoodItem.svelte';

  let recaps: (MonthlyRecap | null)[] = [];
  let userId = '';
  let checkInsData;
  let lastMonthCheckinData;
  let commonMood: string;
  let data;
  $: {
    if (recaps && recaps.length > 0 && $currentMonth > 0 && $currentMonth - 1 < recaps.length) {
      checkInsData = recaps[$currentMonth - 1]?.checkIns;
      commonMood = checkInsData?.commonMood;
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
          console.log('First last ID:', checkInsData);
        }
      }
    } catch (err) {
      console.error('Error loading recaps:', err);
    }
  }
</script>

{#if checkInsData && commonMood}
  <div class="pain-recap-container">
    {#if $currentMonth == 1 || checkInsData.commonMood}
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}"
      >
        You've been tracking your mood
      </h3>
      <p>Here's your average rating</p>
      <RecapMoodItem selectedRating={commonMood} />
    {/if}
  </div>
{/if}
