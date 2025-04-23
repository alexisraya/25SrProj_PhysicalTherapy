<script lang="ts">
  import { typography } from '$lib/design-system';
  import Streak from '$lib/design-system/components/Streak.svelte';
  import ExerciseCard from '$lib/design-system/components/ExerciseCard.svelte';
  import ProgramCompletePlayButtonLight from '$lib/assets/iconography/ProgramCompletePlayButtonLight.svg';
  import ProgramCompletePlayButtonDark from '$lib/assets/iconography/ProgramCompletePlayButtonDark.svg';
  import SummaryBlob from '$lib/assets/background-images/SummaryBlob.svg';
  import { onMount } from 'svelte';
  import Button from '$lib/design-system/components/Button.svelte';
  import { checkInStore } from '$stores/checkInStore';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import AchievmentCard from '$lib/design-system/components/AchievmentCard.svelte';
  import Achievement from '$lib/design-system/components/Achievement.svelte';
  import { achievementsMap } from '$lib/achievements.js';

  export let data;

  $: program = data.program;
  $: stats = data.stats;
  $: weeklyProgress = data.weeklyProgress;
  $: error = data.error;
  $: longestStreak = stats.longestStreak;
  // Make sure we have an array of achievements
  $: achievementsArray = stats?.achievements
    ? Object.entries(stats.achievements).map(([id, data]) => ({
        achieveId: id,
        unlocked: data.unlocked,
        unlockedAt: data.unlockedAt
      }))
    : [];

  // Filter for today's achievements
  $: todayAchievements = achievementsArray.filter((achievement) => {
    if (!achievement?.unlockedAt) return false;

    const today = new Date();
    const unlocked = new Date(achievement.unlockedAt);

    return (
      today.getFullYear() === unlocked.getFullYear() &&
      today.getMonth() === unlocked.getMonth() &&
      today.getDate() === unlocked.getDate()
    );
  });

  console.log('ALEXIS');
  console.log(data.stats);
  console.log(longestStreak);
  console.log(achievementsArray);

  // Determine if we're in a loading state
  $: loading = !error && !program && !stats && !weeklyProgress;

  let currentTheme: 'light' | 'dark' = 'light';
  let checkInCompleted = false;

  function updateThemeFromStorage() {
    // Check localStorage directly
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      currentTheme = savedTheme;
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      currentTheme = prefersDark ? 'dark' : 'light';
    }
  }

  function goToCheckIn() {
    goto('/check-in');
  }

  async function loadCheckIn() {
    try {
      await checkInStore.checkTodayStatus();
      checkInCompleted = get(checkInStore).todayCompleted;
    } catch (err) {
      console.error('Error checking check-in status:', err);
    }
  }

  onMount(async () => {
    // Initial check from localStorage
    updateThemeFromStorage();

    // Listen for custom theme change events
    const handleThemeChange = () => {
      updateThemeFromStorage();
    };

    await loadCheckIn();
    window.addEventListener('themeChanged', handleThemeChange);
    console.log(achievementsArray);
    return () => {
      window.removeEventListener('themeChanged', updateThemeFromStorage);
    };
  });
</script>

<div class="summary-page-wrapper">
  <div class="summary-page-container">
    <div class="blob-container">
      <img class="blob" src={SummaryBlob} alt="background blob" />
    </div>
    <div class="heading">
      {#if currentTheme == 'light'}
        <img
          src={ProgramCompletePlayButtonLight}
          alt="program complete icon"
          class="complete-icon"
        />
      {:else}
        <img
          src={ProgramCompletePlayButtonDark}
          alt="program complete icon"
          class="complete-icon"
        />
      {/if}
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}; text-align: center;"
      >
        You're done!
      </h3>
    </div>
    {#if !checkInCompleted}
      <div class="subtitle-container">
        <p
          class="subtitle"
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .regular}; font-weight: {typography.fontWeights.regular};"
        >
          What's next today?
        </p>
        <Button cta="Check in on pain and mood" buttonType="secondary" onClickFunc={goToCheckIn} />
      </div>
    {/if}
    {#if program}
      <div class="summary-container">
        <!-- Add achievements if any were unlocked that day -->
        <div class="program-summary">
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .regular}; font-weight: {typography.fontWeights.medium};"
          >
            Program Summary
          </p>
          <div class="horizontal-box"></div>

          <div
            class="program-summary-content {todayAchievements.length === 0
              ? 'no-achievements'
              : ''}"
          >
            {#if todayAchievements.length > 0}
              <Achievement
                type="program"
                achievementDescription={todayAchievements[0].achieveId.split('-').join(' ')}
                achievmentId={todayAchievements[0].achieveId}
                iconName={achievementsMap[todayAchievements[0].achieveId]}
              />
            {/if}
            <Streak
              streakType="program"
              streakTotalDays={5}
              streakDaysCompleted={weeklyProgress.daysCompleted}
              overallStreak={longestStreak}
            />
          </div>
        </div>
        <div class="exercise-summary">
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .regular}; font-weight: {typography.fontWeights.medium};"
          >
            Exercise Summary
          </p>
          <div class="horizontal-box"></div>
          <div class="completed-exerecises-container">
            {#each program.exercises.filter((ex) => ex.completed || ex.skipped) as exercise}
              <ExerciseCard
                isComplete
                exerciseName={exercise.exerciseName}
                isTooPainful={exercise.skipped}
                cardType="summary"
                isOnSummary
              />
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  p,
  h3 {
    margin: 0;
  }

  .summary-page-wrapper {
    position: relative;
    width: 100%;
    overflow-x: hidden; /* Main overflow control at the wrapper level */
  }

  .summary-page-container {
    padding: 32px 24px;
    position: relative;
    max-width: 552px;
    margin: auto;
  }

  .blob-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    overflow: visible;
    z-index: 0;
  }

  .blob {
    position: absolute;
    top: -135px;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    z-index: 0;
  }

  .heading {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
  }

  .summary-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 24px;
    padding-top: 32px;
    position: relative;
    z-index: 1;
  }

  .program-summary {
    width: 100%;
  }

  .program-summary-content {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: var(--background);
    gap: 16px;
  }

  .program-summary-content.no-achievements {
    grid-template-columns: 1fr; /* Change to a single column */
  }

  .exercise-summary {
    width: 100%;
  }

  .horizontal-box {
    background-color: var(--background-secondary);
    width: 100%;
    height: 2px;
    margin-top: 8px;
    margin-bottom: 12px;
  }

  .completed-exerecises-container {
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    align-items: center;
  }

  .subtitle-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 16px;
    margin-top: 8px;
  }
  .subtitle {
    text-align: center;
    color: var(--text-secondary);
  }
  @media (min-width: 500px) {
    .complete-icon {
      width: 124px;
      height: 124px;
    }
    .blob {
      position: absolute;
      top: -35vw;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100vw);
      z-index: 0;
    }
  }
  @media (min-width: 1000px) {
    .blob {
      top: -40vw;
    }
  }
  @media (min-width: 1200px) {
    .blob {
      top: -42vw;
    }
  }
</style>
