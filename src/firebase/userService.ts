// This is referring to the Patient User
import { db } from "$lib/helpers/firebase";
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";

export interface User {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    isTherapist: boolean;
    createdAt: string;
    updatedAt: string;
    therapistId?: string; // The therapist assigned to this user
    assignedExercises?: any[]; // Only for patients
}

export async function getUser(userId: string): Promise<User | null> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
        return userSnap.data() as User;
    } else {
        console.warn(`User with ID ${userId} not found.`);
        return null;
    }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
}

export async function getAllUsers(): Promise<User[]> {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => doc.data() as User);
}