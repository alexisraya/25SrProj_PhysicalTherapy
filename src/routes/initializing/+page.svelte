<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '../../stores/authStore';
  import { typography } from '$lib/design-system';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';

  let loadingSteps = [
    { text: 'Setting up your account...', completed: false },
    { text: 'Initializing your goals...', completed: false },
    { text: 'Preparing your program...', completed: false },
    { text: 'Almost ready!', completed: false }
  ];

  let currentStep = 0;

  onMount(() => {
    // Simulate progress steps
    const stepInterval = setInterval(() => {
      if (currentStep < loadingSteps.length - 1) {
        loadingSteps[currentStep].completed = true;
        currentStep++;
        loadingSteps = [...loadingSteps]; // Trigger reactivity
      } else {
        loadingSteps[currentStep].completed = true;
        loadingSteps = [...loadingSteps];
        clearInterval(stepInterval);

        // Navigate after all steps complete
        setTimeout(() => {
          goto('/onboarding');
        }, 1000);
      }
    }, 1500);

    // Fallback navigation in case something goes wrong
    const fallbackTimeout = setTimeout(() => {
      console.log('Fallback navigation triggered');
      goto('/onboarding');
    }, 10000); // 10 second fallback

    return () => {
      clearInterval(stepInterval);
      clearTimeout(fallbackTimeout);
    };
  });
</script>

<div class="container">
  <div class="content">
    <h1 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h2};">
      Welcome to Mend!
    </h1>

    <div class="loading-steps">
      {#each loadingSteps as step, index}
        <div class="step" class:active={index === currentStep} class:completed={step.completed}>
          <div class="step-indicator">
            {#if step.completed}
              <RemixIcon name="check-line" color="--blue-50" />
            {:else if index === currentStep}
              <div class="spinner"></div>
            {:else}
              {index + 1}
            {/if}
          </div>
          <span class="step-text">{step.text}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .content {
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  h1 {
    margin-bottom: 48px;
    color: var(--text-primary);
  }

  .loading-steps {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 16px;
    opacity: 0.4;
    transition: opacity 0.3s ease;
  }

  .step.active,
  .step.completed {
    opacity: 1;
  }

  .step-indicator {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    background-color: var(--background-secondary);
    color: var(--text-secondary);
    transition: all 0.3s ease;
  }

  .step.active .step-indicator {
    background-color: var(--color-blue-525);
    color: white;
  }

  .step.completed .step-indicator {
    background-color: var(--color-green-500, #10b981);
    color: white;
  }

  .step-text {
    font-family: var(--typography-font-family-body);
    font-size: 16px;
    color: var(--text-primary);
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
