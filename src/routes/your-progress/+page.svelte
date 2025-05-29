<script lang="ts">
  import { typography } from '$lib/design-system';
  import StatsTab from '$lib/design-system/components/StatsTab.svelte';
  import Tabs from '$lib/design-system/components/Tabs.svelte';
  import ProgressBlobLight from '$lib/assets/background-images/ProgressBackgroundLargeLight.svg';
  import ProgressBlobDark from '$lib/assets/background-images/ProgressBackgroundLargeDark.svg';
  import MilestoneTab from '$lib/design-system/components/MilestoneTab.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let activeTab = 0;
  let tabs = [
    { id: 'stats', label: 'Stats' },
    { id: 'milestones', label: 'Milestones' }
  ];

  let currentTheme: 'light' | 'dark' = 'light';

  function updateThemeFromStorage() {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      currentTheme = savedTheme;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      currentTheme = prefersDark ? 'dark' : 'light';
    }
  }

  // Handle tab changes and update URL
  function handleTabChange(newTab: number) {
    activeTab = newTab;
    const tabParam = newTab === 1 ? 'milestones' : 'stats';
    goto(`?tab=${tabParam}`, { replaceState: true, noScroll: true });

    // Store the current tab in sessionStorage for navigation back from other pages
    sessionStorage.setItem('lastProgressTab', newTab.toString());
  }

  onMount(() => {
    // Check URL for tab parameter first
    const urlTab = $page.url.searchParams.get('tab');
    if (urlTab === 'milestones') {
      activeTab = 1;
    } else if (urlTab === 'stats') {
      activeTab = 0;
    } else {
      // If no URL tab parameter, check sessionStorage
      const savedTab = sessionStorage.getItem('lastProgressTab');
      if (savedTab) {
        activeTab = parseInt(savedTab, 10);
        // Update URL to match the restored tab
        const tabParam = activeTab === 1 ? 'milestones' : 'stats';
        goto(`?tab=${tabParam}`, { replaceState: true, noScroll: true });
      }
    }

    // Store initial tab state
    sessionStorage.setItem('lastProgressTab', activeTab.toString());

    updateThemeFromStorage();

    const handleThemeChange = () => {
      updateThemeFromStorage();
    };

    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', updateThemeFromStorage);
    };
  });

  // React to URL changes (back/forward navigation)
  $: if ($page.url.searchParams.get('tab')) {
    const urlTab = $page.url.searchParams.get('tab');
    if (urlTab === 'milestones' && activeTab !== 1) {
      activeTab = 1;
      sessionStorage.setItem('lastProgressTab', '1');
    } else if (urlTab === 'stats' && activeTab !== 0) {
      activeTab = 0;
      sessionStorage.setItem('lastProgressTab', '0');
    }
  }
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
    <Tabs {tabs} {activeTab} on:tabChange={(e) => handleTabChange(e.detail)}>
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
  .blob {
    position: absolute;
    z-index: 0;
    top: calc(98px - ((100vw - 375px) * 0.23));
    width: 100%;
    left: 0;
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
    width: 100%;
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
    width: 100%;
    background-color: var(--background);
  }
  @media (min-width: 800px) and (max-width: 1200px) {
    .blob {
      top: calc(-1 * ((100vw - 1200px) * 0.2) + 12px);
    }
  }
  @media (min-width: 800px) and (max-width: 1100px) {
    .milestone-blob {
      top: 80px;
    }
  }
  @media (min-width: 1201px) {
    .blob {
      top: calc(-1 * ((100vw - 1200px) * 0.2));
    }
  }
  @media (min-width: 800px) {
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
