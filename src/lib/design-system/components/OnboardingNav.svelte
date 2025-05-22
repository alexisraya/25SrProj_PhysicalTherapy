<script lang="ts">
  import ProgressBar from '$lib/design-system/components/ProgressBar.svelte';
  import { typography } from '$lib/design-system/typography';

  export let currentStep: number;
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
  <a
    href="/patient-dashboard"
    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
      .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
  >
    Skip
  </a>
</div>

<style>
  a {
    color: var(--text-primary);
  }
  a:visited {
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
  .onboarding-nav-container a {
    position: absolute;
    top: 45px;
  }
  .first {
    padding-top: 24px;
  }
</style>
