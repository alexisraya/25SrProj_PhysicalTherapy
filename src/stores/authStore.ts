import { writable, derived } from 'svelte/store';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '$lib/helpers/firebase';
import { goto } from '$app/navigation';
// import { assignPatientToTherapist } from '$firebase/services/therapistService';
import { createUser } from '$firebase/services/userService';
import {
  assignGoalsToUser,
  initializeUserAchievements,
  checkAchievements
} from '$firebase/services/milestoneService';
import { initializeUserWithDemoData } from '$firebase/services/demoUserService';

const db = getFirestore();

interface AuthState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userId: any;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUser: any | null;
  error: string | null;
  isTherapist: boolean;
}

const initialState: AuthState = {
  userId: null,
  isLoading: true,
  currentUser: null,
  error: null,
  isTherapist: false
};

export const authStore = writable<AuthState>(initialState);

export const userId = derived(authStore, ($state) => $state.userId);
export const currentUser = derived(authStore, ($state) => $state.currentUser);
export const isLoading = derived(authStore, ($state) => $state.isLoading);
export const isAuthenticated = derived(authStore, ($state) => !!$state.currentUser);
export const isTherapist = derived(authStore, ($state) => $state.isTherapist);
export const authError = derived(authStore, ($state) => $state.error);

export const initializationProgress = writable({
  userCreated: false,
  achievementsInitialized: false,
  goalsAssigned: false,
  demoDataLoaded: false
});

export const authHandlers = {
  login: async (email: string, password: string) => {
    try {
      authStore.update((state) => ({ ...state, isLoading: true, error: null }));
      console.log('Login started, waiting for authentication...');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful, checking user role...');

      await checkUserRole(userCredential.user.uid);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      authStore.update((state) => ({ ...state, error: errorMessage, isLoading: false }));
    }
  },

  // Update signup function to track progress
  signup: async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      authStore.update((state) => ({ ...state, isLoading: true, error: null }));
      initializationProgress.set({
        userCreated: false,
        achievementsInitialized: false,
        goalsAssigned: false,
        demoDataLoaded: false
      });

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: `${firstName} ${lastName}` });
      await createUser(user.uid, firstName, lastName, email);
      initializationProgress.update((p) => ({ ...p, userCreated: true }));

      goto('/initializing');

      try {
        await initializeUserAchievements(user.uid);
        initializationProgress.update((p) => ({ ...p, achievementsInitialized: true }));
      } catch (achieveError) {
        console.error('Error initializing achievements:', achieveError);
      }

      try {
        await assignGoalsToUser(user.uid);
        initializationProgress.update((p) => ({ ...p, goalsAssigned: true }));

        await initializeUserWithDemoData(user.uid);
        initializationProgress.update((p) => ({ ...p, demoDataLoaded: true }));
      } catch (goalErr) {
        console.error('Error in goal assignment or demo data:', goalErr);
      }

      authStore.update((state) => ({ ...state, isLoading: false }));
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      authStore.update((state) => ({ ...state, error: errorMessage, isLoading: false }));
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
      authStore.set({ ...initialState, isLoading: false });
      goto('/login');
    } catch (error) {
      console.error('Logout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      authStore.update((state) => ({ ...state, error: errorMessage }));
    }
  },

  clearError: () => {
    authStore.update((state) => ({ ...state, error: null }));
  }
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.warn('No user signed in.');
    authStore.set({ ...initialState, isLoading: false });
    return;
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    let isUserTherapist = false;
    if (!userSnap.exists()) {
      const therapistRef = doc(db, 'therapists', user.uid);
      const therapistSnap = await getDoc(therapistRef);
      isUserTherapist = therapistSnap.exists();
    }

    if (userSnap.exists() || isUserTherapist) {
      const userData = userSnap.exists() ? userSnap.data() : {};

      authStore.set({
        userId: user.uid,
        isLoading: false,
        currentUser: {
          ...user,
          ...userData
        },
        error: null,
        isTherapist: isUserTherapist
      });
    } else {
      // During signup, the user document might not exist yet - this is normal
      console.log('User document not found - might be during signup process');
      authStore.set({
        userId: user.uid,
        isLoading: false,
        currentUser: user,
        error: null,
        isTherapist: false
      });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);

    // During signup, permission errors are common - handle gracefully
    if (error.code === 'permission-denied') {
      console.log('Permission denied - likely during signup, setting basic user state');
      authStore.set({
        userId: user.uid,
        isLoading: false,
        currentUser: user,
        error: null,
        isTherapist: false
      });
    } else {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      authStore.set({ ...initialState, isLoading: false, error: errorMessage });
    }
  }
});

async function checkUserRole(userId: string) {
  if (window.location.pathname.includes('/exploration/')) {
    console.log('Test route detected - skipping redirection');
    return;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log('Patient logged in:', userId);

      try {
        await initializeUserAchievements(userId);
        await checkAchievements(userId);
        console.log('User achievements initialized and checked');
      } catch (achieveError) {
        console.error('Error checking achievements:', achieveError);
      }

      authStore.update((state) => ({ ...state, isTherapist: false }));
      goto('/patient-dashboard');
      return;
    }

    // const therapistRef = doc(db, 'therapists', userId);
    // const therapistSnap = await getDoc(therapistRef);

    // if (therapistSnap.exists()) {
    //   console.log('Therapist logged in:', userId);
    //   authStore.update((state) => ({ ...state, isTherapist: true }));
    //   goto('/therapist-dashboard');
    //   return;
    // }

    console.warn('No valid user found.');
    authStore.update((state) => ({
      ...state,
      error: 'Account not found in the system',
      isLoading: false
    }));

    await signOut(auth);
    goto('/login');
  } catch (error) {
    console.error('Error checking user role:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    authStore.update((state) => ({ ...state, error: errorMessage, isLoading: false }));
    await signOut(auth);
    goto('/login');
  }
}
