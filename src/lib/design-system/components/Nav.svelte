<script lang="ts">
  import { writable } from 'svelte/store';
  import { page } from '$app/stores';
  import ToneSwitch from './ToneSwitch.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';

  let isOpen = writable(false);

  const toggleMenu = () => {
    isOpen.update((value) => !value);
  };

  const closeMenu = () => {
    isOpen.set(false);
  };
</script>

<nav>
  <div class="nav-container">
    <button on:click={toggleMenu} class="hamburger">
      <RemixIcon name="menu-3-line" />
    </button>
  </div>

  <!-- Subscribe to isOpen using $ -->
  <div class="menu-container" class:show={$isOpen}>
    <div class="menu">
      <button class="close-button" on:click={closeMenu}>
        <RemixIcon name="close-fill" />
      </button>
      <div class="menu-items">
        <div class="menu-item" class:active={$page.url.pathname === '/patient-dashboard'}>
          <RemixIcon name="dashboard-line" />
          <a href="/patient-dashboard" on:click={closeMenu}>Home</a>
        </div>
        <div class="menu-item" class:active={$page.url.pathname === '/your-progress'}>
          <RemixIcon name="line-chart-line" />
          <a href="/your-progress" on:click={closeMenu}>Progress</a>
        </div>
        <div class="menu-item" class:active={$page.url.pathname === '/your-program'}>
          <RemixIcon name="list-check-2" />
          <a href="/your-program" on:click={closeMenu}>Program</a>
        </div>
        <div class="menu-item" class:active={$page.url.pathname === '/profile'}>
          <RemixIcon name="user-3-line" />
          <a href="/profile" on:click={closeMenu}>Profile</a>
        </div>
      </div>

      <div class="toggles-container">
        <ThemeToggle />
        <ToneSwitch />
      </div>
    </div>
  </div>
</nav>

<style>
  nav {
    background-color: transparent;
    padding: 10px 20px;
    color: var(--text-primary);
    position: fixed;
    top: 0;
    right: 0;
    z-index: 100;
  }

  .nav-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  /* New container for animation */
  .menu-container {
    position: fixed;
    top: 0;
    right: 0;
    width: 277px;
    height: 100vh;
    overflow: hidden;
    transform: translateX(100%); /* Start off-screen */
    transition: transform 0.3s ease-out;
  }

  /* Show when menu is open */
  .menu-container.show {
    transform: translateX(0); /* Slide in */
    opacity: 1; /* Fade in */
  }

  .menu {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: var(--background-secondary);
    padding: 74px 16px 24px 16px;
    height: 100vh;
    width: 277px;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .menu a {
    display: block;
    text-decoration: none;
    color: var(--text-primary);
  }

  .menu-items {
    display: flex;
    flex-direction: column;
    row-gap: 22px;
  }

  .menu-item {
    background-color: transparent;
    border-radius: 8px;
    height: 27px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 12px;
    column-gap: 16px;
  }

  .menu-item.active {
    background-color: var(--background);
  }

  .toggles-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    row-gap: 16px;
  }

  .hamburger {
    background: none;
    border: none;
    cursor: pointer;
    width: 24px;
    height: 24px;
  }

  .close-button {
    border: 0;
    background-color: transparent;
    display: flex;
    width: 24px;
    height: 24px;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    right: 0;
    margin: 16px;
    cursor: pointer;
  }
</style>
