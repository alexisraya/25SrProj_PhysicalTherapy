<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import { auth } from '$lib/helpers/firebase';
  import { getAllMonthlyRecaps, type MonthlyRecap } from '$firebase/services/monthlyRecapService';
  import { currentMonth } from '$stores/monthlyrecap';
  import { getTone } from '$lib/helpers/toneContext';
  import RecapGoal from '$lib/design-system/components/RecapGoal.svelte';

  let recaps: (MonthlyRecap | null)[] = [];
  let userId = '';
  let goalData;
  $: {
    if (recaps && recaps.length > 0 && $currentMonth > 0 && $currentMonth - 1 < recaps.length) {
      goalData = recaps[$currentMonth - 1].goals;
      console.log(goalData.unlocked);
    }
  }

  const { text } = getTone();
  const goalsText = $text(`goals`);

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
        goalData = recaps[$currentMonth].goals;
        console.log('goal data:', goalData);

        // Check if unlocked exists before trying to access it
        if (goalData && goalData.unlocked && goalData.unlocked.length > 0) {
          console.log('First goal ID:', goalData.unlocked[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading recaps:', err);
    }
  }
</script>

<div class="month-recap-container">
  {#if goalData && goalData.unlocked && goalData.unlocked.length > 0}
    <h3
      style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
        .h3}; font-weight: {typography.fontWeights.regular}"
    >
      {#if goalData.unlocked.length > 1}
        You've met major goals
      {:else}
        You've met a major goal
      {/if}
    </h3>
    <p>{goalsText}</p>
    <div
      class="monthly-achievments-container {goalData.unlocked.length <= 2
        ? 'less-achivements'
        : ''}"
    >
      {#each goalData.unlocked.slice(0, 5) as goal}
        <RecapGoal goalId={goal.id} title={goal.name} ammount={goalData.unlocked.length} />
      {/each}
    </div>
  {/if}
</div>

<style>
  p,
  h3 {
    margin: 0;
  }
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
