import { writable } from "svelte/store";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth } from "$lib/helpers/firebase";
import { assignPatientToTherapist } from "$firebase/therapistService";

const db = getFirestore();

export const authStore = writable({
    isLoading: true,
    currentUser: null
})

export const authHandlers = {
    login: async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password)
    },
    signup: async (email: string, password: string, firstName: string, lastName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user;
        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`,
        });

        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            userId: user.uid,
            firstName: firstName,
            lastName: lastName,
            displayName: `${firstName} ${lastName}`,
            email: email,
            isTherapist: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            therapistId: "mY8JFfhiJvdFm54wG57ALJmVYit2",
            assignedExercises: []
        });
        await assignPatientToTherapist(user.uid);
    },
    logout: async () => {
        await signOut(auth)
    }
}