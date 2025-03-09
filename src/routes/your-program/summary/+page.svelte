<script lang="ts">
    import { onMount } from "svelte";
    import { authStore } from "$stores/authStore";
    import { getCurrentProgram } from "$firebase/services/programService";
    import {
        getUserStats,
        getWeeklyProgress,
        checkAndResetProgress,
    } from "$firebase/services/statService";
    import type { Program } from "$firebase/types/userType";
    import type { UserStats } from "$firebase/types/userType";
    import { typography } from "$lib/design-system";
    import Streak from "$lib/design-system/components/Streak.svelte";
    import ExerciseCard from "$lib/design-system/components/ExerciseCard.svelte";
    import ProgramCompletePlayButton from "$lib/assets/iconography/ProgramCompletePlayButton.svg";
    import SummaryBlob from "$lib/assets/background-images/SummaryBlob.svg";

    let program: Program | null = null;
    let stats: UserStats | null = null;
    let weeklyProgress: any = null;
    let loading = true;
    let error: string | null = null;

    const today = new Date();
    console.log(`today ${today}`);
    // 2025-03-03T02:14:02.010Z
    onMount(async () => {
        try {
            if (!$authStore.currentUser) return;
            const userId = $authStore.currentUser.uid;
            await checkAndResetProgress($authStore.currentUser.uid);

            const [programData, statsData, weeklyData] = await Promise.all([
                getCurrentProgram(userId),
                getUserStats(userId),
                getWeeklyProgress(userId),
            ]);

            program = programData;
            stats = statsData;
            weeklyProgress = weeklyData;
        } catch (err) {
            console.error("Error loading completion data:", err);
            error =
                err instanceof Error
                    ? err.message
                    : "Failed to load completion data";
        } finally {
            console.log("Completed Data");
            console.log("Program:");
            console.log(program);
            console.log("Stats:");
            console.log(stats);
            console.log("Weekly Progress:");
            console.log(weeklyProgress);
            loading = false;
        }
    });
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
                        <ExerciseCard isComplete exerciseName={exercise.exerciseName} />
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