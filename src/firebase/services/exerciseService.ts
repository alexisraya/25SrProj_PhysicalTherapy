import { db } from '$lib/helpers/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import type { Exercise } from '../types/exerciseType';
import { isDistanceExercise, isWeightExercise, isTimeExercise } from '../types/exerciseType';

export async function getAllExercisesFromLibrary(): Promise<Exercise[]> {
  try {
    const exercisesRef = collection(db, 'exercises');
    const snapshot = await getDocs(exercisesRef);
    return snapshot.docs.map((doc) => doc.data() as Exercise);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
}

export async function getExercise(exerciseId: string): Promise<Exercise | null> {
  try {
    const exerciseRef = doc(db, 'exercises', exerciseId);
    const snapshot = await getDoc(exerciseRef);

    if (snapshot.exists()) {
      return snapshot.data() as Exercise;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching exercise ${exerciseId}:`, error);
    return null;
  }
}

export async function getExercisesByType(
  type: 'distance' | 'weight' | 'time'
): Promise<Exercise[]> {
  try {
    const exercises = await getAllExercisesFromLibrary();
    return exercises.filter((exercise) => exercise.exerciseType === type);
  } catch (error) {
    console.error(`Error fetching exercises of type ${type}:`, error);
    return [];
  }
}

export function formatExerciseRequirements(exercise: Exercise): string {
  if (isDistanceExercise(exercise)) {
    return `${exercise.defaultSets || 3} sets of ${exercise.defaultSteps || 10} steps`;
  } else if (isWeightExercise(exercise)) {
    return `${exercise.defaultSets || 3} sets of ${exercise.defaultReps || 10} reps at ${exercise.defaultWeight || 0}lbs`;
  } else if (isTimeExercise(exercise)) {
    return `${exercise.defaultSets || 1} sets of ${exercise.defaultReps || 10} reps, holding for ${exercise.defaultSeconds || 10} seconds each`;
  }
  return 'Exercise requirements not specified';
}

export { isDistanceExercise, isWeightExercise, isTimeExercise };
