<script>
    import { onMount } from 'svelte';
    import { authStore } from '$stores/authStore';
    import { goalStore } from '$stores/goalStore';
    import MilestoneMonths from "$lib/design-system/components/MilestoneMonths.svelte";
    import Achievement from "$lib/design-system/components/Achievement.svelte";
    import Streak from "$lib/design-system/components/Streak.svelte";
    import Goal from '$lib/design-system/components/Goal.svelte';
    import { typography } from '$lib/design-system/typography';
    import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';

    let goals;
    onMount(() => {
        if ($authStore.currentUser) {
            goalStore.loadGoals($authStore.currentUser.uid);
            console.log($goalStore.goals);
        }
    });

    goals = $goalStore.goals[2].slice(0, 5); //TODO: ALEXIS Make Month dynamic
</script>
<div class="milestone-header">
    <MilestoneMonths month={1} isComplete />
    <MilestoneMonths month={2} isActive/>
    <MilestoneMonths month={3} isUpcoming />
    <MilestoneMonths month={4} isUpcoming />
    <MilestoneMonths month={5} isUpcoming />
</div>
<div class="milestone-body">
    <div class="milestone-body--top">
        <Achievement type="milestones" achievementDescription="You’ve lifted the weight of a polar bear!"/>
        <Streak streakType="milestones" streakTotalDays={5} streakDaysCompleted={1} />
        <!-- TODO: Alexis Make dynamic -->
    </div>
    <div class="milestone-body--bottom">
        <div class="goals-section">
            <a class="goals-section--header" href="/your-progress/goals">
                <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">Goals</p>
                <RemixIcon name="arrow-right-s-line" />
            </a>
            <div class="goals-container">
                {#each goals as goalItem}
                    <Goal goalName={goalItem.goalName} isLocked={!goalItem.unlocked} extraInfo={goalItem.timeframe}/>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    a {
        color: var(--text-primary);
        text-decoration: none;
    }
    .milestone-header {
        display: flex;
        column-gap: 16px;
        align-items: flex-start;
        padding: 0 24px;
        overflow-x: scroll;
        overflow-y: hidden;
        &::-webkit-scrollbar {
            display: none;
        }
    }
    .milestone-body {
        background-color: var(--background);
        min-height: 500px;
        padding: 16px 14px 32px 14px;
    }
    .milestone-body--top {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
    .goals-section {
        padding: 12px;
    }
    .goals-section--header{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .goals-container {
        display: grid;
        grid-template-columns: repeat(3, 92.5px);
        align-items: flex-start;
        justify-content: space-between;
        row-gap: 16px;
    }
</style>