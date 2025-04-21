<script lang="ts">
  import { setStepComplete } from '$stores/onboarding';
  import { typography } from '$lib/design-system/typography';
  import KindToneBlobLight from '$lib/assets/background-images/steps/KindToneBlobLight.svg';
  import KindToneBlobDark from '$lib/assets/background-images/steps/KindToneBlobDark.svg';
  import ToughToneBlobLight from '$lib/assets/background-images/steps/ToughToneBlobLight.svg';
  import ToughToneBlobDark from '$lib/assets/background-images/steps/ToughToneBlobDark.svg';
  import NoToneBlobLight from '$lib/assets/background-images/steps/NoToneBlobLight.svg';
  import NoToneBlobDark from '$lib/assets/background-images/steps/NoToneBlobDark.svg';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
  import { getTone } from '$lib/helpers/toneContext';
  import { onMount } from 'svelte';

  const { setTone } = getTone();

  const STEP_INDEX = 4; // This is the 5th step (0-indexed)

  let selectedTone: string | null = null;

  const noToneSelected = 'Select tough or kind tone to see an example.';
  const kindToneExample = 'Healing takes time, but you’re making progress!';
  const toughToneExample = 'Half effort gets half results—commit to this.';

  // Update completion status when a choice is made
  $: {
    setStepComplete(STEP_INDEX, selectedTone !== null);
  }

  function onToughClicked() {
    selectedTone = 'tough';
    setTone('tough');
  }

  function onKindClicked() {
    selectedTone = 'kind';
    setTone('kind');
  }

  let currentTheme: 'light' | 'dark' = 'light';

  function updateThemeFromStorage() {
    // Check localStorage directly
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      currentTheme = savedTheme;
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      currentTheme = prefersDark ? 'dark' : 'light';
    }
  }

  onMount(() => {
    // Initial check from localStorage
    updateThemeFromStorage();

    // Listen for custom theme change events
    const handleThemeChange = () => {
      updateThemeFromStorage();
    };

    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', updateThemeFromStorage);
    };
  });
</script>

<div>
  <div class="tone-blob">
    {#if selectedTone == 'kind'}
      {#if currentTheme == 'light'}
        <img class="tone-blob--image" src={KindToneBlobLight} alt="blob" />
      {:else}
        <img class="tone-blob--image" src={KindToneBlobDark} alt="blob" />
      {/if}
      <p
        class="tone-blob--text"
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .special02}; font-weight: {typography.fontWeights.medium};"
      >
        {kindToneExample}
      </p>
    {:else if selectedTone == 'tough'}
      {#if currentTheme == 'light'}
        <img class="tone-blob--image" src={ToughToneBlobLight} alt="blob" />
      {:else}
        <img class="tone-blob--image" src={ToughToneBlobDark} alt="blob" />
      {/if}
      <p
        class="tone-blob--text"
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .special02}; font-weight: {typography.fontWeights.medium};"
      >
        {toughToneExample}
      </p>
    {:else}
      {#if currentTheme == 'light'}
        <img class="tone-blob--image" src={NoToneBlobLight} alt="blob" />
      {:else}
        <img class="tone-blob--image" src={NoToneBlobDark} alt="blob" />
      {/if}
      <p
        class="tone-blob--text"
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .special02}; font-weight: {typography.fontWeights.medium};"
      >
        {noToneSelected}
      </p>
    {/if}
  </div>
  <div class="tone-choice-container">
    <button on:click={onKindClicked} class={selectedTone == 'kind' ? 'selected' : ''}>
      <RemixIcon
        name="service-line"
        color={selectedTone == 'kind' ? 'var(--background)' : 'var(--text-primary)'}
      />
      <p
        class="tone-text"
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.medium};"
      >
        Kind
      </p>
    </button>
    <button on:click={onToughClicked} class={selectedTone == 'tough' ? 'selected' : ''}>
      <RemixIcon
        name="megaphone-line"
        color={selectedTone == 'tough' ? 'var(--background)' : 'var(--text-primary)'}
      />
      <p
        class="tone-text"
        style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
          .regular}; font-weight: {typography.fontWeights.medium};"
      >
        Tough
      </p>
    </button>
  </div>
</div>

<style>
  p {
    padding: 0;
    margin: 0;
  }
  .tone-blob {
    position: relative;
  }
  .tone-blob--image {
    position: relative;
    width: 100%;
  }
  .tone-blob--text {
    text-align: center;
    max-width: 80%;
    height: 87px;
    position: absolute;
    top: 25%;
    left: 5%;
    transform: translateX(5%) translateY(25%);
  }
  .tone-choice-container {
    margin-top: 24px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 12px;
    height: 48px;
  }
  .tone-choice-container button {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    column-gap: 8px;
    height: 48px;
    background-color: var(--button-primary-disabled-bg);
    border: 1px solid var(--button-primary-disabled-bg);
    border-radius: 8px;
    color: var(--text-primary);
  }

  .tone-choice-container button:hover {
    background-color: var(--color-blue-900);
    border: 1px solid var(--button-primary-bg);
    color: var(--text-primary);
  }

  /* Primary Active */
  .tone-choice-container button:active {
    transform: scale(97.5%);
  }

  .selected {
    background-color: var(--text-primary) !important;
    color: var(--background) !important;
  }

  @media (min-width: 400px) {
    .tone-blob--text {
      text-align: center;
      max-width: 80%;
      /* height: 87px; */
      position: absolute;
      top: 37%;
      left: 5%;
      transform: translateX(5%) translateY(25%);
    }
  }
</style>
