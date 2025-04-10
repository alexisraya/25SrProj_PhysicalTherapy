<script>
  import { onMount } from 'svelte';
  import { authStore } from '$stores/authStore';
  import { goalStore } from '$stores/goalStore';
  import MilestoneMonths from '$lib/design-system/components/MilestoneMonths.svelte';
  import Achievement from '$lib/design-system/components/Achievement.svelte';
  import Streak from '$lib/design-system/components/Streak.svelte';
  import Goal from '$lib/design-system/components/Goal.svelte';
  import { typography } from '$lib/design-system/typography';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';

  let goals;
  onMount(() => {
    if ($authStore.currentUser) {
      goalStore.loadGoals($authStore.currentUser.uid);
      console.log($goalStore.goals);
    }
  });

  goals = $goalStore.goals[2].slice(0, 5); //TODO: ALEXIS Make Month dynamic
</script>

<div class="milestone-header">
  <MilestoneMonths month={1} isComplete />
  <MilestoneMonths month={2} isActive />
  <MilestoneMonths month={3} isUpcoming />
  <MilestoneMonths month={4} isUpcoming />
  <MilestoneMonths month={5} isUpcoming />
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
        <Streak streakType="milestones" streakTotalDays={5} streakDaysCompleted={1} />
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
        {#each goals as goalItem}
          <Goal
            goalName={goalItem.goalName}
            isLocked={!goalItem.unlocked}
            extraInfo={goalItem.timeframe}
          />
        {/each}
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
  @media (min-width: 800px) {
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
