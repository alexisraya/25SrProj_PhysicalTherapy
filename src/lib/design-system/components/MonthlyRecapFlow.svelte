<script lang="ts">
  import {
    currentRecapStep,
    recapSteps,
    goToNextRecap,
    goToPreviousRecap,
    currentMonth
  } from '$stores/monthlyrecap';
  import type { ComponentType } from 'svelte';
  import MonthlyRecapActions from '$lib/design-system/components/MonthlyRecapActions.svelte';
  import MonthlyRecapNav from '$lib/design-system/components/MonthlyRecapNav.svelte';

  import AchievementRecap from '$lib/design-system/components/recap-steps/AchievementRecap.svelte';
  import ExercisesRecap from '$lib/design-system/components/recap-steps/ExercisesRecap.svelte';
  import GoalsRecap from '$lib/design-system/components/recap-steps/GoalsRecap.svelte';
  import MonthRecap from '$lib/design-system/components/recap-steps/MonthRecap.svelte';
  import PainRecap from '$lib/design-system/components/recap-steps/PainRecap.svelte';
  import ROMRecap from '$lib/design-system/components/recap-steps/ROMRecap.svelte';
  import StrengthRecap from '$lib/design-system/components/recap-steps/StrengthRecap.svelte';
  import MoodRecap from '$lib/design-system/components/recap-steps/MoodRecap.svelte';

  const stepComponents: ComponentType[] = [
    MonthRecap,
    ROMRecap,
    StrengthRecap,
    GoalsRecap,
    AchievementRecap,
    ExercisesRecap,
    PainRecap,
    MoodRecap
  ];

  $: bgClass = getBackgroundClass($currentRecapStep);

  function getBackgroundClass(step: number): string {
    // Check if current step is ROMRecap (index 1) or StrengthRecap (index 2)
    if (step === 1) {
      return 'rom-bg';
    } else if (step === 2) {
      return 'strength-bg';
    } else {
      return 'default-bg';
    }
  }
  $: console.log(
    'Current step:',
    $currentRecapStep,
    'Total steps:',
    recapSteps.length,
    'Is last step:',
    $currentRecapStep === recapSteps.length - 1
  );
</script>

<div class="recap-container {bgClass}">
  <MonthlyRecapNav currentStep={$currentRecapStep + 1} />
  <div class="step-content">
    <!-- Simplified component usage - no more props passing -->
    <svelte:component this={stepComponents[$currentRecapStep]} />
  </div>
  <MonthlyRecapActions
    isFirstStep={$currentRecapStep === 0}
    isLastStep={$currentRecapStep === recapSteps.length - 1}
    onNext={goToNextRecap}
    onPrevious={goToPreviousRecap}
    currentStepIndex={$currentRecapStep}
  />
</div>

<style>
  /* add media query and align-self: flex start */
  .recap-container {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
    padding-bottom: 34px;
    width: 100%;
    height: 100%;
    max-height: 785px;
    max-width: 808px;
  }
  :global(body) {
    overflow: hidden;
    max-height: 100vh;
  }
  .default-bg {
    background-color: var(--background);
  }
  /* .rom-bg {
    background-color: var(--color-blue-525);
  } */
  .strength-bg {
    background-color: none;
  }
  .step-content {
    width: 100%;
    max-width: 448px;
    overflow-x: visible;
  }
  /* .actions-wrapper {
    width: 100%;
    position: relative;
    left: 0;
    right: 0;
    bottom: 24px;
    z-index: 2;
    margin-top: auto;
  } */
</style>
