<script>
  import OnboardingFlow from '$lib/design-system/components/OnboardingFlow.svelte';
</script>

<div class="onboarding-page-container">
  <OnboardingFlow />
</div>

<style>
  .onboarding-page-container {
    box-sizing: border-box;
    background-color: var(--background);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    max-height: 100vh;
  }
</style>
