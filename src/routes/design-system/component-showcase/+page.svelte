<script>
    import Button from "$lib/design-system/components/Button.svelte";
    import DoubleButton from "$lib/design-system/components/DoubleButton.svelte";
    import HoldToComplete from "$lib/design-system/components/HoldToComplete.svelte";
    import Goal from "$lib/design-system/components/Goal.svelte";
    import { defaultGoals } from "$lib/design-system/components/Goal.svelte";    import ExerciseCard from "$lib/design-system/components/ExerciseCard.svelte";
    import Nav from "$lib/design-system/components/Nav.svelte";
    import StatBlock from "$lib/design-system/components/StatBlock.svelte";

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

    <div class="component-section">
        <h2>Stat Block</h2>
        <div class="component-items">
            <StatBlock statTitle="Stat Title" stat="Stat"/>
        </div>
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
</style>