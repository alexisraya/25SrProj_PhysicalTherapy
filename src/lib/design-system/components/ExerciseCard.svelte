<script lang="ts">
    import { goto } from "$app/navigation";
    import { typography } from "$lib/design-system";
    import RightArrow from '$lib/assets/iconography/RightArrow.svg';
    import DraggableIcon from '$lib/assets/iconography/DraggableIcon.svg';
    import CheckboxEmptyIcon from '$lib/assets/iconography/CheckboxExmptyIcon.svg';
    import CheckboxSelectedIcon from '$lib/assets/iconography/CheckboxSelectedIcon.svg'; 
    import CompletedCheckmark from "$lib/design-system/components/CompletedCheckmark.svelte";
    
    export let orderable = false;
    export let editMode = false;
    export let isComplete = false;
    export let isTooPainful = false;

    export let exerciseName: string;
    export let exerciseSet: string;
    export let exerciseEquipment: string;
    export let exerciseId: string;
    export let cardType: string; // "your-program" or "summary"
    
    // Add prop to connect with parent selection state
    export let onToggleSelection: (id: string, selected: boolean) => void = () => {};
    export let isSelected = false;

    function toggleCheckbox(event: Event) {
        // Prevent button click from triggering card click
        event.stopPropagation();
        
        isSelected = !isSelected;
        onToggleSelection(exerciseId, isSelected);
    }

    const onClick = () => {
        if(!editMode){
            goto(`/your-program/${exerciseId}`)
        }
    }
</script>
<button class="exercise-container {cardType}" on:click={onClick}>
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
        {#if editMode}
            <button 
                class="checkbox-button" 
                on:click={toggleCheckbox}
                aria-label={isSelected ? "Deselect exercise" : "Select exercise"}
            >
                <img 
                    src={isSelected || isComplete ? CheckboxSelectedIcon : CheckboxEmptyIcon} 
                    alt={isSelected ? "Selected" : "Not selected"} 
                />
            </button>
         {:else if orderable && !isComplete}
            <img src={DraggableIcon} alt="draggable dots" />
         {:else if isComplete || isTooPainful}            
            <CompletedCheckmark isTooPainful={isTooPainful}/>
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
        cursor: pointer;
        width: 100%;
    }
    /* .your-program {
        width: 326px;
    }
    .summary {
        width: 100%;
    } */
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
    .checkbox-button {
        background-color: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .hidden-checkbox {
        display: none; /* Hide the default checkbox */
    }
</style>