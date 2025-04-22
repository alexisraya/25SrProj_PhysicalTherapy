<script lang="ts">
  import {
    currentRecapStep,
    recapSteps,
    goToNextRecap,
    goToPreviousRecap
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
    AchievementRecap,
    PainRecap,
    ROMRecap,
    StrengthRecap,
    ExercisesRecap,
    GoalsRecap,
    PainRecap,
    MoodRecap
  ];
</script>

<div class="recap-container">
  <MonthlyRecapNav currentStep={$currentRecapStep} />
  <div class="step-content">
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
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    margin: 0 24px;
    padding: 20px 0 34px 0;
    background-color: var(--background);
    width: 100%;
    height: 100%;
    max-height: 785px;
    max-width: 808px;
    overflow-x: hidden;
  }
  .step-content {
    width: 100%;
    max-width: 448px;
    overflow-x: visible;
  }
</style>
