<script lang="ts">
    import MoodCheckInItem from "$lib/design-system/components/MoodCheckInItem.svelte";
    import { scale } from 'svelte/transition';
    
    let numbers = Array.from({ length: 5 }, (_, i) => i + 1);
    let selectedRating: number | null = null;
    let selectedRatingImg = "/mood-faces/mood-face-default.svg";

    const moodIcons = ["/mood-faces/mood-face-motivated.svg", "/mood-faces/mood-face-hopeful.svg", "/mood-faces/mood-face-indifferent.svg", "/mood-faces/mood-face-uncertain.svg", "/mood-faces/mood-face-discouraged.svg"];

    function handleSelect(event: CustomEvent<number>) {
        selectedRating = event.detail;
        selectedRatingImg = moodIcons[selectedRating-1];
    }
</script>

<div class="mood-container">
    {#key selectedRating}
        <div class="mood-container--icon">
            <img 
            in:scale={{ delay: 5, duration: 250, start: 0.4}}
            src={selectedRatingImg} alt="mood icon" 
            />
        </div>
    {/key}
    <div class="mood-rating-container">
        {#each numbers as num}
            <MoodCheckInItem rating={num} isSelected={num === selectedRating} on:select={handleSelect} />
        {/each}
    </div>
</div>

<style>
    .mood-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .mood-container--icon {
        width: 105px;
        margin-bottom: 16px;
        min-height: fit-content;
    }
    .mood-rating-container {
        display: flex;
        flex-direction: column;
        row-gap: 6px;
        width: 100%;
    }
</style>
