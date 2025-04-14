<script>
  import { getMoodDescription, getPainDescription } from '$firebase/types/checkInType';
  import { typography } from '$lib/design-system/typography';
  import { checkInStore } from '$stores/checkInStore';

  import { get } from 'svelte/store';

  $: moodLevel = get(checkInStore).currentCheckIn.moodLevel;
  $: painLevel = get(checkInStore).currentCheckIn.painLevel;

  $: moodDescription = getMoodDescription(moodLevel);
  $: painDescription = getPainDescription(painLevel);

  const moodIcons = [
    '/mood-faces/mood-face-motivated-small.png',
    '/mood-faces/mood-face-hopeful-small.png',
    '/mood-faces/mood-face-indifferent-small.png',
    '/mood-faces/mood-face-uncertain-small.png',
    '/mood-faces/mood-face-discouraged-small.png'
  ];
</script>

<div class="reflection-container">
  <div class="reflection-header">
    <div class="reflection-header--copy">
      {#if moodLevel !== null && painLevel !== null}
        <img src={moodIcons[moodLevel - 1]} alt="{moodDescription} face" />
        <p>
          You're feeling {moodDescription.toLowerCase()} with {painDescription.toLowerCase()} pain
        </p>
      {/if}
    </div>
  </div>
  <div class="reflection-body">
    <h2
      style="font-family: {typography.fontFamily
        .heading}; font-size: 2.5rem; font-weight: {typography.fontWeights.regular};"
    >
      Recovery is tough, but it does get better.
    </h2>
    <span class="reflection-body--stat">
      <h1
        style="font-family: {typography.fontFamily
          .heading}; font-size: 4rem; font-weight: {typography.fontWeights.regular};"
      >
        75%
      </h1>
      <p>of adults have recovered from a knee injury, and you can too.</p>
    </span>
  </div>
</div>

<style>
  h1,
  h2,
  p {
    margin: 0;
  }
  .reflection-container {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    row-gap: 68px;
    height: 100%;
  }
  .reflection-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .reflection-header--copy {
    display: flex;
    align-items: center;
    column-gap: 12px;
    width: 100%;
  }
  .reflection-body {
    display: flex;
    flex-direction: column;
    row-gap: 32px;
  }
  .reflection-body--stat {
    display: grid;
    grid-template-columns: 40% 60%;
    align-items: center;
  }
</style>
