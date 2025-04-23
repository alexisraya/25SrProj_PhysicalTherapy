<script lang="ts">
  export let selectedRating: string = '';

  const moodMap = {
    motivated: '/mood-faces/mood-face-motivated.svg',
    hopeful: '/mood-faces/mood-face-hopeful.svg',
    indifferent: '/mood-faces/mood-face-indifferent.svg',
    uncertain: '/mood-faces/mood-face-uncertain.svg',
    discouraged: '/mood-faces/mood-face-discouraged.svg',
    default: '/mood-faces/mood-face-default.svg'
  };

  const moodColors = {
    motivated: '#3FAF6C20',
    hopeful: '#8FD2EC20',
    indifferent: '#9E80C520',
    uncertain: '#8FD2EC20',
    discouraged: '#D4663520',
    default: '#8FD2EC20'
  };

  $: normalizedRating = selectedRating.trim().toLowerCase();
  $: selectedRatingImg = moodMap[normalizedRating] || moodMap.default;
  $: selectedColor = moodColors[normalizedRating] || moodColors.default;

  $: console.log('normalizedRating:', normalizedRating);
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
    padding: 16px 16px;
    row-gap: 9px;
  }
</style>
