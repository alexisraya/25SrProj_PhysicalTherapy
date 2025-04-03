import { db } from "$lib/helpers/firebase";
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where, deleteDoc } from "firebase/firestore";
import type { User } from "../types/userType";
import { initializeUserStats } from "./statService";
import { initializeUserAchievements } from "./milestoneService";

/* ------------------------- BASE FUNCTIONS ------------------------- */
export async function getUser(userId: string): Promise<User | null> {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            if (!userData.assignedExercises) userData.assignedExercises = [];
            if (!userData.stats) {
                userData.stats = initializeUserStats(); 
            }
            return userData;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return null;
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

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
        const userRef = doc(db, "users", userId);
        if (updates.stats && typeof updates.stats === 'object') {
            const cleanUpdates = Object.fromEntries(
                Object.entries(updates).filter(([_, value]) => value !== undefined)
            );
            await updateDoc(userRef, {
                ...cleanUpdates,
                updatedAt: new Date().toISOString()
            });
        } else {
            const { stats, ...otherUpdates } = updates;
            await updateDoc(userRef, {
                ...otherUpdates,
                updatedAt: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw error;
    }
}

export async function createUser(
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    therapistId: string = "mY8JFfhiJvdFm54wG57ALJmVYit2"
): Promise<void> {
    try {
        const userRef = doc(db, "users", userId);
        
        const stats = initializeUserStats();
        stats.achievements = {};

        await setDoc(userRef, {
            userId,
            firstName,
            lastName,
            displayName: `${firstName} ${lastName}`,
            email,
            isTherapist: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            therapistId,
            assignedExercises: [],
            stats
        });
        
        const programRef = doc(db, "users", userId, "program", "currentProgram");
        await setDoc(programRef, {
            exercises: [],
            estimatedTime: 30,
            assignedAt: new Date().toISOString(),
            completed: false
        });
        await initializeUserAchievements(userId);
    } catch (error) {
        console.error(`Error creating user ${userId}:`, error);
        throw error;
    }
}