<script lang="ts">
  import ProgressBar from '$lib/design-system/components/ProgressBar.svelte';
  import { typography } from '$lib/design-system/typography';

  export let currentStep: number;
</script>

<div class="onboarding-nav-container">
  <ProgressBar totalExercises={6} completedExercises={currentStep} />
  <p
    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
      .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
  >
    Skip
  </p>
</div>

<style>
  .onboarding-nav-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    row-gap: 16px;
  }
</style>
