<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { typography } from '../typography';
  export let rating: number;

  const dispatch = createEventDispatcher(); // Create an event dispatcher

  const itemColors = [
    '#6AD997',
    '#70DEB0',
    '#73D7C3',
    '#76D0D6',
    '#79C9E8',
    '#FDEF67',
    '#FED25E',
    '#FEB554',
    '#FF984B',
    '#FF7A40'
  ];

  const itemDescriptions = [
    'No Pain',
    'Very Mild Pain',
    'Mild Pain',
    'Moderate Pain',
    'Moderate Pain',
    'Moderately Severe Pain',
    'Severe Pain',
    'Severe Pain',
    'Severe Pain',
    'Very Severe Pain'
  ];

  const itemColor = itemColors[rating - 1];
  const itemDescription = itemDescriptions[rating - 1];
</script>

<button
  class="check-in-item-container"
  style="background-color: {itemColor};"
  on:click={() => dispatch('select', rating)}
>
  <p
    class="rating-title"
    style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
      .special}; font-weight: {typography.fontWeights.medium}; color: var(--color-blue-110)"
  >
    {rating}
  </p>
  <p
    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
      .regular}; font-weight: {typography.fontWeights.medium}; color: var(--color-blue-110)"
  >
    {itemDescription}
  </p>
</button>

<style>
  button {
    border: none;
  }
  p {
    margin: 0;
  }
  .rating-title {
    margin: -22px 0;
  }
  .check-in-item-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    width: 134px;
    transition: 0.25s;
    padding: 12px;
  }
</style>
