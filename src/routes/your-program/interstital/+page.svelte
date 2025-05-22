<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import Icon from '$lib/design-system/components/Icon.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getTone } from '$lib/helpers/toneContext';
  import { getWeeklyProgress } from '$firebase/services/statService';
  import { authStore } from '$stores/authStore';

  const { text } = getTone();

  const randomInsterstitialOption = Math.floor(Math.random() * 3);
  const interstitialTitleOptions = ['You did it!', 'Nice work!', 'Way to Go!'];
  const interstitialSubtitleOptions = ['you_did_it_bubble', 'nice_work_star', 'way_to_go_stairs'];
  const interstitialIconOptions = [
    'program-complete-stars',
    'program-complete-trophey',
    'program-complete-flag'
  ];

  const interstitialTitleOption = interstitialTitleOptions[randomInsterstitialOption];
  const insterstitialSubtitleOption = interstitialSubtitleOptions[randomInsterstitialOption];
  const interstitialIconOption = interstitialIconOptions[randomInsterstitialOption];

  let weeklyProgress: any = null;
  let goToUrl = '/your-program/summary';

  let unsubscribe;

  onMount(() => {
    const timeoutId = setTimeout(() => {
      goto(goToUrl);
    }, 3000);
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
      clearTimeout(timeoutId);
      if (unsubscribe) unsubscribe();
    };
  });

  async function loadUserData(userId) {
    try {
      const [weeklyData] = await Promise.all([getWeeklyProgress(userId)]);
      weeklyProgress = weeklyData;
      if (weeklyProgress.daysCompleted > 4) {
        goToUrl = '/your-program/summary/interstital';
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }
</script>

<div class="interstital-container">
  <div class="intersitial-icon-container">
    <Icon name={interstitialIconOption} />
    <svg width="266" height="266" class="interstitial-circle">
      <circle cx="133" cy="133" r="133" />
    </svg>
  </div>
  <div class="interstital-text">
    <h1
      style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
        .h1}; font-weight: {typography.fontWeights.regular};"
    >
      {interstitialTitleOption}
    </h1>
    <p
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .regular}; font-weight: {typography.fontWeights.regular};"
    >
      {$text(insterstitialSubtitleOption)}
    </p>
  </div>
</div>

<style>
  h1,
  p {
    margin: 0;
  }
  .interstital-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* row-gap: 32px; */
    row-gap: 0px;
    height: 100vh;
    overflow: visible;
    background-color: var(--color-green-500); /** Light mode dark mode exception */
  }
  .interstital-text h1 {
    text-align: center;
    color: var(--color-blue-1100) !important;
  }
  .interstital-text p {
    text-align: center;
    color: var(--color-blue-1100) !important;
  }
  .intersitial-icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    aspect-ratio: 1;
  }
  .interstitial-circle {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
