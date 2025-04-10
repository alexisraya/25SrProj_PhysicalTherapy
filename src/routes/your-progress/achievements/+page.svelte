<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$stores/authStore';
  import { achievementStore, achievementsByType } from '$stores/achieveStore';
  import AchievmentCard from '$lib/design-system/components/AchievmentCard.svelte';
  import { typography } from '$lib/design-system';

  onMount(() => {
    if ($authStore.currentUser) {
      achievementStore.loadAchievements($authStore.currentUser.uid);
    }
  });
</script>

<div class="achievement-page-container">
  {#if $achievementStore.isLoading}
    <div class="loading-container">
      <p>Loading achievements...</p>
    </div>
  {:else if $achievementStore.error}
    <div class="error-container">
      <p>{$achievementStore.error}</p>
      <button
        on:click={() => achievementStore.loadAchievements($authStore.currentUser.uid)}
        class="reload-btn"
      >
        Reload Achievements
      </button>
    </div>
  {:else}
    <div class="achievement-header">
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular};"
      >
        Achievements
      </h3>
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .small}; font-weight: {typography.fontWeights.regular};"
      >
        Achievements are based on your exercises done in the app.<br class="large-screen-show" /> Stay
        on track to unlock them all!
      </p>
    </div>
    <div class="achievement-type-container">
      <p
        class="achievement-type-title"
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .small}; font-weight: {typography.fontWeights.medium};"
      >
        Strength
      </p>
      <div class="horizontal-box"></div>
      <div class="achievement-container">
        {#each $achievementsByType.weight as achievement}
          <AchievmentCard
            achievementTitle={achievement.achieveName}
            achievementMark={achievement.targetUnits}
            achievementValue={achievement.targetValue}
            isLocked={!achievement.unlocked}
          />
        {/each}
      </div>
    </div>

    <div class="achievement-type-container">
      <p
        class="achievement-type-title"
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .small}; font-weight: {typography.fontWeights.medium};"
      >
        Time
      </p>
      <div class="horizontal-box"></div>
      <div class="achievement-container">
        {#each $achievementsByType.time as achievement}
          <AchievmentCard
            achievementTitle={achievement.achieveName}
            achievementMark={achievement.targetUnits}
            achievementValue={achievement.targetValue}
            isLocked={!achievement.unlocked}
          />
        {/each}
      </div>
    </div>

    <div class="achievement-type-container">
      <p
        class="achievement-type-title"
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .small}; font-weight: {typography.fontWeights.medium};"
      >
        Distance
      </p>
      <div class="horizontal-box"></div>
      <div class="achievement-container">
        {#each $achievementsByType.distance as achievement}
          <AchievmentCard
            achievementTitle={achievement.achieveName}
            achievementMark={achievement.targetUnits}
            achievementValue={achievement.targetValue}
            isLocked={!achievement.unlocked}
          />
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  p,
  h3 {
    margin: 0;
  }
  .achievement-page-container {
    display: flex;
    flex-direction: column;
    row-gap: 32px;
    padding: 40px 24px;
  }
  .achievement-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 16px;
    text-align: center;
    max-width: 576px;
    margin: auto;
  }
  .achievement-type-container {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    max-width: 576px;
    margin: auto;
  }
  .horizontal-box {
    background-color: var(--background-secondary);
    width: 100%;
    height: 2px;
    margin-bottom: 8px;
  }
  .achievement-container {
    display: grid;
    grid-template-columns: repeat(3, 92.5px);
    align-items: flex-start;
    justify-content: center;
    column-gap: 25.5px;
    row-gap: 16px;
  }
  .large-screen-show {
    display: none;
  }
  @media (min-width: 800px) {
    .achievement-container {
      display: grid;
      grid-template-columns: repeat(5, 92.5px);
      align-items: flex-start;
      justify-content: center;
      column-gap: 25.5px;
      row-gap: 16px;
    }
    .large-screen-show {
      display: block;
    }
  }
</style>
