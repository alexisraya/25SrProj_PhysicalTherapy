<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$stores/authStore';
  import { goalStore } from '$stores/goalStore';
  import Goal from '$lib/design-system/components/Goal.svelte';
  import { typography } from '$lib/design-system';

  onMount(() => {
    if ($authStore.currentUser) {
      goalStore.loadGoals($authStore.currentUser.uid);
    }
  });

  function formatMonth(month: string): string {
    return `Month ${month}`;
  }
</script>

<div class="goals-page-container">
  <div class="goals-header">
    <h3
      style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
        .h3}; font-weight: {typography.fontWeights.regular};"
    >
      Goals
    </h3>
    <p
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .small}; font-weight: {typography.fontWeights.regular};"
    >
      These goals are <b style="font-weight: {typography.fontWeights.bold};"
        >set by your physical therapist</b
      > and are based on the timeline of your recovery. They are subject to change.
    </p>
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
    {#each Object.entries($goalStore.goals).sort(([a], [b]) => parseInt(a) - parseInt(b)) as [month, goals]}
      <div class="goals-month-container">
        <p
          class="achievement-type-title"
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .small}; font-weight: {typography.fontWeights.medium};"
        >
          {formatMonth(month)}
        </p>
        <div class="horizontal-box" />
        <div class="goals-container">
          {#each goals as goalItem}
            <Goal
              goalName={goalItem.goalName}
              isLocked={!goalItem.unlocked}
              extraInfo={goalItem.timeframe}
            />
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  p,
  h3 {
    margin: 0;
  }
  .goals-page-container {
    display: flex;
    flex-direction: column;
    row-gap: 32px;
    padding: 40px 24px;
  }
  .goals-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 16px;
    text-align: center;
    max-width: 524px;
    margin: auto;
  }
  .goals-month-container {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    max-width: 552px;
    margin: auto;
  }
  .horizontal-box {
    background-color: var(--background-secondary);
    width: 100%;
    height: 2px;
    margin-bottom: 8px;
  }
  .goals-container {
    display: grid;
    grid-template-columns: repeat(3, 92.5px);
    align-items: flex-start;
    justify-content: center;
    column-gap: 25.5px;
    row-gap: 16px;
  }

  @media (min-width: 800px) {
    .goals-container {
      display: grid;
      grid-template-columns: repeat(5, 92.5px);
      align-items: flex-start;
      justify-content: center;
      column-gap: 25.5px;
      row-gap: 16px;
    }
  }
</style>
