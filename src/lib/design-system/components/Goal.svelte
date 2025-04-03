<script lang="ts">
  import { typography } from "$lib/design-system/typography";
  import Icon from "./Icon.svelte";

  export let goalName: string;
  export let isLocked: boolean = false;
  export let hasExtraInfo: boolean = false;
  export let extraInfo: string;
</script>

<script context="module">
  export const defaultGoals = [
    { goalName: "Unlocked Goal", isLocked: false, hasExtraInfo: false },
    { goalName: "Unlocked Goal", isLocked: false, hasExtraInfo: true, extraInfo: "Time" },
    { goalName: "Locked Goal", isLocked: true, hasExtraInfo: false },
    { goalName: "Locked Goal", isLocked: true, hasExtraInfo: true, extraInfo: "Time" }
  ];
</script>

<div class="goal-container">
  <div class="goal-icon {isLocked ? 'locked' : 'unlocked'}">
    <div class="floating-icon">
      {#if isLocked}
        <Icon name="lock-light" size="small"/>
      {:else}
        <Icon name="stairs" size="small"/>
      {/if}
    </div>
  </div>
  <p class="goal-name" style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">{goalName}</p>
  {#if extraInfo}
    <p class="goal-extra" style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xxsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic">{extraInfo}</p>
  {/if}
</div>

<style>
  p {
    margin: 0;
  }
  .goal-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 92px;
    align-self: stretch;
    text-align: center;
  }

  .goal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1000px;
    width: 92px;
    height: 92px;
  }

  @keyframes floatUpDown {
    0% { transform: translateY(0px); }
    50% { transform: translateY(4px); } /* Moves slightly up */
    100% { transform: translateY(0px); } /* Moves back down */
}

  .unlocked {
    background-color: var(--color-blue-550);
  }

  .locked {
    background-color: transparent;
    border: 2px solid var(--color-blue-100);
  }

  .goal-name {
    color: var(--color-blue-1100);
    margin-top: 12px;
  }

  .goal-extra {
    color: var(--color-grey-300);
  }
  .unlocked:hover .floating-icon {
    animation: floatUpDown 2s ease-in-out infinite; /* Apply animation */
  }
</style>