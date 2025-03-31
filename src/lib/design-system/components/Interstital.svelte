<script lang="ts">
  import { typography } from '../typography';
  import Icon from './Icon.svelte';

  export let interstitalType: string | null;
</script>

<div class="interstital-container">
  {#if interstitalType === 'completed'}
    <Icon name="program-interstitial-completed-test" />
    <h2
      style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
        .h2}; font-weight: {typography.fontWeights.regular};"
    >
      Exercise <br /> completed
    </h2>
  {:else if interstitalType === 'skipped'}
    <Icon name="program-interstitial-skipped" />
    <h2
      style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
        .h2}; font-weight: {typography.fontWeights.regular};"
    >
      Exercise <br /> skipped
    </h2>
  {:else if interstitalType === 'too-painful'}
    <Icon name="program-interstitial-too-painful" />
    <h2
      style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
        .h2}; font-weight: {typography.fontWeights.regular};"
    >
      Exercise marked <br /> as too painful
    </h2>
  {/if}
</div>

<style>
  .interstital-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* row-gap: 32px; */
    row-gap: 0px;
    height: 100vh;
  }
  .interstital-container h2 {
    text-align: center;
  }
</style>
