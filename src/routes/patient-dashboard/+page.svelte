<script lang="ts">
  import { typography } from '$lib/design-system';
  import PlayButtonLight from '$lib/assets/iconography/PlayButtonLight.svg';
  import PlayButtonDark from '$lib/assets/iconography/PlayButtonDark.svg';
  import homeBackgroundSmallLight from '$lib/assets/background-images/HomeBackgroundSmallLight.svg';
  import homeBackgroundSmallDark from '$lib/assets/background-images/HomeBackgroundSmallDark.svg';
  import Streak from '$lib/design-system/components/Streak.svelte';
  import PainMoodDropdown from '$lib/design-system/components/PainMoodDropdown.svelte';
  import LineChart from '$lib/design-system/components/LineChart.svelte';
  import XAxisTimeFrameSelectors from '$lib/design-system/components/XAxisTimeFrameSelectors.svelte';
  import { getTone } from '$lib/helpers/toneContext';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
  import { onMount } from 'svelte';
  import { getCheckInStats } from '$firebase/services/checkInService';
  import { authStore } from '$stores/authStore';
  import { checkInStore } from '$stores/checkInStore';
  import { get } from 'svelte/store';

  export let data;

  $: program = data.program;
  $: stats = data.stats;
  $: weeklyProgress = data.weeklyProgress;
  $: userData = data.userData;
  $: error = data.error;

  $: overallStreak = stats.longestStreak;
  $: streakDaysCompleted = weeklyProgress.daysCompleted;

  // Determine if we're in a loading state
  $: loading = !error && !program && !stats && !weeklyProgress;

  // Data storage objects by timeframe
  let painStatsData: Record<string, number[]> = {
    '1 Week': [],
    '1 Month': [],
    '3 Months': [],
    '6 Months': [],
    '1 Year': [],
    'All Time': []
  };

  let moodStatsData: Record<string, number[]> = {
    '1 Week': [],
    '1 Month': [],
    '3 Months': [],
    '6 Months': [],
    '1 Year': [],
    'All Time': []
  };

  let errorMsg: string | null = null;

  // Track the current chart type for check-in metrics
  let checkInChartType = 'pain';

  // Track the current timeframe for check-in metrics
  let checkInTimeFrame = '1 Week';

  // Get active data based on current selections
  $: activeCheckInData =
    checkInChartType === 'pain' ? painStatsData[checkInTimeFrame] : moodStatsData[checkInTimeFrame];

  let checkInCompleted = false;

  // Convert UI timeframe to API format
  function convertTimeFrameToApiFormat(timeFrame: string): string {
    switch (timeFrame) {
      case '1 Week':
        return 'week';
      case '1 Month':
        return 'month';
      case '3 Months':
        return '3months';
      case '6 Months':
        return '6months';
      case '1 Year':
        return 'year';
      case 'All Time':
        return 'all';
      default:
        return 'week';
    }
  }

  //Tone Text
  const { text } = getTone();
  const programCTATextOptions = [`home_program_cta_1`, `home_program_cta_2`, `home_program_cta_3`];
  const programCTAText =
    programCTATextOptions[Math.floor(Math.random() * programCTATextOptions.length)];

  const programCompleteTextOptions = [`complete_1`, `complete_2`, `complete_3`];
  const programCompleteText =
    programCompleteTextOptions[Math.floor(Math.random() * programCompleteTextOptions.length)];

  let currentTheme: 'light' | 'dark' = 'light';

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

  async function loadCheckIn() {
    try {
      await checkInStore.checkTodayStatus();
      checkInCompleted = get(checkInStore).todayCompleted;
    } catch (err) {
      console.error('Error checking check-in status:', err);
      errorMsg = err instanceof Error ? err.message : 'Failed to load check-in status';
    }
  }

  async function loadCheckInStatus(userId: string, timeframe: string) {
    try {
      const checkInStats = await getCheckInStats(userId, timeframe);

      if (checkInStats && checkInStats.checkIns && checkInStats.checkIns.length > 0) {
        // Get pain and mood data from check-ins
        const painData = checkInStats.checkIns.map((stat) => stat.painLevel);
        const moodData = checkInStats.checkIns.map((stat) => stat.moodLevel);

        // Map API timeframe back to UI timeframe
        let uiTimeframe = 'week';
        switch (timeframe) {
          case 'week':
            uiTimeframe = '1 Week';
            break;
          case 'month':
            uiTimeframe = '1 Month';
            break;
          case '3months':
            uiTimeframe = '3 Months';
            break;
          case '6months':
            uiTimeframe = '6 Months';
            break;
          case 'year':
            uiTimeframe = '1 Year';
            break;
          case 'all':
            uiTimeframe = 'All Time';
            break;
        }

        // Store data in the appropriate timeframe slot
        painStatsData[uiTimeframe] = painData;
        moodStatsData[uiTimeframe] = moodData;

        // Trigger reactivity by reassigning the objects
        painStatsData = { ...painStatsData };
        moodStatsData = { ...moodStatsData };

        console.log(`Loaded ${timeframe} data:`, {
          pain: painStatsData[uiTimeframe],
          mood: moodStatsData[uiTimeframe]
        });
      } else {
        console.log(`No check-in data available for timeframe: ${timeframe}`);
      }
    } catch (err) {
      console.error('Error checking check-in status:', err);
      errorMsg = err instanceof Error ? err.message : 'Failed to load check-in status';
    }
  }

  // Event handlers
  function handleCheckInChartTypeChange(event) {
    checkInChartType = event.detail.value;
    console.log(checkInChartType);
  }

  async function handleCheckInTimeFrameChange(event) {
    // Update the timeframe first
    checkInTimeFrame = event.detail;

    // Then load data if needed
    if (!painStatsData[checkInTimeFrame]?.length && !moodStatsData[checkInTimeFrame]?.length) {
      if ($authStore.currentUser) {
        const apiTimeFrame = convertTimeFrameToApiFormat(checkInTimeFrame);
        await loadCheckInStatus($authStore.currentUser.uid, apiTimeFrame);
      }
    }
  }

  onMount(async () => {
    // Initial check from localStorage
    updateThemeFromStorage();

    // Listen for custom theme change events
    const handleThemeChange = () => {
      updateThemeFromStorage();
    };

    window.addEventListener('themeChanged', handleThemeChange);

    // Load initial check-in data
    if ($authStore.currentUser) {
      await loadCheckInStatus($authStore.currentUser.uid, 'week');
      await loadCheckIn();
    }

    console.log('LOOK HERE');
    console.log(overallStreak);
    console.log(streakDaysCompleted);

    return () => {
      window.removeEventListener('themeChanged', updateThemeFromStorage);
    };
  });
</script>

{#if program && stats && weeklyProgress}
  <div class="wave-container">
    {#if currentTheme == 'light'}
      <img
        class="background-wave wave-light"
        src={homeBackgroundSmallLight}
        alt="background wave"
      />
    {:else}
      <img class="background-wave wave-dark" src={homeBackgroundSmallDark} alt="background wave" />
    {/if}
  </div>
  <div class="header-container">
    <div class="cta-container">
      <div class="cta-container-text">
        <h2
          style="font-family: {typography.fontFamily.heading}; font-size: {window.innerWidth >= 800
            ? typography.fontSizes.h1
            : typography.fontSizes.h2}; font-weight: {typography.fontWeights
            .regular}; margin-bottom: 4px;"
          on:resize={() => window.innerWidth}
        >
          Hi {userData.firstName}!
        </h2>
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .regular}; font-weight: {typography.fontWeights.light}; margin-bottom: 12px;"
        >
          {$text(programCTAText)}
        </p>
      </div>
      <a href="/your-program">
        {#if currentTheme == 'light'}
          <img src={PlayButtonLight} alt="play button" />
        {:else}
          <img src={PlayButtonDark} alt="play button" />
        {/if}
      </a>
    </div>
  </div>
  <div class="body-container">
    <Streak
      streakType="home"
      streakTotalDays={weeklyProgress.daysCompleted + weeklyProgress.daysNeededForStreak}
      {streakDaysCompleted}
      {overallStreak}
    />
    <div class="break" />
    {#if !checkInCompleted}
      <a class="checkin-cta-container" href="/check-in">
        <div class="chickin-cta-text">
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .regular}; font-weight: {typography.fontWeights.medium};"
          >
            Check In
          </p>
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .xsmall}; font-weight: {typography.fontWeights.medium};"
          >
            on your pain and mood today
          </p>
        </div>
        <RemixIcon name="arrow-right-s-line" />
      </a>
      <div class="break-small" />
    {/if}
    <div class="metrics-container">
      <div class="metrics-header">
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .xsmall}; font-weight: {typography.fontWeights.medium};"
        >
          Weekly metrics
        </p>
        <PainMoodDropdown value={checkInChartType} on:change={handleCheckInChartTypeChange} />
      </div>
      {#if activeCheckInData && activeCheckInData.length > 0}
        <LineChart
          dataArr={activeCheckInData}
          type={checkInChartType}
          timeframe={convertTimeFrameToApiFormat(checkInTimeFrame)}
          title={`${checkInChartType === 'pain' ? 'Pain' : 'Mood'} Levels - ${checkInTimeFrame}`}
        />
        <div class="timeframe-selector">
          <XAxisTimeFrameSelectors
            selectedTimeFrame={checkInTimeFrame}
            on:timeframeChange={handleCheckInTimeFrameChange}
          />
        </div>
      {:else}
        <div class="no-metrics-container">
          <RemixIcon name="indeterminate-circle-fill" color="var(--text-secondary)" />
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .regular}; font-weight: {typography.fontWeights.medium};"
          >
            No metrics yet
          </p>
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .xsmall}; font-weight: {typography.fontWeights.regular};"
          >
            Complete your check in to see up-to-date data here
          </p>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <p>Loading...</p>
{/if}

<style>
  p {
    margin: 0;
  }
  a {
    color: var(--text-primary);
  }
  button {
    background-color: transparent;
    border: none;
  }
  .break {
    position: relative;
    width: 100vw;
    height: 8px;
    background-color: var(--background-secondary);
  }
  .break-small {
    position: relative;
    width: 100%;
    height: 2px;
    background-color: var(--background-secondary);
  }
  .background-wave {
    position: fixed;
    top: -17%;
    left: 50%;
    transform: translateX(-50%);
    z-index: -1;
    width: 562px;
  }
  .header-container {
    position: relative;
    width: 100%;
    overflow-x: hidden;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding-top: 40px;
  }
  .body-container {
    margin: 16px 16px 0 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-items: center;
    row-gap: 8px;
  }
  .metrics-container {
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    align-items: flex-start;
    width: 100%;
  }
  .metrics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .timeframe-selector {
    padding: 0 12px 12px;
    width: 100%;
  }
  .no-metrics-container {
    color: var(--text-secondary);
    align-self: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    max-width: 182px;
    margin-top: 32px;
  }
  .no-metrics-container p {
    line-height: 150%;
    color: var(--color-grey-400);
  }
  .wave-container {
    position: relative;
    width: 100%;
    overflow-x: hidden;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .checkin-cta-container {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    width: 100%;
  }
  @media (min-width: 800px) {
    .break {
      display: none;
    }
    .break-small {
      display: none;
    }
    .body-container {
      margin: 16px auto 0 auto;
      padding: 0 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      align-items: center;
      row-gap: 8px;
      max-width: 806px;
    }
    .cta-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: calc(100% - 32px);
      max-width: 806px;
      margin: auto;
      padding-top: 92px;
    }
    .cta-container-text {
      text-align: left;
    }
    .metrics-container {
      margin-top: 32px;
    }
    .wave-light {
      content: url('/src/lib/assets/background-images/HomeBackgroundLargeLight.svg');
    }
    .wave-dark {
      content: url('/src/lib/assets/background-images/HomeBackgroundLargeDark.svg');
    }
    .background-wave {
      width: 1500px;
      top: -450px;
      left: 100%;
    }
  }
  @media (min-width: 1000px) {
    .background-wave {
      width: 1500px;
      top: -450px;
      left: 75%;
    }
  }
</style>
