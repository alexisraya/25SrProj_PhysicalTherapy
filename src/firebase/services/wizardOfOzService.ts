import { db } from '$lib/helpers/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { getUser, updateUser } from './userService';
import { getCurrentProgram, updateProgram } from './programService';
import { updateRangeOfMotion, updateStrength } from './metricsService';
import type { User, UserStats, AssignedExercise } from '../types/userType';

// Test scenarios for Wizard of Oz testing
export enum WizardScenario {
  // MONTH 1, WEEK 1, DAY 1 (baseline)
  RUN_1_BASELINE = 'run_1_baseline',
  
  // MONTH 1, WEEK 3, DAY 5 (before completing program)
  RUN_2_PRE_COMPLETION = 'run_2_pre_completion',
  
  // MONTH 3, WEEK 1, DAY 1 (after completing program)
  RUN_3_POST_COMPLETION = 'run_3_post_completion'
}

export async function applyWizardScenario(
  userId: string, 
  scenario: WizardScenario
): Promise<boolean> {
  try {
    const user = await getUser(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return false;
    }

    switch (scenario) {
      case WizardScenario.RUN_1_BASELINE:
        await applyRun1Scenario(userId, user);
        break;
      
      case WizardScenario.RUN_2_PRE_COMPLETION:
        await applyRun2Scenario(userId, user);
        break;
      
      case WizardScenario.RUN_3_POST_COMPLETION:
        await applyRun3Scenario(userId, user);
        break;
      
      default:
        console.error(`Unknown scenario: ${scenario}`);
        return false;
    }

    return true;
  } catch (error) {
    console.error(`Error applying wizard scenario ${scenario} to user ${userId}:`, error);
    return false;
  }
}

/**
 * Run 1: MONTH 1, WEEK 1, DAY 1 (baseline)
 * Fresh start with no history
 */
async function applyRun1Scenario(userId: string, user: User): Promise<void> {
  const today = new Date();
  const creationDate = new Date(today);
  creationDate.setHours(0, 0, 0, 0);
  
  await updateUser(userId, {
    createdAt: creationDate.toISOString(),
    updatedAt: today.toISOString()
  });

  // Reset stats to initial values
  const stats: UserStats = {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    weeklyProgress: {
      weekStartDate: getWeekStartDate(creationDate),
      daysCompleted: 0,
      exercisesCompleted: 0
    },
    monthlyProgress: {
      [today.toISOString().substring(0, 7)]: {
        month: 1,
        exercisesCompleted: 0,
        programsCompleted: 0
      }
    },
    completedExercises: 0,
    completedPrograms: 0,
    totalSets: 0,
    totalReps: 0,
    totalWeight: 0,
    totalDistance: 0,
    totalTime: 0,
    streakHistory: [],
    achievements: {}
  };

  await clearAllCheckIns(userId);
  const metricsRef = doc(db, 'userMetrics', userId);
  await setDoc(metricsRef, {
    userId,
    rangeOfMotion: [],
    strength: [],
    updatedAt: new Date().toISOString()
  }, { merge: true });

  await updateUser(userId, { stats });
  await updateRangeOfMotion(userId, 1, 60);
  await updateStrength(userId, 1, 2);

  const exercises: AssignedExercise[] = [
    {
      exerciseId: 'quad-set',
      exerciseName: 'Quad Set',
      exerciseType: 'time',
      order: 0,
      sets: 1,
      reps: 10,
      seconds: 10,
      completed: false,
    },
    {
      exerciseId: 'heel-slide',
      exerciseName: 'Heel Slide',
      exerciseType: 'time',
      order: 1,
      sets: 3,
      reps: 10,
      seconds: 10,
      completed: false,
    },
    {
      exerciseId: 'straight-leg-raise',
      exerciseName: 'Straight Leg Raise',
      exerciseType: 'weight',
      order: 2,
      sets: 3,
      reps: 10,
      weight: 3,
      completed: false
    }
  ];

  await updateProgram(userId, {
    exercises,
    completed: false,
    assignedAt: today.toISOString(),
    estimatedTime: 75
  });

  // Reset all goals to locked
  await resetAllGoals(userId);
}

/**
 * Run 2: MONTH 1, WEEK 3, DAY 5 (before completing program)
 */
async function applyRun2Scenario(userId: string, user: User): Promise<void> {
  // Date setup remains the same
  const today = new Date();
  const creationDate = new Date(today);
  creationDate.setDate(creationDate.getDate() - 19);
  creationDate.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 5);
  weekStart.setHours(0, 0, 0, 0);
  
  const lastCompletion = new Date(today);
  lastCompletion.setDate(lastCompletion.getDate() - 1);
  
  await updateUser(userId, {
    createdAt: creationDate.toISOString(),
    updatedAt: today.toISOString()
  });

  const streakHistory = [];
  
  // Previous weeks' history
  for (let i = 18; i >= 6; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const completed = !(dayOfWeek === 0 || dayOfWeek === 6 || i % 7 === 3);
    streakHistory.push({
      date: date.toISOString(),
      completed
    });
  }
  
  // Current week (4 days completed)
  for (let i = 5; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    streakHistory.push({
      date: date.toISOString(),
      completed: true
    });
  }

  const stats: UserStats = {
    currentStreak: 2,
    longestStreak: 2,
    lastCompletedDate: lastCompletion.toISOString(),
    weeklyProgress: {
      weekStartDate: getWeekStartDate(weekStart),
      daysCompleted: 4,
      exercisesCompleted: 12
    },
    monthlyProgress: {
      [creationDate.toISOString().substring(0, 7)]: {
        month: 1,
        exercisesCompleted: 42,
        programsCompleted: 14
      }
    },
    completedExercises: 42,
    completedPrograms: 14,
    totalSets: 75, 
    totalReps: 750,
    totalWeight: 250,
    totalDistance: 0, 
    totalTime: 1080, 
    streakHistory,
    achievements: {
      "time-1": { unlocked: true, unlockedAt: getDateDaysAgo(15).toISOString() },
      "time-2": { unlocked: true, unlockedAt: getDateDaysAgo(13).toISOString() },
      "time-3": { unlocked: true, unlockedAt: getDateDaysAgo(10).toISOString() },
      "time-4": { unlocked: true, unlockedAt: getDateDaysAgo(8).toISOString() },
      "time-5": { unlocked: true, unlockedAt: getDateDaysAgo(5).toISOString() },
      "weight-1": { unlocked: true, unlockedAt: getDateDaysAgo(12).toISOString() },
      "weight-2": { unlocked: true, unlockedAt: getDateDaysAgo(7).toISOString() }
    }
  };

  await clearAllCheckIns(userId);
  await addCheckInData(userId, 1, creationDate, 21, 5.5, 3);

  await updateUser(userId, { stats });
  await updateRangeOfMotion(userId, 1, 72);
  await updateStrength(userId, 1, 3);

  const exercises: AssignedExercise[] = [
    {
      exerciseId: 'bridge',
      exerciseName: 'Bridge',
      exerciseType: 'time',
      order: 0,
      sets: 1,
      reps: 10,
      seconds: 10,
      completed: false
    },
    {
      exerciseId: 'clamshell',
      exerciseName: 'Clamshell',
      exerciseType: 'time',
      order: 1,
      sets: 1,
      reps: 10,
      seconds: 10,
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
    }
  ];

  await updateProgram(userId, {
    exercises,
    completed: false,
    assignedAt: today.toISOString(),
    estimatedTime: 75
  });

  await resetAllGoals(userId);
  await unlockGoal(userId, 'goal-1');
}

/**
 * Run 3: MONTH 3, WEEK 1, DAY 1 (after completing program)
 */
async function applyRun3Scenario(userId: string, user: User): Promise<void> {
  const today = new Date();
  
  // Set creation date to about 2 months ago
  const creationDate = new Date(today);
  creationDate.setDate(creationDate.getDate() - 61);
  creationDate.setHours(0, 0, 0, 0);
  
  // Month 2 started 30 days ago
  const month2Date = new Date(creationDate);
  month2Date.setDate(month2Date.getDate() + 30);
  
  // Month 3 starts today
  const month3Date = new Date(today);
  month3Date.setHours(0, 0, 0, 0);
  
  const weekStart = getWeekStartDate(today);
  
  // Program was completed already
  const completionTime = new Date(today);
  completionTime.setHours(today.getHours() - 2);
  
  await updateUser(userId, {
    createdAt: creationDate.toISOString(),
    updatedAt: today.toISOString()
  });

  const streakHistory = [];
  
  for (let i = 60; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayOfWeek = date.getDay();
    let completed = true;
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      completed = Math.random() < 0.3;
    } else {
      completed = Math.random() < 0.85;
    }
    
    streakHistory.push({
      date: date.toISOString(),
      completed
    });
  }

  streakHistory.push({
    date: completionTime.toISOString(),
    completed: true
  });

  const stats: UserStats = {
    currentStreak: 8,
    longestStreak: 8,
    lastCompletedDate: completionTime.toISOString(),
    weeklyProgress: {
      weekStartDate: weekStart,
      daysCompleted: 1,
      exercisesCompleted: 3
    },
    monthlyProgress: {
      [creationDate.toISOString().substring(0, 7)]: {
        month: 1,
        exercisesCompleted: 63,
        programsCompleted: 21
      },
      [month2Date.toISOString().substring(0, 7)]: {
        month: 2,
        exercisesCompleted: 66,
        programsCompleted: 22
      },
      [month3Date.toISOString().substring(0, 7)]: {
        month: 3,
        exercisesCompleted: 3,
        programsCompleted: 1
      }
    },
    completedExercises: 123,
    completedPrograms: 41,
    totalSets: 207,
    totalReps: 2070,
    totalWeight: 700,
    totalDistance: 320,
    totalTime: 1370,
    streakHistory,
    achievements: {
      // All unlocked achievements
      "time-1": { unlocked: true, unlockedAt: getDateDaysAgo(60).toISOString() },
      "time-2": { unlocked: true, unlockedAt: getDateDaysAgo(58).toISOString() },
      "time-3": { unlocked: true, unlockedAt: getDateDaysAgo(55).toISOString() },
      "time-4": { unlocked: true, unlockedAt: getDateDaysAgo(50).toISOString() },
      "time-5": { unlocked: true, unlockedAt: getDateDaysAgo(45).toISOString() },
      "time-6": { unlocked: true, unlockedAt: getDateDaysAgo(30).toISOString() },
      "weight-1": { unlocked: true, unlockedAt: getDateDaysAgo(57).toISOString() },
      "weight-2": { unlocked: true, unlockedAt: getDateDaysAgo(48).toISOString() },
      "weight-3": { unlocked: true, unlockedAt: getDateDaysAgo(25).toISOString() },
      "distance-1": { unlocked: true, unlockedAt: getDateDaysAgo(40).toISOString() },
      "distance-2": { unlocked: true, unlockedAt: getDateDaysAgo(35).toISOString() },
      "distance-3": { unlocked: true, unlockedAt: getDateDaysAgo(20).toISOString() }
    }
  };

  await updateUser(userId, { stats });

  // Month 1
  await updateRangeOfMotion(userId, 1, 65);
  await updateStrength(userId, 1, 2);
  
  // Month 2
  await updateRangeOfMotion(userId, 2, 82);
  await updateStrength(userId, 2, 3);
  
  // Month 3 (current)
  await updateRangeOfMotion(userId, 3, 95);
  await updateStrength(userId, 3, 4);

  const exercises: AssignedExercise[] = [
    {
      exerciseId: 'standing-tke',
      exerciseName: 'Standing TKE',
      exerciseType: 'time',
      order: 0,
      sets: 1,
      reps: 10,
      seconds: 5,
      completed: true,
      completedAt: completionTime.toISOString()
    },
    {
      exerciseId: 'monster-walk',
      exerciseName: 'Monster Walk',
      exerciseType: 'distance',
      order: 1,
      sets: 3,
      steps: 10,
      completed: true,
      completedAt: completionTime.toISOString()
    },
    {
      exerciseId: 'side-stepping',
      exerciseName: 'Side Stepping',
      exerciseType: 'distance',
      order: 2,
      sets: 3,
      steps: 10,
      completed: true,
      completedAt: completionTime.toISOString()
    }
  ];

  await updateProgram(userId, {
    exercises,
    completed: true,
    assignedAt: today.toISOString(),
    updatedAt: completionTime.toISOString(),
    estimatedTime: 75
  });

  // Reset goals and unlock the specified ones
  await resetAllGoals(userId);
  const goalsToUnlock = ['goal-1', 'goal-2', 'goal-3', 'goal-4', 'goal-5', 'goal-6', 'goal-7', 'goal-8', 'goal-9', 'goal-10'];
  
  for (const goalId of goalsToUnlock) {
    await unlockGoal(userId, goalId);
  }

  await addCheckInData(userId, 1, creationDate, 21, 5.5, 3);
  await addCheckInData(userId, 2, month2Date, 22, 4.5, 2);
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

// Helper function: unlock a specific goal
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

/**
 * Helper function to unlock goals for a specific month
 */
async function unlockGoalsForMonth(userId: string, month: number, count: number): Promise<void> {
  try {
    const userGoalsRef = collection(db, `users/${userId}/goals`);
    const userGoalsSnap = await getDocs(userGoalsRef);
    
    if (userGoalsSnap.empty) {
      console.warn(`No goals found for user ${userId}`);
      return;
    }
    
    // Filter goals for month
    const monthGoals = userGoalsSnap.docs
      .filter(doc => doc.data().month === month)
      .map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (monthGoals.length === 0) {
      console.warn(`No goals found for month ${month}`);
      return;
    }

    const unlockDate = new Date();
    if (month < 3) {
      unlockDate.setDate(unlockDate.getDate() - (3 - month) * 30 + 15);
    } else {
      unlockDate.setDate(unlockDate.getDate() - 2);
    }
    
    const goalsToUnlock = monthGoals.slice(0, Math.min(count, monthGoals.length));
    
    for (const goal of goalsToUnlock) {
      await updateDoc(doc(db, `users/${userId}/goals/${goal.id}`), {
        unlocked: true,
        unlockedAt: unlockDate.toISOString()
      });
    }

  } catch (error) {
    console.error(`Error unlocking goals for month ${month}:`, error);
  }
}

/**
 * Add check-in data for a specific month
 */
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

/**
 * Reset all goals to locked state
 */
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

/**
 * Helper function to get a date N days ago
 */
function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Helper function to get the week start date (Sunday)
 */
function getWeekStartDate(date: Date = new Date()): string {
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  sunday.setHours(0, 0, 0, 0);
  return sunday.toISOString();
}