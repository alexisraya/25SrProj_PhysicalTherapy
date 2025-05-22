<script lang="ts">
  import { typography } from '$lib/design-system';
  import ProfileLight from '$lib/assets/iconography/ProfileLight.svg';
  import ProfileDark from '$lib/assets/iconography/ProfileDark.svg';
  import ProfileBlobLight from '$lib/assets/background-images/ProfileBlobLight.svg';
  import ProfileBlobDark from '$lib/assets/background-images/ProfileBlobDark.svg';

  import Button from '$lib/design-system/components/Button.svelte';

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  export let data;

  $: userData = data.userData;

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

  function logout() {
    goto('/logout');
  }

  onMount(() => {
    // Initial check from localStorage
    updateThemeFromStorage();

    // Listen for custom theme change events
    const handleThemeChange = () => {
      updateThemeFromStorage();
    };

    window.addEventListener('themeChanged', handleThemeChange);
    console.log(userData);
    return () => {
      window.removeEventListener('themeChanged', updateThemeFromStorage);
    };
  });
</script>

<div class="summary-page-wrapper">
  <div class="summary-page-container">
    <div class="blob-container">
      {#if currentTheme == 'light'}
        <img class="blob" src={ProfileBlobLight} alt="background blob" />
      {:else}
        <img class="blob" src={ProfileBlobDark} alt="background blob" />
      {/if}
    </div>
    <div class="heading">
      {#if currentTheme == 'light'}
        <img src={ProfileLight} alt="program complete icon" class="complete-icon" />
      {:else}
        <img src={ProfileDark} alt="program complete icon" class="complete-icon" />
      {/if}
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; font-weight: {typography.fontWeights.regular}; text-align: center;"
      >
        Profile
      </h3>
    </div>
    <div class="summary-container">
      <div class="program-summary">
        <h5
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .regular}; font-weight: {typography.fontWeights.medium};"
        >
          Your details
        </h5>
        <div class="horizontal-box"></div>
      </div>
      <div class="profile-container">
        <div class="profile-section">
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .xsmall}; font-weight: {typography.fontWeights.regular};"
          >
            Name
          </p>
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .regular}; font-weight: {typography.fontWeights.medium};"
          >
            {userData.displayName}
          </p>
        </div>
        <div class="profile-section">
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .xsmall}; font-weight: {typography.fontWeights.regular};"
          >
            Email
          </p>
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .regular}; font-weight: {typography.fontWeights.medium};"
          >
            {userData.email}
          </p>
        </div>
        <div class="profile-section">
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .xsmall}; font-weight: {typography.fontWeights.regular};"
          >
            Physical Therapy Clinic
          </p>
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .regular}; font-weight: {typography.fontWeights.medium};"
          >
            Ivy Rehab
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="logout-container">
    <Button buttonType="secondary" cta="Log out" onClickFunc={logout}></Button>
  </div>
</div>

<style>
  p,
  h3 {
    margin: 0;
  }

  .summary-page-wrapper {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    height: 100vh;
    overflow-x: hidden; /* Main overflow control at the wrapper level */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 24px;
  }

  .summary-page-container {
    box-sizing: border-box;
    padding: 32px 24px;
    position: relative;
    width: 100%;
    max-width: 552px;
    margin: auto;
  }

  .blob-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    overflow: visible;
    z-index: 0;
  }

  .blob {
    position: absolute;
    top: -135px;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    z-index: 0;
  }

  .heading {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
  }

  .summary-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 16px;
    padding-top: 32px;
    position: relative;
    z-index: 1;
  }

  .program-summary {
    width: 100%;
  }

  .profile-section {
    margin-right: auto;
  }

  .profile-container {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    row-gap: 24px;
    position: relative;
    z-index: 1;
  }

  .horizontal-box {
    background-color: var(--background-secondary);
    width: 100%;
    height: 2px;
    margin-top: 8px;
    margin-bottom: 0px;
  }

  .logout-container {
    position: relative;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 24px;
    max-width: 552px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }
  @media (min-width: 500px) {
    .summary-page-wrapper {
      padding-bottom: 90px;
    }
    .complete-icon {
      width: 124px;
      height: 124px;
    }
    .blob {
      position: absolute;
      top: -35vw;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100vw);
      z-index: 0;
    }
    .logout-container {
      padding: 0;
    }
  }
  @media (min-width: 1000px) {
    .blob {
      top: -40vw;
    }
  }
  @media (min-width: 1200px) {
    .blob {
      top: -42vw;
    }
  }
</style>
