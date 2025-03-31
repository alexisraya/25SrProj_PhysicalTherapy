import { db } from '$lib/helpers/firebase';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { getAllAchievementsFromLibrary } from './achieveService';
import { getUserStats } from './statService';
import { updateUser } from './userService';
import type { User, UserStats } from '../types/userType';

/* ---------------------- GOAL TO USER (Might need to fix...) ---------------------- */
interface Goal {
  goalId: string;
  goalName: string;
  description: string;
  month: number;
  timeframe: string;
  unlocked: boolean;
}

export async function assignGoalsToUser(userId: string): Promise<void> {
  if (userId === 'mY8JFfhiJvdFm54wG57ALJmVYit2') {
    console.warn('Attempted to assign goals to therapist ID - operation aborted');
    return;
  }

  try {
    console.log(`Starting goal assignment for user ${userId}`);

    const goalsRef = collection(db, 'goals');
    const snapshot = await getDocs(goalsRef);

    if (snapshot.empty) {
      console.error('No goals found in the global goal library!');
      return;
    }

    console.log(`Found ${snapshot.docs.length} goals in global library`);

    const userGoalsRef = collection(db, `users/${userId}/goals`);

    const userGoalsSnap = await getDocs(userGoalsRef);
    const existingGoalIds = new Set(userGoalsSnap.docs.map((doc) => doc.id));

    console.log(`User has ${existingGoalIds.size} existing goals`);

    let assignedCount = 0;
    let errors = 0;

    for (const goalDoc of snapshot.docs) {
      try {
        const goalId = goalDoc.id;
        const goalData = goalDoc.data();

        if (existingGoalIds.has(goalId)) {
          console.log(`Goal ${goalId} already assigned to user ${userId}, skipping`);
          continue;
        }

        const userGoalRef = doc(userGoalsRef, goalId);

        await setDoc(userGoalRef, {
          ...goalData,
          goalId: goalId,
          unlocked: false,
        });

        console.log(`Assigned goal ${goalId} to user ${userId}`);
        assignedCount++;
      } catch (err) {
        console.error(`Error assigning goal ${goalDoc.id}:`, err);
        errors++;
      }
    }

    console.log(`Assignment complete: ${assignedCount} goals assigned, ${errors} errors`);
  } catch (error) {
    console.error('Error assigning goals to user:', error);
    throw error;
  }
}

export async function getUserGoals(userId: string): Promise<Record<string, Goal[]>> {
  try {
    console.log(`Fetching goals for user ${userId}`);
    const userGoalsRef = collection(db, `users/${userId}/goals`);
    const userGoalsSnap = await getDocs(userGoalsRef);

    console.log(`Found ${userGoalsSnap.docs.length} goal documents for user ${userId}`);

    if (userGoalsSnap.empty) {
      console.warn(`No goals found for user ${userId}`);
      return {};
    }

    const sortedGoals: Record<string, Goal[]> = {};
    userGoalsSnap.docs.forEach((goalDoc) => {
      const goalData = goalDoc.data();
      console.log(`Processing goal ${goalDoc.id}:`, goalData);

      const month = (goalData.month || '1').toString();

      if (!sortedGoals[month]) {
        sortedGoals[month] = [];
      }

      sortedGoals[month].push({
        ...goalData,
        goalId: goalDoc.id,
        month: parseInt(month),
        unlocked: !!goalData.unlocked,
      } as Goal);
    });

    console.log('Sorted goals by month:', Object.keys(sortedGoals));
    return sortedGoals;
  } catch (error) {
    console.error(`Error fetching user goals for ${userId}:`, error);
    return {};
  }
}

export async function updateGoalLockStatus(
  userId: string,
  goalId: string,
  unlocked: boolean
): Promise<void> {
  try {
    console.log(
      `Updating goal ${goalId} for user ${userId} to ${unlocked ? 'unlocked' : 'locked'}`
    );
    const userGoalRef = doc(db, `users/${userId}/goals/${goalId}`);
    const userGoalSnap = await getDoc(userGoalRef);

    if (!userGoalSnap.exists()) {
      console.error(`Goal ${goalId} not found for user ${userId}`);
      throw new Error(`Goal ${goalId} not found for user ${userId}.`);
    }

    await updateDoc(userGoalRef, { unlocked });
    console.log(
      `Therapist updated goal ${goalId} for user ${userId}: ${unlocked ? 'Unlocked' : 'Locked'}`
    );
  } catch (error) {
    console.error('Error updating goal lock status:', error);
    throw error;
  }
}

/* ---------------------- ACHIEVEMENT TO USER ---------------------- */
export async function initializeUserAchievements(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const userData = userSnap.data() as User;

    if (!userData.stats.achievements) {
      userData.stats.achievements = {};
      await updateDoc(userRef, { 'stats.achievements': {} });
    }
  } catch (error) {
    console.error(`Error initializing achievements for user ${userId}:`, error);
  }
}

export async function checkAchievements(userId: string): Promise<string[]> {
  try {
    const [stats, allAchievements] = await Promise.all([
      getUserStats(userId),
      getAllAchievementsFromLibrary(),
    ]);

    if (!stats) return [];

    if (!stats.achievements) {
      stats.achievements = {};
      await initializeUserAchievements(userId);
    }

    const newlyUnlocked: string[] = [];
    const achievementsToUpdate = { ...stats.achievements };

    for (const achievement of allAchievements) {
      if (achievementsToUpdate[achievement.achieveId]?.unlocked) continue;

      let isUnlocked = false;

      switch (achievement.achieveType) {
        case 'distance':
          isUnlocked = stats.totalDistance >= achievement.targetValue;
          break;
        case 'weight':
          isUnlocked = stats.totalWeight >= achievement.targetValue;
          break;
        case 'time':
          isUnlocked = stats.totalTime >= achievement.targetValue;
          break;
      }

      if (isUnlocked) {
        achievementsToUpdate[achievement.achieveId] = {
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };
        newlyUnlocked.push(achievement.achieveId);
        console.log(`User ${userId} unlocked achievement: ${achievement.achieveName}`);
      } else if (!achievementsToUpdate[achievement.achieveId]) {
        achievementsToUpdate[achievement.achieveId] = {
          unlocked: false,
        };
      }
    }

    // Only update if there are changes
    if (
      newlyUnlocked.length > 0 ||
      Object.keys(achievementsToUpdate).length !== Object.keys(stats.achievements).length
    ) {
      await updateUser(userId, {
        stats: {
          ...stats,
          achievements: achievementsToUpdate,
        },
      });

      console.log(
        `Updated achievements for user ${userId}, newly unlocked: ${newlyUnlocked.length}`
      );
    }

    return newlyUnlocked;
  } catch (error) {
    console.error(`Error checking achievements for user ${userId}:`, error);
    return [];
  }
}

export async function getUserAchievements(userId: string): Promise<{
  unlocked: string[];
  locked: string[];
  total: number;
  progress: number;
}> {
  try {
    const [stats, allAchievements] = await Promise.all([
      getUserStats(userId),
      getAllAchievementsFromLibrary(),
    ]);

    if (!stats || !stats.achievements) {
      return {
        unlocked: [],
        locked: allAchievements.map((a) => a.achieveId),
        total: allAchievements.length,
        progress: 0,
      };
    }

    const unlocked: string[] = [];
    const locked: string[] = [];

    for (const achievement of allAchievements) {
      if (stats.achievements[achievement.achieveId]?.unlocked) {
        unlocked.push(achievement.achieveId);
      } else {
        locked.push(achievement.achieveId);
      }
    }

    return {
      unlocked,
      locked,
      total: allAchievements.length,
      progress: Math.round((unlocked.length / allAchievements.length) * 100),
    };
  } catch (error) {
    console.error(`Error getting achievements for user ${userId}:`, error);
    return { unlocked: [], locked: [], total: 0, progress: 0 };
  }
}
