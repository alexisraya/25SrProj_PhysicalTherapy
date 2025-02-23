<script lang="ts">
    import { onMount } from 'svelte';
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

    onMount(() => {
        const unsubscribe = authStore.subscribe(async (auth) => {
            if (!auth.isLoading && auth.currentUser) {
                try {
                    const [programData, statsData, weeklyData] = await Promise.all([
                        getCurrentProgram(auth.currentUser.uid),
                        getUserStats(auth.currentUser.uid),
                        getWeeklyProgress(auth.currentUser.uid)
                    ]);
                    
                    program = programData;
                    stats = statsData;
                    weeklyProgress = weeklyData;
                } catch (err) {
                    error = err.message;
                } finally {
                    loading = false;
                }
            }
        });

        return unsubscribe;
    });

    function getProgressPercentage(): number {
        if (!program?.exercises) return 0;
        const completed = program.exercises.filter(ex => ex.completed).length;
        return (completed / program.exercises.length) * 100;
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString();
    }

    function formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
</script>

<div class="program-container">
    {#if loading}
        <p>Loading program...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else if program}
        <!-- Program Overview -->
        <div class="program-header">
            <h2>Today's Program</h2>
            <div class="program-meta">
                <span>Estimated Time: {program.estimatedTime} minutes</span>
                <span>Assigned: {formatDate(program.assignedAt)}</span>
            </div>
        </div>

        <!-- Progress Section -->
        <div class="progress-section">
            <div class="progress-cards">
                <!-- Daily Progress -->
                <div class="progress-card">
                    <h3>Today's Progress</h3>
                    <div class="progress-bar">
                        <div 
                            class="progress-fill"
                            style="width: {getProgressPercentage()}%"
                        ></div>
                    </div>
                    <p>{program.exercises.filter(ex => ex.completed).length} / {program.exercises.length} exercises completed</p>
                </div>

                <!-- Weekly Progress -->
                {#if weeklyProgress}
                    <div class="progress-card">
                        <h3>Weekly Goal Progress</h3>
                        <div class="progress-bar">
                            <div 
                                class="progress-fill"
                                style="width: {(weeklyProgress.daysCompleted / 5) * 100}%"
                            ></div>
                        </div>
                        <p>{weeklyProgress.daysCompleted}/5 days completed</p>
                        <p class="text-sm">Week starting {formatDate(weeklyProgress.weekStartDate)}</p>
                    </div>
                {/if}

                <!-- Stats Summary -->
                {#if stats}
                    <div class="progress-card">
                        <h3>Current Stats</h3>
                        <div class="stats-summary">
                            <div class="stat-item">
                                <span>Streak</span>
                                <span>{stats.currentStreak} days</span>
                            </div>
                            <div class="stat-item">
                                <span>Total Time</span>
                                <span>{formatTime(stats.totalTime)}</span>
                            </div>
                            <div class="stat-item">
                                <span>Completed</span>
                                <span>{stats.completedExercises} exercises</span>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Exercise List -->
        <div class="exercise-list">
            <h3>Exercises</h3>
            {#each program.exercises as exercise, i}
                <div class="exercise-card" class:completed={exercise.completed} class:skipped={exercise.skipped}>
                    <div class="exercise-info">
                        <h4>{exercise.exerciseName}</h4>
                        <p>
                            {#if exercise.exerciseType === 'distance'}
                                {exercise.sets} sets of {exercise.steps} steps
                            {:else if exercise.exerciseType === 'weight'}
                                {exercise.sets} sets of {exercise.reps} reps at {exercise.weight}lbs
                            {:else}
                                {exercise.reps} times, {exercise.seconds} seconds each
                            {/if}
                        </p>
                        {#if exercise.equipment}
                            <small>Equipment: {exercise.equipment}</small>
                        {/if}
                    </div>
                    <div class="exercise-status">
                        {#if exercise.completed}
                            <span class="status completed">✓ Completed {formatDate(exercise.completedAt)}</span>
                        {:else if exercise.skipped}
                            <span class="status skipped">Skipped</span>
                        {:else}
                            <a href="/exploration/firebase-test/exercise-flow/{exercise.exerciseId}" class="start-btn">
                                Start Exercise
                            </a>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p>No program found</p>
    {/if}
</div>

<style>
    .program-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }

    .program-header {
        margin-bottom: 2rem;
    }

    .program-meta {
        display: flex;
        gap: 1rem;
        color: #6b7280;
    }

    .progress-section {
        margin-bottom: 2rem;
    }

    .progress-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
    }

    .progress-card {
        background: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        margin: 1rem 0;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: #3b82f6;
        transition: width 0.3s ease;
    }

    .stats-summary {
        display: grid;
        gap: 0.5rem;
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e5e7eb;
    }

    .exercise-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        margin-bottom: 0.5rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .exercise-card.completed {
        background: #f0fdf4;
    }

    .exercise-card.skipped {
        background: #fef2f2;
    }

    .status {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
    }

    .status.completed {
        background: #dcfce7;
        color: #166534;
    }

    .status.skipped {
        background: #fee2e2;
        color: #991b1b;
    }

    .start-btn {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: #3b82f6;
        color: white;
        border-radius: 0.25rem;
        text-decoration: none;
    }

    .start-btn:hover {
        background: #2563eb;
    }

    .error {
        color: #ef4444;
    }
</style>
