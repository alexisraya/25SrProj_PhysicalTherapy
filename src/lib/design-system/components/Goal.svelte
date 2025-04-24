<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import { goalsMap } from '$lib/goals';

  export let goalName: string;
  export let isLocked: boolean = false;
  export let hasExtraInfo: boolean = false;
  export let extraInfo: string;
  export let goalId: string;
  export let isInModal: boolean = false;

  export const defaultGoals = [
    { goalName: 'Unlocked Goal', isLocked: false, hasExtraInfo: false },
    { goalName: 'Unlocked Goal', isLocked: false, hasExtraInfo: true, extraInfo: 'Time' },
    { goalName: 'Locked Goal', isLocked: true, hasExtraInfo: false },
    { goalName: 'Locked Goal', isLocked: true, hasExtraInfo: true, extraInfo: 'Time' }
  ];

  let currentTheme: 'light' | 'dark' = 'light';

  function updateThemeFromStorage() {
    // Check localStorage directly
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      currentTheme = savedTheme;
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      currentTheme = prefersDark ? 'dark' : 'light';
    }
  }

  onMount(() => {
    // Initial check from localStorage
    updateThemeFromStorage();

    // Listen for custom theme change events
    const handleThemeChange = () => {
      updateThemeFromStorage();
    };

    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', updateThemeFromStorage);
    };
  });
</script>

<div class="goal-container">
  <div class="goal-icon {isLocked ? 'locked' : 'unlocked'} {isInModal ? 'inModal' : ''}">
    <div class="floating-icon">
      {#if isLocked}
        {#if currentTheme == 'light'}
          <Icon name="lock-light" size="small" />
        {:else}
          <Icon name="lock-dark" size="small" />
        {/if}
      {:else}
        <Icon name={goalsMap[goalId]} size={isInModal ? 'large' : 'small'} />
      {/if}
    </div>
  </div>

  <p
    class="goal-name"
    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
      .xsmall}; font-weight: {typography.fontWeights.regular};"
  >
    {goalName}
  </p>

  {#if extraInfo}
    <p
      class="goal-extra"
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .xxsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic"
    >
      {extraInfo}
    </p>
  {/if}
</div>

<style>
  p {
    margin: 0;
  }
  .goal-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 92px;
    align-self: stretch;
    text-align: center;
  }

  .goal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1000px;
    width: 92px;
    height: 92px;
  }

  .inModal {
    width: 225px;
    height: 225px;
  }

  @keyframes floatUpDown {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(4px);
    } /* Moves slightly up */
    100% {
      transform: translateY(0px);
    } /* Moves back down */
  }

  .unlocked {
    background-color: var(--unlocked-goal-background);
  }

  .locked {
    background-color: transparent;
    border: 2px solid var(--locked-goal-border);
  }

  .goal-name {
    color: var(--text-primary);
    margin-top: 12px;
  }

  .goal-extra {
    color: var(--color-grey-300); /* light/dark mode exception */
  }
  .unlocked:hover .floating-icon {
    animation: floatUpDown 2s ease-in-out infinite; /* Apply animation */
  }
</style>
