<script lang="ts">
  import { auth } from '$lib/helpers/firebase';
  import { onMount } from 'svelte';
  import { authStore } from '../stores/authStore';
  import { userStore } from '../stores/userStore';
  import { programStore } from '../stores/programStore';
  import { goalStore } from '../stores/goalStore';
  import '../app.css';
  import Nav from '$lib/design-system/components/Nav.svelte';
  import { page } from '$app/stores';
  import { setupToneContext, type ToneType } from '$lib/helpers/toneContext';
  import { browser } from '$app/environment';
  import { hasCompletedOnboarding } from '$stores/onboarding';
  import { goto } from '$app/navigation';

  let currentUserId: string | null = null;
  let initialTone: ToneType = 'kind';

  $: isEverythingLoaded = !$userStore.isLoading && !$authStore.isLoading;

  function checkOnboardingStatus() {
    // Get current path
    const currentPath = $page.url.pathname;

    // Skip check if user is already on onboarding or login pages
    if (currentPath === '/onboarding' || currentPath === '/login' || currentPath === '/register') {
      return;
    }

    // Get onboarding completion status
    let hasCompleted = false;
    hasCompletedOnboarding.subscribe((value) => {
      hasCompleted = value;
    })();

    // If user hasn't completed onboarding, redirect to onboarding page
    if (!hasCompleted && $authStore.currentUser) {
      goto('/onboarding');
    }
  }

  // Force nav to show on dashboard pages
  function shouldForceShowNav(path: string): boolean {
    return path === '/patient-dashboard' && $authStore.currentUser !== null;
  }

  if (browser) {
    try {
      const savedTone = localStorage.getItem('userTonePreference');
      if (savedTone === 'tough' || savedTone === 'kind') {
        initialTone = savedTone as ToneType;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }

  // Set up the tone context with the initial tone
  const { tone } = setupToneContext(initialTone);

  onMount(() => {
    // Set up auth listener
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      authStore.update((curr) => {
        return { ...curr, isLoading: false, currentUser: user };
      });

      if (user) {
        if (currentUserId !== user.uid) {
          currentUserId = user.uid;
          console.log('User authenticated, loading data for:', user.uid);

          userStore.loadUser(user.uid);
          programStore.loadProgram(user.uid);
          goalStore.loadGoals(user.uid);

          checkOnboardingStatus();
        }
      } else {
        currentUserId = null;
        userStore.reset();
        programStore.reset();
        goalStore.reset();
      }
    });

    // Set up tone preference persistence
    let toneUnsubscribe = () => {};
    if (browser) {
      toneUnsubscribe = tone.subscribe((currentTone) => {
        try {
          localStorage.setItem('userTonePreference', currentTone);
        } catch (error) {
          console.error('Error saving tone preference to localStorage:', error);
        }
      });
    }

    const pageUnsubscribe = page.subscribe(() => {
      if ($authStore.currentUser && !$authStore.isLoading) {
        checkOnboardingStatus();
      }
    });

    // Return cleanup function that unsubscribes from both
    return () => {
      authUnsubscribe();
      toneUnsubscribe();
      pageUnsubscribe();
    };
  });

  function shouldShowNav(path: string) {
    // For "/your-progress" but not "/your-progress/goals"
    if (path === '/your-progress') return true;
    if (path === '/patient-dashboard') return true;
    if (path === '/your-program') return true;
    if (path === '/your-program/summary') return true;
    if (path === '/profile') return true;

    return false;
  }
</script>

{#if !isEverythingLoaded && $page.url.pathname !== '/login' && $page.url.pathname !== '/logout' && $page.url.pathname !== '/register' && $page.url.pathname !== '/'}
  <div class="loading-container">
    <p>Loading...</p>
  </div>
{:else if shouldShowNav($page.url.pathname) || shouldForceShowNav($page.url.pathname)}
  <div class="main-container-nav">
    <div>
      <Nav />
    </div>
    <div class="main-content">
      <slot />
    </div>
  </div>
{:else}
  <div class="main-content">
    <slot />
  </div>
{/if}

<style>
  @media (min-width: 800px) {
    .main-container-nav {
      padding: 0;
      display: grid;
      grid-template-columns: 324px 1fr;
    }
    .main-content {
      width: 100%;
      padding: 0;
    }
  }

  /* .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
  } */
</style>