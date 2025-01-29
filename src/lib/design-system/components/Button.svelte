<script lang="ts">
    import { typography } from '$lib/design-system';

    export let isDisabled = false;
    export let buttonType = "primary"; // "primary" or "secondary"
    export let cta: string;

</script>

<button class="{buttonType} {isDisabled ? `${buttonType}-disabled` : ''}" disabled={isDisabled}>
    <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.bold};">
        {cta}
    </p>
</button>

<style>
    button {
        border-radius: 23px;
        width: 100%;
        height: 44px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: 0.3s ease;
    }

    /* Primary Button Styles */
    .primary {
        background-color: var(--button-primary-bg);
        border: 1px solid var(--button-primary-bg);
        color: var(--color-grey-0);
    }

    /* Disabled Primary Button Styles */
    .primary-disabled {
        background-color: var(--button-primary-disabled-bg);
        border: 1px solid var(--button-primary-disabled-bg);
        color: var(--color-grey-300);
        cursor: default;
    }

    /* Secondary Button Styles */
    .secondary {
        background-color: transparent;
        color: var(--button-secondary-border);
        border: 1px solid #0F1B1F;
    }

    /* Disabled Secondary Button Styles */
    .secondary-disabled {
        background-color: transparent;
        border: 1px solid var(--button-secondary-disabled-border);
        color: var(--button-secondary-disabled-border);
        cursor: default;
    }
</style>