<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Colors, typography } from '$lib/design-system';
    import RightArrow from '$lib/assets/iconography/RightArrow.svg';
    import { goto } from '$app/navigation'; // Import SvelteKit navigation for page transition
    import { browser } from '$app/environment';

    export let nextPage: string;

    let isGrowing: boolean = false;
    let hasFilledScreen: boolean = false;
    let radius: number = 0;
    let growInterval: NodeJS.Timeout | null = null;
    let cx: number = 0;
    let cy: number = 0;
    let buttonRef: HTMLButtonElement;
    let MAX_RADIUS: number = 1000; // Default value (fallback for SSR)

    // Update max radius when in the browser
    const updateMaxRadius = () => {
        if (typeof window !== 'undefined') {  // Ensure this runs in the browser
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
        }
    });

    const startGrowing = (event: MouseEvent | TouchEvent): void => {
        if (buttonRef) {
            const rect = buttonRef.getBoundingClientRect();
            cx = rect.left + rect.width / 2;
            cy = rect.top + rect.height / 2;
        }

        isGrowing = true;
        hasFilledScreen = false;
        radius = 0;

        growInterval = setInterval(() => {
            // Use an easing function to create acceleration
            const progress = 1 - (MAX_RADIUS - radius) / MAX_RADIUS; // Ranges from 0 to 1
            // Cubic ease-in function: starts slow, speeds up dramatically
            const easedProgress = progress * progress * progress;
            // Calculate dynamic growth rate with more controlled acceleration
            const baseGrowthRate = 5; // Start with a very low base growth rate
            const accelerationFactor = 15; // Control the maximum acceleration
            // Calculate dynamic growth rate
            const growthRate = baseGrowthRate * (1 + easedProgress * accelerationFactor);
            radius += growthRate; // Adjust growth speed
            if (radius >= MAX_RADIUS && growInterval) {
                clearInterval(growInterval); // Stop animation at max size
                hasFilledScreen = true;

                // Optional: Delay navigation for smooth transition
                setTimeout(() => {
                    if (nextPage) goto(nextPage);
                }, 300); // Adjust delay as needed
            }
        }, 5);
    };

    const stopGrowing = (): void => {
        if (!hasFilledScreen) {
            isGrowing = false;
            if (growInterval) {
                clearInterval(growInterval);
                growInterval = null;
            }
            radius = 0; // Reset only if it didn't reach max size
        }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === "Enter") startGrowing(event);
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
        if (event.key === "Enter") stopGrowing();
    };
</script>

<div class="hold_to_complete_container">
    <div class="hold_to_complete_label">
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">Hold to complete</p>
        <img src={RightArrow} alt="right arrow"/>
    </div>
    <div class="press_hold_btn_container"> 
        <button
            bind:this={buttonRef}
            on:mousedown={startGrowing} 
            on:mouseup={stopGrowing} 
            on:mouseleave={stopGrowing} 
            on:touchstart={startGrowing} 
            on:touchend={stopGrowing} 
            on:keydown={handleKeyDown} 
            on:keyup={handleKeyUp}
        >
            <svg viewBox="-50 -50 100 100" width="44" height="44">
                <circle r="44" fill="#add8e6" />
                <circle r="44" fill={Colors.blue[100]} />
                <circle r="14" fill="none" stroke={Colors.blue[1000]} stroke-width="4" />
            </svg>
        </button>
        
        {#if isGrowing || hasFilledScreen}
            <svg class="full-screen-circle" width="100vw" height="100vh">
                <circle cx={cx} cy={cy} r={radius} fill="#6DE49D" />
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
