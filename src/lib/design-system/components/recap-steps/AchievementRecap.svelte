<script lang="ts">
  import { typography } from '$lib/design-system/typography';
</script>

<div class="month-recap-copy-container">
  <h1
    style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
      .h1}; font-weight: {typography.fontWeights.regular}"
  >
    You've got an achivement
  </h1>
  <!-- Add achivement card here -->
</div>

<style>
  .month-recap-copy-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
</style>
