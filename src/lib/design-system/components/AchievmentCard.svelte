<script lang="ts">
  import Icon from './Icon.svelte';
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';

  export let achievementTitle: string;
  export let achievementMark: string;
  export let achievementValue: number;
  export let isLocked = false;

  let valueLabel = `${achievementValue} ${achievementMark}`;

  if (achievementMark == 'seconds' && achievementValue >= 60) {
    const minutes = Math.floor(achievementValue / 60);
    const seconds = achievementValue % 60;

    seconds > 0 ? (valueLabel = `${minutes}m ${seconds}s`) : (valueLabel = `${minutes} minutes`);
  }

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

<div class="achievement-card-container">
  <div class="achievement-body">
    <div class="achievement-image-container {isLocked ? 'locked' : ''}">
      {#if isLocked}
        {#if currentTheme == 'light'}
          <Icon name="lock-yellow-light" size="small" />
        {:else}
          <Icon name="lock-yellow-dark" size="small" />
        {/if}
      {:else}
        <Icon name="polar-bear" size="small" />
      {/if}
    </div>
    {#if isLocked}
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .xsmall}; font-weight: {typography.fontWeights.regular}; text-align: center;"
      >
        Locked
      </p>
    {:else}
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .xsmall}; font-weight: {typography.fontWeights.regular}; text-align: center;"
      >
        {achievementTitle}
      </p>
    {/if}
    <p
      class="achievement-mark"
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .xsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic;"
    >
      {valueLabel}
    </p>
  </div>
</div>

<style>
  p {
    margin: 0;
  }

  .achievement-card-container {
    display: flex;
    flex-direction: column;
    row-gap: 12px;
  }

  .achievement-body {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }

  .achievement-image-container {
    padding: 0px 20px;
    border-radius: 4px;
    background-color: var(--color-yellow-550); /* light/dark mode exception */
    border: 2px solid var(--color-yellow-550); /* light/dark mode exception */
    height: 101px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .locked {
    background-color: transparent;
    border-radius: 4px;
    border: 2px solid var(--locked-achievement-image-border);
  }

  .achievement-mark {
    color: var(--color-grey-300); /* light/dark mode exception */
    text-align: center;
  }
</style>
