<script lang="ts">
    import { typography } from "$lib/design-system";
    import Streak from "$lib/design-system/components/Streak.svelte";
    import ExerciseCard from "$lib/design-system/components/ExerciseCard.svelte";
    import ProgramCompletePlayButton from "$lib/assets/iconography/ProgramCompletePlayButton.svg";
    import SummaryBlob from "$lib/assets/background-images/SummaryBlob.svg";

    export let data;

    $: program = data.program;
    $: stats = data.stats;
    $: weeklyProgress = data.weeklyProgress;
    $: error = data.error;
    
    // Determine if we're in a loading state
    $: loading = !error && !program && !stats && !weeklyProgress;
</script>

<div class="summary-page-container">
    <img class="blob" src={SummaryBlob} alt="background blob" />
    <div class="heading">
        <img src={ProgramCompletePlayButton} />
        <h3 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h3}; font-weight: {typography.fontWeights.regular}; text-align: center;">You're done!</h3>
    </div>
    {#if program}
        <div class="summary-container">
            <!-- Add achievements if any were unlocked that day -->
            <div class="program-summary">
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">Program Summary</p>
                <div class="horizontal-box"></div>
                <!-- TODO: Alexis check Streak with Sabrina -->
                <Streak streakType="program" streakTotalDays={weeklyProgress.daysCompleted + weeklyProgress.daysNeededForStreak} streakDaysCompleted={weeklyProgress.daysCompleted} overallStreak={stats?.completedPrograms}/>
            </div>
            <div class="exercise-summary">
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">Exercise Summary</p>
                <div class="horizontal-box"></div>
                <div class="completed-exerecises-container">
                    {#each program.exercises.filter((ex) => ex.completed) as exercise}
                        <ExerciseCard isComplete exerciseName={exercise.exerciseName} isTooPainful={exercise.skipped} cardType="summary"/>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    p, h3 {
        margin: 0;
    }
    .blob {
        position: absolute;
        z-index: 0;
        overflow: hidden;
        top: -135px;
        left: 50%;
        transform: translateX(-50%);
    }
    .summary-page-container {
        padding: 32px 24px;
    }
    .heading {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 16px;
        z-index: 1;
    }
    .summary-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 24px;
        padding-top: 32px;
    }
    .program-summary {
        width: 100%;
    }
    .exercise-summary {
        width: 100%;
    }
    .horizontal-box {
        background-color: var(--color-blue-50);
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
</style>