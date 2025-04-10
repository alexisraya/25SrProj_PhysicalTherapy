import { db } from '$lib/helpers/firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import type { TooPainfulLog } from '$firebase/types/userType';
import { getUser } from './userService';

export async function logTooPainful(
  userId: string,
  exerciseId: string,
  exerciseName: string,
  exerciseType: 'distance' | 'weight' | 'time'
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const today = new Date();

    const logEntry: TooPainfulLog = {
      exerciseId,
      exerciseName,
      exerciseType,
      loggedAt: today.toISOString()
    };

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;

    const userData = userDoc.data();

    // if doesn't exist, initialize as empty array
    if (!userData.tooPainfulLogs) {
      await updateDoc(userRef, { tooPainfulLogs: [logEntry] });
    } else {
      await updateDoc(userRef, {
        tooPainfulLogs: arrayUnion(logEntry)
      });
    }

    console.log(`Logged painful exercise ${exerciseId} for user ${userId}`);
  } catch (error) {
    console.error(`Error logging painful exercise:`, error);
    throw error;
  }
}

export async function getTooPainfulLogs(userId: string): Promise<TooPainfulLog[]> {
  try {
    const user = await getUser(userId);
    return user?.tooPainfulLogs || [];
  } catch (error) {
    console.error('Error getting painful exercise logs:', error);
    throw error;
  }
}
