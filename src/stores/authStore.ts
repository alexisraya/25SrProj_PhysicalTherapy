import { writable, derived } from 'svelte/store';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '$lib/helpers/firebase';
import { goto } from '$app/navigation';
import { assignPatientToTherapist } from '$firebase/services/therapistService';
import { createUser } from '$firebase/services/userService';
import {
  assignGoalsToUser,
  initializeUserAchievements,
  checkAchievements,
} from '$firebase/services/milestoneService';

const db = getFirestore();

interface AuthState {
  isLoading: boolean;
  currentUser: any | null;
  error: string | null;
  isTherapist: boolean;
}

const initialState: AuthState = {
  isLoading: true,
  currentUser: null,
  error: null,
  isTherapist: false,
};

export const authStore = writable<AuthState>(initialState);
export const currentUser = derived(authStore, ($state) => $state.currentUser);
export const isLoading = derived(authStore, ($state) => $state.isLoading);
export const isAuthenticated = derived(authStore, ($state) => !!$state.currentUser);
export const isTherapist = derived(authStore, ($state) => $state.isTherapist);
export const authError = derived(authStore, ($state) => $state.error);

export const authHandlers = {
  login: async (email: string, password: string) => {
    try {
      authStore.update((state) => ({ ...state, isLoading: true, error: null }));
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkUserRole(userCredential.user.uid);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      authStore.update((state) => ({ ...state, error: errorMessage, isLoading: false }));
    }
  },

  signup: async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      authStore.update((state) => ({ ...state, isLoading: true, error: null }));

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Created Firebase auth user:', user.uid);

      await updateProfile(user, { displayName: `${firstName} ${lastName}` });
      console.log('Updated user profile');

      await createUser(user.uid, firstName, lastName, email);
      console.log('Created user document in Firestore');

      try {
        await initializeUserAchievements(user.uid);
        console.log('Initialized achievements for new user');
      } catch (achieveError) {
        console.error('Error initializing achievements for new user:', achieveError);
      }

      const therapistId = 'mY8JFfhiJvdFm54wG57ALJmVYit2';
      try {
        await assignPatientToTherapist(user.uid, therapistId);
        console.log(`Assigned patient ${user.uid} to therapist ${therapistId}`);
      } catch (err) {
        console.error('Error assigning patient to therapist:', err);
      }

      try {
        setTimeout(async () => {
          try {
            await assignGoalsToUser(user.uid);
            console.log(`Assigned goals to user ${user.uid}`);
          } catch (goalErr) {
            console.error('Error in delayed goal assignment:', goalErr);
          }
        }, 1000);
      } catch (goalError) {
        console.error('Error assigning goals:', goalError);
      }

      goto('/patient-dashboard');
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
  },
};

// Initialize auth state listener
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
        isLoading: false,
        currentUser: {
          ...user,
          ...userData,
        },
        error: null,
        isTherapist: isUserTherapist,
      });
    } else {
      console.warn('User document not found in Firestore.');
      authStore.set({ ...initialState, isLoading: false });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    authStore.set({ ...initialState, isLoading: false, error: errorMessage });
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

    const therapistRef = doc(db, 'therapists', userId);
    const therapistSnap = await getDoc(therapistRef);

    if (therapistSnap.exists()) {
      console.log('Therapist logged in:', userId);
      authStore.update((state) => ({ ...state, isTherapist: true }));
      goto('/therapist-dashboard');
      return;
    }

    console.warn('No valid user or therapist found.');
    authStore.update((state) => ({
      ...state,
      error: 'Account not found in the system',
      isLoading: false,
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
