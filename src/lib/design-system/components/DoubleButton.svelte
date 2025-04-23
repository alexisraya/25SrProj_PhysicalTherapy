<script lang="ts">
  import Button from './Button.svelte';

  export let ctaOne: string;
  export let ctaOneOnClickFunc;
  export let ctaTwo: string;
  export let ctaTwoOnClickFunc;
  export let isCTATwoDisabled;

  // Optional props with fallback values
  export let ctaOneButtonType: string = 'secondary';
  export let ctaTwoButtonType: string = 'primary';
</script>

<div class="double-button-container">
  <Button buttonType={ctaTwoButtonType} cta={ctaOne} onClickFunc={ctaOneOnClickFunc} />
  <Button
    buttonType={ctaOneButtonType}
    cta={ctaTwo}
    onClickFunc={ctaTwoOnClickFunc}
    isDisabled={isCTATwoDisabled}
  />
</div>

<style>
  .double-button-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    justify-content: center;
    column-gap: 16px;
    width: 100%;
  }
</style>
