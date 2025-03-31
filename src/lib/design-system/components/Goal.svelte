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
    {#if isLocked}
      <Icon name="lock-light" size="small"/>
    {:else}
      <Icon name="stairs" size="small"/>
    {/if}
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

  .unlocked {
    background-color: var(--unlocked-goal-background);
  }

  .locked {
    background-color: transparent;
    border: 2px solid var(--locked-goal-border);
  }

  .goal-name {
    color: var(--text-primary);
    margin-top: 12px;
  }

  .goal-extra {
    color: var(--color-grey-300); /* light/dark mode exception */
  }
</style>