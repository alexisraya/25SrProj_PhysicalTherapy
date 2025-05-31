<script>
  import MonthlyRecapFlow from '$lib/design-system/components/MonthlyRecapFlow.svelte';
</script>

<div class="recap-page-container">
  <MonthlyRecapFlow />
</div>

<style>
  .recap-page-container {
    margin-top: 0.5rem;
    display: flex;
    align-items: space-between;
    justify-content: center;
    height: calc(100vh - 0.5rem);
    overflow-x: hidden;
  }
</style>
