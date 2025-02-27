<script>
    import Button from "$lib/design-system/components/Button.svelte";
    import DoubleButton from "$lib/design-system/components/DoubleButton.svelte";
    import HoldToComplete from "$lib/design-system/components/HoldToComplete.svelte";
    import Goal from "$lib/design-system/components/Goal.svelte";
    import { defaultGoals } from "$lib/design-system/components/Goal.svelte";    import ExerciseCard from "$lib/design-system/components/ExerciseCard.svelte";
    import StatBlock from "$lib/design-system/components/StatBlock.svelte";
    import CheckInPain from "$lib/design-system/components/CheckInPain.svelte";
    import CheckInMood from "$lib/design-system/components/CheckInMood.svelte";
    import XAxisTimeFrameSelectors from "$lib/design-system/components/XAxisTimeFrameSelectors.svelte";
    import Streak from "$lib/design-system/components/Streak.svelte";
    import Achievement from "$lib/design-system/components/Achievement.svelte";
    import AchievmentCard from "$lib/design-system/components/AchievmentCard.svelte";
    import ProgressBar from "$lib/design-system/components/ProgressBar.svelte";
    import MilestoneMonths from "$lib/design-system/components/MilestoneMonths.svelte";
    import CharacterSelect from "$lib/design-system/components/CharacterSelect.svelte";
    import ExerciseInfoBlock from "$lib/design-system/components/ExerciseInfoBlock.svelte";

</script>

<div class="container">
    <h1>Component Showcase</h1>

    <!-- Button -->
    <div class="component-section">
        <h2>Button</h2>
        <div class="component-items">
            <Button cta="Primary Button"/>
            <Button isDisabled buttonType="primary" cta="Primary Button Disabled"/>
            <Button buttonType="secondary" cta="Secondary Button"/>
            <Button isDisabled buttonType="secondary" cta="Secondary Button Disabled"/>
        </div>
        <h2>Double Button</h2>
        <div class="component-items">
            <DoubleButton ctaOne="Button 1" ctaTwo="Button 2" />
        </div>
        <h2>Hold to Complete</h2>
        <div class="component-items">
            <HoldToComplete nextPage=""/>
        </div>
    </div>

    <!-- Goal -->
    <div class="component-section">
        <h2>Goals</h2>
        <div class="goal-grid">
            {#each defaultGoals as goal}
                <Goal {...goal} />
            {/each}
        </div>
    </div>

    <!-- Achievements -->
    <div class="component-section">
        <h2>Achievement</h2>
        <Achievement type="program" achievementDescription="You’ve lifted the weight of a polar bear!"/>
        <Achievement type="milestones" achievementDescription="You’ve lifted the weight of a polar bear!"/>
        <AchievmentCard achievementTitle="Polar bear" achievementMark="158lbs" />
        <AchievmentCard isLocked achievementTitle="Female hippo" achievementMark="3000lbs" />
    </div>

    <!-- Exercise Card -->
    <div class="component-section">
        <h2>Exercise Card</h2>
        <div class="component-items">
            <ExerciseCard exerciseName="Exercise Default" exerciseSet="Text" exerciseEquipment="Text" />
            <ExerciseCard exerciseName="Exercise Orderable" exerciseSet="Text" exerciseEquipment="Text" orderable/>
            <ExerciseCard exerciseName="Exercise Edit Mode" exerciseSet="Text" exerciseEquipment="Text" editMode/>
            <ExerciseCard exerciseName="Exercise Complete" exerciseSet="Text" exerciseEquipment="Text" isComplete/>
        </div>
    </div>

    <!-- Stat Block -->
    <div class="component-section">
        <h2>Stat Block</h2>
        <div class="component-items">
            <StatBlock statTitle="Stat Title" stat="Stat"/>
        </div>
    </div>

    <!-- Check Ins -->
    <div class="component-section">
        <h2>Check In Pain</h2>
        <div class="component-items">
            <CheckInPain />
        </div>
        <h2>Check In Mood</h2>
        <div class="component-items">
            <CheckInMood />
        </div>
    </div>

    <!-- X Axis Selector -->
    <div class="component-section">
        <h2>X Axis Time Selector</h2>
        <XAxisTimeFrameSelectors />
    </div>

    <!-- Streak Displays -->
    <div class="component-section">
        <h2>Streak Displays</h2>
        <Streak streakType="home" streakTotalDays={5} streakDaysCompleted={1} />
        <Streak streakType="program" streakTotalDays={5} streakDaysCompleted={1} />
        <Streak streakType="milestones" streakTotalDays={5} streakDaysCompleted={1} />
    </div>

    <!-- Progress Bar -->
    <div class="component-section">
        <h2>Progress Bar</h2>
        <ProgressBar totalExercises={6} completedExercises={2} />
    </div>

    <!-- Milestone Months -->
    <div class="component-section">
        <h2>Milestone Months</h2>
        <div class="milestone">
            <MilestoneMonths isComplete={true} isActive={false} isUpcoming={false} month={1} />
            <MilestoneMonths isComplete={false} isActive={true} isUpcoming={false} month={2} />
            <MilestoneMonths isComplete={false} isActive={false} isUpcoming={true} month={3} />
        </div>
    </div>

    <!-- Character Select -->
    <div class="component-section">
        <h2>Character Select</h2>
        <CharacterSelect />
    </div>

    <!-- Exercise Info Block -->
    <div class="component-section">
        <h2>Exercise Info Block</h2>
        <ExerciseInfoBlock />
    </div>
</div>

<style>
    h1, h2 {
        margin: 0;
    }

    .container {
        margin: 20px;
    }

    .component-section {
        display: flex;
        flex-direction: column;
        row-gap: 16px;
        margin-bottom: 48px;
    }

    .component-items {
        display: flex;
        flex-direction: column;
        row-gap: 8px;
    }

    .goal-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
        gap: 16px;
        justify-content: center;
        padding-top: 10px;
    }

    .milestone {
        display: flex;
        column-gap: 8px;
        align-items: flex-start;
        background-color: #EAEAEA;
        padding: 16px;
    }
</style>