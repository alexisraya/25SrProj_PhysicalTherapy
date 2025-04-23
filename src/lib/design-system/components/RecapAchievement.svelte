<script lang="ts">
  import Icon from '$lib/design-system/components/Icon.svelte';
  import { achievementsMap } from '$lib/achievements';
  import { typography } from '$lib/design-system/typography';

  export let achievemntId;
  export let title;
  export let ammount; // '1', '2', etc
  console.log('achievemntId');
  console.log(achievemntId);
  console.log(title);
  console.log(ammount);

  let sizing = 'medium';
  if (ammount < 2) {
    sizing = 'large';
  } else {
    sizing = 'medium';
  }
  let action = 'walked the';
  // First, make sure achievementId is a string
  const achievementIdStr = String(achievemntId).toLowerCase();

  if (achievementIdStr.includes('time')) {
    action = 'exercised as long as it takes for';
  } else if (achievementIdStr.includes('weight')) {
    action = 'lifted the weight of a';
  }
</script>

<div class="recap-achievement-container {sizing}">
  <div class="recap-achivement-icon-container {sizing}-icon-container">
    <Icon name={achievementsMap[achievemntId]} size="small" />
  </div>
  <p
    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
      .regular}; font-weight: {typography.fontWeights.medium}"
    class="achievement-subtitle"
  >
    You've {action}
    {title}
  </p>
</div>

<style>
  p {
    margin: 0;
  }
  .recap-achievement-container {
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
  .recap-achivement-icon-container {
    background-color: var(--color-yellow-550);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  .large-icon-container {
    height: 220px;
  }
  .medium-icon-container {
    height: 115px;
  }
  .achievement-subtitle {
    text-transform: lowercase;
  }
  .achievement-subtitle::first-letter {
    text-transform: uppercase;
  }
</style>
