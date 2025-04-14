<script lang="ts">
  import { currentCheckInStep, checkInSteps, goToNext, goToPrevious } from '$stores/checkin';
  import type { ComponentType } from 'svelte';
  import { typography } from '$lib/design-system/typography';
  import CheckInActions from '$lib/design-system/components/CheckInActions.svelte';
  import CheckInNav from '$lib/design-system/components/CheckInNav.svelte';

  import Pain from '$lib/design-system/components/checkin/Pain.svelte';
  import Mood from '$lib/design-system/components/checkin/Mood.svelte';
  import Reflection from '$lib/design-system/components/checkin/Reflection.svelte';

  const stepComponents: ComponentType[] = [Pain, Mood, Reflection];
</script>

<div class="onboarding-container">
  <CheckInNav currentStep={$currentCheckInStep} />
  <div class="step-content">
    <div class="step-copy">
      {#if checkInSteps[$currentCheckInStep].title}
        <h3
          style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
            .h3}; margin: 0; text-align: center;"
        >
          {checkInSteps[$currentCheckInStep].title}
        </h3>
      {/if}
      {#if checkInSteps[$currentCheckInStep].description}
        <p
          class="description"
          style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
            .regular}; font-weight: {typography.fontWeights.medium}; margin: 0; text-align: center;"
        >
          {checkInSteps[$currentCheckInStep].description}
        </p>
      {/if}
    </div>
    <svelte:component this={stepComponents[$currentCheckInStep]} />
  </div>
  <CheckInActions
    isFirstStep={$currentCheckInStep === 0}
    isLastStep={$currentCheckInStep === checkInSteps.length - 1}
    onNext={goToNext}
    onPrevious={goToPrevious}
    currentStepIndex={$currentCheckInStep}
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
  }
</style>
