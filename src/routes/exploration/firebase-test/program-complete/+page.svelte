<script lang="ts">
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

<div class="completion-container">
    {#if loading}
        <p>Loading completion details...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else}
        <div class="completion-header">
            <h1>Program Complete!</h1>
            <p>Great work on completing today's exercises</p>
        </div>
        {#if stats && weeklyProgress}
            <div class="stats-section">
                <h2>Your Progress</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Current Streak</h3>
                        <p class="stat-value">{stats.currentStreak} days</p>
                        <p class="stat-label">Keep it going!</p>
                    </div>
                    <div class="stat-card">
                        <h3>Weekly Progress</h3>
                        <p class="stat-value">
                            {weeklyProgress.daysCompleted}/5
                        </p>
                        <p class="stat-label">days completed this week</p>
                        <p class="stat-label">
                            Days needed: {weeklyProgress.daysNeededForStreak}
                        </p>
                    </div>
                    <div class="stat-card">
                        <h3>Total Programs</h3>
                        <p class="stat-value">{stats.completedPrograms}</p>
                        <p class="stat-label">programs completed</p>
                    </div>
                </div>
                <div class="detailed-stats">
                    <h3>Today's Stats</h3>
                    <div class="stat-list">
                        <div class="stat-item">
                            <span>Exercises Completed</span>
                            <span
                                >{program?.exercises.filter(
                                    (ex) => ex.completed,
                                ).length || 0}</span
                            >
                        </div>
                        <div class="stat-item">
                            <span>Total Time</span>
                            <span>{formatTime(stats.totalTime)}</span>
                        </div>
                        {#if stats.totalDistance > 0}
                            <div class="stat-item">
                                <span>Distance Covered</span>
                                <span>{stats.totalDistance} steps</span>
                            </div>
                        {/if}
                        {#if stats.totalWeight > 0}
                            <div class="stat-item">
                                <span>Weight Lifted</span>
                                <span>{stats.totalWeight} lbs</span>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
        <div class="action-buttons">
            <a
                href="/exploration/firebase-test/program-view"
                class="btn primary"
            >
                Return to Program
            </a>
            <a href="/patient-dashboard" class="btn secondary">
                Go to Dashboard
            </a>
        </div>
    {/if}
</div>

<style>
    .completion-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 1rem;
    }

    .completion-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: white;
        padding: 1rem;
        border-radius: 0.5rem;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: #3b82f6;
        margin: 0.5rem 0;
    }

    .stat-label {
        color: #6b7280;
        font-size: 0.875rem;
    }

    .detailed-stats {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .stat-list {
        display: grid;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        background: #f9fafb;
        border-radius: 0.25rem;
    }

    .action-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }

    .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        text-decoration: none;
        font-weight: 500;
    }

    .btn.primary {
        background: #3b82f6;
        color: white;
    }

    .btn.secondary {
        background: #e5e7eb;
        color: #374151;
    }

    .error {
        color: #ef4444;
        text-align: center;
    }
</style>
