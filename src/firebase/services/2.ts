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
    console.log(`🚀 Starting demo data initialization for user ${userId}`);
    const user = await getUser(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

    const today = new Date();
    
    // Set creation date to 65 days ago (Month 1 start) - extended from Run 2's 19 days
    const creationDate = new Date(today);
    creationDate.setDate(creationDate.getDate() - 65);
    creationDate.setHours(0, 0, 0, 0);
    
    // Month 2 started 35 days ago  
    const month2Date = new Date(creationDate);
    month2Date.setDate(month2Date.getDate() + 30);
    
    // Month 3 started 5 days ago
    const month3Date = new Date(today);
    month3Date.setDate(month3Date.getDate() - 5);
    month3Date.setHours(0, 0, 0, 0);
    
    // Calculate personal week start based on user's creation date (exactly like Run 2)
    const weekStartDate = getPersonalWeekStart(creationDate.toISOString(), today);
    console.log("Demo - Personal week start:", weekStartDate);
    
    const lastCompletion = new Date(today);
    lastCompletion.setDate(lastCompletion.getDate() - 1);
    
    // Update user creation and update timestamps
    try {
      await updateUser(userId, {
        createdAt: creationDate.toISOString(),
        updatedAt: today.toISOString()
      });
      console.log(`✅ Updated user timestamps for ${userId}`);
    } catch (error) {
      console.error(`⚠️ Could not update user timestamps:`, error);
    }

    // Generate realistic streak history (exactly like Run 2 pattern but extended)
    const streakHistory = [];

    // Previous weeks' history (same pattern as Run 2)
    for (let i = 60; i >= 5; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      // Use exact same completion logic as Run 2
      const completed = !(dayOfWeek === 0 || dayOfWeek === 6 || i % 7 === 3);
      streakHistory.push({
        date: date.toISOString(),
        completed
      });
    }

    // Current week: exactly 4 days completed (exactly like Run 2)
    for (let i = 4; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      streakHistory.push({
        date: date.toISOString(),
        completed: true
      });
    }
    
    // Set up user statistics (based on Run 2 pattern but with your specified numbers)
    const stats: UserStats = {
      currentStreak: 8, // Your specified streak count
      longestStreak: 8, // Your specified streak count
      lastCompletedDate: lastCompletion.toISOString(),
      weeklyProgress: {
        weekStartDate: weekStartDate, // Using the correct week start based on creation date (like Run 2)
        daysCompleted: 4, // IMPORTANT: 4 days completed out of 5 (exactly like Run 2)
        exercisesCompleted: 20 // 5 exercises per day for 4 days
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
          exercisesCompleted: 3, // Only 3 completed so far this month
          programsCompleted: 0
        }
      },
      // Your specified stats
      completedExercises: 96,
      completedPrograms: 30,
      totalSets: 192,
      totalReps: 954,
      totalWeight: 475, // lbs
      totalDistance: 5596.8, // 5596.8 feet as you specified
      totalTime: 1200, // seconds
      streakHistory,
      // Exactly 11 unlocked achievements as specified
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

    // Update user stats (this should work even if other operations fail)
    try {
      await updateUser(userId, { stats });
      console.log(`✅ Updated user stats for ${userId}`);
    } catch (error) {
      console.error(`⚠️ Could not update user stats:`, error);
    }

    // CRITICAL: Assign the EXACT 5 exercises you specified (use assignProgram like Run 2)
    const exercises: AssignedExercise[] = [
      {
        exerciseId: 'clamshell',
        exerciseName: 'Clamshell',
        exerciseType: 'time',
        order: 0,
        sets: 1,        // EXACTLY as you specified: 1 set
        reps: 10,       // EXACTLY as you specified: 10 reps
        seconds: 10,    // EXACTLY as you specified: 10 seconds
        completed: false
      },
      {
        exerciseId: 'standing-tke',
        exerciseName: 'Standing TKE',
        exerciseType: 'time',
        order: 1,
        sets: 1,        // EXACTLY as you specified: 1 set
        reps: 10,       // EXACTLY as you specified: 10 reps
        seconds: 5,     // EXACTLY as you specified: 5 seconds
        completed: false
      },
      {
        exerciseId: 'side-stepping',
        exerciseName: 'Side Stepping',
        exerciseType: 'distance',
        order: 2,
        sets: 3,        // EXACTLY as you specified: 3 sets
        steps: 10,      // EXACTLY as you specified: 10 steps/reps
        completed: false
      },
      {
        exerciseId: 'straight-leg-raise',
        exerciseName: 'Straight Leg Raise',
        exerciseType: 'weight',
        order: 3,
        sets: 3,        // EXACTLY as you specified: 3 sets
        reps: 10,       // EXACTLY as you specified: 10 reps
        weight: 0,      // EXACTLY as you specified: 0 lbs
        completed: false
      },
      {
        exerciseId: 'bulgarian-split-squat',
        exerciseName: 'Bulgarian Split Squat',
        exerciseType: 'weight',
        order: 4,
        sets: 3,        // EXACTLY as you specified: 3 sets
        reps: 10,       // EXACTLY as you specified: 10 reps
        weight: 5,      // EXACTLY as you specified: 5 lbs
        completed: false
      }
    ];

    // Use assignProgram instead of updateProgram (like the wizard does)
    try {
      await assignProgram(userId, exercises, 120);
      console.log(`✅ Assigned EXACTLY 5 exercises to user ${userId}: Clamshell (1x10, 10s), Standing TKE (1x10, 5s), Side Stepping (3x10 steps), Straight Leg Raise (3x10, 0lbs), Bulgarian Split Squat (3x10, 5lbs)`);
    } catch (error) {
      console.error(`⚠️ Could not assign exercises:`, error);
    }

    // Try to set up metrics (may fail due to permissions, but continue anyway)
    try {
      // Clear and set up user metrics (ensure clean setup like Run 2)
      const metricsRef = doc(db, 'userMetrics', userId);
      await setDoc(metricsRef, {
        userId,
        rangeOfMotion: [],
        strength: [],
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Set up range of motion and strength metrics for months 1-2 EXACTLY as you specified
      await updateRangeOfMotion(userId, 1, 45); // Month 1: 45 degrees (EXACTLY as you specified)
      await updateRangeOfMotion(userId, 2, 60); // Month 2: 60 degrees (EXACTLY as you specified)
      await updateStrength(userId, 1, 2); // Month 1: strength level 2 (EXACTLY as you specified)
      await updateStrength(userId, 2, 3); // Month 2: strength level 3 (EXACTLY as you specified)
      console.log(`✅ Updated user metrics for ${userId} - ROM: Month 1 = 45°, Month 2 = 60°; Strength: Month 1 = 2, Month 2 = 3`);
    } catch (error) {
      console.error(`⚠️ Could not update metrics (permission issue):`, error);
    }

    // Try to set up check-ins (may fail due to permissions, but continue anyway)
    try {
      await clearAllCheckIns(userId);
      await addCheckInData(userId, 1, creationDate, 21, 5.5, 3); // Month 1: same as Run 2
      await addCheckInData(userId, 2, month2Date, 22, 4.5, 2);   // Month 2: improved pain/mood
      console.log(`✅ Added check-in data for ${userId}`);
    } catch (error) {
      console.error(`⚠️ Could not add check-in data (permission issue):`, error);
    }

    // Try to set up goals (may fail due to permissions, but continue anyway)
    try {
      await resetAllGoals(userId);
      // EXACTLY as you specified: goal-1, goal-2, goal-3, goal-4, goal-5, goal-6, goal-8
      const goalsToUnlock = ['goal-1', 'goal-2', 'goal-3', 'goal-4', 'goal-5', 'goal-6', 'goal-8'];
      
      for (const goalId of goalsToUnlock) {
        await unlockGoal(userId, goalId);
      }
      console.log(`✅ Unlocked EXACTLY ${goalsToUnlock.length} goals for user ${userId}: ${goalsToUnlock.join(', ')}`);
    } catch (error) {
      console.error(`⚠️ Could not unlock goals (permission issue):`, error);
    }

    console.log(`🎉 Successfully initialized user ${userId} with demo data`);
    console.log("Demo setup complete with days completed:", stats.weeklyProgress.daysCompleted);
    
    // Print summary of what was set up
    console.log(`📊 DEMO DATA SUMMARY FOR ${userId}:`);
    console.log(`   - Streak: ${stats.currentStreak} weeks`);
    console.log(`   - Weekly Progress: ${stats.weeklyProgress.daysCompleted}/5 days`);
    console.log(`   - Total Distance: ${stats.totalDistance} feet`);
    console.log(`   - Exercises Assigned: ${exercises.length}`);
    console.log(`   - Goals Unlocked: 7 (goal-1, goal-2, goal-3, goal-4, goal-5, goal-6, goal-8)`);
    console.log(`   - Strength: Month 1 = 2, Month 2 = 3`);
    console.log(`   - ROM: Month 1 = 45°, Month 2 = 60°`);
    console.log(`   - Check-ins: Month 1 = 21, Month 2 = 22`);
    
  } catch (error) {
    console.error(`❌ Error initializing user with demo data:`, error);
    // Don't throw - we want signup to succeed even if demo data fails
  }
}

// Helper function to get a date N days ago
function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Clear all existing check-ins for clean demo data (exactly like Run 2)
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

// Unlock a specific goal (exactly like Run 2)
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

// Reset all goals to locked state (exactly like Run 2)
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

// Add realistic check-in data for demo purposes (exactly like Run 2)
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

    // Remove any existing check-ins in this time period
    const existingCheckInsQuery = query(
      checkInsRef,
      where('timestamp', '>=', startDate),
      where('timestamp', '<', endDate)
    );
    const existingCheckIns = await getDocs(existingCheckInsQuery);

    for (const doc of existingCheckIns.docs) {
      await deleteDoc(doc.ref);
    }

    // Generate realistic check-in data spread throughout the month (exactly like Run 2)
    for (let i = 0; i < checkInCount; i++) {
      const dayOffset = Math.floor(i * (30 / checkInCount)) + 1;
      const checkInDate = new Date(startDate);
      checkInDate.setDate(checkInDate.getDate() + dayOffset);
      
      // Add realistic variation to pain and mood levels (same as Run 2)
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