<script lang="ts">
  import { getMoodDescription, getPainDescription } from '$firebase/types/checkInType';
  import { typography } from '$lib/design-system/typography';
  import { checkInStore } from '$stores/checkInStore';

  // Check in backgrounds light mode
  import DiscouragedBgLight from '$lib/assets/background-images/check-in/DiscouragedBgLight.svg';
  import DiscouragedBgLightLarge from '$lib/assets/background-images/check-in/DiscouragedBgLightLarge.svg';
  import UncertainBgLight from '$lib/assets/background-images/check-in/UncertainBgLight.svg';
  import UncertainBgLightLarge from '$lib/assets/background-images/check-in/UncertainBgLightLarge.svg';
  import IndifferentBgLight from '$lib/assets/background-images/check-in/IndifferentBgLight.svg';
  import IndifferentBgLightLarge from '$lib/assets/background-images/check-in/IndifferentBgLightLarge.svg';
  import MotivatedBgLight from '$lib/assets/background-images/check-in/MotivatedBgLight.svg';
  import MotivatedBgLightLarge from '$lib/assets/background-images/check-in/MotivatedBgLightLarge.svg';
  import HopefulBgLight from '$lib/assets/background-images/check-in/HopefulBgLight.svg';
  import HopefulBgLightLarge from '$lib/assets/background-images/check-in/HopefulBgLightLarge.svg';
  // Check in backgrounds dark mode
  import DiscouragedBgDark from '$lib/assets/background-images/check-in/DiscouragedBgDark.svg';
  import DiscouragedBgDarkLarge from '$lib/assets/background-images/check-in/DiscouragedBgDarkLarge.svg';
  import UncertainBgDark from '$lib/assets/background-images/check-in/UncertainBgDark.svg';
  import UncertainBgDarkLarge from '$lib/assets/background-images/check-in/UncertainBgDarkLarge.svg';
  import IndifferentBgDark from '$lib/assets/background-images/check-in/IndifferentBgDark.svg';
  import IndifferentBgDarkLarge from '$lib/assets/background-images/check-in/IndifferentBgDarkLarge.svg';
  import MotivatedBgDark from '$lib/assets/background-images/check-in/MotivatedBgDark.svg';
  import MotivatedBgDarkLarge from '$lib/assets/background-images/check-in/MotivatedBgDarkLarge.svg';
  import HopefulBgDark from '$lib/assets/background-images/check-in/HopefulBgDark.svg';
  import HopefulBgDarkLarge from '$lib/assets/background-images/check-in/HopefulBgDarkLarge.svg';

  import { get } from 'svelte/store';
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

  $: moodLevel = get(checkInStore).currentCheckIn.moodLevel;
  $: painLevel = get(checkInStore).currentCheckIn.painLevel;

  $: moodDescription = getMoodDescription(moodLevel);
  $: painDescription = getPainDescription(painLevel);

  // Mood-based background images (indexed by moodLevel - 1)
  const moodBgLightMobile = [
    MotivatedBgLight,
    HopefulBgLight,
    IndifferentBgLight,
    UncertainBgLight,
    DiscouragedBgLight
  ];

  const moodBgLightDesktop = [
    MotivatedBgLightLarge,
    HopefulBgLightLarge,
    IndifferentBgLightLarge,
    UncertainBgLightLarge,
    DiscouragedBgLightLarge
  ];

  const moodBgDarkMobile = [
    MotivatedBgDark,
    HopefulBgDark,
    IndifferentBgDark,
    UncertainBgDark,
    DiscouragedBgDark
  ];

  const moodBgDarkDesktop = [
    MotivatedBgDarkLarge,
    HopefulBgDarkLarge,
    IndifferentBgDarkLarge,
    UncertainBgDarkLarge,
    DiscouragedBgDarkLarge
  ];

  const moodIcons = [
    '/mood-faces/mood-face-motivated.svg',
    '/mood-faces/mood-face-hopeful.svg',
    '/mood-faces/mood-face-indifferent.svg',
    '/mood-faces/mood-face-uncertain.svg',
    '/mood-faces/mood-face-discouraged.svg'
  ];

  $: bgMobile = moodLevel
    ? currentTheme === 'dark'
      ? moodBgDarkMobile[moodLevel - 1]
      : moodBgLightMobile[moodLevel - 1]
    : null;

  $: bgDesktop = moodLevel
    ? currentTheme === 'dark'
      ? moodBgDarkDesktop[moodLevel - 1]
      : moodBgLightDesktop[moodLevel - 1]
    : null;
</script>

<div class="reflection-container">
  <div class="reflection-header">
    <div class="reflection-header--copy">
      {#if moodLevel !== null && painLevel !== null}
        <img src={moodIcons[moodLevel - 1]} alt="{moodDescription} face" />
        <p class:uncertain-text={moodLevel === 4}>
          You're feeling {moodDescription.toLowerCase()} with {painDescription.toLowerCase()}
        </p>
      {/if}
    </div>
  </div>
  {#if bgMobile && bgDesktop}
    <div class="bg">
      <img src={bgMobile} alt="background-wave" class="mobile-bg" />
      <img src={bgDesktop} alt="background-wave" class="desktop-bg" />
    </div>
  {/if}
  <div class="reflection-body">
    <h2
      style="font-family: {typography.fontFamily
        .heading}; font-size: 2.5rem; font-weight: {typography.fontWeights.regular};"
    >
      Recovery is tough, but it does get better.
    </h2>
    <span class="reflection-body--stat">
      <h1
        style="font-family: {typography.fontFamily
          .heading}; font-size: 4rem; font-weight: {typography.fontWeights.regular};"
      >
        75%
      </h1>
      <p>of adults have recovered from a knee injury, and you can too.</p>
    </span>
  </div>
</div>

<style>
  h1,
  h2,
  p {
    margin: 0;
  }
  h2 {
    line-height: 120%;
  }
  .bg {
    position: absolute;
    top: calc(275px - (100vw * 0.7333));
    left: 0;
    width: 100%;
    overflow: hidden;
  }
  .bg img {
    width: 100%;
    height: auto;
  }
  .reflection-container {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    row-gap: 48px;
  }
  .reflection-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    z-index: 2;
  }
  .reflection-header--copy {
    display: flex;
    align-items: center;
    column-gap: 12px;
    width: 100%;
  }
  .reflection-header--copy img {
    max-width: 58px;
  }
  .reflection-body {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    z-index: 2;
  }
  .reflection-body--stat {
    display: grid;
    grid-template-columns: 40% 60%;
    align-items: center;
    z-index: 2;
  }
  .mobile-bg {
    display: block; /* Images should use block or inline-block, not flex */
  }

  .desktop-bg {
    display: none; /* Hidden by default */
  }
  .uncertain-text {
    color: white;
  }

  @media (min-width: 820px) {
    .bg {
      position: absolute;
      top: calc(372px - (100vw * 0.45));
      left: 0;
      width: 100%;
      overflow: hidden;
    }
    .mobile-bg {
      display: none; /* Hide mobile bg at larger screens */
    }
    .desktop-bg {
      display: block; /* Show desktop bg at larger screens */
    }
    .reflection-header {
      height: 150px;
    }
  }
  @media (min-width: 900px) {
    .bg {
      top: calc(312px - (100vw * 0.351));
    }
  }
  @media (min-width: 1000px) {
    .bg {
      top: calc(332px - (100vw * 0.351));
    }
    .reflection-header--copy img {
      max-width: 100px;
    }
  }
  @media (min-width: 1100px) {
    .bg {
      top: calc(352px - (100vw * 0.351));
    }
  }
  @media (min-width: 1260px) {
    .bg {
      top: calc(372px - (100vw * 0.2951));
    }

    .reflection-container {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      row-gap: 164px;
    }
    .reflection-header--copy {
      display: flex;
      flex-direction: column;
      align-items: center;
      row-gap: 16px;
      width: 100%;
    }
    .reflection-header--copy img {
      width: 100px;
    }
    .reflection-header {
      height: 200px;
    }
  }

  @media (min-width: 1460px) {
    .bg {
      top: calc(372px + 24px - (100vw * 0.2951));
    }
  }
</style>
