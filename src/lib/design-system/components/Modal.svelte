<!-- Modal.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  
  export let isOpen = false;
  export let title: String;
  
  const dispatch = createEventDispatcher();
  
  function handleOutsideClick(event) {
    if (event.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  }
  
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
  
  function closeModal() {
    dispatch('close');
    isOpen = false;
  }
  
  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={handleOutsideClick}>
    <div class="modal-content">
      <div class="modal-header">
        <h2>{title}</h2>
        <button class="close-button" on:click={closeModal}>✕</button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-footer">
        <slot name="footer">
          <button class="button" on:click={closeModal}>Close</button>
        </slot>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 24px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 4px;
    color: #666;
  }

  .close-button:hover {
    color: #333;
  }

  .modal-body {
    margin-bottom: 16px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .button {
    padding: 8px 16px;
    background-color: #e2e2e2;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .button:hover {
    background-color: #d2d2d2;
  }

  /* Responsive design */
  @media (min-width: 768px) {
    .modal-content {
      width: 75%;
    }
  }

  @media (min-width: 1024px) {
    .modal-content {
      width: 50%;
    }
  }
</style>