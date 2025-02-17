import { db } from "$lib/helpers/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export interface Exercise {
    exerciseId: string;
    exerciseName: string;
}

export interface User {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    injury?: string;
    isTherapist: boolean;
    therapistId?: string;
    startDate: string;
    endDate?: string | null;
    exercises?: Exercise[];
}

export async function createUser(userId: string, userData: User): Promise<void> {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, userData, { merge: true });
    console.log("User added to Firestore:", userId);
}

export async function getUser(userId: string): Promise<User | null> {
    if (!userId) {
        console.warn("🚨 Invalid userId provided to getUser.");
        return null;
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as User;
    } else {
        console.warn("⚠️ User not found in Firestore:", userId);
        return null;
    }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
}

export async function assignExercisesToUser(userId: string, exercises: Exercise[]): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { exercises });
}