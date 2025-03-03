import { db } from "$lib/helpers/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { AssignedExercise } from "../types/userType";
import { getUser, updateUser } from "./userService";
import { getCurrentProgram, updateProgram } from "./programService";
import { 
    initializeUserStats, 
    checkAndResetProgress, 
    updateStreakOnCompletion 
} from "./statService";

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
        await checkAndResetProgress(userId);
        
        const [user, program] = await Promise.all([
            getUser(userId),
            getCurrentProgram(userId)
        ]);

        if (!user || !program) return;

        const today = new Date();
        const exercise = program.exercises.find(ex => ex.exerciseId === exerciseId);
        if (!exercise || exercise.completed) return;

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

        const stats = user.stats || initializeUserStats();
        
        stats.completedExercises++;
        stats.weeklyProgress.exercisesCompleted++;
        
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

        const allCompleted = updatedExercises.every(ex => ex.completed || ex.skipped);
        
        if (allCompleted) {
            stats.completedPrograms++;
            await updateProgram(userId, {
                exercises: updatedExercises,
                completed: true
            });
            await updateUser(userId, { stats });
            await updateStreakOnCompletion(userId);
        } else {
            await Promise.all([
                updateProgram(userId, {
                    exercises: updatedExercises,
                    completed: false
                }),
                updateUser(userId, { stats })
            ]);
        }

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
        await checkAndResetProgress(userId);
        
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

        const allCompleted = updatedExercises.every(ex => ex.completed || ex.skipped);

        let stats = user.stats || initializeUserStats();
        
        if (allCompleted) {
            stats.completedPrograms++;
            await updateProgram(userId, {
                exercises: updatedExercises,
                completed: true
            });
            await updateUser(userId, { stats });
            await updateStreakOnCompletion(userId);
        } else {
            await Promise.all([
                updateProgram(userId, {
                    exercises: updatedExercises,
                    completed: false
                }),
                updateUser(userId, { stats })
            ]);
        }

    } catch (error) {
        console.error("Error skipping exercise:", error);
        throw error;
    }
}