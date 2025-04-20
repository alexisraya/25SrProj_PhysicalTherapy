import type { UserStats } from '../types/userType';

/**
 * Gets the start date (Sunday) of the week containing the provided date
 * Returns it as an ISO string
 */
export function getWeekStartDate(date: Date = new Date()): string {
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  sunday.setHours(0, 0, 0, 0);
  return sunday.toISOString();
}

/**
 * Creates and returns an initialized UserStats object
 * Used when creating new users or if stats don't exist
 */
export function initializeUserStats(): UserStats {
  const currentMonth = new Date().toISOString().substring(0, 7); // Get current month in YYYY-MM format

  return {
    currentStreak: 0,
    longestStreak: 0, // Keeping this even though not actively used
    lastCompletedDate: null,
    weeklyProgress: {
      weekStartDate: getWeekStartDate(),
      daysCompleted: 0,
      exercisesCompleted: 0
    },
    monthlyProgress: {
      [currentMonth]: {
        month: 1, // First month for new users
        exercisesCompleted: 0,
        programsCompleted: 0
      }
    },
    completedExercises: 0,
    completedPrograms: 0,
    totalSets: 0,
    totalReps: 0,
    totalWeight: 0,
    totalDistance: 0,
    totalTime: 0,
    streakHistory: [],
    achievements: {}
  };
}
