<script lang="ts">
  import Button from '$lib/design-system/components/Button.svelte';
  import DoubleButton from '$lib/design-system/components/DoubleButton.svelte';
  import { goto } from '$app/navigation';
  import { currentRecapStep } from '$stores/monthlyrecap';

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

  export let onNext: () => void;
  export let onPrevious: () => void;
  export let isFirstStep: boolean = false;
  export let isLastStep: boolean = false;
  export let currentStepIndex: number;

  // Determine if we’re on PainRecap (index 6) or MoodRecap (index 7)
  $: useInvertedStyle = currentStepIndex === 6;

  function handleFinish() {
    goto('/your-progress');
  }
</script>

<div class="actions-container {bgClass}">
  {#if isFirstStep}
    <Button cta="Begin" onClickFunc={onNext} />
  {:else}
    <DoubleButton
      ctaOne="Back"
      ctaOneOnClickFunc={onPrevious}
      ctaTwo={isLastStep ? 'Finish' : 'Next'}
      ctaTwoOnClickFunc={isLastStep ? handleFinish : onNext}
      ctaOneButtonType={useInvertedStyle ? 'primary-inverted' : 'primary'}
      ctaTwoButtonType={useInvertedStyle ? 'secondary-inverted' : 'secondary'}
    />
  {/if}
</div>

<style>
  .actions-container {
    box-sizing: border-box;
    display: flex;
    width: 100%;
    margin: auto;
    max-width: 448px;
    padding: 0 24px 16px;
    overflow: visible;
    position: absolute;
    bottom: 0;
  }
  .rom-bg {
    position: absolute;
    bottom: 0;
  }
</style>
