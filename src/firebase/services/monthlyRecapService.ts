import { db } from '$lib/helpers/firebase';
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { User, UserStats, UserMetrics, RangeOfMotion, Strength } from '../types/userType';
import type { CheckIn } from '../types/checkInType';
import { getMoodDescription } from '../types/checkInType';
import { getUser } from './userService';
import { getUserMetrics } from './metricsService';
import { getUserGoals } from './milestoneService';
import { getAllAchievementsFromLibrary } from './achieveService';

export interface MonthlyRecap {
  userId: string;
  monthNumber: number;
  startDate: string;
  endDate: string;

  achievements: {
    count: number;
    unlocked: Array<{ id: string; name: string; unlockedAt: string }>;
  };

  checkIns: {
    painAverage: number;
    painChange: number | null;
    commonMood: string;
    moodChange: string | null;
    count: number;
  };

  metrics: {
    rangeOfMotion: {
      value: number | null;
      change: number | null;
    };
    strength: {
      value: number | null;
      change: number | null;
    };
  };

  progress: {
    exercisesCompleted: number;
    programsCompleted: number;
  };

  goals: {
    count: number;
    unlocked: Array<{ id: string; name: string; unlockedAt: string }>;
  };
}

/**
 * Monthly recap data for a specific month
 * Month is 1-based (month 1, month 2, etc.)
 */
export async function getMonthlyRecap(userId: string, month: number): Promise<MonthlyRecap | null> {
  try {
    const user = await getUser(userId);
    if (!user) return null;

    const { startDate, endDate } = calculateMonthDateRange(user.createdAt, month);

    const [achievementsData, checkInsData, metricsData, goalsData] = await Promise.all([
      getAchievementsData(userId, startDate, endDate, month),
      getCheckInsData(userId, startDate, endDate, month),
      getMetricsData(userId, month),
      getGoalsData(userId, startDate, endDate, month)
    ]);

    const progressData = getProgressData(user.stats, startDate, endDate, month);

    const recap: MonthlyRecap = {
      userId,
      monthNumber: month,
      startDate,
      endDate,
      achievements: achievementsData,
      checkIns: checkInsData,
      metrics: metricsData,
      progress: progressData,
      goals: goalsData
    };

    return recap;
  } catch (error) {
    console.error(`Error getting monthly recap for user ${userId}, month ${month}:`, error);
    return null;
  }
}

/**
 * Monthly recaps for all months since user creation
 * Returns an array of monthly recaps, with null values for months with no data
 */
export async function getAllMonthlyRecaps(
  userId: string,
  maxMonths: number = 5
): Promise<(MonthlyRecap | null)[]> {
  try {
    const user = await getUser(userId);
    if (!user) return [];

    const creationDate = new Date(user.createdAt);
    const today = new Date();

    const monthsPassed = calculateMonthsPassed(creationDate, today);
    const monthsToFetch = Math.min(monthsPassed, maxMonths);

    const recapPromises = [];
    for (let i = 1; i <= monthsToFetch; i++) {
      recapPromises.push(getMonthlyRecap(userId, i));
    }

    return await Promise.all(recapPromises);
  } catch (error) {
    console.error(`Error getting all monthly recaps for user ${userId}:`, error);
    return [];
  }
}

// Helper: calculate date range for a specific month
function calculateMonthDateRange(
  creationDateStr: string,
  month: number
): { startDate: string; endDate: string } {
  const creationDate = new Date(creationDateStr);

  const startDate = new Date(creationDate);
  startDate.setDate(startDate.getDate() + (month - 1) * 30);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
}

// HelperL calculate months passed between two dates
function calculateMonthsPassed(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 30);
}

// Helper: get achievement
async function getAchievementsData(
  userId: string,
  startDate: string,
  endDate: string,
  month: number
): Promise<MonthlyRecap['achievements']> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { count: 0, unlocked: [] };
    }

    const userData = userSnap.data() as User;
    const achievements = userData.stats.achievements || {};

    const allAchievements = await getAllAchievementsFromLibrary();
    const achievementNames = Object.fromEntries(
      allAchievements.map((a) => [a.achieveId, a.achieveName])
    );

    const unlocked = Object.entries(achievements)
      .filter(([_, achievement]) => {
        if (!achievement.unlocked || !achievement.unlockedAt) return false;

        const unlockedDate = new Date(achievement.unlockedAt);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return unlockedDate >= start && unlockedDate < end;
      })
      .map(([id, achievement]) => ({
        id,
        name: achievementNames[id] || id,
        unlockedAt: achievement.unlockedAt as string
      }));

    return {
      count: unlocked.length,
      unlocked
    };
  } catch (error) {
    console.error(`Error fetching achievements for user ${userId}:`, error);
    return { count: 0, unlocked: [] };
  }
}

// Helper: get check-in data for a month
async function getCheckInsData(
  userId: string,
  startDate: string,
  endDate: string,
  month: number
): Promise<MonthlyRecap['checkIns']> {
  try {
    const checkInsRef = collection(db, 'users', userId, 'checkIns');
    const currentMonthQuery = query(
      checkInsRef,
      where('timestamp', '>=', new Date(startDate)),
      where('timestamp', '<', new Date(endDate)),
      orderBy('timestamp')
    );

    const currentMonthSnap = await getDocs(currentMonthQuery);
    const currentMonthCheckIns = currentMonthSnap.docs.map((doc) => doc.data() as CheckIn);

    // Pain Average
    const painSum = currentMonthCheckIns.reduce((sum, checkIn) => sum + checkIn.painLevel, 0);
    const painAverage = currentMonthCheckIns.length > 0 ? painSum / currentMonthCheckIns.length : 0;

    // Common Mood
    const moodCounts = new Map<number, number>();
    currentMonthCheckIns.forEach((checkIn) => {
      const count = moodCounts.get(checkIn.moodLevel) || 0;
      moodCounts.set(checkIn.moodLevel, count + 1);
    });

    let commonMoodValue = 0;
    let maxCount = 0;

    moodCounts.forEach((count, mood) => {
      if (count > maxCount) {
        maxCount = count;
        commonMoodValue = mood;
      }
    });

    const commonMood = commonMoodValue ? getMoodDescription(commonMoodValue) : 'No data';

    // Get previous month data for comparison
    let painChange = null;
    let moodChange = null;

    if (month > 1) {
      const prevMonthRange = calculateMonthDateRange(startDate, month - 1);
      const prevMonthQuery = query(
        checkInsRef,
        where('timestamp', '>=', new Date(prevMonthRange.startDate)),
        where('timestamp', '<', new Date(prevMonthRange.endDate)),
        orderBy('timestamp')
      );

      const prevMonthSnap = await getDocs(prevMonthQuery);
      const prevMonthCheckIns = prevMonthSnap.docs.map((doc) => doc.data() as CheckIn);

      // Previous month's pain average
      if (prevMonthCheckIns.length > 0) {
        const prevPainSum = prevMonthCheckIns.reduce((sum, checkIn) => sum + checkIn.painLevel, 0);
        const prevPainAverage = prevPainSum / prevMonthCheckIns.length;

        // Calculate percentage change
        if (prevPainAverage > 0) {
          painChange = ((painAverage - prevPainAverage) / prevPainAverage) * 100;
        }

        // Previous month's common mood
        const prevMoodCounts = new Map<number, number>();
        prevMonthCheckIns.forEach((checkIn) => {
          const count = prevMoodCounts.get(checkIn.moodLevel) || 0;
          prevMoodCounts.set(checkIn.moodLevel, count + 1);
        });

        let prevCommonMoodValue = 0;
        let prevMaxCount = 0;

        prevMoodCounts.forEach((count, mood) => {
          if (count > prevMaxCount) {
            prevMaxCount = count;
            prevCommonMoodValue = mood;
          }
        });

        if (prevCommonMoodValue) {
          moodChange = getMoodDescription(prevCommonMoodValue);
        }
      }
    }

    return {
      painAverage,
      painChange,
      commonMood,
      moodChange,
      count: currentMonthCheckIns.length
    };
  } catch (error) {
    console.error(`Error fetching check-ins for user ${userId}:`, error);
    return {
      painAverage: 0,
      painChange: null,
      commonMood: 'No data',
      moodChange: null,
      count: 0
    };
  }
}

// Helper: get metrics data for current month
async function getMetricsData(userId: string, month: number): Promise<MonthlyRecap['metrics']> {
  try {
    const metrics = await getUserMetrics(userId);

    if (!metrics) {
      return {
        rangeOfMotion: { value: null, change: null },
        strength: { value: null, change: null }
      };
    }

    const currentROM = metrics.rangeOfMotion.find((rom) => rom.month === month);
    const prevROM = month > 1 ? metrics.rangeOfMotion.find((rom) => rom.month === month - 1) : null;

    const romValue = currentROM ? currentROM.degrees : null;
    const romChange = currentROM && prevROM ? currentROM.degrees - prevROM.degrees : null;

    const currentStrength = metrics.strength.find((str) => str.month === month);
    const prevStrength = month > 1 ? metrics.strength.find((str) => str.month === month - 1) : null;

    const strengthValue = currentStrength ? currentStrength.strengthScale : null;
    const strengthChange =
      currentStrength && prevStrength
        ? currentStrength.strengthScale - prevStrength.strengthScale
        : null;

    return {
      rangeOfMotion: { value: romValue, change: romChange },
      strength: { value: strengthValue, change: strengthChange }
    };
  } catch (error) {
    console.error(`Error fetching metrics for user ${userId}:`, error);
    return {
      rangeOfMotion: { value: null, change: null },
      strength: { value: null, change: null }
    };
  }
}

// Helper: get progress data for current month
function getProgressData(
  stats: UserStats,
  startDate: string,
  endDate: string,
  month: number
): MonthlyRecap['progress'] {
  try {
    if (stats.monthlyProgress) {
      for (const [key, progress] of Object.entries(stats.monthlyProgress)) {
        if (progress.month === month) {
          return {
            exercisesCompleted: progress.exercisesCompleted,
            programsCompleted: progress.programsCompleted
          };
        }
      }
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const completions = stats.streakHistory.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entry.completed && entryDate >= start && entryDate < end;
    });

    return {
      exercisesCompleted: completions.length * 3,
      programsCompleted: completions.length
    };
  } catch (error) {
    console.error(`Error calculating progress data:`, error);
    return {
      exercisesCompleted: 0,
      programsCompleted: 0
    };
  }
}

// Helper: get goals data for current month
async function getGoalsData(
  userId: string,
  startDate: string,
  endDate: string,
  month: number
): Promise<MonthlyRecap['goals']> {
  try {
    const patientGoals = await getUserGoals(userId);

    const monthGoals = patientGoals[month.toString()] || [];

    // Filter unlocked goals
    const unlocked = monthGoals
      .filter((goal) => goal.unlocked)
      .map((goal) => ({
        id: goal.goalId,
        name: goal.goalName,
        unlockedAt: goal.unlockedAt || new Date().toISOString()
      }));

    return {
      count: unlocked.length,
      unlocked
    };
  } catch (error) {
    console.error(`Error fetching goals for user ${userId}:`, error);
    return {
      count: 0,
      unlocked: []
    };
  }
}
