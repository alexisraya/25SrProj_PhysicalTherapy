import { db } from "$lib/helpers/firebase";
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";

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
    estimatedTime?: number;
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

// Base functions
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
        exercises: cleanedExercises,  // 🔥 Uses the cleaned array with `null` replacements
        estimatedTime: estimatedTime ?? 0, // Default estimatedTime to 0
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
    const program = await getCurrentProgram(userId);
    if (!program) return;

    const updatedExercises = program.exercises.map(ex => 
        ex.exerciseId === exerciseId 
            ? {
                ...ex,
                completed: true,
                completedAt: new Date().toISOString(),
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

    await updateProgram(userId, {
        exercises: updatedExercises,
        completed: updatedExercises.every(ex => ex.completed || ex.skipped)
    });
}

export async function skipExercise(
    userId: string,
    exerciseId: string
): Promise<void> {
    const program = await getCurrentProgram(userId);
    if (!program) return;

    const updatedExercises = program.exercises.map(ex =>
        ex.exerciseId === exerciseId
            ? { ...ex, skipped: true }
            : ex
    );

    await updateProgram(userId, {
        exercises: updatedExercises,
        completed: updatedExercises.every(ex => ex.completed || ex.skipped)
    });
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