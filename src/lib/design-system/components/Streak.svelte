<script lang="ts">
    import { typography } from "$lib/design-system/typography";
    import StreakComplete from "$lib/assets/iconography/StreakCompleted.svg";

    export let streakType: string; // "home", "milestones", or "program"
    export let streakTotalDays: number;
    export let streakDaysCompleted: number;
    const remainingDays = streakTotalDays - streakDaysCompleted;
</script>

<div class="streak-display-container">
    <div class="streak-title">
        {#if streakType=="home"}
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">Weekly program streak</p>
        {:else}
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">Streak</p>
        {/if}
        <div class="streak-count">
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">4</p>
            <img class="streak-icon" src={StreakComplete} alt="lightning"/>
        </div>
    </div>
    <div class="streaks-container {streakType}">
        {#each Array(streakDaysCompleted).fill(0) as _, i}
            <div class="streak-container">
                <div class="streak completed {streakType!=="home" ? 'tall' : ''}"></div>
                {#if streakType=="home"}
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic;">Day {i+1}</p>
                {/if}
            </div>
        {/each}
        {#each Array(remainingDays).fill(0) as _, i}
            <div class="streak-container">
                <div class="streak {streakType!=="home" ? 'tall' : ''}"></div>
                {#if streakType=="home"}
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic;">Day {i+streakDaysCompleted+1}</p>
                {/if}
            </div>
        {/each}
    </div>
    {#if streakType!="home"}
        <div class="program-days-container">
            <h3 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h3}; font-weight: {typography.fontWeights.regular};">{streakDaysCompleted}/{streakTotalDays} </h3>
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular};">programs</p>
        </div>
    {/if}
</div>

<style>
    h3, p {
        margin: 0;
    }
    .streak-display-container {
        display: flex;
        flex-direction: column;
        row-gap: 12px;
        padding: 12px;
    }
    .streak-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .streaks-container {
        display: flex;
        column-gap: 2px;
        align-items: center;
        justify-content: center;
    }
    .program {
        background-color: var(--color-purple-100);
        border: 1px solid var(--color-purple-600);
        border-radius: 4px;
        padding: 16px 12px;
    }
    .streak-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 6px;
        width: 100%;
    }
    .streak {
        border-radius: 4px;
        display: flex;
        height: 12px;
        background-color: var(--color-purple-200);
        width: 100%;
    }
    .tall {
        height: 101px;
        background-color: var(--color-purple-300);
    }
    .completed {
        background-color: var(--color-purple-600);
    }
    .program-days-container {
        display: flex;
        align-items: flex-end;
        column-gap: 6px;
    }
    .program-days-container p{
        padding-bottom: 5px;
    }
    .streak-count {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        column-gap: 4px;
    }
</style>