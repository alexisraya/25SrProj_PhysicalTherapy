import { db } from '$lib/helpers/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

/* ---------------------- ACHIEVEMENT LIBRARY MANAGEMENT ---------------------- */
// Base achievement interface
interface BaseAchievement {
  achieveId: string;
  achieveName: string;
  achieveType: 'distance' | 'weight' | 'time';
  targetValue: number;
  targetUnits: 'steps' | 'lbs' | 'seconds';
}

// Distance-based achievements
interface DistanceAchievement extends BaseAchievement {
  achieveType: 'distance';
  targetUnit: 'steps';
}

// Weight-based achievements
interface WeightAchievement extends BaseAchievement {
  achieveType: 'weight';
  targetUnit: 'lbs';
}

// Time-based achievements
interface TimeAchievement extends BaseAchievement {
  achieveType: 'time';
  targetUnit: 'seconds';
}

export type Achievement = DistanceAchievement | WeightAchievement | TimeAchievement;

export function isDistanceAchievement(
  achievement: Achievement
): achievement is DistanceAchievement {
  return achievement.achieveType === 'distance';
}

export function isWeightAchievement(achievement: Achievement): achievement is WeightAchievement {
  return achievement.achieveType === 'weight';
}

export function isTimeAchievement(achievement: Achievement): achievement is TimeAchievement {
  return achievement.achieveType === 'time';
}

export function convertToAchievement(data: any): Achievement {
  const baseAchievement: BaseAchievement = {
    achieveId: data.achieveId,
    achieveName: data.achieveName,
    achieveType: data.achieveType,
    targetValue: data.targetValue,
    targetUnits: data.targetUnits,
  };

  switch (data.achieveType) {
    case 'distance':
      return {
        ...baseAchievement,
        achieveType: 'distance',
        targetUnits: 'steps',
      } as DistanceAchievement;
    case 'weight':
      return {
        ...baseAchievement,
        achieveType: 'weight',
        targetUnits: 'lbs',
      } as WeightAchievement;
    case 'time':
      return {
        ...baseAchievement,
        achieveType: 'time',
        targetUnits: 'seconds',
      } as TimeAchievement;
    default:
      throw new Error(`Invalid achievement type: ${data.achieveType}`);
  }
}

export async function getAllAchievementsFromLibrary(): Promise<Achievement[]> {
  try {
    const achievementsRef = collection(db, 'achievements');
    const snapshot = await getDocs(achievementsRef);
    return snapshot.docs.map((doc) => convertToAchievement(doc.data()));
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

export async function getAchievement(achieveId: string): Promise<Achievement | null> {
  try {
    const achievementRef = doc(db, 'achievements', achieveId);
    const snapshot = await getDoc(achievementRef);

    if (snapshot.exists()) {
      return convertToAchievement(snapshot.data());
    }
    return null;
  } catch (error) {
    console.error(`Error fetching achievement ${achieveId}:`, error);
    return null;
  }
}

export async function getAchievementsByType(
  type: 'distance' | 'weight' | 'time'
): Promise<Achievement[]> {
  try {
    const achievements = await getAllAchievementsFromLibrary();
    return achievements.filter((achievement) => achievement.achieveType === type);
  } catch (error) {
    console.error(`Error fetching achievements of type ${type}:`, error);
    return [];
  }
}
