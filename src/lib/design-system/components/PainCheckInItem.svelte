<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { typography } from '../typography';
  export let rating: number;
  export let isSelected = false;

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

  const itemColor = itemColors[rating - 1];
  const itemColorTrans = itemColor + 20;
</script>

<button
  class="check-in-item-container {isSelected ? 'selected' : ''}"
  style="background-color: {isSelected
    ? itemColor
    : itemColorTrans}; border: 2px solid {itemColor};"
  on:click={() => dispatch('select', rating)}
>
  <p
    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
      .small}; font-weight: {typography.fontWeights.medium};"
  >
    {rating}
  </p>
</button>

<style>
  p {
    margin: 0;
  }
  .check-in-item-container {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    width: 68px;
    height: 75px;
    transition: 0.25s;
  }

  .check-in-item-container:active {
    transform: scale(0.9);
  }

  .check-in-item-container:active p {
    transform: scale(1.1);
    transition: 0.25s;
  }
</style>
