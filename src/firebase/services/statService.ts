import { db } from "$lib/helpers/firebase";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import type { User, AssignedExercise, UserStats } from "../types/userType";
import { getUser, updateUser } from "./userService";
import { getWeekStartDate, initializeUserStats } from "./helpers";
import { getCurrentProgram, updateProgram } from "./programService";
import { checkAchievements } from "./milestoneService";

export { initializeUserStats };

/* ---------------------- GET USER STATS ---------------------- */
/**
 * Retrieves the current stats for a specific user from Firestore.
 * This is the core function for accessing all user statistics.
 */

export async function getUserStats(userId: string): Promise<UserStats | null> {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? (userSnap.data().stats as UserStats) : null;
    } catch (error) {
        console.error(`Error getting stats for user ${userId}:`, error);
        return null;
    }
}

/* ---------------------- UPDATE USER STATS AFTER EXERCISE ---------------------- */
/**
 * Updates a user's cumulative stats after completing an exercise.
 * Increments totalSets, totalReps, totalWeight, totalDistance, and totalTime based on the exercise.
 * Also triggers a check for newly unlocked achievements.
 */

export async function updateUserStats(userId: string, exercise: AssignedExercise) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        let { stats } = userSnap.data();

        stats.totalSets += exercise.sets ?? 0;
        stats.totalReps += exercise.reps ?? 0;
        stats.totalWeight += (exercise.weight ?? 0) * (exercise.reps ?? 0);
        stats.totalDistance += exercise.steps ?? 0;
        stats.totalTime += exercise.seconds ?? 0;

        await updateDoc(userRef, { stats });
        await checkAchievements(userId);
    } catch (error) {
        console.error(`Error updating stats for user ${userId}:`, error);
    }
}

/* ---------------------- RESET USER'S DAILY PROGRESS AT MIDNIGHT ---------------------- */
/**
 * Resets a user's daily exercise progress.
 * Called when a new day starts to mark all exercises as not completed.
 * If the user didn't complete any exercises yesterday, resets their current streak.
 */

export async function resetDailyProgress(userId: string) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const userData = userSnap.data() as User;
        const today = new Date().toISOString().split("T")[0];
        let completedToday = false;

        const programRef = doc(db, `users/${userId}/program/currentProgram`);
        const programSnap = await getDoc(programRef);
        
        if (programSnap.exists()) {
            const programData = programSnap.data();
            const updatedExercises = programData.exercises.map((exercise: AssignedExercise) => {
                if (exercise.completedAt?.startsWith(today)) {
                    completedToday = true;
                }
                return { ...exercise, completed: false };
            });

            if (!completedToday) {
                userData.stats.currentStreak = 0;
            }

            await Promise.all([
                updateDoc(programRef, { exercises: updatedExercises }),
                updateDoc(userRef, { stats: userData.stats })
            ]);
        }
    } catch (error) {
        console.error(`Error resetting daily progress for user ${userId}:`, error);
    }
}

/* ---------------------- RESET WEEKLY PROGRESS (ONLY ON SUNDAYS) ---------------------- */
/**
 * Resets weekly progress every Sunday at midnight.
 * - If user completed 5+ days in the week, increments their currentStreak
 * - Resets daysCompleted to 0 for the new week
 * - Updates longest streak if needed
 */

export async function resetWeeklyProgress(userId: string) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        let { stats } = userSnap.data();
        const today = new Date().toISOString().split("T")[0];
        const currentWeekStart = getWeekStartDate(new Date(today));

        if (stats.weeklyProgress.weekStartDate !== currentWeekStart) {
            if (stats.weeklyProgress.daysCompleted >= 5) {
                stats.currentStreak += 1;

                if (stats.currentStreak > stats.longestStreak) {
                    stats.longestStreak = stats.currentStreak;
                }
            } else {
                stats.currentStreak = 0;
            }
            
            stats.weeklyProgress = { 
                weekStartDate: currentWeekStart, 
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
 * Checks if it's a new day and performs necessary resets.
 * Uses localStorage to track the last check date.
 * Calls resetDailyProgress for a new day and resetWeeklyProgress on Sundays.
 */

export async function checkAndResetProgress(userId: string) {
    try {
        const lastCheck = localStorage.getItem(`lastProgressCheck_${userId}`);
        const today = new Date().toDateString();
        
        // Only reset if it's a new day
        if (lastCheck !== today) {
            console.log("Performing daily progress check and reset if needed");
            await resetDailyProgress(userId);
            localStorage.setItem(`lastProgressCheck_${userId}`, today);
            
            // Check if it's Sunday (day 0) for weekly reset
            if (new Date().getDay() === 0) {
                console.log("Sunday detected - performing weekly reset");
                await resetWeeklyProgress(userId);
            }
        }
    } catch (error) {
        console.error(`Error checking and resetting progress for user ${userId}:`, error);
    }
}

/* ---------------------- GET WEEKLY PROGRESS ---------------------- */
/**
 * Retrieves and calculates weekly progress information for UI display.
 * Adds additional metrics like remainingDays and daysNeededForStreak.
 * Creates weeklyProgress if it doesn't exist yet.
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
        if (!stats) throw new Error("User stats not found");

        if (!stats.weeklyProgress) {
            stats.weeklyProgress = {
                weekStartDate: getWeekStartDate(),
                daysCompleted: 0,
                exercisesCompleted: 0
            };
        }

        const today = new Date();
        const weekStart = new Date(stats.weeklyProgress.weekStartDate);
        const daysSinceStart = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
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
 * Updates the user's streak when they complete their daily exercises.
 * - Adds today's completion to the streak history
 * - Increments the days completed for the current week (max of 5)
 * The streak model is based on completing exercises on 5 out of 7 days each week.
 */

export async function updateStreakOnCompletion(userId: string): Promise<void> {
    try {
        const user = await getUser(userId);
        if (!user?.stats) return;

        if (await hasCompletedToday(userId)) return;

        const today = new Date();
        const stats = { ...user.stats };

        stats.streakHistory.push({ date: today.toISOString(), completed: true });
        stats.lastCompletedDate = today.toISOString();

        if (stats.weeklyProgress?.weekStartDate === getWeekStartDate(today)) {
            stats.weeklyProgress.daysCompleted = Math.min(5, stats.weeklyProgress.daysCompleted + 1);
        }

        await updateUser(userId, { stats });
        await checkAchievements(userId);
    } catch (error) {
        console.error(`Error updating streak for user ${userId}:`, error);
    }
}

/* ---------------------- RESET DAILY EXERCISES ---------------------- */
/**
 * Resets all exercises to not completed if the user's last completion was not today.
 * This ensures exercises are fresh each day.
 */

export async function resetDailyExercises(userId: string): Promise<void> {
    try {
        const user = await getUser(userId);
        if (!user?.stats?.lastCompletedDate) return;

        const lastCompleted = new Date(user.stats.lastCompletedDate);
        const today = new Date();

        // If last completion was not today, reset all exercises
        if (lastCompleted.toDateString() !== today.toDateString()) {
            const program = await getCurrentProgram(userId);
            if (!program) return;

            // Reset all exercises
            const resetExercises = program.exercises.map(ex => ({ 
                ...ex, 
                completed: false, 
                completedAt: undefined, 
                skipped: false 
            }));
            
            await updateProgram(userId, { 
                exercises: resetExercises, 
                completed: false 
            });
        }
    } catch (error) {
        console.error(`Error resetting daily exercises for user ${userId}:`, error);
    }
}

/**
 * Checks if the user has already completed their exercises today.
 * Used to prevent duplicate streak updates on the same day.
 */

async function hasCompletedToday(userId: string): Promise<boolean> {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return false;

        const userData = userSnap.data() as User;
        const today = new Date().toISOString().split("T")[0];

        return userData.stats.streakHistory.some(entry => entry.date.startsWith(today) && entry.completed);
    } catch (error) {
        console.error(`Error checking completion status for user ${userId}:`, error);
        return false;
    }
}