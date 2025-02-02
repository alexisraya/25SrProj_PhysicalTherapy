import { db } from "$lib/helpers/firebase";
import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";

export interface Exercise {
    exerciseId: string;
    exerciseName: string;
    description: string;
    equipment: string;
    image: string;
    defaultSets: number;
    defaultReps: number;
}

export async function addExerciseToLibrary(exercise: Exercise): Promise<void> {
    const exerciseRef = doc(db, "exercises", exercise.exerciseId);
    await setDoc(exerciseRef, exercise);
}

export async function getExerciseFromLibrary(exerciseId: string): Promise<Exercise | null> {
    const exerciseRef = doc(db, "exercises", exerciseId);
    const exerciseSnap = await getDoc(exerciseRef);

    return exerciseSnap.exists() ? (exerciseSnap.data() as Exercise) : null;
}

export async function getAllExercisesFromLibrary(): Promise<Exercise[]> {
    const exercisesRef = collection(db, "exercises");
    const exercisesSnap = await getDocs(exercisesRef);

    return exercisesSnap.docs.map((doc) => doc.data() as Exercise);
}
