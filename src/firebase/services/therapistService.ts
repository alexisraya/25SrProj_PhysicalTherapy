import { db } from '$lib/helpers/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  getFirestore,
  runTransaction
} from 'firebase/firestore';
import type { User } from '$firebase/types/userType';

export interface Therapist {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  patients: string[];
}

const THERAPIST_ID = 'mY8JFfhiJvdFm54wG57ALJmVYit2';

export async function getTherapist(therapistId: string = THERAPIST_ID): Promise<Therapist | null> {
  const therapistRef = doc(db, 'therapists', therapistId);
  const therapistSnap = await getDoc(therapistRef);

  return therapistSnap.exists() ? (therapistSnap.data() as Therapist) : null;
}

export async function assignPatientToTherapist(
  patientId: string,
  therapistId: string = THERAPIST_ID
): Promise<void> {
  try {
    console.log(`Assigning patient ${patientId} to therapist ${therapistId}`);

    const db = getFirestore();

    await runTransaction(db, async (transaction) => {
      const therapistRef = doc(db, 'therapists', therapistId);
      const therapistDoc = await transaction.get(therapistRef);

      if (!therapistDoc.exists()) {
        throw new Error(`Therapist with ID ${therapistId} does not exist`);
      }

      const userRef = doc(db, 'users', patientId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error(`User with ID ${patientId} does not exist`);
      }

      transaction.update(userRef, {
        therapistId,
        updatedAt: new Date().toISOString()
      });

      const therapistData = therapistDoc.data();
      const currentPatients = therapistData.patients || [];

      if (!currentPatients.includes(patientId)) {
        transaction.update(therapistRef, {
          patients: [...currentPatients, patientId],
          updatedAt: new Date().toISOString()
        });
      }
    });

    console.log(`Successfully assigned patient ${patientId} to therapist ${therapistId}`);
  } catch (error) {
    console.error(`Error assigning patient ${patientId} to therapist:`, error);
    throw error;
  }
}

export async function getPatientsForTherapist(therapistId: string): Promise<User[]> {
  try {
    const patientsQuery = query(
      collection(db, 'users'),
      where('therapistId', '==', therapistId),
      where('isTherapist', '==', false)
    );

    const snapshot = await getDocs(patientsQuery);
    return snapshot.docs.map((doc) => doc.data() as User);
  } catch (error) {
    console.error(`Error fetching patients for therapist ${therapistId}:`, error);
    return [];
  }
}
