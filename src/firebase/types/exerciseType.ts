// Base exercise interface
interface BaseExercise {
    exerciseId: string;
    exerciseName: string;
    instructions: string;
    information: string;
    exerciseType: 'distance' | 'weight' | 'time';
    defaultSets: number;
    equipment?: string;
    modification: string;
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