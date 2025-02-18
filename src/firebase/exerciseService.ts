import { db } from "$lib/helpers/firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

export interface Exercise {
    exerciseId: string;
    exerciseName: string;
}

export async function populateExerciseLibrary(): Promise<void> {
    const exercises: Exercise[] = [
        { exerciseId: "bridge", exerciseName: "Bridge" },
        { exerciseId: "clamshell", exerciseName: "Clamshell" },
        { exerciseId: "side-stepping", exerciseName: "Side Stepping" },
        { exerciseId: "quad-set", exerciseName: "Quad Set" },
        { exerciseId: "straight-leg-raise", exerciseName: "Straight Leg Raise" },
        { exerciseId: "standing-tke", exerciseName: "Standing TKE" },
        { exerciseId: "monsster-walk", exerciseName: "Monster Walk" },
        { exerciseId: "bulgarain-split-squat", exerciseName: "Bulgarian Split Squat" },
        { exerciseId: "single-leg-squat", exerciseName: "Single Leg Squat" },
        { exerciseId: "heel-slide", exerciseName: "Heel Slide" },
    ];

    for (const exercise of exercises) {
        const exerciseRef = doc(db, "exercises", exercise.exerciseId);
        await setDoc(exerciseRef, exercise, { merge: true });
    }

    console.log("Exercises added to Firestore");
}

export async function getAllExercisesFromLibrary(): Promise<Exercise[]> {
    const exercisesRef = collection(db, "exercises");
    const snapshot = await getDocs(exercisesRef);
    return snapshot.docs.map(doc => doc.data() as Exercise);
}