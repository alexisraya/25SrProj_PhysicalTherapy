import { writable, derived } from 'svelte/store';
import { getUserAchievements } from '$firebase/services/milestoneService';
import { getAllAchievementsFromLibrary } from '$firebase/services/achieveService';

interface AchievementWithStatus {
  achieveId: string;
  achieveName: string;
  achieveType: 'distance' | 'weight' | 'time';
  targetValue: number;
  targetUnits: 'steps' | 'lbs' | 'seconds';
  unlocked: boolean;
}

interface AchievementsByType {
  distance: AchievementWithStatus[];
  weight: AchievementWithStatus[];
  time: AchievementWithStatus[];
}

interface AchievementStoreState {
  achievements: AchievementWithStatus[];
  userAchievements: {
    unlocked: string[];
    locked: string[];
    total: number;
    progress: number;
  };
  isLoading: boolean;
  error: string | null;
}

function createAchievementStore() {
  const { subscribe, set, update } = writable<AchievementStoreState>({
    achievements: [],
    userAchievements: {
      unlocked: [],
      locked: [],
      total: 0,
      progress: 0
    },
    isLoading: false,
    error: null
  });

  return {
    subscribe,

    loadAchievements: async (userId: string) => {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const [allAchievements, userAchievements] = await Promise.all([
          getAllAchievementsFromLibrary(),
          getUserAchievements(userId)
        ]);

        const achievements = allAchievements.map((achievement) => ({
          ...achievement,
          unlocked: userAchievements.unlocked.includes(achievement.achieveId)
        }));

        update((state) => ({
          ...state,
          achievements,
          userAchievements,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error loading achievements:', error);
        update((state) => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to load achievements',
          isLoading: false
        }));
      }
    },

    reset: () => {
      set({
        achievements: [],
        userAchievements: {
          unlocked: [],
          locked: [],
          total: 0,
          progress: 0
        },
        isLoading: false,
        error: null
      });
    }
  };
}

export const achievementStore = createAchievementStore();

export const unlockedAchievements = derived<typeof achievementStore, AchievementWithStatus[]>(
  achievementStore,
  ($store) => $store.achievements.filter((a) => a.unlocked)
);

export const lockedAchievements = derived<typeof achievementStore, AchievementWithStatus[]>(
  achievementStore,
  ($store) => $store.achievements.filter((a) => !a.unlocked)
);

export const achievementsByType = derived<typeof achievementStore, AchievementsByType>(
  achievementStore,
  ($store) => {
    const byType: AchievementsByType = {
      distance: [],
      weight: [],
      time: []
    };

    $store.achievements.forEach((achievement) => {
      byType[achievement.achieveType].push(achievement);
    });

    return byType;
  }
);
