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

  <!-- Side column for desktop and menu for mobile -->
  <div class="menu-container" class:show={$isOpen}>
    <div class="menu">
      <div class="logo-space">
        <!-- Space for logo on desktop -->
      </div>
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
  /* Mobile styles (unchanged) */
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

  .menu-container {
    position: fixed;
    top: 0;
    right: 0;
    width: 277px;
    height: 100vh;
    overflow: hidden;
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
  }

  .menu-container.show {
    transform: translateX(0);
    opacity: 1;
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

  .logo-space {
    display: none;
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

  /* Desktop styles (> 800px) */
  @media (min-width: 800px) {
    nav {
      position: relative;
      left: 0;
      right: auto;
      top: 0;
      padding: 0;
    }

    .nav-container {
      display: none;
    }

    .menu-container {
      position: static;
      width: 316px;
      transform: translateX(0);
      opacity: 1;
      border-right: 8px solid var(--background-secondary);
    }

    .menu {
      width: 324px;
      padding: 24px 16px;
      background-color: var(--background);
    }

    .menu-item.active {
      background-color: var(--background-secondary);
    }

    .logo-space {
      display: block;
      height: 100px;
      width: 100%;
      margin-bottom: 24px;
    }

    .close-button {
      display: none;
    }

    .toggles-container {
      align-items: flex-start;
    }
  }
</style>
