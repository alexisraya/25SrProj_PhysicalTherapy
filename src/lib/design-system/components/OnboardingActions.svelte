<script lang="ts">
  import { stepCompletionStatus } from '$stores/onboarding';
  import Button from '$lib/design-system/components/Button.svelte';
  import DoubleButton from '$lib/design-system/components/DoubleButton.svelte';

  export let onNext: () => void;
  export let onPrevious: () => void;
  export let isFirstStep: boolean = false;
  export let isLastStep: boolean = false;
  export let currentStepIndex: number;

  $: isStepComplete = $stepCompletionStatus[currentStepIndex];
</script>

<div class="actions-container">
  {#if isFirstStep}
    <Button cta="Begin" onClickFunc={onNext} />
  {:else}
    <DoubleButton
      ctaOne="Back"
      ctaOneOnClickFunc={onPrevious}
      ctaTwo={isLastStep ? 'Start check in' : 'Next'}
      ctaTwoOnClickFunc={onNext}
      isCTATwoDisabled={!isStepComplete}
    />
  {/if}
</div>

<style>
  .actions-container {
    display: flex;
    width: 100%;
    max-width: 448px;
  }
</style>
