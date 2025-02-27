<script lang="ts">
    import Icon from "./Icon.svelte";
    import RightArrow from '$lib/assets/iconography/RightArrow.svg';
    import { typography } from "$lib/design-system/typography";

    export let type: string; // "program", "milestones"
    export let achievementDescription: string;
</script>

<div class="achievement-card-container {type}">
    <div class="achievement-header">
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">Achievements</p>
        <img src={RightArrow} alt="rigth arrow" />
    </div>
    <div class="achievement-body">
        <div class="achievement-image-container" >
            <Icon name="polar-bear" size="small"/>
        </div>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">{achievementDescription}</p>
    </div>
    
</div>

<style>
    p {
        margin: 0;
    }

    .achievement-card-container {
        display: flex;
        flex-direction: column;
        row-gap: 12px;
        border-radius: 4px;
        border: 1px solid var(--color-yellow-600);
        background: var(--color-yellow-100);
        padding: 16px 12px 12px 12px;
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