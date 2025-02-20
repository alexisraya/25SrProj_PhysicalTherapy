import { db } from "$lib/helpers/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export interface Therapist {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    patients: string[];
}

const THERAPIST_ID = "mY8JFfhiJvdFm54wG57ALJmVYit2"; 

export async function getTherapist(therapistId: string = THERAPIST_ID): Promise<Therapist | null> {
    const therapistRef = doc(db, "therapists", therapistId);
    const therapistSnap = await getDoc(therapistRef);
    
    return therapistSnap.exists() ? (therapistSnap.data() as Therapist) : null;
}

export async function assignPatientToTherapist(patientId: string, therapistId: string = THERAPIST_ID): Promise<void> {
    const therapistRef = doc(db, "therapists", therapistId);
    const therapistSnap = await getDoc(therapistRef);

    if (!therapistSnap.exists()) {
        throw new Error("Therapist not found.");
    }

    const therapistData = therapistSnap.data() as Therapist;

    if (therapistData.patients && therapistData.patients.includes(patientId)) {
        return;
    }

    const updatedPatients = therapistData.patients ? [...therapistData.patients, patientId] : [patientId];
    await updateDoc(therapistRef, { patients: updatedPatients });
}