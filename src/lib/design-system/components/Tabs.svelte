<!-- Tabs.svelte -->
<script>
    import { typography } from "../typography";

    export let activeTab = 0;
    export let tabs = [];
  
    function setActiveTab(index) {
      activeTab = index;
    }
  </script>
  
  <div class="tabs-container">
    <div class="tabs">
      {#each tabs as tab, i}
        <button 
          class="tab-button {activeTab === i ? 'active' : ''}" 
          on:click={() => setActiveTab(i)}
        >
          <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.medium};">{tab.label}</p>
        </button>
      {/each}
    </div>
    
    <div class="tab-content">
      <slot {activeTab}></slot>
    </div>
  </div>
  
  <style>
    p {
        margin: 0;
    }
    .tabs-container {
      width: 100%;
      margin: 16px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .tabs {
        display: flex;
        max-width: fit-content;
        padding: 8px;
        justify-content: space-between;
        align-items: center;
        border-radius: 23px;
        background-color: var(--color-grey-0);
        position: relative;
        z-index: 1;
    }
    
    .tab-button {
      padding: 3px 20px;
      background-color: var(--color-grey-0);
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
      border-radius: 23px;
    }
    
    .tab-button.active {
      background-color: var(--color-blue-50);
    }
    
    .tab-button:hover:not(.active) {
      background-color: #f1f5f9;
    }
    
    .tab-content {
      padding-top: 20px;
      width: 100%;
    }
  </style>