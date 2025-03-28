<!-- ThemeToggle.svelte -->
<script>
    import { onMount } from 'svelte';
    
    let theme = 'light';
    
    onMount(() => {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem('theme');
      
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
    
    function applyTheme(newTheme) {
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      theme = newTheme;
    }
    
    function toggleTheme() {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    }
</script>

<button on:click={toggleTheme}>
    {theme === 'light' ? '🌙' : '☀️'}
</button>