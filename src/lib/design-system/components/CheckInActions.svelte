<script lang="ts">
  import { get } from 'svelte/store';
  import { checkInStepCompletionStatus } from '$stores/checkin';
  import { checkInStore, checkInValid } from '$stores/checkInStore';
  import Button from '$lib/design-system/components/Button.svelte';
  import DoubleButton from '$lib/design-system/components/DoubleButton.svelte';
  import { goto } from '$app/navigation';

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
    console.log('ive been clicked');
    // Get the current state from the store
    const storeState = get(checkInStore);
    const { painLevel, moodLevel } = storeState.currentCheckIn;

    // Log values for debugging
    console.log('checkInValid:', get(checkInValid));
    console.log('Current Pain Level:', painLevel);
    console.log('Current Mood Level:', moodLevel);

    if (!get(checkInValid)) {
      errorMsg = 'Please complete both pain and mood selections';
      console.log('Validation failed:', errorMsg);
      // You might need to expose this error message in the UI
      return;
    }

    isSubmitting = true;
    errorMsg = '';

    try {
      console.log('im trying');
      const success = await checkInStore.submitCheckIn();
      console.log('submission result:', success);

      if (success) {
        showSuccess = true;
        checkInCompleted = true;
        console.log('Im here');
      } else {
        console.log('Im error');
        errorMsg = 'Failed to submit check-in';
      }
    } catch (err) {
      console.error('Error submitting check-in:', err);
      errorMsg = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      console.log('submitting complete');
      isSubmitting = false;
      console.log('About to navigate to patient-dashboard');
      goto('patient-dashboard');
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
    margin: auto;
  }
</style>
