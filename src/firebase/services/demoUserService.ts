import { doc, getDoc, updateDoc, collection, getDocs, query, where, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '$lib/helpers/firebase';
import { getUser, updateUser } from './userService';
import { assignProgram } from './programService';
import { updateRangeOfMotion, updateStrength } from './metricsService';
import { getPersonalWeekStart } from './helpers';
import type { User, UserStats, AssignedExercise } from '../types/userType';

/**
 * Initializes a new user with pre-populated demo data based on Run 2 pattern
 * This sets up the user to be in Month 3, Week 1, Day 5 with 4 days already completed
 * 
 * Timeline (based on Run 2 but extended):
 * - Account created: 65 days ago (Month 1)
 * - Month 2: Started 35 days ago
 * - Month 3: Started 5 days ago
 * - Current week: 4 days completed, today is day 5
 * 
 * Pre-populated data includes:
 * - 96 completed exercises, 30 completed programs
 * - 11 unlocked achievements
 * - 7 unlocked goals (goal-1 through goal-6, plus goal-8)
 * - Range of motion and strength metrics for months 1-2
 * - Check-in data for months 1-2
 * - 5 exercises assigned for today (not completed)
 */
export async function initializeUserWithDemoData(userId: string): Promise<void> {
  try {
    const user = await getUser(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

    const today = new Date();
    const creationDate = new Date(today);
    creationDate.setDate(creationDate.getDate() - 65);
    creationDate.setHours(0, 0, 0, 0);
    
    const month2Date = new Date(creationDate);
    month2Date.setDate(month2Date.getDate() + 30);
    
    const month3Date = new Date(today);
    month3Date.setDate(month3Date.getDate() - 5);
    month3Date.setHours(0, 0, 0, 0);
    
    const weekStartDate = getPersonalWeekStart(creationDate.toISOString(), today);
    console.log("Demo - Personal week start:", weekStartDate);
    
    const lastCompletion = new Date(today);
    lastCompletion.setDate(lastCompletion.getDate() - 1);
    
    try {
      await updateUser(userId, {
        createdAt: creationDate.toISOString(),
        updatedAt: today.toISOString()
      });
      console.log(`Updated user timestamps for ${userId}`);
    } catch (error) {
      console.error(`Could not update user timestamps:`, error);
    }
    const streakHistory = [];

    for (let i = 60; i >= 5; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      const completed = !(dayOfWeek === 0 || dayOfWeek === 6 || i % 7 === 3);
      streakHistory.push({
        date: date.toISOString(),
        completed
      });
    }

    for (let i = 4; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      streakHistory.push({
        date: date.toISOString(),
        completed: true
      });
    }

    const stats: UserStats = {
      currentStreak: 8,
      longestStreak: 8,
      lastCompletedDate: lastCompletion.toISOString(),
      weeklyProgress: {
        weekStartDate: weekStartDate,
        daysCompleted: 4,
        exercisesCompleted: 20
      },
      monthlyProgress: {
        [creationDate.toISOString().substring(0, 7)]: {
          month: 1,
          exercisesCompleted: 45,
          programsCompleted: 15
        },
        [month2Date.toISOString().substring(0, 7)]: {
          month: 2,
          exercisesCompleted: 48,
          programsCompleted: 15
        },
        [month3Date.toISOString().substring(0, 7)]: {
          month: 3,
          exercisesCompleted: 3,
          programsCompleted: 0
        }
      },
      // Your specified stats
      completedExercises: 96,
      completedPrograms: 30,
      totalSets: 192,
      totalReps: 954,
      totalWeight: 475,
      totalDistance: 218,
      totalTime: 1200,
      streakHistory,
      achievements: {
        "time-1": { unlocked: true, unlockedAt: getDateDaysAgo(60).toISOString() },
        "time-2": { unlocked: true, unlockedAt: getDateDaysAgo(55).toISOString() },
        "time-3": { unlocked: true, unlockedAt: getDateDaysAgo(50).toISOString() },
        "time-4": { unlocked: true, unlockedAt: getDateDaysAgo(45).toISOString() },
        "time-5": { unlocked: true, unlockedAt: getDateDaysAgo(40).toISOString() },
        "weight-1": { unlocked: true, unlockedAt: getDateDaysAgo(57).toISOString() },
        "weight-2": { unlocked: true, unlockedAt: getDateDaysAgo(52).toISOString() },
        "weight-3": { unlocked: true, unlockedAt: getDateDaysAgo(47).toISOString() },
        "weight-4": { unlocked: true, unlockedAt: getDateDaysAgo(42).toISOString() },
        "distance-1": { unlocked: true, unlockedAt: getDateDaysAgo(48).toISOString() },
        "distance-2": { unlocked: true, unlockedAt: getDateDaysAgo(44).toISOString() }
      }
    };

    console.log("Demo - Setting up with days completed:", stats.weeklyProgress.daysCompleted);

    try {
      await updateUser(userId, { stats });
      console.log(`Updated user stats for ${userId}`);
    } catch (error) {
      console.error(`Could not update user stats:`, error);
    }

    const exercises: AssignedExercise[] = [
      {
        exerciseId: 'clamshell',
        exerciseName: 'Clamshell',
        exerciseType: 'time',
        order: 0,
        sets: 1,
        reps: 10,    
        seconds: 10, 
        completed: false
      },
      {
        exerciseId: 'standing-tke',
        exerciseName: 'Standing TKE',
        exerciseType: 'time',
        order: 1,
        sets: 1,
        reps: 10,
        seconds: 5, 
        completed: false
      },
      {
        exerciseId: 'side-stepping',
        exerciseName: 'Side Stepping',
        exerciseType: 'distance',
        order: 2,
        sets: 3,     
        steps: 10,   
        completed: false
      },
      {
        exerciseId: 'straight-leg-raise',
        exerciseName: 'Straight Leg Raise',
        exerciseType: 'weight',
        order: 3,
        sets: 3,     
        reps: 10,      
        weight: 0,   
        completed: false
      },
      {
        exerciseId: 'bulgarian-split-squat',
        exerciseName: 'Bulgarian Split Squat',
        exerciseType: 'weight',
        order: 4,
        sets: 3, 
        reps: 10, 
        weight: 5,  
        completed: false
      }
    ];

    try {
      await assignProgram(userId, exercises, 120);
    } catch (error) {
      console.error(`Could not assign exercises:`, error);
    }

    try {
      const metricsRef = doc(db, 'userMetrics', userId);
      await setDoc(metricsRef, {
        userId,
        rangeOfMotion: [],
        strength: [],
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await updateRangeOfMotion(userId, 1, 45);
      await updateRangeOfMotion(userId, 2, 60);
      await updateStrength(userId, 1, 2);
      await updateStrength(userId, 2, 3); 
    } catch (error) {
      console.error(`Could not update metrics (permission issue):`, error);
    }

    try {
      await clearAllCheckIns(userId);
      await addCheckInData(userId, 1, creationDate, 21, 5.5, 3);
      await addCheckInData(userId, 2, month2Date, 22, 4.5, 2);
    } catch (error) {
      console.error(`Could not add check-in data (permission issue):`, error);
    }

    try {
      await resetAllGoals(userId);
      const goalsToUnlock = ['goal-1', 'goal-2', 'goal-3', 'goal-4', 'goal-5', 'goal-6', 'goal-8'];
      
      for (const goalId of goalsToUnlock) {
        await unlockGoal(userId, goalId);
      }
    } catch (error) {
      console.error(`Could not unlock goals (permission issue):`, error);
    }

    console.log(`Successfully initialized user ${userId} with demo data`);

    
  } catch (error) {
    console.error(`Error initializing user with demo data:`, error);
  }
}

function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function clearAllCheckIns(userId: string): Promise<void> {
  try {
    const checkInsRef = collection(db, 'users', userId, 'checkIns');
    const checkInsSnapshot = await getDocs(checkInsRef);
    
    for (const doc of checkInsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    console.log(`Cleared all check-ins for user ${userId}`);
  } catch (error) {
    console.error(`Error clearing check-ins for user ${userId}:`, error);
  }
}

async function unlockGoal(userId: string, goalId: string): Promise<void> {
  try {
    const goalRef = doc(db, `users/${userId}/goals/${goalId}`);
    const goalSnap = await getDoc(goalRef);
    
    if (!goalSnap.exists()) {
      console.warn(`Goal ${goalId} not found for user ${userId}`);
      return;
    }
    
    await updateDoc(goalRef, {
      unlocked: true,
      unlockedAt: getDateDaysAgo(5).toISOString()
    });
    
  } catch (error) {
    console.error(`Error unlocking goal ${goalId}:`, error);
  }
}

async function resetAllGoals(userId: string): Promise<void> {
  try {
    const userGoalsRef = collection(db, `users/${userId}/goals`);
    const userGoalsSnap = await getDocs(userGoalsRef);
    
    if (userGoalsSnap.empty) {
      console.warn(`No goals found for user ${userId}`);
      return;
    }
    
    for (const doc of userGoalsSnap.docs) {
      await updateDoc(doc.ref, {
        unlocked: false,
        unlockedAt: null
      });
    }
  } catch (error) {
    console.error(`Error resetting goals:`, error);
  }
}

async function addCheckInData(
  userId: string, 
  month: number, 
  monthStartDate: Date,
  checkInCount: number, 
  avgPain: number, 
  commonMoodLevel: number
): Promise<void> {
  try {
    const checkInsRef = collection(db, 'users', userId, 'checkIns');
    const startDate = new Date(monthStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    const existingCheckInsQuery = query(
      checkInsRef,
      where('timestamp', '>=', startDate),
      where('timestamp', '<', endDate)
    );
    const existingCheckIns = await getDocs(existingCheckInsQuery);

    for (const doc of existingCheckIns.docs) {
      await deleteDoc(doc.ref);
    }

    for (let i = 0; i < checkInCount; i++) {
      const dayOffset = Math.floor(i * (30 / checkInCount)) + 1;
      const checkInDate = new Date(startDate);
      checkInDate.setDate(checkInDate.getDate() + dayOffset);
      const painVariation = (Math.random() - 0.5) * 2; // -1 to +1
      const painLevel = Math.max(1, Math.min(10, Math.round(avgPain + painVariation)));
      const moodVariation = Math.random() < 0.7 ? 0 : (Math.random() < 0.5 ? -1 : 1);
      const moodLevel = Math.max(1, Math.min(5, commonMoodLevel + moodVariation));
      
      await addDoc(checkInsRef, {
        userId,
        timestamp: checkInDate,
        date: checkInDate.toISOString().split('T')[0],
        painLevel,
        moodLevel
      });
    }
  } catch (error) {
    console.error(`Error adding check-in data for month ${month}:`, error);
  }
}