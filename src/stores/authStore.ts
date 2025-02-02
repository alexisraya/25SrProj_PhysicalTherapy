import { writable } from "svelte/store";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { auth, db } from "$lib/helpers/firebase";
import { setPersistence, browserLocalPersistence } from "firebase/auth"; // probs remvove

setPersistence(auth, browserLocalPersistence) // probs remove
    .then(() => console.log("✅ Auth persistence enabled"))
    .catch((error) => console.error("🔥 Error enabling auth persistence:", error));

interface AuthState {
    isLoading: boolean;
    currentUser: User | null;
}

export const authStore = writable<AuthState>({
    isLoading: true,
    currentUser: null
});

onAuthStateChanged(auth, (user) => {
    authStore.set({
        isLoading: false,
        currentUser: user
    });
});

export const authHandlers = {
    login: async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    },

    signup: async (email: string, password: string, firstName: string, lastName: string, injury: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: `${firstName} ${lastName}` });

        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            userId: user.uid,
            firstName: firstName,
            lastName: lastName,
            email: email,
            displayName: `${firstName} ${lastName}`,
            injury: injury,
            isTherapist: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return userCredential;
    },

    logout: async () => {
        await signOut(auth);
    }
};