import { db } from "$lib/helpers/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

// Base achievement interface with common fields
interface BaseAchievement {
    achieveId: string;
    achieveName: string;
    description: string;
    achieveType: 'distance' | 'weight' | 'time';
    targetValue: number;
    targetUnits: 'steps' | 'lbs' | 'seconds'
}
// NOTE: Probably put a conversion function here to convert raw data from firestore

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

export function isDistanceAchievement(achievement: Achievement): achievement is DistanceAchievement {
    return achievement.achieveType === 'distance';
}

export function isWeightAchievement(achievement: Achievement): achievement is WeightAchievement {
    return achievement.achieveType === 'weight';
}

export function isTimeAchievement(achievement: Achievement): achievement is TimeAchievement {
    return achievement.achieveType === 'time';
}

export async function getAllAchievementsFromLibrary(): Promise<Achievement[]> {
    try {
        const achievementsRef = collection(db, "achievements");
        const snapshot = await getDocs(achievementsRef);
        return snapshot.docs.map(doc => doc.data() as Achievement);
    } catch (error) {
        console.error("Error fetching achievements:", error);
        return [];
    }
}