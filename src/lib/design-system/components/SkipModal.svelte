<script lang="ts">
    import { typography } from "$lib/design-system/typography";
    import Button from "$lib/design-system/components/Button.svelte";
    import CloseIcon from "$lib/assets/iconography/CloseIcon.svg"

    export let handleTooPainful;
    export let handleAddToEnd;
    export let open: boolean = false;
    
    function closeModal(): void {
        open = false;
    }
    
    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
    
    function handleBackdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    }
</script>

{#if open}
    <div class="modal-backdrop" on:click={handleBackdropClick}>
        <div class="modal-container">
            <div class="modal-text">
                <button class="close-button" on:click={closeModal}>
                    <img src={CloseIcon} alt="close" />
                </button>
                <p style="font-family: {typography.fontFamily.body}; font-size: 1.125rem; font-weight: {typography.fontWeights.medium};">Skip this Exercise</p>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.medium};">Let us know how you’d like to handle this skipped exercise</p>
            </div>
            <div class="modal-buttons">
                <Button buttonType="primary" cta="Add to end of my program" onClickFunc={handleAddToEnd} />
                <Button buttonType="secondary" cta="Mark as too painful to complete" onClickFunc={handleTooPainful} />
            </div>
        </div>
    </div>
{/if}

<style>
    p {
        margin: 0;
    }

    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    .modal-container {
        background-color: var(--color-grey-0);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 24px;
        padding: 16px 16px 32px 16px;
        margin: 0 32px;
        max-width: 500px;
        overflow-y: auto;
    }

    .modal-text {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 8px;
        text-align: center;
    }

    .modal-buttons {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 12px;
        width: 100%;
    }

    .close-button {
        align-self: flex-end;
        background-color: transparent;
        border: 0;
        cursor: pointer;
        margin-bottom: -8px;
    }
</style>