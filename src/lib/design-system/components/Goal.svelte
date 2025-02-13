<script lang="ts">
  import { typography } from "$lib/design-system/typography";

  export let goalName: string;
  export let isLocked: boolean = false;
  export let hasExtraInfo: boolean = false;
  export let extraInfo: string = "Time";

  let backgroundSrc = isLocked 
    ? "/src/lib/assets/iconography/Circle Locked BG.svg" 
    : "/src/lib/assets/iconography/Circle Unlocked BG.svg";

  let lockIconSrc = "/src/lib/assets/iconography/lock-light.svg";
  let goalIconSrc = "/src/lib/assets/iconography/stairs.svg";
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
  <div class="goal-icon">
    <img class="bg-image" src={backgroundSrc} alt="Goal background" />
    {#if isLocked}
      <img class="goal-image" src={lockIconSrc} alt="Locked" />
    {:else}
      <img class="goal-image" src={goalIconSrc} alt={goalName} />
    {/if}
  </div>
  <p class="goal-name">{goalName}</p>
  {#if hasExtraInfo}
    <p class="goal-extra">{extraInfo}</p>
  {/if}
</div>

<style>
  .goal-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 92px;
    align-self: stretch;
  }

  .goal-icon {
    position: relative;
    width: 92px;
    height: 92px;
  }

  .bg-image {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .goal-image {
    position: absolute;
    width: 73px;
    height: 73px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .goal-name {
    font-family: var(--font-body);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 150%;
    text-align: center;
    color: var(--blue-110);
    margin-bottom: 2px;
  }

  .goal-extra {
    font-family: var(--font-body);
    font-size: 10px;
    font-style: italic;
    font-weight: 400;
    line-height: 150%;
    text-align: center;
    color: var(--grey-30);
    margin-top: 2px;
  }
</style>