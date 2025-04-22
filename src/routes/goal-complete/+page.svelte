<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$stores/authStore';
  import { goalStore } from '$stores/goalStore';
  import Icon from '$lib/design-system/components/Icon.svelte';
  import BgLight from '$lib/assets/background-images/GoalCompleteBgLight.svg';
  import BgDark from '$lib/assets/background-images/GoalCompleteBgDark.svg';

  import Button from '$lib/design-system/components/Button.svelte';

  import { typography } from '$lib/design-system';

  const goToGoals = () => goto('/your-progress/goals');
  const goHome = () => goto('/patient-dashboard');

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

<div class="goals-wrapper">
  <div class="goals-page-container">
    <div class="goals-header">
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular};"
      >
        Goal Completed!
      </h3>
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .small}; font-weight: {typography.fontWeights.regular};"
      >
        Nice job hitting this goal—keep it up!
      </p>
    </div>
    <!-- Goal -->
    <div class="goal-icon-section">
      <div class="goal">
        <Icon name="laundry" size="medium" />
      </div>
      {#if currentTheme == 'light'}
        <img src={BgLight} alt="Background Light" class="background" />
      {:else}
        <img src={BgDark} alt="Background Dark" class="background" />
      {/if}
    </div>
    <div class="goal-info">
      <h5
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.bold};"
      >
        Lift a basket of laundry
      </h5>
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .small}; font-weight: {typography.fontWeights.regular};"
      >
        You can safely lift and carry items up to 10 pounds!
      </p>
    </div>
    <div class="button-container">
      <Button buttonType="primary" cta="View all goals" onClickFunc={goToGoals} />
      <Button buttonType="secondary" cta="Continue to home" onClickFunc={goHome} />
    </div>
  </div>
</div>

<style>
  p,
  h3 {
    margin: 0;
  }
  .goals-page-container {
    display: flex;
    flex-direction: column;
    row-gap: 48px;
    padding: 40px 24px;
    margin: auto;
    max-width: 700px;
  }
  .goals-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 8px;
    text-align: center;
    max-width: 524px;
    margin: auto;
  }
  .goal-icon-section {
    position: relative;
    width: 175px;
    height: 175px;
    margin: auto;
  }

  .goal {
    width: 175px;
    height: 175px;
    border-radius: 999px;
    background-color: var(--color-blue-525);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative; /* makes sure it stacks above the background */
    z-index: 1;
  }

  .background {
    position: absolute;
    top: -25px;
    right: -35px;
    z-index: 0;
  }
  .goal-info {
    display: flex;
    flex-direction: column;
    align-content: center;
  }
  .goal-info * {
    width: fit-content;
    margin: 8px auto 0;
  }
  .button-container {
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    width: 100%;
  }
  @media (min-width: 800px) {
    .goals-wrapper {
      min-height: 85vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .goals-page-container {
      display: flex;
      flex-direction: column;
      row-gap: 48px;
      padding: 40px 24px;
      margin: auto;
      width: 600px;
    }
  }
</style>
