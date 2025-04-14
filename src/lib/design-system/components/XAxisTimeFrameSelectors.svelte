<script lang="ts">
  import { typography } from '$lib/design-system/typography';

  let selectedTimeFrame = '1 Week';

  function selectTimeFrame(timeFrame: string) {
    selectedTimeFrame = timeFrame;
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
          .xsmall}; font-weight: {typography.fontWeights.bold};"
      >
        {timeFrame}
      </p>
    </button>
  {/each}
</div>

<style>
  p {
    margin: 0;
  }

  .time-frame-container {
    background-color: var(--background-secondary);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--background-secondary);
    padding: 4px 10px;
    cursor: pointer;
  }

  .selected {
    border: 1px solid var(--text-primary);
  }

  .x-axis-container {
    display: flex;
    justify-content: space-between;
  }
</style>
