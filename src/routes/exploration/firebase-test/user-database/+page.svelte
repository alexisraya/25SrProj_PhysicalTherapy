<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '$stores/authStore';
    import { getUser, getUserStats, getWeeklyProgress } from '$firebase/userService';

    let userData = null;
    let userStats = null;
    let weeklyProgress = null;
    let loading = true;
    let error = null;

    onMount(() => {
        const unsubscribe = authStore.subscribe(async (auth) => {
            if (!auth.isLoading && auth.currentUser) {
                try {
                    const [user, stats, weekly] = await Promise.all([
                        getUser(auth.currentUser.uid),
                        getUserStats(auth.currentUser.uid),
                        getWeeklyProgress(auth.currentUser.uid)
                    ]);
                    
                    userData = user;
                    userStats = stats;
                    weeklyProgress = weekly;
                } catch (err) {
                    error = err.message;
                } finally {
                    loading = false;
                }
            }
        });

        return unsubscribe;
    });

    function formatDate(dateString: string | null): string {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    }
</script>

<div class="user-stats-container">
    {#if loading}
        <p>Loading user data...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else if userData && userStats}
        <div class="stats-grid">
            <!-- User Info -->
            <div class="stats-card">
                <h2>User Information</h2>
                <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Member since:</strong> {formatDate(userData.createdAt)}</p>
            </div>

            <!-- Streak Information -->
            <div class="stats-card">
                <h2>Streaks</h2>
                <div class="streak-info">
                    <div class="streak-item">
                        <span class="streak-label">Current Streak</span>
                        <span class="streak-value">{userStats.currentStreak} days</span>
                    </div>
                    <div class="streak-item">
                        <span class="streak-label">Longest Streak</span>
                        <span class="streak-value">{userStats.longestStreak} days</span>
                    </div>
                    <div class="streak-item">
                        <span class="streak-label">Last Active</span>
                        <span class="streak-value">{formatDate(userStats.lastCompletedDate)}</span>
                    </div>
                </div>
            </div>

            <!-- Weekly Progress -->
            <div class="stats-card">
                <h2>Weekly Progress</h2>
                <div class="progress-info">
                    <p>Week Starting: {formatDate(weeklyProgress.weekStartDate)}</p>
                    <div class="progress-bar">
                        <div 
                            class="progress-fill" 
                            style="width: {(weeklyProgress.daysCompleted / 5) * 100}%"
                        ></div>
                    </div>
                    <p>{weeklyProgress.daysCompleted}/5 days completed</p>
                    <p>{weeklyProgress.exercisesCompleted} exercises completed</p>
                    <p>{weeklyProgress.remainingDays} days remaining this week</p>
                </div>
            </div>

            <!-- Overall Stats -->
            <div class="stats-card">
                <h2>Exercise Statistics</h2>
                <div class="stats-grid-mini">
                    <div class="stat-item">
                        <span class="stat-label">Completed Exercises</span>
                        <span class="stat-value">{userStats.completedExercises}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Completed Programs</span>
                        <span class="stat-value">{userStats.completedPrograms}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Sets</span>
                        <span class="stat-value">{userStats.totalSets}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Reps</span>
                        <span class="stat-value">{userStats.totalReps}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Weight (lbs)</span>
                        <span class="stat-value">{userStats.totalWeight}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Distance (steps)</span>
                        <span class="stat-value">{userStats.totalDistance}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Time (seconds)</span>
                        <span class="stat-value">{userStats.totalTime}</span>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <p>No user data found</p>
    {/if}
</div>

<style>
    .user-stats-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .stats-card {
        background: white;
        border-radius: 0.5rem;
        padding: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .streak-info, .progress-info {
        margin-top: 1rem;
    }

    .streak-item, .stat-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .progress-bar {
        width: 100%;
        height: 20px;
        background: #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
        margin: 1rem 0;
    }

    .progress-fill {
        height: 100%;
        background: #3b82f6;
        transition: width 0.3s ease;
    }

    .stats-grid-mini {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
    }

    .stat-label {
        color: #6b7280;
    }

    .stat-value {
        font-weight: 600;
    }

    .error {
        color: #ef4444;
    }
</style>