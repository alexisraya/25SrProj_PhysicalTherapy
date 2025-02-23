import { db } from "$lib/helpers/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

interface Goal {
    goalId: string;
    goalName: string;
    description: string;
    month: number;
    timeframe: string;
    unlocked: boolean;
}

export async function getAllGoalsFromLibrary(): Promise<Goal[]> {
    try {
        const goalsRef = collection(db, "goals");
        const snapshot = await getDocs(goalsRef);
        return snapshot.docs.map(doc => doc.data() as Goal);
    } catch (error) {
        console.error("Error fetching goals:", error);
        return [];
    }
}

export async function getExercise(goalId: string): Promise<Goal| null> {
    try {
        const goalRef = doc(db, "goals", goalId);
        const snapshot = await getDoc(goalRef);
        
        if (snapshot.exists()) {
            return snapshot.data() as Goal;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching exercise ${goalId}:`, error);
        return null;
    }
}

export function sortGoalsByMonth(goals: Goal[]): Goal[][] {
    const sortedGoals: Goal[][] = [[], [], [], [], [], []];
    goals.forEach(goal => {
        if (goal.month >= 1 && goal.month <= 6) {
            sortedGoals[goal.month - 1].push(goal);
        }
    });
    return sortedGoals;
}