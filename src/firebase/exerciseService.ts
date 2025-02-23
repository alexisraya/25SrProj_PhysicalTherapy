import { db } from "$lib/helpers/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

// Base exercise interface
interface BaseExercise {
    exerciseId: string;
    exerciseName: string;
    instructions: string;
    information: string;
    exerciseType: 'distance' | 'weight' | 'time';
    defaultSets: number;
    equipment?: string;
}

// Distance-based exercises
interface DistanceExercise extends BaseExercise {
    exerciseType: 'distance';
    defaultSteps?: number;
}

// Weight-based exercises
interface WeightExercise extends BaseExercise {
    exerciseType: 'weight';
    defaultReps?: number;
    defaultWeight?: number;
}

// Time-based exercises
interface TimeExercise extends BaseExercise {
    exerciseType: 'time';
    defaultReps?: number;
    defaultSeconds?: number;
}

export type Exercise = DistanceExercise | WeightExercise | TimeExercise;

export function isDistanceExercise(exercise: Exercise): exercise is DistanceExercise {
    return exercise.exerciseType === 'distance';
}

export function isWeightExercise(exercise: Exercise): exercise is WeightExercise {
    return exercise.exerciseType === 'weight';
}

export function isTimeExercise(exercise: Exercise): exercise is TimeExercise {
    return exercise.exerciseType === 'time';
}

export async function getAllExercisesFromLibrary(): Promise<Exercise[]> {
    try {
        const exercisesRef = collection(db, "exercises");
        const snapshot = await getDocs(exercisesRef);
        return snapshot.docs.map(doc => doc.data() as Exercise);
    } catch (error) {
        console.error("Error fetching exercises:", error);
        return [];
    }
}

export async function getExercise(exerciseId: string): Promise<Exercise | null> {
    try {
        const exerciseRef = doc(db, "exercises", exerciseId);
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

// Function to get exercises by type
export async function getExercisesByType(type: 'distance' | 'weight' | 'time'): Promise<Exercise[]> {
    try {
        const exercises = await getAllExercisesFromLibrary();
        return exercises.filter(exercise => exercise.exerciseType === type);
    } catch (error) {
        console.error(`Error fetching exercises of type ${type}:`, error);
        return [];
    }
}

// Function to format exercise requirements based on type
// TODO: change this later and just probably do an assignment calculation
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