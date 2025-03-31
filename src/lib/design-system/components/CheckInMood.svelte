<script lang="ts">
  import MoodCheckInItem from '$lib/design-system/components/MoodCheckInItem.svelte';
  import { scale } from 'svelte/transition';
  import { onMount } from 'svelte';

  let numbers = Array.from({ length: 5 }, (_, i) => i + 1);
  let selectedRating: number | null = null;
  let selectedRatingImg = '/mood-faces/mood-face-default.svg';
  let iconContainerElement: HTMLDivElement;
  let iconImgElement: HTMLImageElement;

  const moodIcons = [
    '/mood-faces/mood-face-motivated.svg',
    '/mood-faces/mood-face-hopeful.svg',
    '/mood-faces/mood-face-indifferent.svg',
    '/mood-faces/mood-face-uncertain.svg',
    '/mood-faces/mood-face-discouraged.svg',
  ];

  function handleSelect(event: CustomEvent<number>) {
    selectedRating = event.detail;
    selectedRatingImg = moodIcons[selectedRating - 1];
  }

  // mitigates visual bug that collapses (what seems to be) randomly height upon loading a new icon

  // Update container height when image is loaded
  function handleImageLoad() {
    if (iconImgElement && iconContainerElement) {
      // Set container height to match the natural height of the image
      iconContainerElement.style.minHeight = `${iconImgElement.naturalHeight}px`;
    }
  }

  onMount(() => {
    // Initial image load handling
    if (iconImgElement && iconImgElement.complete) {
      handleImageLoad();
    }
  });
</script>

<div class="mood-container">
  <div class="mood-container--icon" bind:this={iconContainerElement}>
    {#key selectedRating}
      <img
        in:scale={{ delay: 5, duration: 250, start: 0.4 }}
        src={selectedRatingImg}
        alt="mood icon"
        bind:this={iconImgElement}
        on:load={handleImageLoad}
      />
    {/key}
  </div>
  <div class="mood-rating-container">
    {#each numbers as num}
      <MoodCheckInItem rating={num} isSelected={num === selectedRating} on:select={handleSelect} />
    {/each}
  </div>
</div>

<style>
  .mood-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .mood-container--icon {
    width: 105px;
    margin-bottom: 16px;
    transition: 0.5s;
  }
  .mood-rating-container {
    display: flex;
    flex-direction: column;
    row-gap: 6px;
    width: 100%;
  }
</style>
