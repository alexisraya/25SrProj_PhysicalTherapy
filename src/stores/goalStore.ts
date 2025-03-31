import { writable, derived } from 'svelte/store';
import {
  getUserGoals,
  updateGoalLockStatus,
  assignGoalsToUser,
} from '$firebase/services/milestoneService';

interface Goal {
  goalId: string;
  goalName: string;
  description: string;
  month: number;
  timeframe: string;
  unlocked: boolean;
}

interface GoalStoreState {
  goals: Record<string, Goal[]>;
  isLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}

function createGoalStore() {
  const { subscribe, set, update } = writable<GoalStoreState>({
    goals: {},
    isLoading: false,
    actionLoading: false,
    error: null,
  });

  return {
    subscribe,

    loadGoals: async (userId: string) => {
      if (userId === 'mY8JFfhiJvdFm54wG57ALJmVYit2') {
        console.log("Therapist account doesn't have goals");
        update((state) => ({ ...state, goals: {}, isLoading: false }));
        return;
      }

      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        console.log(`Loading goals for ${userId}`);
        const goals = await getUserGoals(userId);

        if (Object.keys(goals).length === 0) {
          console.log('No goals found, assigning default goals');
          try {
            await assignGoalsToUser(userId);
            const freshGoals = await getUserGoals(userId);
            console.log(`Assigned and loaded ${Object.values(freshGoals).flat().length} goals`);
            update((state) => ({ ...state, goals: freshGoals, isLoading: false }));
          } catch (assignError) {
            console.error('Error assigning goals:', assignError);
            update((state) => ({
              ...state,
              error: 'Insufficient permissions to assign goals',
              isLoading: false,
            }));
          }
        } else {
          console.log(`Loaded ${Object.values(goals).flat().length} goals`);
          update((state) => ({ ...state, goals, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading goals:', error);
        update((state) => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to load goals',
          isLoading: false,
        }));
      }
    },

    toggleGoalLock: async (userId: string, goalId: string, currentStatus: boolean) => {
      update((state) => ({ ...state, actionLoading: true, error: null }));
      try {
        console.log(
          `Toggling goal ${goalId} from ${currentStatus ? 'unlocked' : 'locked'} to ${!currentStatus ? 'unlocked' : 'locked'}`
        );
        await updateGoalLockStatus(userId, goalId, !currentStatus);

        const refreshedGoals = await getUserGoals(userId);
        update((state) => ({ ...state, goals: refreshedGoals, actionLoading: false }));
      } catch (error) {
        console.error('Error toggling goal:', error);
        update((state) => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to update goal',
          actionLoading: false,
        }));
      }
    },

    reset: () => {
      set({ goals: {}, isLoading: false, actionLoading: false, error: null });
    },
  };
}

export const goalStore = createGoalStore();

export const sortedGoalsByMonth = derived(goalStore, ($goalStore) => {
  return Object.entries($goalStore.goals)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([month, goals]) => ({ month, goals }));
});

export const unlockedGoalsCount = derived(goalStore, ($goalStore) => {
  let count = 0;
  for (const month in $goalStore.goals) {
    if ($goalStore.goals[month]) {
      count += $goalStore.goals[month].filter((g) => g.unlocked).length;
    }
  }
  return count;
});
