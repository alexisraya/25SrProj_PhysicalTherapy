<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import Icon from '$lib/design-system/components/Icon.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Button from '$lib/design-system/components/Button.svelte';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
  import { authStore } from '$stores/authStore';
  import { getUserStats } from '$firebase/services/statService';

  const randomInsterstitialOption = Math.floor(Math.random() * 3);
  const interstitialIconOptions = [
    'streak-complete-flag',
    'streak-complete-medal',
    'streak-complete-shield'
  ];

  const interstitialIconOption = interstitialIconOptions[randomInsterstitialOption];

  let weeklyProgress: any = null;

  let unsubscribe;

  onMount(() => {
    // Subscribe to auth changes
    const unsubscribe = authStore.subscribe((authState) => {
      if (!authState.isLoading) {
        // Auth state is initialized (no longer loading)
        if (authState.currentUser) {
          // User is logged in, load data
          loadUserData(authState.currentUser.uid);
        }
      }
      // If still loading, we'll wait
    });

    // Clean up subscription on component destroy
    return () => {
      if (unsubscribe) unsubscribe();
    };
  });

  async function loadUserData(userId) {
    try {
      const [stats] = await Promise.all([getUserStats(userId)]);
      weeklyProgress = stats;
      console.log(weeklyProgress);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }

  function onClick() {
    goto('/your-program/summary/');
  }
</script>

<div class="interstital-container">
  <div class="interstital-body-container">
    <h3
      style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
        .h3}; font-weight: {typography.fontWeights.regular};"
    >
      Weekly streak complete!
    </h3>
    <div class="interstital-icon-container">
      <Icon name={interstitialIconOption} />
    </div>
    <div class="interstital-text-container">
      <span class="interstital-subtitle-container">
        <p
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .regular}; font-weight: {typography.fontWeights.bold};"
        >
          {weeklyProgress ? weeklyProgress.longestStreak : 5} weeks in a row
        </p>
        <RemixIcon name="flashlight-fill" color="var(--streak-complete)" />
      </span>
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .small}; font-weight: {typography.fontWeights.regular};"
      >
        Nice work on your progreams this week. Keep it up!
      </p>
    </div>
    <div class="streaks-container">
      {#each Array(5).fill(0) as _, i}
        <div class="streak-container">
          <div class="streak completed"></div>
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .xsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic;"
          >
            Day {i + 1}
          </p>
        </div>
      {/each}
    </div>
  </div>
  <div class="interstital-lower">
    <Button cta="Done" onClickFunc={onClick} />
  </div>
</div>

<style>
  h3,
  p {
    margin: 0;
  }
  .interstital-container {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    row-gap: 24px;
    height: 100vh;
    overflow: visible;
    background-color: var(--background);
    padding: 56px 12px 24px 12px;
  }
  .interstital-body-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 24px;
    background-color: var(--background);
    padding: 0 12px;
  }
  .interstital-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-purple-200);
    width: fit-content;
    padding: 28px 42px;
    border-radius: 5000px;
  }
  .interstital-body-container h3 {
    text-align: center;
    max-width: 362px;
  }
  .interstital-text-container {
    max-width: 225px;
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }
  .interstital-subtitle-container {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 8px;
  }
  .interstital-text-container p {
    text-align: center;
  }
  .interstital-lower {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 350px;
  }
  .streaks-container {
    display: flex;
    column-gap: 2px;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 350px;
  }
  .streak-container {
    box-sizing: border-box;
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
  .completed {
    background-color: var(--streak-filled);
  }
</style>
