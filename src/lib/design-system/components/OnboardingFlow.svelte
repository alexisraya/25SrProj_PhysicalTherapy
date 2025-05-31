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
  import Tone from '$lib/design-system/components/steps/Tone.svelte';
  import Model from '$lib/design-system/components/steps/Model.svelte';

  const stepComponents: ComponentType[] = [
    Mend,
    Streaks,
    Achievements,
    Goals,
    Tone,
    Model,
    CheckIn
  ];
</script>

<div class="onboarding-container">
  <OnboardingNav currentStep={$currentStep} />
  <div class="step-content">
    <svelte:component this={stepComponents[$currentStep]} />
    <div class="step-copy">
      <h3
        style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
          .h3}; margin: 0; text-align: center; font-weight: 100;"
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
  <!-- <div class="button-area"></div> -->
  <div class="actions-container">
    <OnboardingActions
      isFirstStep={$currentStep === 0}
      isLastStep={$currentStep === steps.length - 1}
      onNext={goToNext}
      onPrevious={goToPrevious}
      currentStepIndex={$currentStep}
    />
  </div>
</div>

<!-- <div class="actions-container">
  <OnboardingActions
    isFirstStep={$currentStep === 0}
    isLastStep={$currentStep === steps.length - 1}
    onNext={goToNext}
    onPrevious={goToPrevious}
    currentStepIndex={$currentStep}
  />
</div> -->

<style>
  /* add media query and align-self: flex start */
  .onboarding-container {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: space-between; */
    gap: 10vh;
    margin: 0 24px;
    padding: 20px 0 34px 0;
    background-color: var(--background);
    width: 100%;
    height: 100%;
    max-height: 985px;
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
  .actions-container {
    width: calc(100vw - 48px);
    padding: 24px;
    position: fixed;
    bottom: 0px;
    display: flex;
    background: linear-gradient(to top, var(--background), transparent);
  }

  @media screen and (min-width: 500px) {
    .actions-container {
      width: calc(100vw - 48px);
      max-width: 452px;

      position: relative;
      margin: auto;
      bottom: 2px;
    }
  }
</style>
