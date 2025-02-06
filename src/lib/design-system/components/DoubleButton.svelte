<script lang="ts">
    import Button from "./Button.svelte";

    export let ctaOne: string;
    export let ctaTwo: string;
</script>

<div class="double-button-container">
    <Button buttonType="secondary" cta={ctaOne}/>
    <Button buttonType="primary" cta={ctaTwo}/>
</div>

<style>
    .double-button-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        justify-content: center;
        column-gap: 16px;
    }
</style>