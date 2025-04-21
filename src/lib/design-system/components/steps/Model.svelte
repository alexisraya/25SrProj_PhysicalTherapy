<script lang="ts">
  import { setStepComplete } from '$stores/onboarding';
  import ModelBlob from '$lib/assets/background-images/steps/ModelBlob.svg';
  import ModelBlobDark from '$lib/assets/background-images/steps/ModelBlobDark.svg';
  import Character from '$lib/assets/iconography/Character.png';
  import { typography } from '$lib/design-system/typography';
  import { onMount } from 'svelte';

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

  const STEP_INDEX = 5; // This is the 5th step (0-indexed)
  let selectedModel: number | null = null;
  let characters = [
    { id: 1, name: 'Bree', image: Character },
    { id: 2, name: 'Kieran', image: Character },
    { id: 3, name: 'Alex', image: Character }
  ];

  // Update completion status when a choice is made
  $: {
    setStepComplete(STEP_INDEX, selectedModel !== null);
  }

  function selectCharacter(id) {
    selectedModel = id;
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

<div class="model-step-container">
  <img src={currentTheme == 'light' ? ModelBlob : ModelBlobDark} alt="blob" class="model-blob" />
  <div class="model-select-container">
    <div class="select-character-section">
      {#each characters as character}
        <button
          class="character {selectedModel === character.id ? 'selected' : ''}"
          on:click={() => selectCharacter(character.id)}
        >
          <img
            class="character--img {selectedModel === character.id ? 'selected-img' : ''}"
            src={character.image}
            alt="Character"
          />
          <div
            class="character--overlay {selectedModel === character.id ? 'selected-overlay' : ''}"
          ></div>
          <div class="character--name {selectedModel === character.id ? 'selected-name' : ''}">
            <p
              style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                .regular}; font-weight: {selectedModel === character.id
                ? typography.fontWeights.bold
                : typography.fontWeights.medium}; line-height: {typography.lineHeight.expanded}"
            >
              {character.name}
            </p>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .model-step-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    min-height: 225px;
  }
  .model-blob {
    position: absolute;
  }
  p {
    margin: 0;
  }
  button {
    background-color: transparent;
    border: 0;
  }
  .select-character-section {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: 16px;
  }
  .character {
    box-sizing: border-box;
    border-radius: 10px;
    position: relative;
    display: inline-block;
    width: 98px; /* Adjust as needed */
    cursor: pointer;
    padding: 4px;
  }
  .character img {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  .character--overlay {
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--color-grey-opactity-dark);
  }
  .character--name {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 24px;
    font-weight: bold;
    color: var(--color-blue-1100);
    text-align: center;
  }
  /* Styling for the selected character */
  .selected {
    border: 1px solid var(--color-blue-1100);
  }
  .selected-overlay {
    display: none;
  }
  .selected-name {
    color: var(--color-grey-0) !important;
  }
</style>
