<script lang="ts">
  import Icon from '$lib/design-system/components/Icon.svelte';
  import { goalsMap } from '$lib/goals';
  import { typography } from '$lib/design-system/typography';

  export let goalId;
  export let title;
  export let ammount; // '1', '2', etc

  let sizing = 'medium';
  if (ammount > 2) {
    sizing = 'small';
  }
  if (ammount == 1) {
    sizing = 'large';
  }
  let action = 'walked the';
  // First, make sure goalId is a string
  const goalIdStr = String(goalId).toLowerCase();

  if (goalIdStr.includes('time')) {
    action = 'exercised as long as it takes for';
  } else if (goalIdStr.includes('weight')) {
    action = 'listed the weight of a';
  }
</script>

<div class="recap-goal-container {sizing}">
  <div class="recap-goal-icon-container {sizing}-icon-container">
    <Icon name={goalsMap[goalId]} size="small" />
  </div>
  <p
    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
      .regular}; font-weight: {typography.fontWeights.medium}"
  >
    You've {action}
    {title}
  </p>
</div>

<style>
  p {
    margin: 0;
  }
  .recap-goal-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .large {
    max-width: 290px;
    max-height: 160px;
    row-gap: 25px;
  }
  .medium {
    max-width: 150px;
    max-height: 290px;
    row-gap: 8px;
  }
  .recap-goal-icon-container {
    background-color: var(--color-blue-525);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%; /* Makes it a circle */
    aspect-ratio: 1; /* Ensures width and height are equal */
  }
  .large-icon-container {
    width: 250px; /* Set the width, height will match due to aspect-ratio */
  }
  .medium-icon-container {
    width: 156px; /* Set the width, height will match due to aspect-ratio */
  }
  .small-icon-container {
    width: 92px; /* Set the width, height will match due to aspect-ratio */
  }
</style>
