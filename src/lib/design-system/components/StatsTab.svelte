<script lang="ts">
  import StatBlock from '$lib/design-system/components/StatBlock.svelte';
  import LineChart from '$lib/design-system/components/LineChart.svelte';
  import BarChart from '$lib/design-system/components/BarChart.svelte';
  import PainMoodDropdown from '$lib/design-system/components/PainMoodDropdown.svelte';
  import XAxisTimeFrameSelectors from '$lib/design-system/components/XAxisTimeFrameSelectors.svelte';
  import { onMount } from 'svelte';
  import { authStore } from '$stores/authStore';
  import { getCurrentProgram } from '$firebase/services/programService';
  import {
    getUserStats,
    getWeeklyProgress,
    checkAndResetProgress
  } from '$firebase/services/statService';
  import type { Program, UserMetrics } from '$firebase/types/userType';
  import type { UserStats } from '$firebase/types/userType';
  import { getCheckInStats } from '$firebase/services/checkInService';
  import { getUserMetrics } from '$firebase/services/metricsService';
  import RomStrengthDropdown from '$lib/design-system/components/RomStrengthDropdown.svelte';
  import { typography } from '$lib/design-system/typography';
  import RemixIcon from './RemixIcon.svelte';

  let program: Program | null = null;
  let stats: UserStats | null = null;
  let metrics: UserMetrics | null = null;
  let weeklyProgress: any = null;
  let loading = true;
  let error: string | null = null;

  let romStats: number[] = [];
  let strengthStats: number[] = [];

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

  // Track the current chart type for each section
  let recoveryChartType = 'rom';
  let checkInChartType = 'mood';

  // Track the current timeframe for each section
  let recoveryTimeFrame = '1 Week';
  let checkInTimeFrame = '1 Week';

  // Get active data based on current selections
  $: activeCheckInData =
    checkInChartType === 'pain' ? painStatsData[checkInTimeFrame] : moodStatsData[checkInTimeFrame];

  $: activeRecoveryData = recoveryChartType === 'rom' ? romStats : strengthStats;

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

  onMount(async () => {
    try {
      if (!$authStore.currentUser) return;
      const userId = $authStore.currentUser.uid;
      await checkAndResetProgress(userId);

      // Load initial data for 1 week timeframe
      await loadCheckInStatus(userId, 'week');

      const [programData, statsData, weeklyData, metricsData] = await Promise.all([
        getCurrentProgram(userId),
        getUserStats(userId),
        getWeeklyProgress(userId),
        getUserMetrics(userId)
      ]);

      program = programData;
      stats = statsData;
      weeklyProgress = weeklyData;
      metrics = metricsData;

      if (metrics) {
        console.log('METRICS DATA', metrics);
        romStats = metrics.rangeOfMotion || [];
        strengthStats = metrics.strength || [];
      }
      console.log(stats);
    } catch (err) {
      console.error('Error loading completion data:', err);
      error = err instanceof Error ? err.message : 'Failed to load completion data';
    } finally {
      loading = false;
    }
  });

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
  function handleRecoveryChartTypeChange(event) {
    recoveryChartType = event.detail.value;
  }

  function handleCheckInChartTypeChange(event) {
    checkInChartType = event.detail.value;
  }

  async function handleRecoveryTimeFrameChange(event) {
    recoveryTimeFrame = event.detail;

    // Load data for this timeframe if not loaded yet
    if (!painStatsData[recoveryTimeFrame]?.length && !moodStatsData[recoveryTimeFrame]?.length) {
      if ($authStore.currentUser) {
        const apiTimeFrame = convertTimeFrameToApiFormat(recoveryTimeFrame);
        await loadCheckInStatus($authStore.currentUser.uid, apiTimeFrame);
      }
    }
  }

  async function handleCheckInTimeFrameChange(event) {
    checkInTimeFrame = event.detail;

    // Load data for this timeframe if not loaded yet
    if (!painStatsData[checkInTimeFrame]?.length && !moodStatsData[checkInTimeFrame]?.length) {
      if ($authStore.currentUser) {
        const apiTimeFrame = convertTimeFrameToApiFormat(checkInTimeFrame);
        await loadCheckInStatus($authStore.currentUser.uid, apiTimeFrame);
      }
    }
  }
</script>

<div class="stats-container">
  <div class="stat-section recovery-metrics">
    <div class="chart-header">
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.medium}; margin: 0;"
      >
        Recovery Metrics
      </p>
      <RomStrengthDropdown value={recoveryChartType} on:change={handleRecoveryChartTypeChange} />
    </div>

    {#if recoveryChartType === 'rom' && romStats && romStats.length > 0}
      <BarChart
        dataArr={romStats}
        type="rom"
        title="Range of Motion Progress"
        yLabel="Degrees"
        labels={romStats.map((_, i) => `Week ${i + 1}`)}
      />
    {:else if recoveryChartType === 'strength' && strengthStats && strengthStats.length > 0}
      <BarChart
        dataArr={strengthStats}
        type="strength"
        title="Strength Progress"
        yLabel="Strength scale"
        labels={strengthStats.map((_, i) => `Week ${i + 1}`)}
      />
    {:else}
      <div class="no-data-container">
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
            Your physical therapist will add your data here when tracked
          </p>
        </div>
      </div>
    {/if}
  </div>

  <div class="stat-section stats">
    {#if stats}
      <StatBlock statTitle="Completed Exercises" stat={stats.completedExercises} />
      <StatBlock statTitle="Completed Programs" stat={stats.completedPrograms} />
      <StatBlock statTitle="Total Reps" stat={stats.totalReps} />
      <StatBlock statTitle="Total Sets" stat={stats.totalSets} />
      <StatBlock statTitle="Total Lifted" stat={stats.totalWeight} />
      <StatBlock statTitle="Total Distance" stat={stats.totalDistance} />
    {:else}
      <p>Loading Stats...</p>
    {/if}
  </div>

  <div class="stat-section check-in-metrics">
    <div class="chart-header">
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.medium}; margin: 0;"
      >
        Check-in Metrics
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
        <XAxisTimeFrameSelectors on:timeframeChange={handleCheckInTimeFrameChange} />
      </div>
    {:else}
      <div class="no-data-container">
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
      </div>
    {/if}
  </div>
</div>

<style>
  .stats-container {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    margin-top: 48px;
    max-width: 100%;
  }

  .stat-section {
    background-color: var(--background);
    width: 100%;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
  }

  .chart-header h3 {
    margin: 0;
    font-size: 16px;
  }

  .timeframe-selector {
    padding: 0 12px 12px;
  }

  .no-data-container {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
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

  .recovery-metrics {
    padding-top: 8px;
    height: 100%;
    border-bottom: solid 8px var(--background-secondary);
  }

  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: start;
    row-gap: 48px;
    column-gap: 24px;
    padding: 32px 0 32px 24px;
    border-bottom: solid 8px var(--background-secondary);
  }

  .check-in-metrics {
    height: 100%;
    padding-top: 8px;
    border-bottom: solid 8px var(--background-secondary);
  }

  @media (min-width: 800px) {
    .stats-container {
      max-width: 100%;
      margin: 48px auto 32px; /* Add horizontal auto margins */
    }
  }

  @media (min-width: 1200px) {
    .recovery-metrics {
      grid-area: recovery;
      border-bottom: 8px solid var(--background-secondary);
      min-height: 400px;
      max-width: 600px;
    }

    .check-in-metrics {
      grid-area: check-in;
      min-height: 400px;
      max-width: 600px;
      border-bottom: 0px solid var(--background-secondary);
    }

    .stats {
      display: grid;
      grid-template-columns: 1fr;
      justify-items: start;
      row-gap: 48px;
      padding: 0 0 16px 48px;
      grid-area: stats;
      border-left: 8px solid var(--background-secondary);
      border-bottom: 0px solid var(--background-secondary);
    }

    .stats-container {
      max-width: 840px;
      margin: 150px auto 32px;
      display: grid;
      grid-template-columns: fit-content fit-content;
      column-gap: 24px;
      grid-template-areas:
        'recovery stats'
        'check-in stats';
    }
  }
</style>
