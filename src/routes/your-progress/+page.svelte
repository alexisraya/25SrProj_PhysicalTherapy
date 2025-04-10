<script lang="ts">
  import { typography } from '$lib/design-system';
  import StatsTab from '$lib/design-system/components/StatsTab.svelte';
  import Tabs from '$lib/design-system/components/Tabs.svelte';
  import ProgressBlobLight from '$lib/assets/background-images/ProgressBackgroundLargeLight.svg';
  import ProgressBlobDark from '$lib/assets/background-images/ProgressBackgroundLargeDark.svg';
  import MilestoneTab from '$lib/design-system/components/MilestoneTab.svelte';
  import { onMount } from 'svelte';

  let activeTab = 0;
  let tabs = [
    { id: 'stats', label: 'Stats' },
    { id: 'milestones', label: 'Milestones' }
  ];

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

<div class="page-container">
  <h3
    class="small-screen-font"
    style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
      .h3}; font-weight: {typography.fontWeights.regular}; text-align: center;"
  >
    Your Progress
  </h3>
  <h1
    class="large-screen-font"
    style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
      .h1}; font-weight: {typography.fontWeights.regular}; text-align: center;"
  >
    Your Progress
  </h1>
  {#if currentTheme == 'light'}
    <img
      class="blob {activeTab === 1 ? 'milestone-blob' : ''}"
      src={ProgressBlobLight}
      alt="background blob"
    />
  {:else}
    <img
      class="blob {activeTab === 1 ? 'milestone-blob' : ''}"
      src={ProgressBlobDark}
      alt="background blob"
    />
  {/if}
  <div class="tab-container">
    <Tabs {tabs} bind:activeTab>
      {#if activeTab === 0}
        <StatsTab />
      {:else if activeTab === 1}
        <div class="milestones-header">
          <MilestoneTab />
        </div>
      {/if}
    </Tabs>
  </div>
</div>

<style>
  h3 {
    margin: 0;
  }
  /* .blob {
    position: absolute;
    z-index: 0;
    top: -375px;
    left: -50px;
    overflow: hidden;
  } */
  .blob {
    position: absolute;
    z-index: 0;
    top: calc(175px - 20vw);
    width: 100%;
    left: 0px;
    overflow: hidden;
  }
  .milestone-blob {
    background-color: var(--background-secondary);
  }
  .page-container {
    background-color: var(--background-secondary);
    padding-top: 40px;
    overflow: hidden;
    position: relative;
  }
  .page-container h3 {
    position: relative;
    z-index: 1;
  }
  .page-container h1 {
    position: relative;
    z-index: 1;
  }
  .milestones-header {
    padding-top: 35px;
    background-color: var(--background-secondary);
  }

  .large-screen-font {
    display: none;
  }
  .small-screen-font {
    display: block;
  }
  .tab-container {
    background-color: var(--background);
  }
  @media (min-width: 800px) {
    .blob {
      position: absolute;
      z-index: 0;
      top: calc(175px - 20vw);
      width: 100%;
      left: 0px;
      overflow: hidden;
    }
    .page-container h1 {
      position: relative;
      z-index: 1;
      margin-top: 24px;
    }
    .small-screen-font {
      display: none;
    }
    .large-screen-font {
      display: block;
    }
  }

  @media (min-width: 1400px) {
    .blob {
      position: absolute;
      z-index: 0;
      top: calc(175px - 21vw);
      width: 100%;
      left: 0px;
      overflow: hidden;
    }
    .page-container h1 {
      position: relative;
      z-index: 1;
      margin-top: 24px;
    }
    .small-screen-font {
      display: none;
    }
    .large-screen-font {
      display: block;
    }
  }
</style>
