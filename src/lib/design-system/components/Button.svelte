<script lang="ts">
  import { typography } from '$lib/design-system';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';

  export let isDisabled = false;
  export let buttonType = 'primary'; // "primary" or "secondary"
  export let cta: string;
  export let onClickFunc;
  export let buttonIcon;
</script>

<button
  class={isDisabled ? `${buttonType}-disabled` : `${buttonType}`}
  disabled={isDisabled}
  on:click={onClickFunc}
>
  {#if buttonIcon}
    <RemixIcon name={buttonIcon} />
  {/if}
  <p
    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
      .small}; font-weight: {typography.fontWeights.bold};"
  >
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
    column-gap: 7px;
    cursor: pointer;
    transition: 0.25s ease;
  }

  /* Primary Button Styles */
  .primary {
    background-color: var(--button-primary-bg);
    border: 1px solid var(--button-primary-bg);
    color: var(--background);
  }

  /* Primary Hover */
  /* TODO: DANE HOVER STATE LIGHT/DARK MODE COLORS */
  .primary:hover {
    background-color: var(--color-blue-900);
    border: 1px solid var(--button-primary-bg);
    color: var(--text-primary);
  }

  /* Primary Active */
  .primary:active {
    transform: scale(97.5%);
  }

  /* Disabled Primary Button Styles */
  /* TODO: DANE HOVER STATE LIGHT/DARK MODE COLORS */
  .primary-disabled {
    background-color: var(--button-primary-disabled-bg);
    border: 1px solid var(--button-primary-disabled-bg);
    color: var(--button-primary-disabled-text);
    cursor: default;
  }

  /* Secondary Button Styles */
  .secondary {
    background-color: transparent;
    color: var(--button-secondary-border);
    border: 1px solid var(--button-secondary-border);
  }

  /* Secondary Hover */
  .secondary:hover {
    background-color: var(--color-blue-50);
    color: var(--color-blue-800);
    border: 1px solid var(--color-blue-800);
  }

  /* Secondary Active */
  .secondary:active {
    transform: scale(97.5%);
  }

  /* Disabled Secondary Button Styles */
  .secondary-disabled {
    background-color: transparent;
    border: 1px solid var(--button-secondary-disabled-border);
    color: var(--button-secondary-disabled-border);
    cursor: default;
  }
</style>
