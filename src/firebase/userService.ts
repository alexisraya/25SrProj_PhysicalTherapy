import { db } from "$lib/helpers/firebase";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";

export interface Program {
    programId: string;
    estimatedTime: number;  // in minutes
    assignedAt: string; 
    exercises: AssignedExercise[];
    completed: boolean;
}

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
    estimatedTime?: number;  // For the program
    stats: {
        completedExercises: number;
        completedPrograms: number;
        totalSets: number;
        totalReps: number;
        totalWeight: number;
        totalDistance: number;
        totalTime: number;
    };
}

export interface AssignedExercise {
    exerciseId: string;
    exerciseName: string;
    exerciseType: 'distance' | 'weight' | 'time';
    order: number;
    equipment?: string;
    // Values assigned by therapist
    sets?: number;
    reps?: number;
    steps?: number;
    seconds?: number;
    weight?: number;
    completed: boolean;
    completedAt?: string;
    skipped?: boolean;
    // Track adjustments made by user
    adjustedSets?: number;
    adjustedReps?: number;
    adjustedSteps?: number;
    adjustedSeconds?: number;
    adjustedWeight?: number;
}

export async function getUser(userId: string): Promise<User | null> {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            return userSnap.data() as User;
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
        await updateDoc(userRef, {
            ...updates,
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

export async function assignProgram(
    userId: string, 
    exercises: AssignedExercise[], 
    estimatedTime: number
) {
    const programRef = doc(db, "users", userId, "program", "currentProgram");
    await setDoc(programRef, {
        exercises: exercises,
        estimatedTime: estimatedTime,
    });
}


export async function completeExercise(
    userId: string,
    exerciseIndex: number,
    adjustedValues?: {
        sets?: number;
        reps?: number;
        steps?: number;
        seconds?: number;
        weight?: number;
    }
): Promise<void> {
    try {
        const user = await getUser(userId);
        if (!user?.assignedExercises) return;

        const exercise = user.assignedExercises[exerciseIndex];
        if (!exercise || exercise.completed || exercise.skipped) return;

        const updatedExercises = [...user.assignedExercises];
        updatedExercises[exerciseIndex] = {
            ...exercise,
            completed: true,
            completedAt: new Date().toISOString(),
            adjustedSets: adjustedValues?.sets,
            adjustedReps: adjustedValues?.reps,
            adjustedSteps: adjustedValues?.steps,
            adjustedSeconds: adjustedValues?.seconds,
            adjustedWeight: adjustedValues?.weight
        };

        const stats = { ...user.stats };
        stats.completedExercises += 1;

        if (exercise.exerciseType === 'distance') {
            const sets = adjustedValues?.sets || exercise.sets || 0;
            const steps = adjustedValues?.steps || exercise.steps || 0;
            stats.totalSets += sets;
            stats.totalDistance += sets * steps;
        } 
        else if (exercise.exerciseType === 'weight') {
            const sets = adjustedValues?.sets || exercise.sets || 0;
            const reps = adjustedValues?.reps || exercise.reps || 0;
            const weight = adjustedValues?.weight || exercise.weight || 0;
            stats.totalSets += sets;
            stats.totalReps += sets * reps;
            stats.totalWeight += sets * reps * weight;
        } 
        else if (exercise.exerciseType === 'time') {
            const reps = adjustedValues?.reps || exercise.reps || 0;
            const seconds = adjustedValues?.seconds || exercise.seconds || 0;
            stats.totalTime += reps * seconds;
        }

        const allDone = updatedExercises.every(ex => ex.completed || ex.skipped);
        if (allDone) {
            stats.completedPrograms += 1;
        }

        await updateUser(userId, {
            assignedExercises: updatedExercises,
            stats
        });
    } catch (error) {
        console.error("Error completing exercise:", error);
        throw error;
    }
}

export async function skipExercise(
    userId: string,
    exerciseIndex: number
): Promise<void> {
    try {
        const user = await getUser(userId);
        if (!user?.assignedExercises) return;

        const updatedExercises = [...user.assignedExercises];
        updatedExercises[exerciseIndex] = {
            ...updatedExercises[exerciseIndex],
            skipped: true,
            completed: false
        };

        const allDone = updatedExercises.every(ex => ex.completed || ex.skipped);
        const stats = { ...user.stats };
        if (allDone) {
            stats.completedPrograms += 1;
        }

        await updateUser(userId, {
            assignedExercises: updatedExercises,
            stats
        });
    } catch (error) {
        console.error("Error skipping exercise:", error);
        throw error;
    }
}

export async function updateExerciseOrder(
    userId: string,
    newOrder: number[]
): Promise<void> {
    try {
        const user = await getUser(userId);
        if (!user?.assignedExercises) return;

        const updatedExercises = [...user.assignedExercises];
        newOrder.forEach((newIndex, oldIndex) => {
            updatedExercises[newIndex] = {
                ...user.assignedExercises[oldIndex],
                order: newIndex
            };
        });

        await updateUser(userId, {
            assignedExercises: updatedExercises
        });
    } catch (error) {
        console.error("Error updating exercise order:", error);
        throw error;
    }
}