<script lang="ts">
    export let goalName: string;
    export let isLocked: boolean = false;
    export let hasExtraInfo: boolean = false;
    export let extraInfo: string = "Time";
    export let isDarkMode: boolean = false; // Enables dark mode styling
  
    // Define assets based on state
    let backgroundSrc = isLocked 
      ? "/src/lib/assets/iconography/Circle Locked BG.svg" 
      : "/src/lib/assets/iconography/Circle Unlocked BG.svg";
  
    let lockIconSrc = "/src/lib/assets/iconography/lock-light.svg";
    let goalIconSrc = "/src/lib/assets/iconography/stairs.svg";
  </script>
  
  <div class="goal-container {isDarkMode ? 'dark-mode' : ''}">
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
    :root {
      /* Color Variables */
      --blue-110: #0F1B1F;
      --grey-0: #FFFFFF;
      --grey-30: #9BA1A3;
  
      /* Font Variables */
      --font-body: "Albert Sans", sans-serif;
    }
  
    .goal-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
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
  
    /* Typography for Goal Name */
    .goal-name {
      font-family: var(--font-body);
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 150%; /* 18px */
      text-align: center;
      color: var(--blue-110);
    }
  
    /* Typography for Extra Info */
    .goal-extra {
      font-family: var(--font-body);
      font-size: 10px;
      font-style: italic;
      font-weight: 400;
      line-height: 150%; /* 15px */
      text-align: center;
      color: var(--grey-30);
    }
  
    /* Dark Mode Styles */
    .dark-mode .goal-name {
      color: var(--grey-0);
    }
  
    .dark-mode .goal-extra {
      color: var(--grey-30);
    }
  </style>  