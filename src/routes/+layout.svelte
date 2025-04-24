<script lang="ts">
  import { auth, db } from '$lib/helpers/firebase';
  import { onMount } from 'svelte';
  import { authStore } from '../stores/authStore';
  import { userStore } from '../stores/userStore';
  import { programStore } from '../stores/programStore';
  import { goalStore } from '../stores/goalStore';
  import { doc, getDoc, updateDoc } from 'firebase/firestore';
  import '../app.css';
  import Nav from '$lib/design-system/components/Nav.svelte';
  import { page } from '$app/stores';
  import { setupToneContext, type ToneType } from '$lib/helpers/toneContext';
  import { browser } from '$app/environment';
  import { hasCompletedOnboarding } from '$stores/onboarding';
  import { goto } from '$app/navigation';
  // Import your goal component
  import Goal from '$lib/design-system/components/Goal.svelte';

  let currentUserId: string | null = null;
  let initialTone: ToneType = 'kind';

  //  For Goal Modal for Wizard of Oz RUN #3
  let showGoalModal = false;
  let goalModalId = 'goal-10'; // Default to goal-10 (laundry)
  let goalModalName = 'Lift a Basket of Laundry';
  let goalModalExtraInfo = '';

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

    //  For Goal Modal for Wizard of Oz RUN #3
    const userStoreUnsubscribe = userStore.subscribe(async ($userStore) => {
      if ($userStore.user?.userId) {
        try {
          const userRef = doc(db, 'users', $userStore.user.userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();
          
          if (userData?.showGoalModal && userData?.showGoalModalId === 'goal-10') {
            // Hardcode the goal data instead of trying to find it
            goalModalId = 'goal-10';
            goalModalName = 'Lift a Basket of Laundry';
            showGoalModal = true;
            
            // Reset the flag so it doesn't show again
            await updateDoc(userRef, {
              showGoalModal: false,
              showGoalModalId: null
            });
          }
        } catch (error) {
          console.error('Error checking for goal modal:', error);
        }
      }
    });

    // Return cleanup function that unsubscribes from both
    return () => {
      authUnsubscribe();
      toneUnsubscribe();
      pageUnsubscribe();
      userStoreUnsubscribe();
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

{#if shouldShowNav($page.url.pathname)}
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

{#if showGoalModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="goal-modal-overlay" on:click|self={() => showGoalModal = false}>
    <div class="modal">
      <div class="modal-content">
        <h2>You've unlocked a new goal!</h2>
        <div class="goal-container">
          <Goal 
            goalId="goal-10"
            goalName="Lift a Basket of Laundry"
            isLocked={false}
            hasExtraInfo={false}
            extraInfo=""
          />
        </div>
        <p>Congratulations! You can safely lift and carry items up to 10 pounds.</p>
        <button class="primary-button" on:click={() => showGoalModal = false}>Continue</button>
      </div>
    </div>
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

  .goal-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background-color: var(--color-white, white);
    border-radius: 16px;
    width: 90%;
    max-width: 320px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .goal-container {
    margin: 16px 0;
  }
  
  .primary-button {
    margin-top: 16px;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    background-color: var(--color-primary, #3b82f6);
    color: white;
    font-weight: 500;
    cursor: pointer;
  }
</style>
