<script lang="ts">
    import { Colors } from "$lib/design-system/colors";
    import ActiveMilestoneLight from "$lib/assets/background-images/ActiveMilestoneLight.svg";
    import { typography } from "$lib/design-system/typography";

    export let isComplete: boolean;
    export let isActive: boolean;
    export let isUpcoming: boolean;
    export let month: number;
</script>

<div class="milestone-month-container {isActive ? 'active-container' : ''}">
    {#if isComplete}
    <svg width="60" height="60">
        <circle cx="30" cy="30" r="29.5" fill="none" stroke={Colors.green[550]} stroke-width="1" />
        <circle cx="30" cy="30" r="25" fill={Colors.grey[0]} />
    </svg>
    {:else if isUpcoming}
    <svg width="60" height="60">
        <circle cx="30" cy="30" r="30" fill={Colors.grey[0]} />
    </svg>
    {:else}
        <img src={ActiveMilestoneLight} alt="active milestone background"/>
    {/if}

    <h1 class="milestone-month {isActive ? 'active' : ''} {isUpcoming ? 'upcoming' : ''}" style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h1}; font-weight: {typography.fontWeights.regular}">{month}</h1>
</div>

<style>
    .milestone-month-container {
        position: relative;
        width: 60px;
        height: 60px;
    }
    .active-container {
        width: 119px;
        height: 70px;
    }
    .milestone-month {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
    }
    .active {
        top: 50%;
        transform: translate(-50%, -57%);
    }
    .upcoming {
        color: var(--color-blue-150)
    }
</style>