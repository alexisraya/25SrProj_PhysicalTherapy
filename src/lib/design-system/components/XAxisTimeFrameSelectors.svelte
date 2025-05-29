<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { createEventDispatcher } from 'svelte';

  export let selectedTimeFrame = '1 Week';
  const dispatch = createEventDispatcher();

  function selectTimeFrame(timeFrame: string) {
    selectedTimeFrame = timeFrame;
    dispatch('timeframeChange', timeFrame);
  }
</script>

<div class="x-axis-container">
  {#each ['1 Week', '1 Month', '3 Months', '6 Months', '1 Year', 'All Time'] as timeFrame}
    <button
      class="time-frame-container {selectedTimeFrame === timeFrame ? 'selected' : ''}"
      on:click={() => selectTimeFrame(timeFrame)}
    >
      <p
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .xsmall}; font-weight: {selectedTimeFrame === timeFrame
          ? typography.fontWeights.bold
          : typography.fontWeights.regular};"
      >
        {timeFrame}
      </p>
    </button>
  {/each}
</div>

<style>
  p {
    margin: 0;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .time-frame-container {
    box-sizing: border-box;
    background-color: var(--background-secondary);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--background-secondary);
    padding: 4px 10px;
    cursor: pointer;
    flex-shrink: 0;
    min-width: 60px;
    width: 15%;
  }

  .selected {
    border: 1px solid var(--text-primary);
  }

  .x-axis-container {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 8px;
  }

  /* Optional: Style the scrollbar */
  .x-axis-container::-webkit-scrollbar {
    height: 4px;
  }

  .x-axis-container::-webkit-scrollbar-track {
    background: var(--background-secondary);
    border-radius: 2px;
  }

  .x-axis-container::-webkit-scrollbar-thumb {
    background: var(--text-secondary);
    border-radius: 2px;
  }

  .x-axis-container::-webkit-scrollbar-thumb:hover {
    background: var(--text-primary);
  }
</style>
