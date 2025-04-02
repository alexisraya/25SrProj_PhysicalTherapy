<script lang="ts">
    import { typography } from '$lib/design-system';
    import PlayButtonLight from '$lib/assets/iconography/PlayButtonLight.svg';
    import PlayButtonDark from '$lib/assets/iconography/PlayButtonDark.svg';
    import homeBackgroundSmallLight from '$lib/assets/background-images/HomeBackgroundSmallLight.svg';
    import homeBackgroundSmallDark from '$lib/assets/background-images/HomeBackgroundSmallDark.svg';
    import Streak from '$lib/design-system/components/Streak.svelte';
    import PainMoodDropdown from '$lib/design-system/components/PainMoodDropdown.svelte';
    import { getTone } from '$lib/helpers/toneContext';
    import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
    import { onMount } from 'svelte';

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

    onMount(() => {
        // Initial check from localStorage
        updateThemeFromStorage();

        // Listen for custom theme change events
        const handleThemeChange = () => {
            updateThemeFromStorage();
        };
        
        window.addEventListener('themeChanged', handleThemeChange);

        return () => {
            window.removeEventListener('themeChanged', updateThemeFromStorage);
        };
    });
</script>

{#if program && stats && weeklyProgress}
<div class="header-container">
    {#if currentTheme == 'light'}
        <img class="background-wave" src={homeBackgroundSmallLight} alt="background wave"/>
    {:else}
        <img class="background-wave" src={homeBackgroundSmallDark} alt="background wave"/>
    {/if}
    <div class="cta-container">
        <h2 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h2}; font-weight: {typography.fontWeights.regular}; margin-bottom: 4px;">Hi {userData.firstName}!</h2>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.light}; margin-bottom: 12px;">{$text(programCTAText)}</p>
        <a href='/your-program'>
            {#if currentTheme == 'light'}
                <img src={PlayButtonLight} alt="play button"/>
            {:else}
                <img src={PlayButtonDark} alt="play button"/>
            {/if}
        </a>
    </div>
</div>
<div class="body-container">
    <Streak streakType="home" streakTotalDays={weeklyProgress.daysCompleted + weeklyProgress.daysNeededForStreak} streakDaysCompleted={weeklyProgress.daysCompleted} overallStreak={stats?.completedPrograms}/>
    <div class="break"/>
    <div class="metrics-container">
        <div class="metrics-header">
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.medium};">Weekly metrics</p>
            <PainMoodDropdown />
        </div>
        
        <!-- <Chart /> -->
         <div class="no-metrics-container">
            <RemixIcon name="indeterminate-circle-fill" color="var(--text-secondary)"/>
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
        background-color: var(--background-secondary);
    }
    .background-wave {
        position: absolute;
        top: -65%;
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

    @media (min-width: 505px) {
        .background-wave {
            content: url('/background-images/home-background-large.svg');
            width: 2258px;
            top: -125%;
        }
    }
</style>