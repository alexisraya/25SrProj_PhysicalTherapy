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

<div class={$currentCheckInStep === 2 ? 'reflection-container' : 'checkin-container'}>
  <CheckInNav currentStep={$currentCheckInStep} />
  <div class="step-content">
    {#if $currentCheckInStep != 2}
      <div class="step-copy">
        {#if checkInSteps[$currentCheckInStep].title}
          <h4
            style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
              .h4}; margin: 0; text-align: center; font-weight: 100;"
          >
            {checkInSteps[$currentCheckInStep].title}
          </h4>
        {/if}
        {#if checkInSteps[$currentCheckInStep].description}
          <p
            class="description"
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .small}; font-weight: {typography.fontWeights
              .regular}; margin: 0; text-align: center;"
          >
            {checkInSteps[$currentCheckInStep].description}
          </p>
        {/if}
      </div>
    {/if}
    <svelte:component this={stepComponents[$currentCheckInStep]} />
  </div>
  <div class={$currentCheckInStep === 2 ? 'reflection-button' : 'checkin-button'}>
    <CheckInActions
      isFirstStep={$currentCheckInStep === 0}
      isLastStep={$currentCheckInStep === checkInSteps.length - 1}
      onNext={goToNext}
      onPrevious={goToPrevious}
      currentStepIndex={$currentCheckInStep}
    />
  </div>
</div>

<style>
  /* add media query and align-self: flex start */
  .checkin-container {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: space-between; */
    margin: 0 24px;
    padding: 20px 0 34px 0;
    background-color: var(--background);
    width: 100%;
    height: 100%;
    /* max-height: 785px; */
    max-width: 808px;
    overflow-x: visible;
  }
  .checkin-button {
    /* width: 100%;
    margin: auto; */
    width: calc(100% - 48px);
    margin: auto;
    position: fixed;
    bottom: 24px;
  }
  .reflection-button {
    width: calc(100% - 48px);
    margin: auto;
    position: fixed;
    bottom: 24px;
  }
  .reflection-container {
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
    max-width: 808px;
    overflow-x: visible;
  }
  .checkin-container .step-content {
    width: 100%;
    max-width: 448px;
    overflow-x: visible;
    margin-bottom: 38px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 200px);
    justify-content: center;
  }
  .reflection-container .step-content {
    width: 100%;
    max-width: 448px;
    overflow-x: visible;
    margin-bottom: 38px;
    height: calc(100vh - 100px);
  }
  .step-copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 8px 0 16px 0;
    padding: 0px 24px;
    row-gap: 12px;
  }

  @media (min-width: 800px) {
    .reflection-container {
      /* max-height: 785px; */
    }
    .checkin-container {
      max-height: 785px;
    }
  }
</style>
