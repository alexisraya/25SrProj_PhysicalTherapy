<script lang="ts">
    import { typography } from '$lib/design-system';
    import PainCheckInItem from "$lib/design-system/components/PainCheckInItem.svelte";
    
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
        <h1 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.special};">
            {selectedRating ?? "_"}
        </h1>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.medium};">{selectedRatingText}</p>
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
    }
    .pain-rating-container {
        width: fit-content;
        display: grid;
        grid-template-columns: repeat(5, max-content);
        column-gap: 6px;
        row-gap: 6px;
    }
</style>
