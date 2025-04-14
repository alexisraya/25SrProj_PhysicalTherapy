import type { UserStats } from '../types/userType';

/**
 * Gets the start date of the week containing the provided date
 * Returns it as an ISO string
 */
export function getWeekStartDate(date: Date = new Date()): string {
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  sunday.setHours(0, 0, 0, 0);
  return sunday.toISOString();
}

/**
 * Gets personal week start date for a user based on their creation date
 * Returns current period start date as an ISO string
 */
export function getPersonalWeekStart(registrationDate: string, today: Date = new Date()): string {
  const startDate = new Date(registrationDate);
  startDate.setHours(0, 0, 0, 0);

  const todayDate = new Date(today);
  todayDate.setHours(0, 0, 0, 0);

  const daysSinceRegistration = Math.floor(
    (todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const completedPeriods = Math.floor(daysSinceRegistration / 7);

  const currentPeriodStart = new Date(startDate);
  currentPeriodStart.setDate(startDate.getDate() + completedPeriods * 7);

  return currentPeriodStart.toISOString();
}

/**
 * Creates and returns an initialized UserStats object
 * Used when creating new users or if stats don't exist
 */
export function initializeUserStats(): UserStats {
  return {
    currentStreak: 0,
    longestStreak: 0, // Keeping this even though not actively used
    lastCompletedDate: null,
    weeklyProgress: {
      weekStartDate: getWeekStartDate(),
      daysCompleted: 0,
      exercisesCompleted: 0
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
