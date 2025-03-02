import { db } from "$lib/helpers/firebase";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import type { User, AssignedExercise, UserStats } from "../types/userType";
import { getUser, updateUser } from "./userService";
import { getWeekStartDate, initializeUserStats } from "./helpers";
import { getCurrentProgram, updateProgram } from "./programService";
import { checkAchievements } from "./milestoneService";

/* ---------------------- GET USER STATS ---------------------- */
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
export async function checkAndResetProgress(userId: string) {
    try {
      // Get last check date from localStorage
      const lastCheck = localStorage.getItem(`lastProgressCheck_${userId}`);
      const today = new Date().toDateString();
      
      if (lastCheck !== today) {
        await resetDailyProgress(userId);
        localStorage.setItem(`lastProgressCheck_${userId}`, today);

        if (new Date().getDay() === 0) {
          await resetWeeklyProgress(userId);
        }
      }
    } catch (error) {
      console.error(`Error checking and resetting progress for user ${userId}:`, error);
    }
  }

/* ---------------------- GET WEEKLY PROGRESS ---------------------- */
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

export { initializeUserStats };

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