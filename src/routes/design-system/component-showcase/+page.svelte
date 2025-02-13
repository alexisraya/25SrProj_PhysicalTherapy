<script>
    import Button from "$lib/design-system/components/Button.svelte";
    import Goal from "$lib/design-system/components/Goal.svelte";
    import { defaultGoals } from "$lib/design-system/components/Goal.svelte";
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
</div>

<style>
    h1, h2{
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