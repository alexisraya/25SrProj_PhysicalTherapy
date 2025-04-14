<script lang="ts">
  export let totalExercises: number;
  export let completedExercises: number;

  export let remainingExercises = totalExercises - completedExercises;
  export let isOnboarding = false;
</script>

<div
  class="progress_bar {isOnboarding ? 'onboarding' : ''}"
  style="display: grid; grid-template-columns: repeat({totalExercises}, 1fr);"
>
  {#each Array(completedExercises).fill(0) as _, i}
    <div
      class="progress_bar--item
        {isOnboarding ? 'onboarding-item' : ''}
        {i === completedExercises - 1 && !isOnboarding ? 'animate-fill' : ''}"
    ></div>
  {/each}
  {#each Array(remainingExercises).fill(0) as _, i}
    <div
      class="progress_bar--item empty {isOnboarding ? 'onboarding-empty' : ''}"
    ></div>
  {/each}
</div>

<style>
  .progress_bar {
    width: 100%;
    column-gap: 8px;
    justify-content: center;
  }
  .progress_bar--item {
    border-radius: 8px;
    height: 9px;
    width: 100%;
    background-color: var(--color-blue-1100);
  }
  .empty {
    opacity: 40%;
  }
  .animate-fill {
    transform: scaleX(0);
    transform-origin: left;
    animation: fillAnimation 1s ease-in-out forwards;
  }
  @keyframes fillAnimation {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
  .onboarding-item {
    background-color: var(--text-primary);
  }
  .onboarding-empty {
    background-color: var(--onboarding-progress-background);
    opacity: 100%;
  }
</style>

