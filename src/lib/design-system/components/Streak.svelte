<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';

  export let streakType: string; // "home", "milestones", or "program"
  export let streakTotalDays: number;
  export let streakDaysCompleted: number;
  export let overallStreak: number = 4;
  const remainingDays = streakTotalDays - streakDaysCompleted;
</script>

<div class="streak-display-container {streakType}">
  <div class="streak-title">
    {#if streakType == 'home'}
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.medium};"
      >
        Weekly program streak
      </p>
    {:else}
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.medium};"
      >
        Streak
      </p>
    {/if}
    <div class="streak-count">
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.medium};"
      >
        {overallStreak}
      </p>
      <RemixIcon name="flashlight-fill" color="var(--streak-complete)" />
    </div>
  </div>
  <div class="streaks-container">
    {#each Array(streakDaysCompleted).fill(0) as _, i}
      <div class="streak-container">
        <div class="streak completed {streakType !== 'home' ? 'tall' : ''}"></div>
        {#if streakType == 'home'}
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .xsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic;"
          >
            Day {i + 1}
          </p>
        {/if}
      </div>
    {/each}
    {#each Array(remainingDays).fill(0) as _, i}
      <div class="streak-container">
        <div class="streak {streakType !== 'home' ? 'tall' : ''}"></div>
        {#if streakType == 'home'}
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .xsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic;"
          >
            Day {i + streakDaysCompleted + 1}
          </p>
        {/if}
      </div>
    {/each}
  </div>
  {#if streakType != 'home'}
    <div class="program-days-container">
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular};"
      >
        {streakDaysCompleted}/{streakTotalDays}
      </h3>
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.regular};"
      >
        programs
      </p>
    </div>
  {/if}
</div>

<style>
  h3,
  p {
    margin: 0;
  }
  .streak-display-container {
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    padding: 12px;
  }
  .streak-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .streaks-container {
    display: flex;
    column-gap: 2px;
    align-items: center;
    justify-content: center;
  }
  .home {
    width: 100%;
  }
  .program {
    background-color: var(--streak-background);
    border: 1px solid var(--streak-border);
    border-radius: 4px;
    padding: 16px 12px;
  }
  .streak-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 6px;
    width: 100%;
  }
  .streak {
    border-radius: 4px;
    display: flex;
    height: 12px;
    background-color: var(--streak-empty);
    width: 100%;
  }
  .tall {
    height: 101px;
    background-color: var(--streak-tall-empty);
  }
  .completed {
    background-color: var(--streak-filled);
  }
  .program-days-container {
    display: flex;
    align-items: flex-end;
    column-gap: 6px;
  }
  .program-days-container p {
    padding-bottom: 5px;
  }
  .streak-count {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    column-gap: 4px;
  }
</style>
