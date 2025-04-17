<script lang="ts">
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
  import PainLevelModal from '$lib/design-system/components/checkin/PainLevelModal.svelte';

  export let currentStep: number;

  let modalOpen = false;

  function openModal() {
    modalOpen = true;
  }

  function closeModal() {
    modalOpen = false;
  }
</script>

<div class="checkin-nav-container {currentStep == 0 ? 'first' : ''}">
  {#if currentStep == 0}
    <button on:click={openModal}>
      <RemixIcon name="information-line" />
    </button>
  {/if}
  <button>
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
  }
  .first {
    justify-content: space-between;
  }
</style>
