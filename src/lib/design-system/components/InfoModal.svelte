<script lang="ts">
  import Icon from '$lib/design-system/components/Icon.svelte';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
  import { onMount } from 'svelte';
  import { typography } from '../typography';

  export let isGoal = false;
  export let isLocked = false;
  export let iconName: string;
  export let infoName: string;

  const closeModal = () => {
    return;
  };

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

<div class="modal-container">
  <button class="close-button" on:click={closeModal}>
    <RemixIcon name="close-line" />
  </button>
  <div class="modal-icon-container {isGoal ? 'goal' : 'achievement'}">
    {#if isLocked}
      {#if isGoal}
        {#if currentTheme == 'light'}
          <Icon name="lock-light" size="small" />
        {:else}
          <Icon name="lock-dark" size="small" />
        {/if}
      {:else if currentTheme == 'light'}
        <Icon name="lock-yellow-light" size="small" />
      {:else}
        <Icon name="lock-yellow-dark" size="small" />
      {/if}
    {:else}
      <Icon name={iconName} size="small" />
    {/if}
  </div>
  <div class="modal-information">
    {#if isGoal}
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.bold};"
      >
        {infoName}
      </p>
    {/if}
    {#if isLocked}
      {#if isGoal}
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .small}; font-weight: {typography.fontWeights.regular};"
        >
          Your physical therapist will unlock this when ready.
        </p>
      {:else}
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .small}; font-weight: {typography.fontWeights.regular};"
        >
          Keep completing your program to unlock more achievements!
        </p>
      {/if}
    {:else}
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .small}; font-weight: {typography.fontWeights.regular};"
      >
        Long description of goal goes here
      </p>
    {/if}
    {#if isGoal}
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .xxsmall}; font-weight: {typography.fontWeights
          .regular}; font-style: italic; color: var(--text-secondary);"
      >
        Week #
      </p>
    {:else}
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .xxsmall}; font-weight: {typography.fontWeights
          .regular}; font-style: italic; color: var(--text-secondary);"
      >
        Metric
      </p>
    {/if}
  </div>
</div>

<style>
  p {
    margin: 0;
  }
  .modal-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 12px;
    width: 311px;
    max-height: 248px;
    text-align: center;
    padding: 32px 0;
    border-radius: 16px;
    background-color: var(--background);
  }
  .modal-icon-container {
    height: 92px;
    width: 92px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .goal {
    background-color: var(--color-blue-525); /* Light/dark mode exception */
    border-radius: 100px;
  }
  .achievement {
    background-color: var(--color-yellow-550); /* Light/dark mode exception */
    border-radius: 4px;
  }
  .modal-information {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    max-width: 255px;
  }
  .close-button {
    border: 0;
    background-color: transparent;
    display: flex;
    width: 24px;
    height: 24px;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    right: 0;
    margin: 16px;
    cursor: pointer;
  }
</style>
