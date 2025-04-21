<script lang="ts">
  import { typography } from '$lib/design-system';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
  import { onMount } from 'svelte';

  export let isDisabled = false;
  export let buttonType = 'primary'; // "primary" or "secondary"
  export let cta: string;
  export let onClickFunc;
  export let buttonIcon;

  let button: HTMLButtonElement;

  onMount(() => {
    if (button) {
      // Only handle page visibility changes to fix the stuck state issue
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          // When leaving the page, ensure any active state is cleared
          button.classList.remove('active');
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  });
</script>

<button
  bind:this={button}
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
    -webkit-tap-highlight-color: transparent; /* Prevent default mobile tap highlight */
    touch-action: manipulation; /* Optimize for touch */
    will-change: transform; /* Optimize for animations */
  }

  /* Primary Button Styles */
  .primary {
    background-color: var(--button-primary-bg);
    border: 1px solid var(--button-primary-bg);
    color: var(--background);
  }

  /* Primary Hover */
  @media (hover: hover) {
    .primary:hover {
      background-color: var(--button-primary-bg-hover);
      border: 1px solid var(--button-primary-bg);
      color: var(--background);
    }
  }

  /* Primary Active */
  .primary:active {
    transform: scale(97.5%);
  }

  /* Disabled Primary Button Styles */
  .primary-disabled {
    background-color: var(--button-primary-disabled-bg);
    border: 1px solid var(--button-primary-disabled-bg);
    color: var(--button-primary-disabled-text);
    cursor: default;
    transform: none !important; /* Prevent active state on disabled buttons */
  }

  /* Secondary Button Styles */
  .secondary {
    background-color: transparent;
    color: var(--button-secondary-border);
    border: 1px solid var(--button-secondary-border);
  }

  /* Secondary Hover - only apply on devices with hover capability */
  @media (hover: hover) {
    .secondary:hover {
      background-color: var(--button-secondary-bg-hover);
      color: var(--button-secondary-border-hover);
      border: 1px solid var(--button-secondary-border-hover);
    }
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
    transform: none !important; /* Prevent active state on disabled buttons */
  }
</style>
