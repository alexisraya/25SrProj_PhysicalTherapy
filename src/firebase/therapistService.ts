import { db } from "$lib/helpers/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export interface Therapist {
    therapistId: string;
    firstName: string;
    lastName: string;
    email: string;
    patients: string[];
}

const THERAPIST_ID = "mY8JFfhiJvdFm54wG57ALJmVYit2";

export async function getTherapist(): Promise<Therapist | null> {
    const therapistRef = doc(db, "therapists", THERAPIST_ID);
    const therapistSnap = await getDoc(therapistRef);
    
    return therapistSnap.exists() ? (therapistSnap.data() as Therapist) : null;
}

export async function assignPatientToTherapist(patientId: string): Promise<void> {
    const therapistRef = doc(db, "therapists", THERAPIST_ID);
    const therapistSnap = await getDoc(therapistRef);

    if (!therapistSnap.exists()) {
        console.error("Therapist not found.");
        return;
    }

    const therapistData = therapistSnap.data();
    const updatedPatients = therapistData.patients ? [...therapistData.patients, patientId] : [patientId];

    await updateDoc(therapistRef, { patients: updatedPatients });
}