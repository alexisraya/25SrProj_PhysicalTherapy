import { db } from '$lib/helpers/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

/* ---------------------- GOAL LIBRARY MANAGEMENT ---------------------- */
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
    const goalsRef = collection(db, 'goals');
    const snapshot = await getDocs(goalsRef);
    return snapshot.docs.map((doc) => {
      return {
        ...doc.data(),
        goalId: doc.id
      } as Goal;
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
}

export async function getGoal(goalId: string): Promise<Goal | null> {
  try {
    const goalRef = doc(db, 'goals', goalId);
    const snapshot = await getDoc(goalRef);

    if (snapshot.exists()) {
      return {
        ...snapshot.data(),
        goalId: snapshot.id
      } as Goal;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching goal ${goalId}:`, error);
    return null;
  }
}

export function sortGoalsByMonth(goals: Goal[]): Record<string, Goal[]> {
  // Create a record of goals by month
  const sortedGoals: Record<string, Goal[]> = {};

  goals.forEach((goal) => {
    const month = goal.month.toString();
    if (!sortedGoals[month]) {
      sortedGoals[month] = [];
    }
    sortedGoals[month].push(goal);
  });

  return sortedGoals;
}
