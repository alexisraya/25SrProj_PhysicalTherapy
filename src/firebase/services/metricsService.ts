import { db } from "$lib/helpers/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import type { RangeOfMotion, Strength, UserMetrics } from "../types/userType";

export async function getUserMetrics(userId: string): Promise<UserMetrics | null> {
  try {
    const metricsRef = doc(db, "userMetrics", userId);
    const metricsSnap = await getDoc(metricsRef);
    
    if (metricsSnap.exists()) {
      return metricsSnap.data() as UserMetrics;
    } else {
      const emptyMetrics: UserMetrics = {
        userId,
        rangeOfMotion: [],
        strength: [],
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(metricsRef, emptyMetrics);
      return emptyMetrics;
    }
  } catch (error) {
    console.error(`Error getting metrics for patient ${userId}:`, error);
    return null;
  }
}

export async function updateRangeOfMotion(
  userId: string, 
  month: number, 
  degrees: number
): Promise<void> {
  try {
    const metricsRef = doc(db, "userMetrics", userId);
    const metricsSnap = await getDoc(metricsRef);
    
    const now = new Date().toISOString();
    const newMetric: RangeOfMotion = {
      month,
      degrees
    };
    
    if (!metricsSnap.exists()) {
      const metrics: UserMetrics = {
        userId,
        rangeOfMotion: [newMetric],
        strength: [],
        updatedAt: now
      };
      await setDoc(metricsRef, metrics);
    } else {
      const metrics = metricsSnap.data() as UserMetrics;
      const existingIndex = metrics.rangeOfMotion.findIndex(m => m.month === month);
      
      if (existingIndex >= 0) {
        metrics.rangeOfMotion[existingIndex] = newMetric;
      } else {
        metrics.rangeOfMotion.push(newMetric);
      }
      
      metrics.rangeOfMotion.sort((a, b) => a.month - b.month);
      
      await updateDoc(metricsRef, {
        rangeOfMotion: metrics.rangeOfMotion,
        updatedAt: now
      });
    }
  } catch (error) {
    console.error(`Error updating range of motion for patient ${userId}:`, error);
    throw error;
  }
}

export async function updateStrength(
  userId: string, 
  month: number, 
  strengthScale: number
): Promise<void> {
  try {
    if (strengthScale < 0 || strengthScale > 5) {
      throw new Error("Strength scale must be between 0 and 5");
    }
    
    const metricsRef = doc(db, "userMetrics", userId);
    const metricsSnap = await getDoc(metricsRef);
    
    const now = new Date().toISOString();
    const newMetric: Strength = {
      month,
      strengthScale: strengthScale,
    };
    
    if (!metricsSnap.exists()) {
      const metrics: UserMetrics = {
        userId,
        rangeOfMotion: [],
        strength: [newMetric],
        updatedAt: now
      };
      await setDoc(metricsRef, metrics);
    } else {
      const metrics = metricsSnap.data() as UserMetrics;
      const existingIndex = metrics.strength.findIndex(m => m.month === month);
      
      if (existingIndex >= 0) {
        metrics.strength[existingIndex] = newMetric;
      } else {
        metrics.strength.push(newMetric);
      }
      
      metrics.strength.sort((a, b) => a.month - b.month);
      
      await updateDoc(metricsRef, {
        strength: metrics.strength,
        updatedAt: now
      });
    }
  } catch (error) {
    console.error(`Error updating strength for patient ${userId}:`, error);
    throw error;
  }
}

export async function deleteRangeOfMotion(userId: string, month: number): Promise<void> {
  try {
    const metricsRef = doc(db, "userMetrics", userId);
    const metricsSnap = await getDoc(metricsRef);
    
    if (metricsSnap.exists()) {
      const metrics = metricsSnap.data() as UserMetrics;
      const updatedMetrics = metrics.rangeOfMotion.filter(m => m.month !== month);
      
      await updateDoc(metricsRef, {
        rangeOfMotion: updatedMetrics,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error(`Error deleting ROM metric for patient ${userId}:`, error);
    throw error;
  }
}

export async function deleteStrength(userId: string, month: number): Promise<void> {
  try {
    const metricsRef = doc(db, "userMetrics", userId);
    const metricsSnap = await getDoc(metricsRef);
    
    if (metricsSnap.exists()) {
      const metrics = metricsSnap.data() as UserMetrics;
      const updatedMetrics = metrics.strength.filter(m => m.month !== month);
      
      await updateDoc(metricsRef, {
        strength: updatedMetrics,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error(`Error deleting strength metric for patient ${userId}:`, error);
    throw error;
  }
}