import type { Exercise } from "./Exercise"

export type Program = {
    exercises: Exercise[];
    // has been completed
    // targetted end date
    exerciseId: number;
    reorderable: Boolean;
    order?: number;
    completed: Boolean;
    tooPainful: Boolean;
    reps: number;
    sets: number;
    adjustedReps?: number;
    adjustedSets?: number;
}