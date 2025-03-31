<script lang="ts">
    import { typography } from '$lib/design-system';

    export let statTitle: string;
    export let stat: number;
</script>

<div class="program-stat-container">
    <div class="stat-border"></div>
    <div class="stat-text">
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.medium};">{statTitle}</p>
        <h1 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h0}; font-weight: {typography.fontWeights.medium};">{stat}</h1>
    </div>
</div>

<style>
    p {
        margin: 0;
    }
    .program-stat-container {
        display: flex;
        column-gap: 24px;
        justify-content: flex-start;
        align-items: center;
        width: 155px;
        height: 98px;
    }
    .stat-border {
        width: 4px;
        height: 100%;
        border-radius: 30px;
        background-color: var(--color-purple-550); /* Light mode dark mode exception */
    }
</style>