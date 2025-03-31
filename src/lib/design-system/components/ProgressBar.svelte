<script lang="ts">
  export let totalExercises: number;
  export let completedExercises: number;

  const remainingExercises = totalExercises - completedExercises;
</script>

<div
  class="progress_bar"
  style="display: grid; grid-template-columns: repeat({totalExercises}, 1fr);"
>
  {#each Array(completedExercises).fill(0) as _, i}
    <div class="progress_bar--item"></div>
  {/each}
  {#each Array(remainingExercises).fill(0) as _, i}
    <div class="progress_bar--item empty"></div>
  {/each}
</div>

<style>
  .progress_bar {
    width: 100%;
    /* display: flex; */
    column-gap: 8px;
    justify-content: center;
    margin-left: 16px;
  }
  .progress_bar--item {
    border-radius: 8px;
    height: 9px;
    /* width: 90px; */
    width: 100%;
    background-color: var(--color-blue-1100);
  }
  .empty {
    opacity: 40%;
  }
</style>
