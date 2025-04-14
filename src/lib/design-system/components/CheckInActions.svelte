<script lang="ts">
  import { get } from 'svelte/store';
  import { checkInStepCompletionStatus } from '$stores/checkin';
  import { checkInStore, checkInValid } from '$stores/checkInStore';
  import Button from '$lib/design-system/components/Button.svelte';
  import DoubleButton from '$lib/design-system/components/DoubleButton.svelte';

  export let onNext: () => void;
  export let onPrevious: () => void;
  export let isFirstStep: boolean = false;
  export let isLastStep: boolean = false;
  export let currentStepIndex: number;
  // These feel a bit negligable
  let isSubmitting = false;
  let errorMsg = '';
  let showSuccess = false;
  let checkInCompleted = false;

  $: isStepComplete = $checkInStepCompletionStatus[currentStepIndex];

  async function onClose() {
    if (!get(checkInValid)) {
      errorMsg = 'Please complete both pain and mood selections';
      return;
    }

    isSubmitting = true;
    errorMsg = '';

    try {
      const success = await checkInStore.submitCheckIn();
      if (success) {
        showSuccess = true;
        checkInCompleted = true;
        // Load stats after successful submission
        await checkInStore.loadStats('week');
      } else {
        errorMsg = 'Failed to submit check-in';
      }
    } catch (err) {
      console.error('Error submitting check-in:', err);
      errorMsg = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="actions-container">
  {#if isFirstStep}
    <Button cta="Next" onClickFunc={onNext} isDisabled={!isStepComplete} />
  {:else if isLastStep}
    <Button cta="Close" onClickFunc={onClose} />
  {:else}
    <DoubleButton
      ctaOne="Back"
      ctaOneOnClickFunc={onPrevious}
      ctaTwo={'Next'}
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
