<script lang="ts">
  import { Colors } from '$lib/design-system/colors';
  import ActiveMilestoneLight from '$lib/assets/background-images/ActiveMilestoneLight.svg';
  import ActiveMilestoneDark from '$lib/assets/background-images/ActiveMilestoneDark.svg';
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';

  export let isComplete: boolean;
  export let isActive: boolean;
  export let isUpcoming: boolean;
  export let month: number;

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

<div class="milestone-month-container {isActive ? 'active-container' : ''}">
  {#if isComplete}
    <svg width="60" height="60">
      <circle cx="30" cy="30" r="29.5" fill="none" stroke={Colors.green[550]} stroke-width="1" />
      <circle cx="30" cy="30" r="25" />
    </svg>
  {:else if isUpcoming}
    <svg width="60" height="60">
      <circle cx="30" cy="30" r="30" />
    </svg>
  {:else}
    <!-- TODO: ALEXIS light/dark mode image -->
    {#if currentTheme == 'light'}
      <img src={ActiveMilestoneLight} alt="active milestone background" />
    {:else}
      <img src={ActiveMilestoneDark} alt="active milestone background" />
    {/if}
  {/if}

  <h1
    class="milestone-month {isActive ? 'active' : ''} {isUpcoming ? 'upcoming' : ''}"
    style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
      .h1}; font-weight: {typography.fontWeights.regular}"
  >
    {month}
  </h1>
</div>

<style>
  circle {
    fill: var(--background);
  }
  .milestone-month-container {
    position: relative;
    width: 60px;
    height: 60px;
  }
  .active-container {
    width: 119px;
    height: 70px;
    margin: 0 -29px;
  }
  .milestone-month {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
  }
  .active {
    top: 50%;
    transform: translate(-50%, -57%);
  }
  .upcoming {
    color: var(--upcoming-milestone);
  }
</style>
