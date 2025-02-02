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

export async function populateExerciseLibrary(): Promise<void> {
    const exercises: Exercise[] = [
        { exerciseId: "knee-extension", exerciseName: "Knee Extension", description: "Strengthens knee muscles.", equipment: "None", image: "url-to-image", defaultSets: 3, defaultReps: 10 },
        { exerciseId: "step-ups", exerciseName: "Step Ups", description: "Improves leg strength.", equipment: "Step platform", image: "url-to-image", defaultSets: 3, defaultReps: 12 },
        { exerciseId: "wall-sit", exerciseName: "Wall Sit", description: "Increases leg endurance.", equipment: "Wall", image: "url-to-image", defaultSets: 3, defaultReps: 30 }
    ];

    for (const exercise of exercises) {
        const exerciseRef = doc(db, "exercises", exercise.exerciseId);
        const existingDoc = await getDoc(exerciseRef);

        if (existingDoc.exists()) {
            console.warn(`⚠️ Exercise "${exercise.exerciseId}" already exists. Skipping.`);
        } else {
            await setDoc(exerciseRef, exercise);
            console.log(`Added exercise: ${exercise.exerciseName}`);
        }
    }
}

export async function getAllExercisesFromLibrary(): Promise<Exercise[]> {
    const exercisesRef = collection(db, "exercises");
    const exercisesSnap = await getDocs(exercisesRef);

    return exercisesSnap.docs.map((doc) => doc.data() as Exercise);
}

export async function getExerciseFromLibrary(exerciseId: string): Promise<Exercise | null> {
    const exerciseRef = doc(db, "exercises", exerciseId);
    const exerciseSnap = await getDoc(exerciseRef);

    return exerciseSnap.exists() ? (exerciseSnap.data() as Exercise) : null;
}