<script>
    import Button from "$lib/design-system/components/Button.svelte";

</script>

<div class="container">
    <h1>Component Showcase</h1>
    <div class="component-section">
        <h2>Button</h2>
        <div class="component-items">
            <Button cta="Primary Button"/>
            <Button isDisabled buttonType="primary" cta="Primary Button Disabled"/>
            <Button buttonType="secondary" cta="Secondary Button"/>
            <Button isDisabled buttonType="secondary" cta="Secondary Button Disabled"/>
        </div>
    </div>
</div>

<style>
    h1, h2, h3, h4, h5, p {
        margin: 0;
    }
    .container {
        margin: 20px;
    }
    .component-section {
        display: flex;
        flex-direction: column;
        row-gap: 8px;
    }
    .component-items {
        display: flex;
        flex-direction: column;
        row-gap: 8px;
    }
</style>