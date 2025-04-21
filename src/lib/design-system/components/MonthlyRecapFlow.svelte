<script lang="ts">
  import { currentStep, steps, goToNext, goToPrevious } from '$stores/onboarding';
  import type { ComponentType } from 'svelte';
  import { typography } from '$lib/design-system/typography';
  import OnboardingActions from '$lib/design-system/components/OnboardingActions.svelte';
  import OnboardingNav from '$lib/design-system/components/OnboardingNav.svelte';

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

<div class="onboarding-container">
  <OnboardingNav currentStep={$currentStep} />
  <div class="step-content">
    <svelte:component this={stepComponents[$currentStep]} />
    <div class="step-copy">
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; margin: 0; text-align: center;"
      >
        {steps[$currentStep].title}
      </h3>
      <p
        class="description"
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.medium}; margin: 0; text-align: center;"
      >
        {steps[$currentStep].description}
      </p>
      {#if steps[$currentStep].caption}
        <p
          class="caption"
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .xsmall}; font-weight: {typography.fontWeights
            .regular}; font-style: italic; margin: 0; color: var(--text-secondary) text-align: center;"
        >
          {steps[$currentStep].caption}
        </p>
      {/if}
    </div>
  </div>
  <OnboardingActions
    isFirstStep={$currentStep === 0}
    isLastStep={$currentStep === steps.length - 1}
    onNext={goToNext}
    onPrevious={goToPrevious}
    currentStepIndex={$currentStep}
  />
</div>

<style>
  /* add media query and align-self: flex start */
  .onboarding-container {
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
  .step-copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 30px 0 48px 0;
    row-gap: 12px;
    line-height: 150%;
  }
</style>
