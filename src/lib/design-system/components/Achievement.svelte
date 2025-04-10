<script lang="ts">
  import { scale } from 'svelte/transition';
  import Icon from './Icon.svelte';
  import { typography } from '$lib/design-system/typography';
  import { goto } from '$app/navigation';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';

  export let type: string; // "program", "milestones"
  export let achievementDescription: string;

  const onClick = () => {
    goto('/your-progress/achievements');
  };
</script>

<button
  class="achievement-card-container {type}"
  on:click={onClick}
  in:scale={{ duration: 300, start: 0.8 }}
>
  <div class="achievement-header small-screen">
    <p
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .regular}; font-weight: {typography.fontWeights.medium};"
    >
      Achievements
    </p>
    <RemixIcon name="arrow-right-s-line" />
  </div>
  <div class="achievement-header large-screen">
    <p
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .large}; font-weight: {typography.fontWeights.medium};"
    >
      Achievements
    </p>
    <RemixIcon name="arrow-right-s-line" />
  </div>
  <div class="achievement-grid">
    <div class="achievement-body {type}-body">
      <div class="achievement-image-container">
        <Icon name="polar-bear" size="small" />
      </div>
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .xsmall}; font-weight: {typography.fontWeights.regular};"
      >
        {achievementDescription}
      </p>
    </div>
    <div class="achievement-body {type}-body {type}-large">
      <div class="achievement-image-container">
        <Icon name="polar-bear" size="small" />
      </div>
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .xsmall}; font-weight: {typography.fontWeights.regular};"
      >
        {achievementDescription}
      </p>
    </div>
  </div>
</button>

<style>
  p {
    margin: 0;
    color: var(--text-primary);
  }

  .achievement-card-container {
    position: relative;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    border-radius: 4px;
    border: 1px solid var(--achievement-card-border);
    background: var(--achievement-card-background);
    padding: 12px;
    cursor: pointer;
    z-index: 5;
  }

  .milestones {
    border-color: transparent;
    background-color: transparent;
    width: 100%;
  }

  .milestones-body {
    max-width: 284px;
  }

  .achievement-header {
    display: flex;
    justify-content: space-between;
  }

  .achievement-body {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    text-align: left;
  }

  .achievement-image-container {
    padding: 0px 20px;
    border-radius: 4px;
    background-color: var(--color-yellow-550); /* light/dark mode exception */
    height: 101px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .achievement-mark {
    color: var(--color-grey-300); /* light/dark mode exception */
    text-align: center;
  }
  .small-screen {
    display: flex;
  }
  .large-screen {
    display: none;
  }
  .milestones-large {
    display: none;
  }
  .achievement-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  @media (min-width: 800px) {
    .small-screen {
      display: none;
    }
    .large-screen {
      display: flex;
    }

    .milestones-large {
      display: flex;
    }
  }
</style>
