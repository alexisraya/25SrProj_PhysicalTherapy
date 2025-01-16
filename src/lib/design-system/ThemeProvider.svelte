<script lang="ts">
  import { theme } from '$lib/design-system/theme';
  import { onMount } from 'svelte';
  import { lightColors, darkColors } from '$lib/design-system/colors';

  let currentTheme: 'light' | 'dark';

  // Reactive subscription to the store value
  $: currentTheme = $theme;

  // Function to update CSS variables based on the theme
  const updateTheme = () => {
    if (typeof document !== 'undefined') {
      // Ensure this code only runs in the browser
      const colors = currentTheme === 'light' ? lightColors : darkColors;

      for (const [key, value] of Object.entries(colors)) {
        document.documentElement.style.setProperty(`--${key}`, value);
      }
    }
  };

  onMount(() => {
    // Set initial theme on mount (browser only)
    updateTheme();
  });

  const toggleTheme = () => {
    theme.set(currentTheme === 'light' ? 'dark' : 'light');
  };

  // Automatically update the theme when `currentTheme` changes
  $: if (currentTheme) updateTheme();
</script>

<div>
  <!-- <button on:click={toggleTheme}>
    Toggle Theme to {currentTheme === 'light' ? 'Dark' : 'Light'}
  </button> -->
  <slot />
</div>

<style>
  :root {
    /* Default theme variables */
    --background: #ffffff;
    --text: #000000;
  }

  body {
    background-color: var(--background);
    color: var(--text);
    margin: 0;
    font-family: sans-serif;
  }
</style>
