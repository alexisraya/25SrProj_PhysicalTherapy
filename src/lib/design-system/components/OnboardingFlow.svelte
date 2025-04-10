<script lang="ts">
  import { currentStep, steps, goToNext, goToPrevious } from '$stores/onboarding';
  import type { ComponentType } from 'svelte';
  import { typography } from '$lib/design-system/typography';
  import OnboardingActions from '$lib/design-system/components/OnboardingActions.svelte';
  import OnboardingNav from '$lib/design-system/components/OnboardingNav.svelte';

  import Mend from '$lib/design-system/components/steps/Mend.svelte';
  import Streaks from '$lib/design-system/components/steps/Streaks.svelte';
  import Achievements from '$lib/design-system/components/steps/Achievements.svelte';
  import Goals from '$lib/design-system/components/steps/Goals.svelte';
  import CheckIn from '$lib/design-system/components/steps/CheckIn.svelte';

  const stepComponents: ComponentType[] = [
    Mend,
    Streaks,
    Achievements,
    Goals,
    // Tone,
    // Model,
    CheckIn
  ];
</script>

<div class="onboarding-container">
  {#if $currentStep !== 0}
    <OnboardingNav currentStep={$currentStep} />
  {/if}
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
  .onboarding-container {
    display: flex;
    flex-direction: column;
    margin: 20px 24px 24px 24px;
    background-color: var(--background);
  }
  .step-copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 30px 0 48px 0;
    row-gap: 12px;
  }
</style>
