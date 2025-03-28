<!-- ThemeToggle.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    
    type Theme = 'light' | 'dark';
    
    let theme: Theme = 'light';
    
    onMount(() => {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      
      // Check for system preference if no saved preference
      if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
      } else {
        theme = savedTheme;
      }
      
      // Apply the theme
      applyTheme(theme);
    });
    
    function applyTheme(newTheme: Theme): void {
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      theme = newTheme;
    }
    
    function toggleTheme(): void {
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    }
  </script>
  
  <div class="theme-toggle">
    <label class="switch">
      <input type="checkbox" checked={theme === 'dark'} on:change={toggleTheme}>
      <span class="slider">
        <span class="icon sun">
            <img src="/icons/remix/sun.svg" alt="sun" />
        </span>
        <span class="icon moon">
            <img src="/icons/remix/moon.svg" alt="moon" />
        </span>
      </span>
    </label>
  </div>
  
  <style>
    .theme-toggle {
        display: flex;
        justify-content: center;
    }
  
    .icon {
        display: inline-flex;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        user-select: none;
        z-index: 3;
    }
    
    .sun {
      left: 13px;
    }
    
    .moon {
      right: 11px;
    }
  
    /* The switch container */
    .switch {
      position: relative;
      display: inline-block;
      width: 97px;
      height: 48px;
    }
  
    /* Hide default HTML checkbox */
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  
    /* The slider */
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: transparent;
      transition: .3s;
      border-radius: 23px;
      border: 1px solid var(--text-primary);
      overflow: hidden;
    }
  
    .slider:before {
      position: absolute;
      content: "";
      height: 38px;
      width: 38px;
      left: 6px;
      bottom: 4px;
      background-color: var(--text-primary);
      transition: .3s;
      border-radius: 50%;
      z-index: 2;
    }
  
    input:checked + .slider:before {
      transform: translateX(46px);
    }
  
  </style>