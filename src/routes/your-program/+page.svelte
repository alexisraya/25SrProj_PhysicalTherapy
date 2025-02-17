<script lang="ts">
    import { typography, Colors } from '$lib/design-system';
    import PlayButton from '$lib/assets/iconography/PlayButton.svg';
    import CheckmarkSmall from "$lib/assets/iconography/CheckmarkSmall.svg";
    import ExerciseCard from '$lib/design-system/components/ExerciseCard.svelte';

    let isEditing = false;
    let buttonLabel = "Mark them complete here";

    const onClick = () => {
        isEditing = !isEditing;
        if (isEditing) {
            buttonLabel = "Mark them complete here";
        } else {
            buttonLabel = "Save changes";
        }
    }
</script>
<!-- Literally hardcoded fix for BE Connections -->
 <div class="your-program-container">
    <svg class="background-wave" xmlns="http://www.w3.org/2000/svg" width="332" height="213" viewBox="0 0 332 213" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M331.819 213C318.478 204.931 306.176 192.179 292.717 178.228C256.836 141.034 212.732 95.3173 118.798 107.096C28.3434 118.438 -3.70112 64.6624 0.372848 0L332 0V213H331.819Z" fill="#E4F4FA"/>
    </svg>
    <div class="your-program-title-container">
        <div class="your-program-title-container--text">
            <h3 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h3}; font-weight: {typography.fontWeights.medium};">Your Program</h3>
            <div class="your-program-title-container--details">
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">~30 Min</p>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">•</p>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">Band</p>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">•</p>
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">Kettle bell</p>
            </div>
        </div>
        <a href='your-program/exercise'>
            <img class="play-btn" src={PlayButton} alt="play button"/>
        </a>
    </div>

    <div class="exercises-container">
        <ExerciseCard exerciseName="Mini quad set" exerciseSet="3 sets of 10" exerciseEquipment="Kettle bell" orderable/>
        <ExerciseCard exerciseName="Mini quad set" exerciseSet="3 sets of 10" orderable/>
        <ExerciseCard exerciseName="Prone knee extension" exerciseSet="3 sets of 10" exerciseEquipment="Band" orderable/>
    </div>

    <div class="exercise-message-container">
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic; color: {Colors.grey[300]};">Already completed some exercises today?</p>
        <button class="exercise-edit-button" on:click={onClick}>
            <img src={CheckmarkSmall} alt="checkmark"/>
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">{buttonLabel}</p>
        </button>
    </div>
</div>

<style>
    .background-wave {
        position: absolute;
        top: 0;
        right: 0;
        z-index: -1;
    }
    .your-program-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 9px;
    }
    .your-program-title-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        max-width: 350px;
        margin-top: 81px;
    }
    .your-program-title-container--text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
    .your-program-title-container--details {
        display: flex;
        justify-content: flex-start;
        column-gap: 8px;
    }
    .play-btn {
        width: 90px;
        height: 90px;
        cursor: pointer;
    }
    .exercises-container {
        display: flex;
        flex-direction: column;
        row-gap: 12px;
        width: 100%;
        max-width: 350px;
    }
    .exercise-message-container {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 7px;
    }
    .exercise-edit-button {
        background-color: transparent;
        border: 2px solid var(--color-blue-50);
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 8px;
        padding: 12px 32px;
        cursor: pointer;
    }
</style>