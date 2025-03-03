<script lang="ts">
    import { onMount } from "svelte";
    import { authStore } from "$stores/authStore";
    import { achievementStore, achievementsByType } from "$stores/achieveStore";

    onMount(() => {
        if ($authStore.currentUser) {
            achievementStore.loadAchievements($authStore.currentUser.uid);
        }
    });

    function formatTarget(achievement: {
        achieveType: string;
        targetValue: number;
    }) {
        if (achievement.achieveType === "distance") {
            return `${achievement.targetValue} steps`;
        } else if (achievement.achieveType === "weight") {
            return `${achievement.targetValue} lbs`;
        } else if (achievement.achieveType === "time") {
            // Convert seconds to minutes for easier reading if over 60 seconds
            if (achievement.targetValue >= 60) {
                const minutes = Math.floor(achievement.targetValue / 60);
                const seconds = achievement.targetValue % 60;
                return seconds > 0
                    ? `${minutes}m ${seconds}s`
                    : `${minutes} minutes`;
            }
            return `${achievement.targetValue} seconds`;
        }
        return `${achievement.targetValue}`;
    }
</script>

<div class="goals-page">
    <header>
        <h1>Achievements</h1>
        <a href="/your-progress" class="back-link">Back to Progress</a>
    </header>

    <div class="info-panel">
        <p>
            Achievements are based on your exercises done in the app. Stay on
            track to unlock them all!
        </p>
    </div>

    {#if $achievementStore.isLoading}
        <div class="loading-container">
            <p>Loading achievements...</p>
        </div>
    {:else if $achievementStore.error}
        <div class="error-container">
            <p>{$achievementStore.error}</p>
            <button
                on:click={() =>
                    achievementStore.loadAchievements(
                        $authStore.currentUser.uid,
                    )}
                class="reload-btn"
            >
                Reload Achievements
            </button>
        </div>
    {:else}
        <div class="timeline">
            <div class="month-container">
                <h2 class="month-title">Strength</h2>
                <div class="goals-container">
                    {#each $achievementsByType.weight as achievement}
                        <div
                            class="goal-card {achievement.unlocked
                                ? 'unlocked'
                                : 'locked'}"
                        >
                            <div class="goal-header">
                                <h3 class="goal-name">
                                    {achievement.achieveName}
                                </h3>
                                <span class="goal-timeframe"
                                    >{formatTarget(achievement)}</span
                                >
                            </div>

                            {#if achievement.unlocked}
                                <div class="goal-status unlocked">
                                    <span class="status-text">✓ Unlocked</span>
                                </div>
                            {:else}
                                <div class="goal-content locked">
                                    <p class="locked-message">
                                        Complete exercises to unlock this
                                        achievement.
                                    </p>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>

            <div class="month-container">
                <h2 class="month-title">Time</h2>
                <div class="goals-container">
                    {#each $achievementsByType.time as achievement}
                        <div
                            class="goal-card {achievement.unlocked
                                ? 'unlocked'
                                : 'locked'}"
                        >
                            <div class="goal-header">
                                <h3 class="goal-name">
                                    {achievement.achieveName}
                                </h3>
                                <span class="goal-timeframe"
                                    >{formatTarget(achievement)}</span
                                >
                            </div>

                            {#if achievement.unlocked}
                                <div class="goal-status unlocked">
                                    <span class="status-text">✓ Unlocked</span>
                                </div>
                            {:else}
                                <div class="goal-content locked">
                                    <p class="locked-message">
                                        Complete exercises to unlock this
                                        achievement.
                                    </p>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>

            <div class="month-container">
                <h2 class="month-title">Distance</h2>
                <div class="goals-container">
                    {#each $achievementsByType.distance as achievement}
                        <div
                            class="goal-card {achievement.unlocked
                                ? 'unlocked'
                                : 'locked'}"
                        >
                            <div class="goal-header">
                                <h3 class="goal-name">
                                    {achievement.achieveName}
                                </h3>
                                <span class="goal-timeframe"
                                    >{formatTarget(achievement)}</span
                                >
                            </div>

                            {#if achievement.unlocked}
                                <div class="goal-status unlocked">
                                    <span class="status-text">✓ Unlocked</span>
                                </div>
                            {:else}
                                <div class="goal-content locked">
                                    <p class="locked-message">
                                        Complete exercises to unlock this
                                        achievement.
                                    </p>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>
