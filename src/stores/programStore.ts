import { writable, derived } from 'svelte/store';
import { getCurrentProgram } from '$firebase/services/programService';
import type { Program } from '$firebase/types/userType';

interface ProgramStoreState {
  program: Program | null;
  isLoading: boolean;
  error: string | null;
}

function createProgramStore() {
  const { subscribe, set, update } = writable<ProgramStoreState>({
    program: null,
    isLoading: false,
    error: null,
  });

  return {
    subscribe,

    loadProgram: async (userId: string) => {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        console.log(`Loading program for ${userId}`);
        const program = await getCurrentProgram(userId);
        console.log('Program loaded:', program ? 'success' : 'not found');
        update((state) => ({ ...state, program, isLoading: false }));
      } catch (error) {
        console.error('Error loading program:', error);
        update((state) => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to load user data',
          isLoading: false,
        }));
      }
    },

    reset: () => {
      set({ program: null, isLoading: false, error: null });
    },
  };
}

export const programStore = createProgramStore();
