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
  import { typography } from '$lib/design-system';
  import Button from '$lib/design-system/components/Button.svelte';
  import { goalsMap } from '$lib/goals';
  import Icon from '$lib/design-system/components/Icon.svelte';
  import GoalModalBackgroundLight from '$lib/assets/background-images/GoalModalBackground-Light.svg';
  import GoalModalBackgroundDark from '$lib/assets/background-images/GoalModalBackground-Dark.svg';
  import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';

  let currentUserId: string | null = null;
  let initialTone: ToneType = 'kind';

  //  For Goal Modal for Wizard of Oz RUN #3
  let showGoalModal = false;
  let goalModalId = 'goal-10'; // Default to goal-10 (laundry)
  let goalModalName = 'Lift a Basket of Laundry';
  let goalModalExtraInfo = '';

  let savedTheme: 'light' | 'dark' | null = null;

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
      savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

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

  function goToGoals() {
    goto('/your-progress/goals');
  }

  function goToHome() {
    showGoalModal = false;
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
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="goal-modal-overlay" on:click|self={() => (showGoalModal = false)}>
    <div class="modal">
      <button class="modal-close-button" on:click={goToHome}>
        <RemixIcon name="close-line" size="40px" />
      </button>

      <div class="modal-content">
        <div class="goal-title">
          <h3
            style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes
              .h3}; font-weight: {typography.fontWeights.regular}"
          >
            Goal completed!
          </h3>
          <p
            style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
              .small}; font-weight: {typography.fontWeights.regular}"
          >
            Nice job hitting this goal—keep it up!
          </p>
        </div>
        <div class="goal-container">
          <img
            class="goal-modal-background"
            src={savedTheme == 'light' ? GoalModalBackgroundLight : GoalModalBackgroundDark}
            alt="goal modal background"
          />
          <div class="goal-icon">
            <div class="floating-icon">
              <Icon name={goalsMap['goal-10']} size="medium" />
            </div>
          </div>

          <div class="goal-description">
            <p
              class="goal-name"
              style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes
                .h5}; font-weight: {typography.fontWeights.bold};"
            >
              Lift a Basket of Laundry
            </p>
            <p>You can salfely lift and carry items up to 10 pounds.</p>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <Button cta="View all goals" buttonType="secondary" onClickFunc={goToGoals} />
        <Button cta="Continue to home" buttonType="primary" onClickFunc={goToHome} />
      </div>
    </div>
  </div>
{/if}

<style>
  p,
  h3 {
    margin: 0;
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
    box-sizing: border-box;
    background-color: var(--background);
    width: 100vw;
    height: 100vh;
    padding: 46px 24px 24px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  .modal-content {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    row-gap: 55px;
  }

  .modal-actions {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    row-gap: 16px;
  }

  .goal-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    row-gap: 18px;
  }

  .goal-modal-background {
    position: absolute;
    z-index: 0;
    top: -25px;
  }

  .goal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1000px;
    width: 175px;
    height: 175px;
    background-color: var(--unlocked-goal-background);
    z-index: 1;
  }

  .goal-description {
    max-width: 225px;
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }

  .modal-close-button {
    background-color: transparent;
    border: 0;
    padding: 0;
    position: absolute;
    right: 32px;
    top: 32px;
    cursor: pointer;
  }

  @keyframes floatUpDown {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(4px);
    } /* Moves slightly up */
    100% {
      transform: translateY(0px);
    } /* Moves back down */
  }

  .goal-name {
    color: var(--text-primary);
    margin-top: 18px;
  }

  .goal-icon .floating-icon {
    animation: floatUpDown 2s ease-in-out infinite; /* Apply animation */
  }

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
    .modal {
      position: relative;
      max-width: 768px;
      height: auto;
      padding: 72px 32px 32px 32px;
      border-radius: 16px;
      row-gap: 48px;
    }
  }
</style>
