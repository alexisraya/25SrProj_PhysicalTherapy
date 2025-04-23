<script lang="ts">
  import { goto } from '$app/navigation';
  import ProgressBar from '$lib/design-system/components/ProgressBar.svelte';
  import { currentMonth } from '$stores/monthlyrecap';
  import { typography } from '$lib/design-system/typography';
  import RemixIcon from './RemixIcon.svelte';

  export let currentStep: number;

  function onExit() {
    goto('/your-progress');
  }
</script>

<div class="recap-nav-container {currentStep == 0 ? 'first' : ''}">
  <div class="top-half-nav">
    <p
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .regular}; font-weight: {typography.fontWeights.medium}"
    >
      Month {$currentMonth} Recap
    </p>
    <button on:click={onExit}>
      <RemixIcon name="close-line" />
    </button>
  </div>
  {#if currentStep > 1}
    <ProgressBar
      totalExercises={8}
      completedExercises={currentStep}
      remainingExercises={8 - currentStep}
      isOnboarding={true}
    />
  {/if}
</div>

<style>
  p {
    margin: 0;
  }
  button {
    background-color: transparent;
    border: 0;
    cursor: pointer;
    padding: 0;
  }
  a:visited {
    color: var(--text-primary);
  }
  .top-half-nav {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;
  }

  .top-half-nav p {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
  }

  .top-half-nav button {
    margin-left: auto; /* This pushes the button to the right */
  }

  .recap-nav-container {
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    row-gap: 25px;
    width: 100%;
    margin-top: 18px;
    padding: 0 24px;
    z-index: 10;
  }
  .first {
    padding-top: 24px;
  }
</style>
