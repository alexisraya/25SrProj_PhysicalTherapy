<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '$stores/authStore';
    import { goalStore } from '$stores/goalStore';

    onMount(() => {
        if ($authStore.currentUser) {
            goalStore.loadGoals($authStore.currentUser.uid);
        }
    });

    function formatMonth(month: string): string {
        return `Month ${month}`;
    }
</script>

<div class="goals-page">
    <header>
        <h1>Goals</h1>
        <a href="/your-progress" class="back-link">Back to Progress</a>
    </header>

    <div class="info-panel">
        <p>These goals are set by your physical therapist and are based on the timeline of your recovery. They are subject to change.</p>
    </div>

    {#if $goalStore.isLoading}
        <div class="loading-container">
            <p>Loading goals...</p>
        </div>
    {:else if $goalStore.error}
        <div class="error-container">
            <p>{$goalStore.error}</p>
            <button on:click={() => goalStore.loadGoals($authStore.currentUser.uid)} class="reload-btn">
                Reload Goals
            </button>
        </div>
    {:else if Object.keys($goalStore.goals).length === 0}
        <div class="empty-state">
            <p>No goals have been assigned yet. Please check with your therapist.</p>
            <button on:click={() => goalStore.loadGoals($authStore.currentUser.uid)} class="reload-btn">
                Reload Goals
            </button>
        </div>
    {:else}
        <div class="timeline">
            {#each Object.entries($goalStore.goals).sort(([a], [b]) => parseInt(a) - parseInt(b)) as [month, goals] }
                <div class="month-container">
                    <h2 class="month-title">{formatMonth(month)}</h2>
                    <div class="goals-container">
                        {#each goals as goal}
                            <div class="goal-card {goal.unlocked ? 'unlocked' : 'locked'}">
                                <div class="goal-header">
                                    <h3 class="goal-name">{goal.goalName}</h3>
                                    <span class="goal-timeframe">{goal.timeframe}</span>
                                </div>
                                
                                {#if goal.unlocked}
                                    <div class="goal-content">
                                        <p class="goal-description">{goal.description}</p>
                                    </div>
                                    <div class="goal-status unlocked">
                                        <span class="status-text">✓ Unlocked</span>
                                    </div>
                                {:else}
                                    <div class="goal-content locked">
                                        <p class="locked-message">
                                            This goal will be unlocked by your therapist as you progress.
                                        </p>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>