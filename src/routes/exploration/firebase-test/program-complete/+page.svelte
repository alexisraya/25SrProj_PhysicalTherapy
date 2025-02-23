<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { authStore } from '$stores/authStore';
    import { 
        getCurrentProgram,
        getUserStats,
        getWeeklyProgress 
    } from '$firebase/userService';

    let program = null;
    let stats = null;
    let weeklyProgress = null;
    let loading = true;
    let error = null;

    let achievements = [
        { title: "Program Complete!", description: "Completed all exercises in the program" },
        { title: "Daily Goal", description: "Added to your daily streak" },
        { title: "Progress Made", description: "Updated your overall stats" }
    ];

    onMount(async () => {
        if (!$authStore.currentUser) return;

        try {
            const [programData, statsData, weeklyData] = await Promise.all([
                getCurrentProgram($authStore.currentUser.uid),
                getUserStats($authStore.currentUser.uid),
                getWeeklyProgress($authStore.currentUser.uid)
            ]);

            program = programData;
            stats = statsData;
            weeklyProgress = weeklyData;
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    });

    function formatTime(seconds: number): string {
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
            <h1>🎉 Program Complete!</h1>
            <p>Great work on completing today's exercises</p>
        </div>

        <!-- Achievements Section -->
        <div class="achievements-section">
            <h2>Achievements Unlocked</h2>
            <div class="achievements-grid">
                {#each achievements as achievement}
                    <div class="achievement-card">
                        <div class="achievement-icon">🏆</div>
                        <h3>{achievement.title}</h3>
                        <p>{achievement.description}</p>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Stats Update -->
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
                        <p class="stat-value">{weeklyProgress.daysCompleted}/5</p>
                        <p class="stat-label">days completed this week</p>
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
                            <span>{program?.exercises.filter(ex => ex.completed).length || 0}</span>
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

        <!-- Action Buttons -->
        <div class="action-buttons">
            <a href="/exploration/firebase-test/program-view" class="btn primary">
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

    .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 1rem 0 2rem;
    }

    .achievement-card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .achievement-icon {
        font-size: 2rem;
        margin-bottom: 1rem;
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