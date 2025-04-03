<script lang="ts">
    import Icon from "./Icon.svelte";
    import { typography } from "$lib/design-system/typography";

    export let achievementTitle: string;
    export let achievementMark: string;
    export let achievementValue: number;
    export let isLocked= false;

    let valueLabel = `${achievementValue} ${achievementMark}`

    if (achievementMark=="seconds" && achievementValue>=60) {
        const minutes = Math.floor(achievementValue / 60);
        const seconds = achievementValue % 60;

        seconds > 0
            ? valueLabel = `${minutes}m ${seconds}s`
            : valueLabel = `${minutes} minutes`;
    }
</script>

<div class="achievement-card-container">
    <div class="achievement-body">
        <div class="achievement-image-container {isLocked ? 'locked' : 'unlocked'}" >
            {#if isLocked}
                <Icon name="lock-yellow-light" size="small"/>
            {:else}
            <div class="floating-icon">
                <Icon name="polar-bear" size="small"/>
            </div>
            {/if}
        </div>
        {#if isLocked}
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular}; text-align: center;">Locked</p>
        {:else}
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular}; text-align: center;">{achievementTitle}</p>
        {/if}
        <p class="achievement-mark" style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic;">{valueLabel}</p>
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
        border: 2px solid var(--color-yellow-550);
        height: 101px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .locked {
        background-color: transparent;
        border-radius: 4px;
        border: 2px solid var(--color-yellow-200);
    }

    .achievement-mark {
        color: var(--color-grey-300);
        text-align: center;
    }

    .unlocked:hover .floating-icon{
        animation: floatUpDown 2s ease-in-out infinite; /* Apply animation */
    }

    @keyframes floatUpDown {
    0% { transform: translateY(0px); }
    50% { transform: translateY(4px); } /* Moves slightly up */
    100% { transform: translateY(0px); } /* Moves back down */
}

</style>