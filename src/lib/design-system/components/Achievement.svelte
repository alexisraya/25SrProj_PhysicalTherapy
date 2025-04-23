<script lang="ts">
  import { scale } from 'svelte/transition';
  import Icon from './Icon.svelte';
  import { typography } from '$lib/design-system/typography';
  import { goto } from '$app/navigation';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
  import { achievementsMap } from '$lib/achievements';

  export let type: string; // "program", "milestones"
  export let achievementDescription: string;
  export let achievmentId: string;
  export let iconName = '';

  let action = 'walked the';
  if (achievmentId.includes('time')) {
    action = 'exercised as long as it takes for';
  } else if (achievmentId.includes('weight')) {
    action = 'listed the weight of a';
  }

  const onClick = () => {
    goto('/your-progress/achievements');
  };

  // In Achievement.svelte
  // Add a console log in the script section
  $: console.log(
    'Achievement component received ID:',
    achievmentId,
    'Icon mapping:',
    achievementsMap[achievmentId]
  );
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
        <div class="floating-icon">
          {#if iconName}
            <Icon name={iconName} size="small" />
          {:else if achievementsMap[achievmentId]}
            <Icon name={achievementsMap[achievmentId]} size="small" />
          {:else}
            <Icon name="trophy" size="small" />
          {/if}
        </div>
      </div>
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .xsmall}; font-weight: {typography.fontWeights.regular};"
      >
        You've {action}
        {achievementDescription}!
      </p>
    </div>
    <div class="achievement-body {type}-body {type}-large">
      <div class="achievement-image-container">
        <!-- Check if we have a mapping for this achievement ID -->
        {#if iconName}
          <Icon name={iconName} size="small" />
        {:else if achievementsMap[achievmentId]}
          <Icon name={achievementsMap[achievmentId]} size="small" />
        {:else}
          <Icon name="trophy" size="small" />
        {/if}
      </div>
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .xsmall}; font-weight: {typography.fontWeights.regular};"
      >
        You've {action}
        {achievementDescription}!
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

  .summary {
    border-radius: 4px;
    border: 1px solid var(--achievement-card-border);
    background: var(--achievement-card-background);
    width: 100%;
  }

  /* Make sure the second achievement section is always visible for summary type */
  .summary-large {
    display: flex !important; /* Override any media queries */
  }

  /* Hide the first achievement section when type is summary */
  .summary-body:not(.summary-large) {
    display: none;
  }

  /* Header visibility control for summary type */
  .summary .small-screen {
    display: flex; /* Show small screen header by default */
  }

  .summary .large-screen {
    display: none; /* Hide large screen header by default */
  }
  @media (min-width: 1000px) {
    .small-screen {
      display: none;
    }
    .large-screen {
      display: flex;
    }

    .milestones-large {
      display: flex;
    }

    .summary .small-screen {
      display: none; /* Hide small screen header on large screens */
    }

    .summary .large-screen {
      display: flex; /* Show large screen header on large screens */
    }
  }
  @keyframes floatUpDown {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(4px);
    }
    100% {
      transform: translateY(0px);
    }
  }
  .achievement-image-container:hover .floating-icon {
    animation: floatUpDown 2s ease-in-out infinite;
  }
</style>
