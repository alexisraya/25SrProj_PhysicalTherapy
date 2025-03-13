<script>
    import { typography } from '$lib/design-system';
    import StatsTab from '$lib/design-system/components/StatsTab.svelte';
    import Tabs from '$lib/design-system/components/Tabs.svelte';
    import ProgressBlob from '$lib/assets/background-images/ProgressBlob.svg';
    import MilestoneTab from '$lib/design-system/components/MilestoneTab.svelte';
    
    let activeTab = 0;
    let tabs = [
      { id: 'stats', label: 'Stats' },
      { id: 'milestones', label: 'Milestones' }
    ];
  </script>
  
<div class="page-container">
  <h3 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h3}; font-weight: {typography.fontWeights.regular}; text-align: center;">Your Progress</h3>
  <img class="blob" src={ProgressBlob} alt="background blob" />
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

<style>
    h3 {
        margin: 0;
    }
    .blob {
        position: absolute;
        z-index: 0;
        top: -375px;
        left: -50px;
        overflow: hidden;
    }
    .page-container {
        background-color: var(--color-blue-50);
        padding-top: 40px;
        overflow: hidden;
        position: relative;
    }
    .page-container h3 {
        position: relative;
        z-index: 1;
    }
    .milestones-header {
      padding-top: 35px;
    }
</style>