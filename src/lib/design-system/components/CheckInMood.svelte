<script lang="ts">
    import MoodCheckInItem from "$lib/design-system/components/MoodCheckInItem.svelte";
    
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
    <div class="mood-container--icon">
        <img src={selectedRatingImg} alt="mood icon" />
    </div>
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
        margin-bottom: 13px;
    }
    .mood-rating-container {
        display: flex;
        flex-direction: column;
        row-gap: 6px;
        width: 100%;
    }
</style>
