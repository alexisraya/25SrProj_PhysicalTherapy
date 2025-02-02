import { db } from "$lib/helpers/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  injury: string;
  isTherapist: boolean;
  therapistId: string;
  startDate: Date;
  endDate: Date | null;
}

export async function createUser(userId: string, userData: User): Promise<void> {
  await setDoc(doc(db, "users", userId), userData);
}

export async function getUser(userId: string): Promise<User | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? (userSnap.data() as User) : null;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, updates);
}