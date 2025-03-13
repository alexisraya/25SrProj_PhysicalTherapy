<script lang="ts">
    import StatBlock from "$lib/design-system/components/StatBlock.svelte";
    import Chart from '$lib/design-system/components/Chart.svelte';
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { authStore } from "$stores/authStore";
    import { getCurrentProgram } from "$firebase/services/programService";
    import {
        getUserStats,
        getWeeklyProgress,
        checkAndResetProgress,
    } from "$firebase/services/statService";
    import type { Program } from "$firebase/types/userType";
    import type { UserStats } from "$firebase/types/userType";

    let program: Program | null = null;
    let stats: UserStats | null = null;
    let weeklyProgress: any = null;
    let loading = true;
    let error: string | null = null;

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
            console.log(stats);
            loading = false;
        }
    });

    function formatTime(seconds: number): string {
        if (!seconds) return "0m 0s";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }

</script>
<div class="stats-container">
    <div class="stat-section recovery-metrics">
        <Chart />
    </div>
    <div class="stat-section stats">
        {#if stats}
            <StatBlock statTitle="Completed Exercises" stat={program?.exercises.filter((ex) => ex.completed,).length || 0} />
            <StatBlock statTitle="Completed Programs" stat={stats.completedPrograms} />
            <StatBlock statTitle="Total Reps" stat={stats.totalReps} />
            <StatBlock statTitle="Total Sets" stat={stats.totalSets} />
            <StatBlock statTitle="Total Lifted" stat={stats.totalWeight}/>
            <StatBlock statTitle="Total Distance" stat={stats.totalDistance}/>
        {:else}
            <p>Loading Stats...</p>
        {/if}
    </div>
    <div class="stat-section check-in-metrics">
        <Chart />
    </div>
</div>

<style>
    .stats-container {
        display: flex;
        flex-direction: column;
        row-gap: 8px;
    }
    .stat-section {
        background-color: var(--color-grey-0);
        width: 100%;
    }
    .recovery-metrics {
        padding-top: 50px;
        min-height: 210px;
    }
    .stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        justify-items: start;
        row-gap: 48px;
        column-gap: 24px;
        padding: 16px 0 16px 24px;
    }
    .check-in-metrics {
        min-height: 250px;
    }
</style>