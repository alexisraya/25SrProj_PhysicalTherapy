<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Colors, typography } from '$lib/design-system';
  import RightArrow from '$lib/assets/iconography/RightArrow.svg';
  import { goto } from '$app/navigation'; // Import SvelteKit navigation for page transition
  import { browser } from '$app/environment';

  export let nextPage: string;
  export let navigateFunc;

  let isGrowing: boolean = false;
  let hasFilledScreen: boolean = false;
  let radius: number = 0;
  let growInterval: NodeJS.Timeout | null = null;
  let cx: number = 0;
  let cy: number = 0;
  let buttonRef: HTMLButtonElement;
  let MAX_RADIUS: number = 1000; // Default value (fallback for SSR)

  // New variables for ring animation
  let isRingShrinking: boolean = false;
  let ringRadius: number = 40; // Starting radius of the ring
  let ringInterval: NodeJS.Timeout | null = null;
  let ringComplete: boolean = false;
  const MIN_RING_RADIUS: number = 20; // Target radius increased to make center further out
  let isHolding: boolean = false; // Track if button is being held
  let ringOpacity: number = 0; // Start with invisible ring

  // Update max radius when in the browser
  const updateMaxRadius = () => {
    if (typeof window !== 'undefined') {
      // Ensure this runs in the browser
      MAX_RADIUS = Math.max(window.innerWidth, window.innerHeight) + 100;
    }
  };

  // Run this only when the component is mounted (client-side)
  onMount(() => {
    if (browser) {
      updateMaxRadius();
      window.addEventListener('resize', updateMaxRadius);
    }
  });

  // Cleanup event listener when the component is destroyed
  onDestroy(() => {
    if (browser) {
      window.removeEventListener('resize', updateMaxRadius);
      if (ringInterval) clearInterval(ringInterval);
      if (growInterval) clearInterval(growInterval);
    }
  });

  const startRingShrinking = (event: MouseEvent | TouchEvent): void => {
    isHolding = true;

    if (buttonRef) {
      const rect = buttonRef.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
    }

    isRingShrinking = true;
    ringComplete = false;
    ringRadius = 40; // Start with a larger ring
    ringOpacity = 0; // Start fully transparent

    // Start the ring shrinking and opacity fade-in simultaneously
    ringInterval = setInterval(() => {
      // Handle ring shrinking
      // Calculate progress from 0 to 1, where 0 is the start and 1 is complete
      const progress = 1 - (ringRadius - MIN_RING_RADIUS) / (40 - MIN_RING_RADIUS);

      // Apply stronger easing to slow down more gradually
      // Using a cubic easing function for a smoother slowdown
      const easingFactor = Math.pow(progress, 2);

      // Base speed that slows down more as we approach the target
      const baseSpeed = 0.4;
      const slowdownFactor = 0.15;
      const adjustedSpeed = baseSpeed * (1 - easingFactor + slowdownFactor);

      ringRadius -= adjustedSpeed;

      // Handle opacity fade-in simultaneously
      // Make opacity increase more quickly at the beginning and then slower
      // This matches the easing of the ring shrinking
      if (ringOpacity < 1) {
        // Adjust this value to control how quickly opacity reaches 1
        ringOpacity = Math.min(1, ringOpacity + 0.03);
      }

      if (ringRadius <= MIN_RING_RADIUS && ringInterval) {
        clearInterval(ringInterval);
        ringComplete = true;

        // Start the green ellipse expansion automatically
        startGrowing();
      }
    }, 10);
  };

  const startGrowing = (): void => {
    isGrowing = true;
    hasFilledScreen = false;
    radius = 0;

    growInterval = setInterval(() => {
      // Use an easing function to create acceleration
      const progress = 1 - (MAX_RADIUS - radius) / MAX_RADIUS; // Ranges from 0 to 1
      // Cubic ease-in function: starts slow, speeds up dramatically
      const easedProgress = progress * progress;
      // Calculate dynamic growth rate with more controlled acceleration
      const baseGrowthRate = 10; // Start with a very low base growth rate
      const accelerationFactor = 15; // Control the maximum acceleration
      // Calculate dynamic growth rate
      const growthRate = baseGrowthRate * (1 + easedProgress * accelerationFactor);
      radius += growthRate; // Adjust growth speed

      if (radius >= MAX_RADIUS && growInterval) {
        clearInterval(growInterval); // Stop animation at max size
        hasFilledScreen = true;

        // Optional: Delay navigation for smooth transition
        setTimeout(() => {
          navigateFunc();
          radius = 0;
        }, 300); // Adjust delay as needed
      }
    }, 5);
  };

  const stopAnimation = (): void => {
    isHolding = false;

    // Only cancel the ring animation if it hasn't completed yet
    if (!ringComplete) {
      isRingShrinking = false;

      if (ringInterval) {
        clearInterval(ringInterval);
        ringInterval = null;
      }

      ringRadius = 40; // Reset ring size
      ringOpacity = 0; // Reset opacity
    }

    // We don't stop the green ellipse animation once it's started
    // It continues regardless of whether the button is still held
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter') startRingShrinking(event);
  };

  const handleKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'Enter') stopAnimation();
  };
</script>

<div class="hold_to_complete_container">
  <div class="hold_to_complete_label">
    <p
      style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
        .small}; font-weight: {typography.fontWeights.regular};"
    >
      Hold to complete
    </p>
    <img src={RightArrow} alt="right arrow" />
  </div>
  <div class="press_hold_btn_container">
    <button
      bind:this={buttonRef}
      on:mousedown={startRingShrinking}
      on:mouseup={stopAnimation}
      on:mouseleave={stopAnimation}
      on:touchstart={startRingShrinking}
      on:touchend={stopAnimation}
      on:keydown={handleKeyDown}
      on:keyup={handleKeyUp}
    >
      <svg viewBox="-50 -50 100 100" width="44" height="44">
        <circle r="44" fill="#add8e6" />
        <circle r="44" fill={Colors.blue[100]} />
        <circle r="14" fill="none" stroke={Colors.blue[1000]} stroke-width="4" />
      </svg>
    </button>

    {#if isRingShrinking || ringComplete}
      <svg
        class="ring-animation"
        width="100"
        height="100"
        style="left: {cx - 50}px; top: {cy - 51.5}px;"
      >
        <circle
          cx="50"
          cy="50"
          r={ringRadius}
          fill="none"
          stroke={Colors.green[550]}
          stroke-width="2"
          opacity={ringOpacity}
        />
      </svg>
    {/if}

    {#if isGrowing || hasFilledScreen}
      <svg class="full-screen-circle" width="100vw" height="100vh">
        <circle {cx} {cy} r={radius} fill={Colors.green[550]} />
      </svg>
    {/if}
  </div>
</div>

<style>
  p {
    margin: 0;
  }
  img {
    transition: 0.25s;
  }
  .hold_to_complete_container {
    padding-right: 24px;
    display: flex;
    align-items: center;
    column-gap: 4px;
    height: 44px;
    user-select: none;
  }
  .hold_to_complete_label {
    display: flex;
    align-items: center;
  }

  .full-screen-circle {
    z-index: 9999999999999;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .ring-animation {
    z-index: -0;
    position: fixed;
    pointer-events: none;
    transition: 0.25s;
  }

  .press_hold_btn_container {
    position: relative;
    display: inline-block;
  }
  .press_hold_btn_container button {
    background-color: transparent;
    border: none;
    cursor: pointer;
  }
  .hold_to_complete_container img {
    position: relative;
    transition: transform 0.25s ease-in;
  }
  .hold_to_complete_container:hover img {
    animation: slide-arrow 0.75s infinite alternate;
  }
  @keyframes slide-arrow {
    from {
      transform: translateX(0px);
    }
    to {
      transform: translateX(4px);
    }
  }
</style>
