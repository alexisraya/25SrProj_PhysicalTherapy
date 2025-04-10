<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import Icon from '$lib/design-system/components/Icon.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getTone } from '$lib/helpers/toneContext';

  const { text } = getTone();

  const randomInsterstitialOption = Math.floor(Math.random() * 3);
  const interstitialTitleOptions = ['You did it!', 'Nice work!', 'Way to Go!'];
  const interstitialSubtitleOptions = ['you_did_it_bubble', 'nice_work_star', 'way_to_go_stairs'];
  const interstitialIconOptions = [
    'program-complete-stars',
    'program-complete-trophey',
    'program-complete-flag'
  ];

  const interstitialTitleOption = interstitialTitleOptions[randomInsterstitialOption];
  const insterstitialSubtitleOption = interstitialSubtitleOptions[randomInsterstitialOption];
  const interstitialIconOption = interstitialIconOptions[randomInsterstitialOption];

  onMount(() => {
    setTimeout(() => {
      goto('/your-program/summary');
    }, 1500);
  });
</script>

<div class="interstital-container">
  <Icon name={interstitialIconOption} />
  <div class="interstital-text">
    <h1
      style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
        .h1}; font-weight: {typography.fontWeights.regular};"
    >
      {interstitialTitleOption}
    </h1>
    <p
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .regular}; font-weight: {typography.fontWeights.regular};"
    >
      {$text(insterstitialSubtitleOption)}
    </p>
  </div>
</div>

<style>
  h1,
  p {
    margin: 0;
  }
  .interstital-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* row-gap: 32px; */
    row-gap: 0px;
    height: 100vh;
    overflow: visible;
    background-color: var(--color-green-500); /** Light mode dark mode exception */
  }
  .interstital-text h1 {
    text-align: center;
  }
  .interstital-text p {
    text-align: center;
  }
</style>
