<script lang="ts">
    import { scale } from "svelte/transition";
    import Icon from "./Icon.svelte";
    import RightArrow from '$lib/assets/iconography/RightArrow.svg';
    import { typography } from "$lib/design-system/typography";
    import { goto } from "$app/navigation";

    export let type: string; // "program", "milestones"
    export let achievementDescription: string;

    const onClick = () => {
        goto('/your-progress/achievements');
    }
</script>

<button 
    class="achievement-card-container {type}" 
    on:click={onClick} 
    in:scale={{ duration: 300, start: 0.8 }}
>
    <div class="achievement-header">
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">Achievements</p>
        <img src={RightArrow} alt="right arrow" />
    </div>
    <div class="achievement-body">
        <div class="achievement-image-container"> 
            <Icon name="polar-bear" size="small"/>
        </div>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">{achievementDescription}</p>
    </div>
</button>

<style>
    p {
        margin: 0;
    }

    .achievement-card-container {
        position: relative;
        display: flex;
        flex-direction: column;
        row-gap: 12px;
        border-radius: 4px;
        border: 1px solid var(--color-yellow-600);
        background: var(--color-yellow-100);
        padding: 12px;
        cursor: pointer;
        z-index: 5;
    }

    .milestones {
        border-color: transparent;
        background-color: transparent;
    }

    .achievement-header {
        display: flex;
        justify-content: space-between;
    }

    .achievement-body {
        display: flex;
        flex-direction: column;
        row-gap: 8px;
        text-align: left;
    }

    .achievement-image-container {
        padding: 0px 20px;
        border-radius: 4px;
        background-color: var(--color-yellow-550);
        height: 101px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .achievement-mark {
        color: var(--color-grey-300);
        text-align: center;
    }
</style>
