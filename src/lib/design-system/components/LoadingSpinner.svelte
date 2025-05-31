<script>
  export let size = '48px';
  export let dotCount = 8;
</script>

<div class="spinner" style="--size: {size}; --color: var(--spinner-color);">
  {#each Array(dotCount) as _, i}
    <div
      class="dot"
      style="
          transform: rotate({(360 / dotCount) * i}deg) translateX(calc(var(--size) * 0.4));
          animation-delay: {-((dotCount - i) * 0.05)}s;
        "
    />
  {/each}
</div>

<style>
  .spinner {
    position: relative;
    width: var(--size);
    height: var(--size);
    animation: rotate 2s linear infinite;
  }

  .dot {
    position: absolute;
    width: 12%;
    height: 12%;
    background-color: var(--spinner-color);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform-origin: center center;
    animation: fade 1s linear infinite;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes fade {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }
</style>
