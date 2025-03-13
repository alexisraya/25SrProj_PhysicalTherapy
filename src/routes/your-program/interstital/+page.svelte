<script lang="ts">
    import { typography } from "$lib/design-system/typography";
    import Icon from "$lib/design-system/components/Icon.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    onMount(() => {
        setTimeout(() => {
            goto("/your-program/summary");
        }, 1500);
    });
</script>
<div class="interstital-container">
    <Icon name="program-complete-test" />
    <div class="interstital-text">
        <h1 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h1}; font-weight: {typography.fontWeights.regular};">You did it!</h1>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular};">Your hard work is paying off</p>
    </div>
</div>

<style>
    h1, p {
        margin: 0;
    }
    .interstital-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        /* row-gap: 32px; */
        row-gap: 0px;
        height: 100vh;
        overflow: visible;
        background-color: var(--color-green-500);
    }
    .interstital-text h1{
        text-align: center;
    }
    .interstital-text p{
        text-align: center;
    }
</style>
