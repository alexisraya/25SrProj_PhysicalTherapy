<script lang="ts">
  export let selectedRating: string = ''; // Provide a default value

  const moodMap = {
    motivated: '/mood-faces/mood-face-motivated.svg',
    hopeful: '/mood-faces/mood-face-hopeful.svg',
    indifferent: '/mood-faces/mood-face-indifferent.svg',
    uncertain: '/mood-faces/mood-face-uncertain.svg',
    discouraged: '/mood-faces/mood-face-discouraged.svg',
    default: '/mood-faces/mood-face-default.svg' // Add a default option
  };

  const moodColors = {
    motivated: '#8FD2EC20',
    hopeful: '#8FD2EC20',
    indifferent: '#D4663520',
    uncertain: '#D4663520',
    discouraged: '#D4663520',
    default: '#8FD2EC20' // Add a default option
  };

  // Use a reactive statement to update the image when selectedRating changes
  $: selectedRatingImg = moodMap[selectedRating] || moodMap.default;
  $: selectedColor = moodColors[selectedRating] || moodColors.default;
</script>

<div class="recap-mood-item-container" style="background-color: {selectedColor};">
  <img src={selectedRatingImg} alt="Mood face for {selectedRating || 'default'}" />
  <p>{selectedRating || 'No rating'}</p>
</div>

<style>
  p {
    margin: 0;
  }
  .recap-mood-item-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 136px;
    aspect-ratio: 1;
    padding: 9px 0;
    row-gap: 9px;
  }
</style>
