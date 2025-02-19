import { db } from "$lib/helpers/firebase";
import { collection, getDocs } from "firebase/firestore";

export interface Exercise {
    exerciseId: string;
    exerciseName: string;
    description?: string;
    defaultReps?: number;
    defaultSets?: number;
    time?: number;
    equipment?: string;
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

// // Function to get all exercises from Firestore
// export async function getAllExercisesFromLibrary(): Promise<Exercise[]> {
//     try {
//         const exercisesRef = collection(db, "exercises");
//         const snapshot = await getDocs(exercisesRef);
//         return snapshot.docs.map(doc => doc.data() as Exercise);
//     } catch (error) {
//         console.error("Error fetching exercises:", error);
//         return [];
//     }
// }

// // Function to update existing exercises with new fields
// export async function updateExerciseDetails(exerciseId: string, updatedFields: Partial<Exercise>): Promise<void> {
//     try {
//         const exerciseRef = doc(db, "exercises", exerciseId);
//         await updateDoc(exerciseRef, updatedFields);
//         console.log(`Exercise ${exerciseId} updated successfully.`);
//     } catch (error) {
//         console.error(`Error updating exercise ${exerciseId}:`, error);
//     }
// }