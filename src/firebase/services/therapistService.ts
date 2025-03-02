import { db } from "$lib/helpers/firebase";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import type { User } from "$firebase/types/userType";

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

// Not sure why this function isn't working but we can just manually assign the patients to the therapist list through their ID's - Sab
export async function assignPatientToTherapist(patientId: string, therapistId: string = THERAPIST_ID): Promise<void> {
    try {
        console.log(`Assigning patient ${patientId} to therapist ${therapistId}`);

        const userRef = doc(db, "users", patientId);
        await updateDoc(userRef, { therapistId });
        console.log(`Updated user ${patientId} with therapistId ${therapistId}`);

        let retryCount = 0;
        const maxRetries = 3;
        
        const updateTherapistPatientList = async () => {
            try {
                const therapistRef = doc(db, "therapists", therapistId);
                const therapistSnap = await getDoc(therapistRef);
    
                if (!therapistSnap.exists()) {
                    console.warn("Therapist not found.");
                    return;
                }
    
                const therapistData = therapistSnap.data() as Therapist;
                const patients = therapistData.patients || [];
                
                if (!patients.includes(patientId)) {
                    console.log(`Adding patient ${patientId} to therapist's patient list`);
                    const updatedPatients = [...patients, patientId];
                    
                    await updateDoc(therapistRef, { patients: updatedPatients });
                    console.log(`Successfully updated therapist's patient list with ${patientId}`);
                } else {
                    console.log(`Patient ${patientId} already in therapist's patient list`);
                }
            } catch (err) {
                retryCount++;
                console.warn(`Error updating therapist (attempt ${retryCount}):`, err);
                
                if (retryCount < maxRetries) {
                    console.log(`Retrying in ${retryCount * 500}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryCount * 500));
                    return updateTherapistPatientList();
                } else {
                    throw err;
                }
            }
        };
        await updateTherapistPatientList();
    } catch (error) {
        console.error(`Error assigning patient ${patientId} to therapist:`, error);
        throw error;
    }
}

export async function getPatientsForTherapist(therapistId: string): Promise<User[]> {
    try {
        const patientsQuery = query(
            collection(db, "users"),
            where("therapistId", "==", therapistId),
            where("isTherapist", "==", false)
        );
        
        const snapshot = await getDocs(patientsQuery);
        return snapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
        console.error(`Error fetching patients for therapist ${therapistId}:`, error);
        return [];
    }
}