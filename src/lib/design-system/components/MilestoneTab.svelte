<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$stores/authStore';
  import { goalStore } from '$stores/goalStore';
  import MilestoneMonths from '$lib/design-system/components/MilestoneMonths.svelte';
  import Achievement from '$lib/design-system/components/Achievement.svelte';
  import Streak from '$lib/design-system/components/Streak.svelte';
  import Goal from '$lib/design-system/components/Goal.svelte';
  import { typography } from '$lib/design-system/typography';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
  import { getUserStats, getWeeklyProgress } from '$firebase/services/statService';

  let stats;
  let monthlyProgress;
  let weeklyProgress;
  let completedMonths = [];
  let longestStreak = 0;
  let currentStreak = 0;
  // In MilestoneTab.svelte, add these changes to the script section

  // Add state for active month
  let activeMonth = 2; // Set your default active month (seems to be month 2 based on your code)
  let totalMonths = 5; // Total number of months to display
  let goals = [];

  // Update the onMount function to load the correct goals for the active month
  onMount(async () => {
    if ($authStore.currentUser) {
      await goalStore.loadGoals($authStore.currentUser.uid);

      stats = await getUserStats($authStore.currentUser.uid);
      monthlyProgress = stats?.monthlyProgress;
      completedMonths = Object.keys(monthlyProgress);

      // Set active month to the NEXT month after completed ones
      // or to 1 if no months are completed yet
      activeMonth = completedMonths.length > 0 ? completedMonths.length : 1;

      // Make sure activeMonth doesn't exceed total months
      if (activeMonth > totalMonths) {
        activeMonth = totalMonths;
      }

      longestStreak = stats?.longestStreak;
      weeklyProgress = await getWeeklyProgress($authStore.currentUser.uid);
      currentStreak = weeklyProgress.daysCompleted;

      updateGoalsForActiveMonth();
    }
  });

  // In MilestoneTab.svelte
  function selectMonth(month) {
    // Always update the activeMonth regardless of current state
    activeMonth = month;
    updateGoalsForActiveMonth();
    console.log('Active month changed to:', activeMonth);
  }

  // Function to update goals based on the active month
  function updateGoalsForActiveMonth() {
    // Check if goals are loaded
    if ($goalStore.goals && $goalStore.goals[activeMonth]) {
      goals = $goalStore.goals[activeMonth].reverse().slice(0, 5);
    } else {
      // Fallback if goals for this month aren't available
      goals = [];
    }
  }

  // Replace the hardcoded goals assignment
  // Remove this line: goals = $goalStore.goals[2].slice(0, 5).reverse();
</script>

<div class="milestone-header">
  {#each Array(totalMonths) as _, index}
    {@const month = index + 1}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="month-selector" on:click={() => selectMonth(month)}>
      <MilestoneMonths
        {month}
        isComplete={month <= completedMonths.length}
        isActive={month === activeMonth}
        isUpcoming={month > completedMonths.length}
      />
    </div>
  {/each}
</div>
<div class="milestone-background">
  <div class="milestone-body">
    <div class="achievement-section">
      <Achievement
        type="milestones"
        achievementDescription="You've lifted the weight of a polar bear!"
      />
    </div>
    <div class="streak-section">
      <div class="streak-small">
        <Streak
          streakType="milestones"
          streakTotalDays={5}
          streakDaysCompleted={currentStreak}
          overallStreak={longestStreak}
        />
      </div>
      <!-- TODO: Alexis Make dynamic -->
    </div>
    <div class="goals-section">
      <a class="goals-section--header small-goals" href="/your-progress/goals">
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .regular}; font-weight: {typography.fontWeights.medium};"
        >
          Goals
        </p>
        <RemixIcon name="arrow-right-s-line" />
      </a>
      <a class="goals-section--header large-goals" href="/your-progress/goals">
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .large}; font-weight: {typography.fontWeights.medium};"
        >
          Goals
        </p>
        <RemixIcon name="arrow-right-s-line" />
      </a>
      <div class="goals-container">
        {#if goals.length > 0}
          {#each goals as goalItem}
            <Goal
              goalName={goalItem.goalName}
              isLocked={!goalItem.unlocked}
              extraInfo={goalItem.timeframe}
            />
          {/each}
        {:else}
          <div class="no-goals">
            <p
              style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                .xsmall}; font-weight: {typography.fontWeights.regular};"
            >
              No goals available for this month
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  a {
    color: var(--text-primary);
    text-decoration: none;
  }
  .milestone-header {
    display: flex;
    background-color: var(--background-secondary);
    column-gap: 16px;
    align-items: flex-start;
    padding: 0px 24px;
    overflow-x: scroll;
    overflow-y: hidden;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .month-selector {
    cursor: pointer;
  }
  .milestone-body {
    display: grid;
    grid-template-areas:
      'achievement streak'
      'goals goals';
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    background-color: var(--background);
    min-height: 500px;
    padding: 16px 14px 32px 14px;
    gap: 16px;
  }
  .achievement-section {
    grid-area: achievement;
    border-right: solid 2px var(--background-secondary);
  }
  .streak-section {
    grid-area: streak;
  }
  .goals-section {
    grid-area: goals;
    padding: 12px;
    border-top: solid 2px var(--background-secondary);
  }
  .goals-section--header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .goals-container {
    display: grid;
    grid-template-columns: repeat(3, 92.5px);
    justify-content: space-between;
    row-gap: 16px;
  }
  .milestone-background {
    background-color: var(--background);
  }
  .small-goals {
    display: flex;
  }
  .large-goals {
    display: none;
  }
  @media (min-width: 1000px) {
    .milestone-header {
      margin: auto;
      width: fit-content;
      column-gap: 40px;
    }
    .milestone-body {
      grid-template-areas:
        'streak streak'
        'goals achievement';
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      max-width: 840px;
      margin: auto;
    }
    .streak-section {
      border-bottom: solid 2px var(--background-secondary);
    }
    .achievement-section {
      border-left: solid 2px var(--background-secondary);
      border-right: solid 0px var(--background-secondary);

      margin: 0 16px 0 0;
      padding-left: 16px;
    }
    .goals-section {
      grid-area: goals;
      padding: 0 12px 12px;
      border-top: solid 0px var(--background-secondary);
    }
    .small-goals {
      display: none;
    }
    .large-goals {
      display: flex;
    }
  }
</style>
