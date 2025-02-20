// This is referring to the Patient User
import { db } from "$lib/helpers/firebase";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";

export interface AssignedExercise {
    exerciseId: string;
    exerciseName: string;
    sets: number;      // Added sets field
    reps: number;
    assigned: string;  // ISO date string
    completed: boolean;
    completedAt?: string;  // ISO date string
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
    therapistId?: string; // The therapist assigned to this user
    assignedExercises?: AssignedExercise[];
}

/**
 * Fetch a user by their ID
 */
export async function getUser(userId: string): Promise<User | null> {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            
            // Ensure assignedExercises is always an array
            if (!userData.assignedExercises) {
                userData.assignedExercises = [];
            }
            
            return userData;
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return null;
    }
}

/**
 * Update a user's data
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
        // Add updatedAt timestamp
        const updatedData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, updatedData);
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw error;
    }
}

/**
 * Get all users (patients)
 */
export async function getAllUsers(): Promise<User[]> {
    try {
        const usersQuery = query(
            collection(db, "users"),
            where("isTherapist", "==", false)
        );
        
        const snapshot = await getDocs(usersQuery);
        return snapshot.docs.map(doc => {
            const data = doc.data() as User;
            // Ensure assignedExercises is always an array
            if (!data.assignedExercises) {
                data.assignedExercises = [];
            }
            return data;
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
}

/**
 * Get all patients assigned to a specific therapist
 */
export async function getPatientsForTherapist(therapistId: string): Promise<User[]> {
    try {
        const patientsQuery = query(
            collection(db, "users"),
            where("therapistId", "==", therapistId),
            where("isTherapist", "==", false)
        );
        
        const snapshot = await getDocs(patientsQuery);
        return snapshot.docs.map(doc => {
            const data = doc.data() as User;
            // Ensure assignedExercises is always an array
            if (!data.assignedExercises) {
                data.assignedExercises = [];
            }
            return data;
        });
    } catch (error) {
        console.error(`Error fetching patients for therapist ${therapistId}:`, error);
        return [];
    }
}

/**
 * Assign a therapist to a patient
 */
export async function assignTherapistToPatient(patientId: string, therapistId: string): Promise<void> {
    try {
        const userRef = doc(db, "users", patientId);
        await updateDoc(userRef, {
            therapistId: therapistId,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Error assigning therapist to patient:`, error);
        throw error;
    }
}

/**
 * Assign an exercise to a patient
 */
export async function assignExerciseToPatient(
    patientId: string,
    exercise: {
        exerciseId: string;
        exerciseName: string;
        reps: number;
    }
): Promise<void> {
    try {
        const userRef = doc(db, "users", patientId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            throw new Error(`Patient ${patientId} not found`);
        }
        
        const userData = userSnap.data() as User;
        const currentExercises = userData.assignedExercises || [];
        
        const updatedExercises = [
            ...currentExercises,
            {
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.exerciseName,
                reps: exercise.reps,
                assigned: new Date().toISOString(),
                completed: false
            }
        ];
        
        await updateDoc(userRef, {
            assignedExercises: updatedExercises,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Error assigning exercise to patient ${patientId}:`, error);
        throw error;
    }
}

/**
 * Mark an exercise as completed for a patient
 */
export async function markExerciseCompleted(
    patientId: string,
    exerciseIndex: number
): Promise<void> {
    try {
        const userRef = doc(db, "users", patientId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            throw new Error(`Patient ${patientId} not found`);
        }
        
        const userData = userSnap.data() as User;
        const exercises = userData.assignedExercises || [];
        
        if (exerciseIndex < 0 || exerciseIndex >= exercises.length) {
            throw new Error(`Invalid exercise index: ${exerciseIndex}`);
        }
        
        exercises[exerciseIndex] = {
            ...exercises[exerciseIndex],
            completed: true,
            completedAt: new Date().toISOString()
        };
        
        await updateDoc(userRef, {
            assignedExercises: exercises,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Error marking exercise as completed:`, error);
        throw error;
    }
}