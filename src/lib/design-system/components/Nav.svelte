<script>
    import { writable } from 'svelte/store';
    import { page } from '$app/stores';
    import NavIcon from "$lib/assets/iconography/NavIcon.svg";
    import CloseIcon from "$lib/assets/iconography/CloseIcon.svg";
    import HomeIcon from "$lib/assets/iconography/HomeIcon.svg";
    import ProgressIcon from "$lib/assets/iconography/ProgressIcon.svg";
    import ProgramIcon from "$lib/assets/iconography/ProgramIcon.svg";
    import ProfileIcon from "$lib/assets/iconography/ProfileIcon.svg";

    let isOpen = writable(false);

    const toggleMenu = () => {
        isOpen.update(value => !value);
    };

    const closeMenu = () => {
        isOpen.set(false);
    };
</script>

<nav>
    <div class="nav-container">
        <button on:click={toggleMenu} class="hamburger">
            <img class="hamburger-icon" alt="nav icon" src={NavIcon} />
        </button>
    </div>

    <!-- Subscribe to isOpen using $ -->
    <div class={$isOpen ? 'menu show-menu' : 'menu'}>
        <button class="close-button" on:click={closeMenu}>
            <img class="close-icon" src={CloseIcon} alt="close button icon" />
        </button>
        <div class="menu-item" class:active={$page.url.pathname === "/patient-dashboard"}>
            <img class="nav-icon" src={HomeIcon} alt="home icon"/>
            <a href="/patient-dashboard" on:click={closeMenu}>Home</a>
        </div>
        <div class="menu-item" class:active={$page.url.pathname === "/your-progress"}>
            <img class="nav-icon" src={ProgressIcon} alt="progress icon"/>
            <a href="/your-progress" on:click={closeMenu}>Progress</a>
        </div>
        <div class="menu-item" class:active={$page.url.pathname === "/your-program"}>
            <img class="nav-icon" src={ProgramIcon} alt="program icon"/>
            <a href="/your-program" on:click={closeMenu}>Program</a>
        </div>
        <div class="menu-item" class:active={$page.url.pathname === "/profile"}>
            <img class="nav-icon" src={ProfileIcon} alt="profile icon"/>
            <a href="/profile" on:click={closeMenu}>Profile</a>
        </div>
    </div>
</nav>

<style>
    nav {
        background-color: transparent;
        padding: 10px 20px;
        color: var(--color-blue-1100);
        position: absolute;
        top: 0;
        right: 0;
        z-index: 100;
        width: 277px;
    }
  
    .nav-container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
  
    .menu {
        display: none;
        flex-direction: column;
        row-gap: 22px;
        background-color: var(--color-blue-50);
        position: relative;
        top: -34px;
        right: -20px;
        padding: 74px 16px 24px 16px;
    }
  
    .menu a {
        display: block;
        text-decoration: none;
        color: var(--color-blue-1100);
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
        background-color: #fff; /* Highlight active menu item */
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

    .show-menu {
      display: flex;
    }
  </style>