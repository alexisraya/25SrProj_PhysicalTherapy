<script lang="ts">
    import { goto } from "$app/navigation";
    import { typography } from "$lib/design-system";
    import RightArrow from '$lib/assets/iconography/RightArrow.svg';
    import DraggableIcon from '$lib/assets/iconography/DraggableIcon.svg';
    import CompletedCheckmark from "./CompletedCheckmark.svelte";
    import Checkbox from "./Checkbox.svelte";

    export let orderable = false;
    export let editMode = false;
    export let isComplete = false;

    export let exerciseName: string;
    export let exerciseSet: string = null;
    export let exerciseEquipment: string = null;
    export let exerciseId: string;

    const onClick = () => {
        if(!editMode){
            goto(`/your-program/${exerciseId}`)
        }
    }
</script>
<button class="exercise-container" on:click={onClick}>
    <div class="exercise-container--left">
        <div class="exercise-container--name">
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">
                {exerciseName}
            </p>
            <img src={RightArrow} alt="Right Arrow" />
        </div>
        {#if !isComplete}
        <div class="tags-container">
            {#if exerciseSet}
                <div class="tag">
                    <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">
                        {exerciseSet}
                    </p>
                </div>
            {/if}
            {#if exerciseEquipment}
                <div class="tag">
                    <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">
                        {exerciseEquipment}
                    </p>
                </div>
            {/if}
        </div>
        {/if}
    </div>
    <div class="exercise-container--right">
        <!-- add logic for each state here -->
         {#if isComplete}
            <!--Logic for too painful will be added once BE is being pulled-->
            <CompletedCheckmark />
         {:else if editMode}
            <Checkbox />
         {:else if orderable}
            <img src={DraggableIcon} alt="draggable dots" />
         {/if}
    </div>
</button>

<style>
    p {
        margin: 0;
    }
    .exercise-container {
        background-color: var(--color-blue-50);
        border: 0;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        width: 326px;
        cursor: pointer;
    }
    .exercise-container--left {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        row-gap: 12px;
    }
    .exercise-container--name {
        display: flex;
        column-gap: 4px;
        align-items: center;
    }
    .tags-container {
        display: flex;
        column-gap: 8px;
    }
    .tag {
        border: 1px var(--color-blue-1100) solid;
        border-radius: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px 10px;
        width: fit-content;
    }
</style>