<script lang="ts">
    import { typography } from '$lib/design-system';
    import PlayButton from '$lib/assets/iconography/PlayButton.svg';
    import homeBackgroundSmall from '$lib/assets/background-images/home-background-small.svg';
    import Streak from '$lib/design-system/components/Streak.svelte';
    import NoMetricsIcon from '$lib/assets/iconography/NoMetricsIcon.svg';
    import PainMoodDropdown from '$lib/design-system/components/PainMoodDropdown.svelte';
    import { getTone } from '$lib/helpers/toneContext';

    export let data;

    $: program = data.program;
    $: stats = data.stats;
    $: weeklyProgress = data.weeklyProgress;
    $: userData = data.userData;
    $: error = data.error;
    
    // Determine if we're in a loading state
    $: loading = !error && !program && !stats && !weeklyProgress;

    //Tone Text
    const { text } = getTone();
    const programCTATextOptions = [`home_program_cta_1`, `home_program_cta_2`, `home_program_cta_3`];
    const programCTAText = programCTATextOptions[Math.floor(Math.random() * programCTATextOptions.length)];

    const programCompleteTextOptions = [`complete_1`, `complete_2`, `complete_3`];
    const programCompleteText = programCompleteTextOptions[Math.floor(Math.random() * programCompleteTextOptions.length)];
</script>

{#if program && stats && weeklyProgress}
<div class="header-container">
    <img class="background-wave" src={homeBackgroundSmall} alt="background wave"/>
    <div class="cta-container">
        <h2 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h2}; font-weight: {typography.fontWeights.regular};">Hi {userData.firstName}!</h2>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.light}; margin-bottom: 8px;">{$text(programCTAText)}</p>
        <a href='/your-program'>
            <img src={PlayButton} />
        </a>
    </div>
</div>
<div class="body-container">
    <Streak streakType="home" streakTotalDays={weeklyProgress.daysCompleted + weeklyProgress.daysNeededForStreak} streakDaysCompleted={weeklyProgress.daysCompleted} overallStreak={stats?.completedPrograms}/>
    <div class="break"/>
    <div class="metrics-container">
        <div class="metrics-header">
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.medium};">Weekly Metrics</p>
            <PainMoodDropdown />
        </div>
        
        <!-- <Chart /> -->
         <div class="no-metrics-container">
            <img src={NoMetricsIcon} alt="indeterminate icon" />
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">No metrics yet</p>
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">Complete your check in to see up-to-date data here</p>
         </div>
    </div>
</div>
{:else}
    <p>Loading...</p>
{/if}

<style>
    p {
        margin: 0;
    }
    button {
        background-color: transparent;
        border: none;
    }
    .break {
        position: relative;
        width: 100vw;
        height: 8px;
        background-color: var(--color-blue-50);
    }
    .background-wave {
        position: absolute;
        top: -75%;
        left: 50%;
        transform: translateX(-50%);
        z-index: -1;
        width: 562px;
    }
    .header-container {
        position: relative;
        width: 100%;
        overflow-x: hidden;
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
    .program-streak-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 12px;
    }
    .program-streak-container--title {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    .program-title--streak {
        display: flex;
        column-gap: 4px;
    }
    .program-streak-container--streaks {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        column-gap: 2px;
    }
    .streak-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 8px;
    }
    .streak-item--rect {
        height: 12px;
        width: 100%;
        background-color: var(--color-purple-200);
        border-radius: 4px;
    }
    .day-one {
        background-color: var(--color-purple-600);
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

    .no-metrics-container {
        align-self: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        max-width: 182px;
        margin-top: 32px;
    }

    @media (min-width: 505px) {
        .background-wave {
            content: url('/background-images/home-background-large.svg');
            width: 2258px;
            top: -125%;
        }
    }
</style>