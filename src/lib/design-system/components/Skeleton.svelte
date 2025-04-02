<div class="container">
  <div class="skeleton-container">
    <div class="skeleton-header-container">
      <div class="skeleton-header pulsate"></div>
      <div class="skeleton-box pulsate"></div>
      <div class="skeleton-box-small pulsate"></div>
    </div>
    <div class="skeleton-header pulsate"></div>
    <div class="skeleton-header pulsate"></div>
    <div class="third-grid">
      <div class="skeleton-med pulsate"></div>
      <div class="skeleton-med pulsate"></div>
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    justify-content: center;
  }
  .skeleton-container {
    width: 100%;
  }
  .skeleton-header-container {
    margin: 16px 0 42px;
  }
  .skeleton-header {
    height: 28px;
    margin-bottom: 16px;
    border-radius: 0.5rem;
  }
  .skeleton-box {
    width: 100%;
    height: 290px;
    margin-bottom: 16px;
    border-radius: 1rem;
  }
  .skeleton-box-small {
    width: 100%;
    height: 92px;
    margin-bottom: 16px;
    border-radius: 1rem;
  }
  .skeleton-med {
    width: 100%;
    height: 48px;
    margin-bottom: 16px;
    border-radius: 1rem;
  }
  .third-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 24px;
  }

  .pulsate {
    opacity: 1;
    /* static */
    /* background: var(--color-blue-50); */
    /* animated light */
    background: linear-gradient(
      -90deg,
      var(--loading-skeleton-primary),
      var(--loading-skeleton-secondary),
      var(--loading-skeleton-primary),
      var(--loading-skeleton-secondary)
    );
    /* animated dark */
    /* background: linear-gradient(-45deg, var(--color-grey-400), var(--color-blue-900), var(--color-grey-400), var(--color-blue-900)); */
    background-size: 400% 400%;
    animation: Gradient 5s ease-in-out infinite;
  }

  @keyframes Gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
</style>
