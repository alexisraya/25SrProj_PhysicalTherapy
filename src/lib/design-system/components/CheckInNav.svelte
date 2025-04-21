<script lang="ts">
  import { goto } from '$app/navigation';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
  import PainLevelModal from '$lib/design-system/components/checkin/PainLevelModal.svelte';
  import { get } from 'svelte/store';
  import { checkInStore, checkInValid } from '$stores/checkInStore';

  export let currentStep: number;

  let modalOpen = false;

  let isSubmitting = false;
  let errorMsg = '';
  let showSuccess = false;
  let checkInCompleted = false;

  function openModal() {
    modalOpen = true;
  }

  function closeModal() {
    modalOpen = false;
  }

  async function onExit() {
    if (currentStep == 2) {
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
        goto('patient-dashboard');
      }
    } else {
      goto('patient-dashboard');
    }
  }
</script>

<div class="checkin-nav-container {currentStep == 0 ? 'first' : ''}">
  {#if currentStep == 0}
    <button on:click={openModal}>
      <RemixIcon name="information-line" />
    </button>
  {/if}
  <button on:click={onExit}>
    <RemixIcon name="close-line" />
  </button>
</div>

<PainLevelModal isOpen={modalOpen} onClose={closeModal} />

<style>
  button {
    background-color: transparent;
    border: 0;
    cursor: pointer;
  }
  .checkin-nav-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    z-index: 2;
  }
  .first {
    justify-content: space-between;
  }
</style>
