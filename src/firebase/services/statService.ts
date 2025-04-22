import { db } from '$lib/helpers/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { User, AssignedExercise, UserStats } from '../types/userType';
import { getUser, updateUser } from './userService';
import { getWeekStartDate, getPersonalWeekStart, initializeUserStats } from './helpers';
import { checkAchievements } from './milestoneService';

export { initializeUserStats };

/* ---------------------- GET USER STATS ---------------------- */
/**
 * Retrieves the current stats for a specific user from Firestore
 * This is the core function for accessing all user statistics
 * Returns the stats object or null if user not found
 */

export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data().stats as UserStats) : null;
  } catch (error) {
    console.error(`Error getting stats for user ${userId}:`, error);
    return null;
  }
}

/* ---------------------- UPDATE USER STATS AFTER EXERCISE ---------------------- */
/**
 * Updates a user's cumulative stats after completing an exercise
 * Increments totalSets, totalReps, totalWeight, totalDistance, and totalTime based on the exercise type
 * Triggers a check for newly unlocked achievements
 * Called within completeExercise() when a user finishes an exercise
 */

export async function updateUserStats(userId: string, exercise: AssignedExercise) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    let { stats } = userSnap.data();

    if (exercise.exerciseType === 'distance') {
      stats.totalSets += exercise.sets ?? 0;
      stats.totalReps += (exercise.steps ?? 0) * (exercise.sets ?? 0);
      stats.totalDistance += (exercise.steps ?? 0) * (exercise.sets ?? 0);
    } else if (exercise.exerciseType === 'weight') {
      stats.totalSets += exercise.sets ?? 0;
      stats.totalReps += (exercise.reps ?? 0) * (exercise.sets ?? 0);
      stats.totalWeight += (exercise.weight ?? 0) * (exercise.reps ?? 0) * (exercise.sets ?? 0);
    } else if (exercise.exerciseType === 'time') {
      stats.totalSets += exercise.sets ?? 0;
      stats.totalReps += (exercise.reps ?? 0) * (exercise.sets ?? 0);
      stats.totalTime += (exercise.seconds ?? 0) * (exercise.reps ?? 0) * (exercise.sets ?? 0);
    }

    await updateDoc(userRef, { stats });
    await checkAchievements(userId);
  } catch (error) {
    console.error(`Error updating stats for user ${userId}:`, error);
  }
}

/* ---------------------- RESET USER'S DAILY PROGRESS AT MIDNIGHT ---------------------- */
/**
 * Resets a user's daily exercise progress
 * Marks all exercises as not completed when a new day starts
 * Doesn't affect streak counts, just prepares the program for the new day
 * Note: This does NOT reset the current streak
 */

export async function resetDailyProgress(userId: string) {
  try {
    const programRef = doc(db, `users/${userId}/program/currentProgram`);
    const programSnap = await getDoc(programRef);

    if (programSnap.exists()) {
      const programData = programSnap.data();
      // const _today = new Date().toISOString().split('T')[0];

      // Reset exercises for the new day
      const updatedExercises = programData.exercises.map((exercise: AssignedExercise) => {
        return {
          ...exercise,
          completed: false,
          completedAt: null,
          skipped: false
        };
      });

      await updateDoc(programRef, {
        exercises: updatedExercises,
        completed: false
      });
    }
  } catch (error) {
    console.error(`Error resetting daily progress for user ${userId}:`, error);
  }
}

/* ---------------------- RESET WEEKLY PROGRESS (BASED ON START DATE) ---------------------- */
/**
 * Resets weekly progress when user's personal 7-day week completes
 * If user completed 5+ days in the week, increments their currentStreak
 * If they didn't reach 5 days, resets currentStreak to 0
 * Updates longestStreak if currentStreak exceeds it
 * Resets daysCompleted and exercisesCompleted to 0 for the new week
 */

export async function resetWeeklyProgress(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data() as User;
    let { stats } = userData;
    const today = new Date();

    const currentPersonalWeekStart = getPersonalWeekStart(userData.createdAt, today);

    if (stats.weeklyProgress.weekStartDate !== currentPersonalWeekStart) {
      // If they completed 5+ days, increment the streak counter
      if (stats.weeklyProgress.daysCompleted >= 5) {
        stats.currentStreak += 1;
        stats.longestStreak = Math.max(stats.currentStreak, stats.longestStreak);
        console.log(`User completed 5+ days! Streak increased to ${stats.currentStreak}`);
      } else {
        // Reset current streak if they didn't complete enough days
        stats.currentStreak = 0;
        console.log('User did not complete enough days, streak reset.');
      }

      // Reset the weekly progress for the new week
      stats.weeklyProgress = {
        weekStartDate: currentPersonalWeekStart,
        daysCompleted: 0,
        exercisesCompleted: 0
      };

      await updateDoc(userRef, { stats });
    }
  } catch (error) {
    console.error(`Error resetting weekly progress for user ${userId}:`, error);
  }
}

/* ---------------------- CHECK & RESET PROGRESS ---------------------- */
/**
 * Main progress reset function - called on app open and key actions
 * Checks if it's a new day compared to the last reset date
 * If it's a new day, resets the daily program and checks if weekly reset is needed
 * Updates lastResetDate to track when resets occur
 * Essential for maintaining the daily/weekly cycle
 */

export async function checkAndResetProgress(userId: string) {
  try {
    const programRef = doc(db, `users/${userId}/program/currentProgram`);
    const programSnap = await getDoc(programRef);

    if (!programSnap.exists()) return;

    const programData = programSnap.data();
    const today = new Date().toISOString().split('T')[0];
    const lastResetDate = programData.lastResetDate || programData.assignedAt.split('T')[0];

    if (lastResetDate !== today) {
      const updatedExercises = programData.exercises.map((exercise: AssignedExercise) => {
        return {
          ...exercise,
          completed: false,
          completedAt: null,
          skipped: false
        };
      });

      await updateDoc(programRef, {
        exercises: updatedExercises,
        completed: false,
        lastResetDate: today
      });

      await resetWeeklyProgress(userId);
    }
  } catch (error) {
    console.error(`Error checking and resetting progress for user ${userId}:`, error);
  }
}

/* ---------------------- GET WEEKLY PROGRESS ---------------------- */
/**
 * Retrieves and calculates weekly progress information for UI display
 * Adds additional metrics for user-friendly display:
 *  - remainingDays: How many days are left in current week
 *  - daysNeededForStreak: How many more days needed to reach 5-day goal
 * Creates weeklyProgress if it doesn't exist yet
 * Used primarily in the user dashboard
 */

export async function getWeeklyProgress(userId: string): Promise<{
  weekStartDate: string;
  daysCompleted: number;
  exercisesCompleted: number;
  remainingDays: number;
  daysNeededForStreak: number;
}> {
  try {
    const stats = await getUserStats(userId);
    if (!stats) throw new Error('User stats not found');

    // Initialize weekly progress if it doesn't exist
    if (!stats.weeklyProgress) {
      stats.weeklyProgress = {
        weekStartDate: getWeekStartDate(),
        daysCompleted: 0,
        exercisesCompleted: 0
      };
    }

    const today = new Date();
    const weekStart = new Date(stats.weeklyProgress.weekStartDate);
    const daysSinceStart = Math.floor(
      (today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    const remainingDays = Math.max(0, 7 - daysSinceStart);

    const daysNeededForStreak = Math.max(0, 5 - stats.weeklyProgress.daysCompleted);

    return {
      ...stats.weeklyProgress,
      remainingDays,
      daysNeededForStreak
    };
  } catch (error) {
    console.error(`Error getting weekly progress for user ${userId}:`, error);
    throw error;
  }
}

/* ---------------------- UPDATE STREAK ON PROGRAM COMPLETION ---------------------- */
/**
 * Updates the user's streak when they complete their daily exercises
 * Adds today's completion to the streak history
 * Increments the days completed for the current week (capped at 5)
 * Prevents duplicate updates by checking if user already completed today
 * Streak model is based on completing exercises on 5 out of 7 days each week
 */

export async function updateStreakOnCompletion(userId: string): Promise<void> {
  try {
    const user = await getUser(userId);
    if (!user?.stats) return;

    // Only update streak if we haven't already completed today
    if (await hasCompletedToday(userId)) return;

    const today = new Date();
    const stats = { ...user.stats };

    // Add today's completion to streak history
    stats.streakHistory.push({ date: today.toISOString(), completed: true });
    stats.lastCompletedDate = today.toISOString();

    // Check if today belongs to the current weekly period
    const personalWeekStart = getPersonalWeekStart(user.createdAt, today);

    if (!stats.weeklyProgress) {
      stats.weeklyProgress = {
        weekStartDate: personalWeekStart,
        daysCompleted: 0,
        exercisesCompleted: 0
      };
    }

    // Create the weekly progress if it doesn't exist or reset if it's a new week
    if (stats.weeklyProgress.weekStartDate !== personalWeekStart) {
      // If we're in a new week, reset the weekly progress
      stats.weeklyProgress = {
        weekStartDate: personalWeekStart,
        daysCompleted: 1, // Set to 1 since we completed today
        exercisesCompleted: stats.weeklyProgress.exercisesCompleted || 0
      };
    } else {
      // Same week, increment days completed (cap at 5)
      stats.weeklyProgress.daysCompleted = Math.min(
        5,
        (stats.weeklyProgress.daysCompleted || 0) + 1
      );
    }

    console.log(`Updated days completed: ${stats.weeklyProgress.daysCompleted}`);

    await updateUser(userId, { stats });
    await checkAchievements(userId);
  } catch (error) {
    console.error(`Error updating streak for user ${userId}:`, error);
  }
}

/**
 * Checks if the user has already completed their exercises today
 * Used to prevent duplicate streak updates on the same day
 * Returns true if user has already logged a completion for today
 * Helper function for updateStreakOnCompletion
 */

async function hasCompletedToday(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return false;

    const userData = userSnap.data() as User;
    const today = new Date().toISOString().split('T')[0];

    return userData.stats.streakHistory.some(
      (entry) => entry.date.startsWith(today) && entry.completed
    );
  } catch (error) {
    console.error(`Error checking completion status for user ${userId}:`, error);
    return false;
  }
}
