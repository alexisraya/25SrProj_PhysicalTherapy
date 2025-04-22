<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';
  import { currentMonth } from '$stores/monthlyrecap';
  import RecapAchievement from '../RecapAchievement.svelte';

  let recaps: (MonthlyRecap | null)[] = [];
  let userId = '';
  let achievementData;
  $: {
    if (recaps && recaps.length > 0 && $currentMonth > 0 && $currentMonth - 1 < recaps.length) {
      achievementData = recaps[$currentMonth - 1].achievements;
      console.log(achievementData.unlocked);
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
        achievementData = recaps[$currentMonth].achievements;
        console.log('Achievement data:', achievementData);

        // Check if unlocked exists before trying to access it
        if (achievementData && achievementData.unlocked && achievementData.unlocked.length > 0) {
          console.log('First achievement ID:', achievementData.unlocked[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading recaps:', err);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
</script>

<div class="month-recap-container">
  {#if achievementData && achievementData.unlocked && achievementData.unlocked.length > 0}
    <h3
      style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
        .h3}; font-weight: {typography.fontWeights.regular}"
    >
      {#if achievementData.unlocked.length > 1}
        You got so many achievements
      {:else}
        You've got an achievement
      {/if}
    </h3>
    <div
      class="monthly-achievments-container {achievementData.unlocked.length <= 2
        ? 'less-achivements'
        : ''}"
    >
      {#each achievementData.unlocked.slice(0, 3) as achievement}
        <RecapAchievement
          achievemntId={achievement.id}
          title={achievement.name}
          ammount={achievementData.unlocked.length}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .month-recap-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    row-gap: 24px;
    align-items: center;
    text-align: center;
  }
  .monthly-achievments-container {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: center;
    column-gap: 12px;
    row-gap: 12px;
    width: 100%;
    padding: 0px 30px;
  }
  .less-achivements {
    flex-direction: column;
    align-items: center;
  }
</style>
