import { 
  doc, collection, addDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp, updateDoc
} from "firebase/firestore";
import { db } from "$lib/helpers/firebase";
import type { CheckIn, CheckInStats } from "../types/checkInType";

/* ---------------------- CREATE CHECK IN ---------------------- */
/**
 * Adds a new check-in for a user and returns the document ID.
 */
export async function addCheckIn(userId: string, painLevel: number, moodLevel: number): Promise<string> {
  if (painLevel < 1 || painLevel > 10) {
    throw new Error("Pain level must be between 1 and 10");
  }
  if (moodLevel < 1 || moodLevel > 5) {
    throw new Error("Mood level must be between 1 and 5");
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    const checkInData: Omit<CheckIn, "id"> = {
      userId,
      timestamp: serverTimestamp(),
      date: today,
      painLevel,
      moodLevel,
    };

    const checkInsRef = collection(db, "users", userId, "checkIns");
    const docRef = await addDoc(checkInsRef, checkInData);

    // Update user's lastCheckIn field
    await updateDoc(doc(db, "users", userId), {
      lastCheckIn: today,
      lastCheckInTimestamp: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding check-in:", error);
    throw error;
  }
}

/* ---------------------- CHECKIN COMPLETED? ---------------------- */
/**
 * Returns `true` if the user has completed today's check-in.
 */
export async function hasCompletedTodayCheckIn(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const checkInsRef = collection(db, "users", userId, "checkIns");

    const q = query(checkInsRef, where("date", "==", today), limit(1));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking today's check-in:", error);
    throw error;
  }
}

/* ---------------------- GET CHECKIN STATS ---------------------- */
/**
 * Fetches check-in data and calculates averages for a given period.
 */
export async function getCheckInStats(userId: string, period: "week" | "month" | "3months" | "6months"): Promise<CheckInStats> {
  try {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      default:
        throw new Error("Invalid period specified");
    }

    const checkInsRef = collection(db, "users", userId, "checkIns");
    const q = query(checkInsRef, where("timestamp", ">=", startDate), orderBy("timestamp", "asc"));

    const querySnapshot = await getDocs(q);

    const checkIns: CheckIn[] = [];
    let totalPain = 0, totalMood = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const checkIn: CheckIn = {
        id: doc.id,
        userId,
        timestamp: data.timestamp?.toDate() || new Date(),
        date: data.date,
        painLevel: data.painLevel,
        moodLevel: data.moodLevel,
      };
      checkIns.push(checkIn);
      totalPain += data.painLevel;
      totalMood += data.moodLevel;
    });

    return {
      startDate,
      endDate: now,
      checkIns,
      averagePainLevel: checkIns.length ? totalPain / checkIns.length : 0,
      averageMoodLevel: checkIns.length ? totalMood / checkIns.length : 0,
    };
  } catch (error) {
    console.error("Error fetching check-in stats:", error);
    throw error;
  }
}

/* ---------------------- GET LATEST CHECKIN ---------------------- */
/**
 * Retrieves the most recent check-in for a user.
 */
export async function getLatestCheckIn(userId: string): Promise<CheckIn | null> {
  try {
    const checkInsRef = collection(db, "users", userId, "checkIns");
    const q = query(checkInsRef, orderBy("timestamp", "desc"), limit(1));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      userId,
      timestamp: data.timestamp?.toDate() || new Date(),
      date: data.date,
      painLevel: data.painLevel,
      moodLevel: data.moodLevel,
    };
  } catch (error) {
    console.error("Error fetching latest check-in:", error);
    throw error;
  }
}

/* ---------------------- GET ALL CHECKINS ---------------------- */
/**
 * Fetches all check-ins for a user.
 */
export async function getAllCheckIns(userId: string): Promise<CheckIn[]> {
  try {
    const checkInsRef = collection(db, "users", userId, "checkIns");
    const q = query(checkInsRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      userId,
      timestamp: doc.data().timestamp?.toDate() || new Date(),
      date: doc.data().date,
      painLevel: doc.data().painLevel,
      moodLevel: doc.data().moodLevel,
    }));
  } catch (error) {
    console.error("Error fetching all check-ins:", error);
    throw error;
  }
}

/* ---------------------- GET CHECKINS WITHIN SPECIFIC RANGE ---------------------- */
/**
 * Retrieves check-ins for a user within a specific date range.
 */
export async function getCheckInsInRange(userId: string, startDate: Date, endDate: Date): Promise<CheckIn[]> {
  try {
    const checkInsRef = collection(db, "users", userId, "checkIns");
    const q = query(checkInsRef, where("timestamp", ">=", startDate), where("timestamp", "<=", endDate));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      userId,
      timestamp: doc.data().timestamp?.toDate() || new Date(),
      date: doc.data().date,
      painLevel: doc.data().painLevel,
      moodLevel: doc.data().moodLevel,
    }));
  } catch (error) {
    console.error("Error fetching check-ins in range:", error);
    throw error;
  }
}
