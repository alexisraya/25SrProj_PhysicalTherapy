<script lang="ts">
  import CheckInStep from '$lib/assets/background-images/steps/CheckInStep.png';
  import CheckInStepDark from '$lib/assets/background-images/steps/CheckInStepDark.png';
  import { onMount } from 'svelte';

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

<div class="mend-step">
  <div class="illustration">
    <img src={currentTheme == 'light' ? CheckInStep : CheckInStepDark} alt="goals" />
  </div>
</div>

<style>
  .mend-step {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
