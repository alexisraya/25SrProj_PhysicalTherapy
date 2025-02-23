import { db } from "$lib/helpers/firebase";
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
/* SABRINA WILL REFACTOR AND REORGANIZE EVERYTHING ONCE CORE FUNCTIONALTIES ARE PROPERLY SET UP */

/* ------------------------- MAIN USER DETAILS ------------------------- */
export interface User {
    userId: string;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    isTherapist: boolean;
    createdAt: string;
    updatedAt: string;
    therapistId?: string;
    assignedExercises: AssignedExercise[];
    userStats: UserStats[];
    estimatedTime?: number;
}

/* ------------------------- EACH EXERCISE DETAILS ------------------------- */
export interface AssignedExercise {
    exerciseId: string;
    exerciseName: string;
    exerciseType: 'distance' | 'weight' | 'time';
    order: number;
    equipment?: string;
    sets?: number;
    reps?: number;
    steps?: number;
    seconds?: number;
    weight?: number;
    completed: boolean;
    completedAt?: string;
    skipped?: boolean;
    adjustedSets?: number;
    adjustedReps?: number;
    adjustedSteps?: number;
    adjustedSeconds?: number;
    adjustedWeight?: number;
}

/* ------------------------- CURRENT PROGRAM ------------------------- */
export interface Program {
    exercises: AssignedExercise[];
    estimatedTime: number;
    assignedAt: string;
    completed: boolean;
    updatedAt?: string;
}

/* USER STATS */
export interface UserStats {
    // STREAKS
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string | null;  // ISO date string
    weeklyProgress: {
        weekStartDate: string;  // ISO date string (Sunday)
        daysCompleted: number;
        exercisesCompleted: number;
    };
    
    // OVERALL STATS
    completedExercises: number;
    completedPrograms: number;
    totalSets: number;
    totalReps: number;
    totalWeight: number;
    totalDistance: number;
    totalTime: number;
    
    // HISTORICAL DATA
    streakHistory: {
        date: string;  // ISO date string
        completed: boolean;
    }[];
}

/* ------------------------- BASE FUNCTIONS ------------------------- */
export async function getUser(userId: string): Promise<User | null> {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            if (!userData.assignedExercises) userData.assignedExercises = [];
            if (!userData.stats) {
                userData.stats = {
                    completedExercises: 0,
                    completedPrograms: 0,
                    totalSets: 0,
                    totalReps: 0,
                    totalWeight: 0,
                    totalDistance: 0,
                    totalTime: 0
                };
            }
            return userData;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return null;
    }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
        const userRef = doc(db, "users", userId);
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
        );
        await updateDoc(userRef, {
            ...cleanUpdates,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw error;
    }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        return snapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
}

export async function getPatientsForTherapist(therapistId: string): Promise<User[]> {
    try {
        const patientsQuery = query(
            collection(db, "users"),
            where("therapistId", "==", therapistId),
            where("isTherapist", "==", false)
        );
        
        const snapshot = await getDocs(patientsQuery);
        return snapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
        console.error(`Error fetching patients for therapist ${therapistId}:`, error);
        return [];
    }
}

/* ------------------------- PROGRAM FUNCTIONS ------------------------- */
export async function assignProgram(
    userId: string, 
    exercises: AssignedExercise[], 
    estimatedTime: number
): Promise<void> {
    if (!userId || !exercises || exercises.length === 0 || estimatedTime === undefined) {
        console.error("Error: Invalid data passed to assignProgram", { userId, exercises, estimatedTime });
        throw new Error("Invalid data: Cannot assign program with missing or undefined values.");
    }

    // Convert undefined values to null (Firestore allows null)
    const cleanedExercises = exercises.map(exercise => {
        return Object.fromEntries(
            Object.entries(exercise).map(([key, value]) => [key, value === undefined ? null : value])
        );
    });

    const programRef = doc(db, "users", userId, "program", "currentProgram");

    const programData = {
        exercises: cleanedExercises, 
        estimatedTime: estimatedTime ?? 0,
        assignedAt: new Date().toISOString(),
        completed: false
    };

    console.log("Writing to Firestore:", programData);

    await setDoc(programRef, programData);
}


export async function getCurrentProgram(userId: string): Promise<Program | null> {
    try {
        const programRef = doc(db, "users", userId, "program", "currentProgram");
        const snap = await getDoc(programRef);
        return snap.exists() ? snap.data() as Program : null;
    } catch (error) {
        console.error("Error fetching program:", error);
        return null;
    }
}

export async function updateProgram(
    userId: string,
    updates: Partial<Program>
): Promise<void> {
    try {
        const programRef = doc(db, "users", userId, "program", "currentProgram");
        await updateDoc(programRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating program:", error);
        throw error;
    }
}

/* ------------------------- EXERCISE FUNCTIONS ------------------------- */

export async function completeExercise(
    userId: string,
    exerciseId: string,
    adjustedValues?: {
        sets?: number;
        reps?: number;
        steps?: number;
        seconds?: number;
        weight?: number;
    }
): Promise<void> {
    try {
        const [user, program] = await Promise.all([
            getUser(userId),
            getCurrentProgram(userId)
        ]);

        if (!user || !program) return;

        const today = new Date();
        const exercise = program.exercises.find(ex => ex.exerciseId === exerciseId);
        if (!exercise || exercise.completed) return;

        // Update exercise completion status
        const updatedExercises = program.exercises.map(ex =>
            ex.exerciseId === exerciseId
                ? {
                    ...ex,
                    completed: true,
                    completedAt: today.toISOString(),
                    ...(adjustedValues && {
                        adjustedSets: adjustedValues.sets,
                        adjustedReps: adjustedValues.reps,
                        adjustedSteps: adjustedValues.steps,
                        adjustedSeconds: adjustedValues.seconds,
                        adjustedWeight: adjustedValues.weight
                    })
                }
                : ex
        );

        // Calculate new stats
        const stats = user.stats || initializeUserStats();
        const weekStart = getWeekStartDate(today);

        // Reset weekly progress if it's a new week
        if (weekStart !== stats.weeklyProgress.weekStartDate) {
            stats.weeklyProgress = {
                weekStartDate: weekStart,
                daysCompleted: 0,
                exercisesCompleted: 0
            };
        }

        // Update exercise-specific stats
        stats.completedExercises++;
        
        const sets = adjustedValues?.sets || exercise.sets || 0;
        const reps = adjustedValues?.reps || exercise.reps || 0;
        const steps = adjustedValues?.steps || exercise.steps || 0;
        const seconds = adjustedValues?.seconds || exercise.seconds || 0;
        const weight = adjustedValues?.weight || exercise.weight || 0;

        if (exercise.exerciseType === 'distance') {
            stats.totalSets += sets;
            stats.totalDistance += sets * steps;
        } else if (exercise.exerciseType === 'weight') {
            stats.totalSets += sets;
            stats.totalReps += sets * reps;
            stats.totalWeight += sets * reps * weight;
        } else if (exercise.exerciseType === 'time') {
            stats.totalTime += reps * seconds;
        }

        // Update streak information
        const lastCompletedDate = stats.lastCompletedDate ? new Date(stats.lastCompletedDate) : null;
        if (!lastCompletedDate || 
            lastCompletedDate.toDateString() !== today.toDateString()) {
            // New day completion
            stats.weeklyProgress.daysCompleted++;
            stats.streakHistory.push({
                date: today.toISOString(),
                completed: true
            });
            
            // Update streak
            stats.currentStreak = calculateStreak(stats.streakHistory);
            stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
            stats.lastCompletedDate = today.toISOString();
        }

        stats.weeklyProgress.exercisesCompleted++;

        // Check if program is completed
        const allCompleted = updatedExercises.every(ex => ex.completed || ex.skipped);
        if (allCompleted) {
            stats.completedPrograms++;
        }

        // Update both program and user stats
        await Promise.all([
            updateProgram(userId, {
                exercises: updatedExercises,
                completed: allCompleted
            }),
            updateUser(userId, { stats })
        ]);

    } catch (error) {
        console.error("Error completing exercise:", error);
        throw error;
    }
}

export async function skipExercise(
    userId: string,
    exerciseId: string
): Promise<void> {
    try {
        const [user, program] = await Promise.all([
            getUser(userId),
            getCurrentProgram(userId)
        ]);

        if (!user || !program) return;

        const exercise = program.exercises.find(ex => ex.exerciseId === exerciseId);
        if (!exercise || exercise.skipped) return;

        const updatedExercises = program.exercises.map(ex =>
            ex.exerciseId === exerciseId
                ? { ...ex, skipped: true }
                : ex
        );

        // Check if program is completed
        const allCompleted = updatedExercises.every(ex => ex.completed || ex.skipped);
        
        // Update stats if program is completed
        let stats = user.stats || initializeUserStats();
        if (allCompleted) {
            stats.completedPrograms++;
        }

        // Update both program and stats
        await Promise.all([
            updateProgram(userId, {
                exercises: updatedExercises,
                completed: allCompleted
            }),
            updateUser(userId, { stats })
        ]);

    } catch (error) {
        console.error("Error skipping exercise:", error);
        throw error;
    }
}

export async function updateExerciseOrder(
    userId: string,
    newOrder: string[] 
): Promise<void> {
    const program = await getCurrentProgram(userId);
    if (!program) return;

    const exerciseMap = new Map(program.exercises.map(ex => [ex.exerciseId, ex]));
    const updatedExercises = newOrder
        .map((id, index) => {
            const exercise = exerciseMap.get(id);
            return exercise ? { ...exercise, order: index } : null;
        })
        .filter((ex): ex is AssignedExercise => ex !== null);

    await updateProgram(userId, { exercises: updatedExercises });
}

/* ------------------------- STAT CALCULATIONS ------------------------- */
// HELP FUNCTIONS FOR STATS
function getWeekStartDate(date: Date = new Date()): string {
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - date.getDay());
    sunday.setHours(0, 0, 0, 0);
    return sunday.toISOString();
}

function calculateStreak(streakHistory: UserStats['streakHistory']): number {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = streakHistory.length - 1; i >= 0; i--) {
        const date = new Date(streakHistory[i].date);
        date.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) break; // Break streak if more than 1 day gap
        if (streakHistory[i].completed) streak++;
    }

    return streak;
}

function initializeUserStats(): UserStats {
    return {
        currentStreak: 0,
        longestStreak: 0,
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
        streakHistory: []
    };
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
    const user = await getUser(userId);
    if (!user) return null;

    await checkAndResetProgress(userId);
    return user.stats || initializeUserStats();
}

/* ------------------------- STREAKS ------------------------- */
// HELPER FUNCTIONS FOR STREAKS
function resetDailyProgress(stats: UserStats): UserStats {
    return {
        ...stats,
        lastCompletedDate: null
    };
}

function resetWeeklyProgress(stats: UserStats): UserStats {
    return {
        ...stats,
        weeklyProgress: {
            weekStartDate: getWeekStartDate(),
            daysCompleted: 0,
            exercisesCompleted: 0
        }
    };
}

export async function getWeeklyProgress(userId: string): Promise<{
    weekStartDate: string;
    daysCompleted: number;
    exercisesCompleted: number;
    remainingDays: number;
}> {
    const stats = await getUserStats(userId);
    if (!stats) throw new Error("User stats not found");

    const today = new Date();
    const weekStart = new Date(stats.weeklyProgress.weekStartDate);
    const daysSinceStart = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, 7 - daysSinceStart);

    return {
        ...stats.weeklyProgress,
        remainingDays
    };
}

export async function checkAndResetProgress(userId: string): Promise<void> {
    const user = await getUser(userId);
    if (!user?.stats) return;

    const today = new Date();
    let stats = { ...user.stats };
    const lastCompleted = stats.lastCompletedDate ? new Date(stats.lastCompletedDate) : null;
    const weekStart = getWeekStartDate(today);
    let needsUpdate = false;

    // Check for daily reset
    if (lastCompleted && lastCompleted.toDateString() !== today.toDateString()) {
        stats = resetDailyProgress(stats);
        needsUpdate = true;
    }

    // Check for weekly reset
    if (weekStart !== stats.weeklyProgress.weekStartDate) {
        // If completed 5 or more days, count it as a successful week
        if (stats.weeklyProgress.daysCompleted >= 5) {
            stats.currentStreak++;
            stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
        } else {
            stats.currentStreak = 0;
        }
        stats = resetWeeklyProgress(stats);
        needsUpdate = true;
    }

    if (needsUpdate) {
        await updateUser(userId, { stats });
    }
}