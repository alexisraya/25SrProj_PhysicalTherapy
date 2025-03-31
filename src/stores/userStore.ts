import { writable, derived } from 'svelte/store';
import { getUser } from '$firebase/services/userService';
import type { User } from '$firebase/types/userType';

interface UserStoreState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

function createUserStore() {
  const { subscribe, set, update } = writable<UserStoreState>({
    user: null,
    isLoading: false,
    error: null,
  });

  return {
    subscribe,

    loadUser: async (userId: string) => {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        console.log(`Loading user data for ${userId}`);
        const userData = await getUser(userId);
        console.log('User data loaded:', userData ? 'success' : 'not found');
        update((state) => ({ ...state, user: userData, isLoading: false }));
      } catch (error) {
        console.error('Error loading user:', error);
        update((state) => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to load user data',
          isLoading: false,
        }));
      }
    },

    reset: () => {
      set({ user: null, isLoading: false, error: null });
    },
  };
}

export const userStore = createUserStore();

export const userStats = derived(userStore, ($userStore) => $userStore.user?.stats || null);
export const userName = derived(userStore, ($userStore) =>
  $userStore.user ? `${$userStore.user.firstName} ${$userStore.user.lastName}` : ''
);
