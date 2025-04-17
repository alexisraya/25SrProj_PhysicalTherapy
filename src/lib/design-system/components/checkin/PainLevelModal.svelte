<script lang="ts">
  import { onMount } from 'svelte';
  import RemixIcon from '../RemixIcon.svelte';
  import PainCheckInItem from '../PainCheckInItem.svelte';
  import { typography } from '$lib/design-system/typography';

  export let isOpen = false;
  export let onClose = () => {};

  let isMounted = false;

  onMount(() => {
    isMounted = true;
    return () => {
      // Cleanup when component is destroyed
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  });

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  function handleBackdropClick(event) {
    // Only close if clicking directly on the backdrop, not on modal content
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  // When modal opens, prevent body scrolling (only in browser)
  $: if (isMounted && typeof document !== 'undefined') {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- <div class="modal-backdrop" on:click={handleBackdropClick}> -->
  <div class="modal-backdrop">
    <div class="modal-content">
      <button class="close-button" on:click={onClose}>
        <RemixIcon name="close-line" />
      </button>
      <div class="modal-scroll-container">
        <div class="modal-title-container">
          <h4
            style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
              .h4}; margin: 0; text-align: center;"
          >
            Pain levels explained
          </h4>
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .small}; font-weight: {typography.fontWeights.light}; margin: 0; text-align: center;"
          >
            This is based on a <strong>clinical pain scale</strong> with descriptions to help accurately
            describe your pain
          </p>
        </div>
        <div class="modal-body-container">
          <div class="pain-level-container">
            <PainCheckInItem rating={1} />
            <div class="pain-level-description">
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
              >
                No Pain
              </p>
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .xsmall}; font-weight: {typography.fontWeights.light}; margin: 0;"
              >
                You feel completely fine. No discomfort at all.
              </p>
            </div>
          </div>
          <div class="divider"></div>
          <div class="pain-level-container">
            <PainCheckInItem rating={2} />
            <div class="pain-level-description">
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
              >
                Very Mild Pain
              </p>
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .xsmall}; font-weight: {typography.fontWeights.light}; margin: 0;"
              >
                Barely noticeable, like a light bruise or mild headache. You don’t really think
                about it.
              </p>
            </div>
          </div>
          <div class="divider"></div>
          <div class="pain-level-container">
            <PainCheckInItem rating={3} />
            <div class="pain-level-description">
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
              >
                Mild Pain
              </p>
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .xsmall}; font-weight: {typography.fontWeights.light}; margin: 0;"
              >
                Annoying but easy to ignore. Like a minor paper cut or slight muscle soreness.
              </p>
            </div>
          </div>
          <div class="divider"></div>
          <div class="pain-level-container">
            <PainCheckInItem rating={4} />
            <div class="pain-level-description">
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
              >
                Moderate Pain
              </p>
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .xsmall}; font-weight: {typography.fontWeights.light}; margin: 0;"
              >
                Barely noticeable, like a light bruise or mild headache. You don’t really think
                about it.
              </p>
            </div>
          </div>
          <div class="divider"></div>
          <div class="pain-level-container">
            <PainCheckInItem rating={5} />
            <div class="pain-level-description">
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
              >
                Moderate Pain
              </p>
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .xsmall}; font-weight: {typography.fontWeights.light}; margin: 0;"
              >
                It’s uncomfortable and distracting, but you can still function.
              </p>
            </div>
          </div>
          <div class="divider"></div>
          <div class="pain-level-container">
            <PainCheckInItem rating={6} />
            <div class="pain-level-description">
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
              >
                Moderately Severe Pain
              </p>
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .xsmall}; font-weight: {typography.fontWeights.light}; margin: 0;"
              >
                It’s affecting your ability to concentrate but not completely debilitating.
              </p>
            </div>
          </div>
          <div class="divider"></div>
          <div class="pain-level-container">
            <PainCheckInItem rating={7} />
            <div class="pain-level-description">
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
              >
                Severe Pain
              </p>
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .xsmall}; font-weight: {typography.fontWeights.light}; margin: 0;"
              >
                You have to stop what you're doing to actively manage the pain.
              </p>
            </div>
          </div>
          <div class="divider"></div>
          <div class="pain-level-container">
            <PainCheckInItem rating={8} />
            <div class="pain-level-description">
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
              >
                Severe Pain
              </p>
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .xsmall}; font-weight: {typography.fontWeights.light}; margin: 0;"
              >
                Comparable to post-surgery pain. You might be crying or struggling to focus.
              </p>
            </div>
          </div>
          <div class="divider"></div>
          <div class="pain-level-container">
            <PainCheckInItem rating={9} />
            <div class="pain-level-description">
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
              >
                Severe Pain
              </p>
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .xsmall}; font-weight: {typography.fontWeights.light}; margin: 0;"
              >
                Unbearable. You may be unable to move or feeling like you might pass out.
              </p>
            </div>
          </div>
          <div class="divider"></div>
          <div class="pain-level-container">
            <PainCheckInItem rating={10} />
            <div class="pain-level-description">
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .small}; font-weight: {typography.fontWeights.bold}; margin: 0;"
              >
                Very Severe Pain
              </p>
              <p
                style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                  .xsmall}; font-weight: {typography.fontWeights.light}; margin: 0;"
              >
                Worst pain possible. You may be in shock or unable to function at all.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  h4,
  p {
    margin: 0;
  }
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: var(--background);
    border-radius: 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .modal-scroll-container {
    width: 100%;
    height: 100%;
    padding: 62px 24px 32px 24px;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .modal-title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 8px;
    margin-bottom: 32px;
  }

  .modal-body-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 16px;
  }

  .divider {
    width: 100%;
    height: 2px;
    background-color: var(--background-secondary);
  }

  .pain-level-container {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 20% 74%;
    align-items: center;
    justify-content: flex-start;
    column-gap: 16px;
  }

  .pain-level-description {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    row-gap: 4px;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 1001;
  }
</style>
