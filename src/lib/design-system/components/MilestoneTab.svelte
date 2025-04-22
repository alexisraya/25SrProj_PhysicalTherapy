<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { authStore } from '$stores/authStore';
  import { goalStore } from '$stores/goalStore';
  import { achievementStore, getUnlockedAchievements } from '$stores/achieveStore';
  import MilestoneMonths from '$lib/design-system/components/MilestoneMonths.svelte';
  import Achievement from '$lib/design-system/components/Achievement.svelte';
  import Streak from '$lib/design-system/components/Streak.svelte';
  import Goal from '$lib/design-system/components/Goal.svelte';
  import { typography } from '$lib/design-system/typography';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
  import { getUserStats, getWeeklyProgress } from '$firebase/services/statService';
  import { achievementsMap } from '$lib/achievements';

  let stats;
  let monthlyProgress;
  let weeklyProgress;
  let unlockedAchievements;
  let chosenAchievement;
  $: if ($unlockedAchievements && $unlockedAchievements.length > 0) {
    // Get achievements for the active month
    const monthAchievements = getMonthAchievements($unlockedAchievements, activeMonth);

    if (monthAchievements.length > 0) {
      // If we have achievements for this month, pick one
      chosenAchievement = monthAchievements[0];
    } else {
      // Fallback: use any unlocked achievement
      chosenAchievement = $unlockedAchievements[0];
    }

    console.log(`Selected achievement for month ${activeMonth}:`, chosenAchievement);
  }
  let completedMonths = [];
  let longestStreak = 0;
  let currentStreak = 0;
  // In MilestoneTab.svelte, add these changes to the script section

  // Add state for active month
  let activeMonth = 2; // Set your default active month (seems to be month 2 based on your code)
  let totalMonths = 5; // Total number of months to display
  let goals = [];
  let achievements = [];
  let achievementIconId = '';

  // Update the onMount function to load the correct goals for the active month
  onMount(async () => {
    if ($authStore.currentUser) {
      await goalStore.loadGoals($authStore.currentUser.uid);
      await achievementStore.loadAchievements($authStore.currentUser.uid);

      stats = await getUserStats($authStore.currentUser.uid);
      monthlyProgress = stats?.monthlyProgress;
      console.log('LOOK HERE');
      console.log($achievementStore);
      console.log($goalStore);

      completedMonths = Object.keys(monthlyProgress);

      // Set active month to the NEXT month after completed ones
      // or to 1 if no months are completed yet
      activeMonth = completedMonths.length > 0 ? completedMonths.length : 1;
      unlockedAchievements = getUnlockedAchievements();

      // Wait until the next tick to ensure the store is populated
      setTimeout(() => {
        // Make sure we have achievements before picking a random one
        if ($unlockedAchievements && $unlockedAchievements.length > 0) {
          // Get a random index (between 0 and length-1)
          const randomIndex = Math.floor(Math.random() * $unlockedAchievements.length);
          // Use the random index to select an achievement
          chosenAchievement = $unlockedAchievements[randomIndex];
          console.log('Chosen achievement:', chosenAchievement);
        }
      }, 0);

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
  // In your selectMonth function in MilestoneTab.svelte
  function selectMonth(month) {
    // Always update the activeMonth regardless of current state
    activeMonth = month;
    updateGoalsForActiveMonth();

    // Also update the achievement for this month
    if ($unlockedAchievements && $unlockedAchievements.length > 0) {
      const monthAchievements = getMonthAchievements($unlockedAchievements, month);

      if (monthAchievements.length > 0) {
        chosenAchievement = monthAchievements[0];
      } else {
        chosenAchievement = null;
      }

      // Add these debug logs
      console.log('Active month:', month);
      console.log('Achievements for this month:', monthAchievements);
      if (chosenAchievement) {
        console.log('Chosen achievement:', chosenAchievement);
      }
    }
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

  function getMonthAchievements(achievements, month) {
    if (!achievements || achievements.length === 0) return [];

    // Filter achievements that have unlockedAt timestamp
    const achievementsWithDates = achievements.filter((a) => a.unlockedAt);

    if (achievementsWithDates.length > 0) {
      // Get user's creation date
      const userCreatedAt = new Date($authStore.currentUser?.createdAt);

      // Calculate month boundaries
      const monthStartDate = new Date(userCreatedAt);
      monthStartDate.setDate(monthStartDate.getDate() + (month - 1) * 30);

      const monthEndDate = new Date(monthStartDate);
      monthEndDate.setDate(monthEndDate.getDate() + 30);

      // Filter by unlock date
      const monthAchievements = achievementsWithDates.filter((a) => {
        const unlockDate = new Date(a.unlockedAt);
        return unlockDate >= monthStartDate && unlockDate < monthEndDate;
      });

      if (monthAchievements.length > 0) {
        return monthAchievements;
      }
    }

    // Fall back to categorization by achievement properties
    // Filter achievements that have icon mappings
    const validAchievements = achievements.filter(
      (a) => a.achieveId && achievementsMap && achievementsMap[a.achieveId]
    );

    if (validAchievements.length === 0) return achievements;

    // Simple mapping strategy - distribute by type across months
    const distanceAchievements = achievements.filter((a) => a.achieveType === 'distance');
    const weightAchievements = achievements.filter((a) => a.achieveType === 'weight');
    const timeAchievements = achievements.filter((a) => a.achieveType === 'time');

    switch (month) {
      case 1:
        // Month 1: Basic achievements with lower target values
        return achievements.filter((a) => a.targetValue < 1000);
      case 2:
        // Month 2: Focus on distance achievements
        return distanceAchievements;
      case 3:
        // Month 3: Focus on weight achievements
        return weightAchievements;
      case 4:
        // Month 4: Focus on time achievements
        return timeAchievements;
      case 5:
        // Month 5: Advanced achievements with higher target values
        return achievements.filter((a) => a.targetValue >= 5000);
      default:
        // Default fallback
        return achievements;
    }
  }

  // function getMonthAchievements(achievements, month) {
  //   if (!achievements || achievements.length === 0) return [];

  //   // Filter achievements that have icon mappings
  //   const validAchievements = achievements.filter(
  //     (a) => a.achieveId && achievementsMap && achievementsMap[a.achieveId]
  //   );

  //   if (validAchievements.length === 0) return achievements;

  //   // Simple mapping strategy - you can customize this based on your needs
  //   // For example, distribute achievements by type across months
  //   const distanceAchievements = achievements.filter((a) => a.achieveType === 'distance');
  //   const weightAchievements = achievements.filter((a) => a.achieveType === 'weight');
  //   const timeAchievements = achievements.filter((a) => a.achieveType === 'time');

  //   switch (month) {
  //     case 1:
  //       // Month 1: Basic achievements with lower target values
  //       return achievements.filter((a) => a.targetValue < 1000);
  //     case 2:
  //       // Month 2: Focus on distance achievements
  //       return distanceAchievements;
  //     case 3:
  //       // Month 3: Focus on weight achievements
  //       return weightAchievements;
  //     case 4:
  //       // Month 4: Focus on time achievements
  //       return timeAchievements;
  //     case 5:
  //       // Month 5: Advanced achievements with higher target values
  //       return achievements.filter((a) => a.targetValue >= 5000);
  //     default:
  //       // Default fallback
  //       return achievements;
  //   }
  // }

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
    {#if $unlockedAchievements && $unlockedAchievements.length > 0 && chosenAchievement}
      <div class="achievement-section">
        {#key activeMonth}
          <Achievement
            type="milestones"
            achievementDescription={chosenAchievement.achieveName}
            achievmentId={chosenAchievement.achieveId}
            iconName={achievementsMap[chosenAchievement.achieveId]}
          />
        {/key}
      </div>
    {:else}
      <div class="achievement-section">
        <Achievement
          type="milestones"
          achievementDescription="No achievements unlocked for this month yet!"
          achievmentId="placeholder"
          iconName="trophy"
        />
      </div>
    {/if}

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
