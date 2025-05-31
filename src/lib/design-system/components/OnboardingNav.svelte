<script lang="ts">
  import ProgressBar from '$lib/design-system/components/ProgressBar.svelte';
  import { typography } from '$lib/design-system/typography';
  import { goto } from '$app/navigation';
  import { completeOnboarding } from '$stores/onboarding';

  export let currentStep: number;

  const handleSkip = () => {
    // Mark onboarding as completed before navigation
    completeOnboarding();
    goto('./patient-dashboard');
  };
</script>

<div class="onboarding-nav-container {currentStep == 0 ? 'first' : ''}">
  {#if currentStep > 0}
    <ProgressBar
      totalExercises={6}
      completedExercises={currentStep}
      remainingExercises={6 - currentStep}
      isOnboarding={true}
    />
  {/if}
  <!-- Replace the anchor tag with a button that calls handleSkip -->
  <button
    class="skip-button"
    on:click={handleSkip}
    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
      .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
  >
    Skip
  </button>
</div>

<style>
  button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-primary);
  }
  button:visited {
    color: var(--text-primary);
  }
  .onboarding-nav-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    row-gap: 16px;
    width: 100%;
  }
  .onboarding-nav-container button {
    position: relative;
    top: 0px;
  }
  .first {
    padding-top: 24px;
  }
</style>
