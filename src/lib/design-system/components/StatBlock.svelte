<script lang="ts">
  import { typography } from '$lib/design-system';

  export let statTitle: string;
  export let stat: number;
  export let unit: string = '';
  export let type: string = '';
  export let position: string = '';
</script>

<div class="program-stat-container {position}">
  <div class="stat-border {position}-{type}"></div>
  <div class="stat-text {type}">
    <p
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .small}; font-weight: {typography.fontWeights.medium}; color: {position == 'second'
        ? 'var(--color-blue-1100)'
        : 'var(--text-primary)'};"
    >
      {statTitle}
    </p>
    <h1
      style="font-family: {typography.fontFamily.heading}; font-size: {type === 'recap'
        ? typography.fontSizes.special03
        : typography.fontSizes.h0}; font-weight: {typography.fontWeights
        .medium}; color: {position == 'second' ? 'var(--color-blue-1100)' : 'var(--text-primary)'};"
    >
      {stat}<span style="font-size: {typography.fontSizes.regular};">{unit}</span>
    </h1>
  </div>
</div>

<style>
  p {
    margin: 0;
  }
  .program-stat-container {
    display: flex;
    column-gap: 24px;
    justify-content: flex-start;
    align-items: center;
    width: 155px;
    height: 98px;
  }
  .stat-border {
    width: 4px;
    height: 100%;
    border-radius: 30px;
    background-color: var(--color-purple-550); /* Light mode dark mode exception */
    flex-shrink: 0;
  }
  .first-recap {
    background-color: var(--text-primary);
  }
  .second-recap {
    background-color: var(--color-blue-1100);
  }
  .second-recap h1 {
    text-align: right;
  }
  .recap {
    display: flex;
    flex-direction: column-reverse;
  }
  .recap h1 {
    line-height: 70%;
  }
  .second {
    flex-direction: row-reverse;
  }
</style>
