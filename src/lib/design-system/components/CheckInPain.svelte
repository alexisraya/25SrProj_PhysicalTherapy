<script lang="ts">
    import { typography } from '$lib/design-system';
    import PainCheckInItem from "$lib/design-system/components/PainCheckInItem.svelte";
    import { fade, fly } from 'svelte/transition';
    
    let numbers = Array.from({ length: 10 }, (_, i) => i + 1);
    let selectedRating: number | null = null;
    let selectedRatingText = "--";

    function handleSelect(event: CustomEvent<number>) {
        selectedRating = event.detail;
        if (selectedRating == 1) {
            selectedRatingText = "No Pain";
        } else if (selectedRating > 1 && selectedRating <=3) {
            selectedRatingText = "Mild";
        } else if (selectedRating > 3 && selectedRating <=6) {
            selectedRatingText = "Moderate";
        } else if (selectedRating > 6 && selectedRating <=9) {
            selectedRatingText = "Severe";
        } else if (selectedRating == 10) {
            selectedRatingText = "Very Severe";
        }
    }
</script>

<div class="pain-container">
    <div class="pain-container--text">
        <div class="text-container">
            {#key selectedRating}
                <h1 
                    in:fly={{ y: 20, duration: 300, delay: 50 }}
                    out:fade={{ duration: 0 }}
                    style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.special};"
                >
                    {selectedRating ?? "_"}
                </h1>
            {/key}
        </div>
        <div class="text-container">
            {#key selectedRating}
                <p 
                    in:fly={{ y: 15, duration: 400, delay: 150 }}
                    out:fade={{ duration: 0 }}
                    style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.medium};"
                >
                    {selectedRatingText}
                </p>
            {/key}
        </div>
    </div>
    <div class="pain-rating-container">
        {#each numbers as num}
            <PainCheckInItem rating={num} isSelected={num === selectedRating} on:select={handleSelect} />
        {/each}
    </div>
</div>

<style>
    h1, p {
        margin: 0;
    }
    .pain-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 32px;
    }
    .pain-container--text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        height: auto;
    }
    .text-container {
        position: relative;
        height: 1.5em;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    .text-container:first-child {
        height: fit-content;
    }
    .pain-rating-container {
        width: fit-content;
        display: grid;
        grid-template-columns: repeat(5, max-content);
        column-gap: 6px;
        row-gap: 6px;
    }
</style>