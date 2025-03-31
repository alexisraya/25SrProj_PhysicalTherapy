<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { typography } from '$lib/design-system';

  export let rating: number;
  export let isSelected = false;

  const dispatch = createEventDispatcher(); // Create an event dispatcher

  const itemColors = ['#3FAF6C', '#70B8D5', '#9E80C5', '#3C6474', '#FF7A40'];

  const itemColor = itemColors[rating - 1];

  const titleOptions = ['Motivated', 'Hopeful', 'Indifferent', 'Uncertain', 'Discouraged'];
  const option = titleOptions[rating - 1];
</script>

<button
  class="check-in-item-container {isSelected ? 'selected' : ''}"
  style="background-color: {isSelected ? itemColor : 'transparent'}; border: 1px solid {isSelected
    ? itemColor
    : 'var(--color-blue-100)'};"
  on:click={() => dispatch('select', rating)}
>
  <p
    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
      .small}; font-weight: {typography.fontWeights.medium}; color: {isSelected
      ? 'var(--color-grey-0)'
      : 'var(--color-blue-1100)'};"
  >
    {option}
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
    height: 44px;
    transition: 0.25s;
    cursor: pointer;
  }
  .check-in-item-container:active {
    transform: scale(95%);
  }
</style>
