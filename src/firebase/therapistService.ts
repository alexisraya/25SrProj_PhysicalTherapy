import { db } from "$lib/helpers/firebase";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

export interface Therapist {
    therapistId: string;
    firstName: string;
    lastName: string;
    email: string;
    patients: string[];
}

export async function createTherapist(therapistId: string, therapistData: Therapist): Promise<void> {
    const therapistRef = doc(db, "therapists", therapistId);
    await setDoc(therapistRef, {
        ...therapistData,
        therapistId, // ✅ Ensure therapistId is stored explicitly
        isTherapist: true, // ✅ Ensure this field exists
    }, { merge: true });

    console.log("✅ Therapist added to Firestore:", therapistId);
}

export async function getTherapist(therapistId: string): Promise<Therapist | null> {
    if (!therapistId) {
        console.warn("🚨 Invalid therapistId provided to getTherapist.");
        return null;
    }

    const therapistRef = doc(db, "therapists", therapistId);
    const therapistSnap = await getDoc(therapistRef);
    if (therapistSnap.exists()) {
        return therapistSnap.data() as Therapist;
    } else {
        console.warn("⚠️ Therapist not found in Firestore:", therapistId);
        return null;
    }
}

export async function getAllTherapists(): Promise<Therapist[]> {
    const therapistsRef = collection(db, "therapists");
    const snapshot = await getDocs(therapistsRef);
    return snapshot.docs.map(doc => doc.data() as Therapist);
}