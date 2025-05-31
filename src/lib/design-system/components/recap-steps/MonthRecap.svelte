<script lang="ts">
  import { typography } from '$lib/design-system/typography';
  import { currentMonth } from '$stores/monthlyrecap';
  import MonthRecapIcon from '$lib/assets/iconography/MonthRecapIcon.svg';
  import MonthRecapBackground from '$lib/assets/background-images/MonthRecapBackground.svg';
</script>

<div class="month-recap-container">
  <img src={MonthRecapBackground} class="month-recap-background" alt="bg" />
  <div class="month-recap-header">
    <img src={MonthRecapIcon} class="month-recap-icon" alt="icon" />
  </div>
  <div class="month-recap-copy-container">
    <h1
      style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
        .h1}; font-weight: {typography.fontWeights.regular}"
    >
      Month {$currentMonth}
    </h1>
    <p
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .regular}; font-weight: {typography.fontWeights.medium}"
    >
      Here's a recap of all the progress you've made!
    </p>
  </div>
</div>

<style>
  p,
  h1 {
    margin: 0;
  }
  .month-recap-container {
    position: relative;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: visible;
  }
  .month-recap-background {
    position: fixed;
    top: -300px;
    left: -52px;
    z-index: 1;
  }
  .month-recap-icon {
    position: relative;
    padding-top: 64px;
    z-index: 1000;
  }
  .month-recap-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .month-recap-copy-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    row-gap: 16px;
    max-width: 265px;
  }
  @media screen and (min-width: 800px) {
    .month-recap-background {
      position: absolute;
      left: 50%;
      transform: translateX(-50%) rotate(-15deg);
      top: calc(350px - 100vw);
      height: 100vw;
    }
  }
  @media screen and (min-width: 1200px) {
    .month-recap-background {
      position: absolute;
      left: 50%;
      transform: translateX(-50%) rotate(-15deg);
      top: calc(500px - 100vw);
      height: 100vw;
    }
  }
</style>
