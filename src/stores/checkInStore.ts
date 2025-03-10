import { writable, derived, get } from "svelte/store";
import type { CheckIn, CheckInStats } from "../firebase/types/checkInType";
import { 
  addCheckIn, 
  hasCompletedTodayCheckIn, 
  getCheckInStats, 
  getLatestCheckIn 
} from "../firebase/services/checkInService";
import { authStore } from "./authStore";

export const currentUser = derived(authStore, ($authStore) => $authStore.userId);

function createCheckInStore() {
  const { subscribe, update } = writable({
    loading: false,
    error: null as string | null,
    todayCompleted: false,
    currentCheckIn: {
      painLevel: null as number | null,
      moodLevel: null as number | null,
    },
    latestCheckIn: null as CheckIn | null,
    stats: null as CheckInStats | null,
  });

  function setPainLevel(level: number) {
    console.log("Updating Pain Level:", level);
    update(state => ({
        ...state,
        currentCheckIn: { 
            ...state.currentCheckIn, 
            painLevel: level 
        }
    }));
  }

  function setMoodLevel(level: number) {
      console.log("Updating Mood Level:", level);
      update(state => ({
          ...state,
          currentCheckIn: { 
              ...state.currentCheckIn, 
              moodLevel: level 
          }
      }));
  }

  async function checkTodayStatus() {
    const userId = get(authStore).userId;
    if (!userId) return;

    update((state) => ({ ...state, loading: true, error: null }));

    try {
      const completed = await hasCompletedTodayCheckIn(userId);
      update((state) => ({ ...state, loading: false, todayCompleted: completed }));
    } catch (error) {
      update((state) => ({
        ...state,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }));
    }
  }

  async function submitCheckIn() {
    const userId = get(authStore).userId;
    if (!userId) {
      update((state) => ({ ...state, error: "User not authenticated" }));
      return false;
    }

    update((state) => ({ ...state, loading: true, error: null }));

    try {
      const storeState = get(checkInStore);
      const { painLevel, moodLevel } = storeState.currentCheckIn;

      if (painLevel === null || moodLevel === null) {
        throw new Error("Pain level and mood level are required");
      }

      await addCheckIn(userId, painLevel, moodLevel);

      update((state) => ({
        ...state,
        loading: false,
        todayCompleted: true,
        currentCheckIn: {
          painLevel: null,
          moodLevel: null,
        },
      }));

      const latest = await getLatestCheckIn(userId);
      update((state) => ({ ...state, latestCheckIn: latest }));

      return true;
    } catch (error) {
      update((state) => ({
        ...state,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }));
      return false;
    }
  }

  async function loadStats(period: "week" | "month" | "3months" | "6months") {
    const userId = get(authStore).userId;
    if (!userId) return;

    update((state) => ({ ...state, loading: true, error: null }));

    try {
      const stats = await getCheckInStats(userId, period);
      update((state) => ({ ...state, loading: false, stats }));
    } catch (error) {
      update((state) => ({
        ...state,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }));
    }
  }

  function resetForm() {
    update((state) => ({
      ...state,
      currentCheckIn: {
        painLevel: null,
        moodLevel: null,
      },
      error: null,
    }));
  }

  function clearError() {
    update((state) => ({ ...state, error: null }));
  }

  return {
    subscribe,
    setPainLevel,
    setMoodLevel,
    checkTodayStatus,
    submitCheckIn,
    loadStats,
    resetForm,
    clearError
  };
}

export const checkInStore = createCheckInStore();

export const { setPainLevel, setMoodLevel } = checkInStore;

export const checkInValid = derived(checkInStore, ($store) => {
  const { painLevel, moodLevel } = $store.currentCheckIn;
  return painLevel !== null && moodLevel !== null;
});

export const userCheckInStatus = derived(
  [currentUser, checkInStore],
  ([$currentUser, $checkInStore]) => ({
    loggedIn: !!$currentUser,
    canCheckIn: !$checkInStore.todayCompleted,
    isLoading: $checkInStore.loading,
  })
);