import { writable } from "svelte/store";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile, 
    onAuthStateChanged, 
    setPersistence, 
    browserLocalPersistence, 
    inMemoryPersistence
} from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "$lib/helpers/firebase";
import { goto } from "$app/navigation";

// ✅ Store authentication state
export const authStore = writable<{ isLoading: boolean; currentUser: User | null }>({
    isLoading: true,
    currentUser: null
});

// ✅ Force login every time locally, but persist sessions on Vercel
const useLocalPersistence = import.meta.env.MODE !== "development";
setPersistence(auth, useLocalPersistence ? browserLocalPersistence : inMemoryPersistence)
    .then(() => console.log(`✅ Auth persistence: ${useLocalPersistence ? "ENABLED" : "DISABLED (Local Dev)"}`))
    .catch((error) => console.error("🔥 Error setting auth persistence:", error));

// ✅ Handle Authentication State Changes (No Immediate Redirection)
onAuthStateChanged(auth, async (user) => {
    authStore.set({ isLoading: false, currentUser: user });

    if (user) {
        console.log("✅ User is logged in:", user.uid);
    } else {
        console.warn("🚨 No user signed in.");
    }
});

// ✅ Get user from Firestore
export async function getUserData(userId: string) {
    if (!userId) {
        console.warn("⚠️ No userId provided.");
        return null;
    }

    let userRef = doc(db, "users", userId);
    let userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return { ...userSnap.data(), userType: "patient" };
    }

    let therapistRef = doc(db, "therapists", userId);
    let therapistSnap = await getDoc(therapistRef);

    if (therapistSnap.exists()) {
        return { ...therapistSnap.data(), userType: "therapist" };
    }

    console.warn(`⚠️ No user found with ID: ${userId}`);
    return null;
}

// ✅ Authentication Handlers
export const authHandlers = {
    login: async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    },

    signup: async (email: string, password: string, firstName: string, lastName: string, isTherapist: boolean = false) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: `${firstName} ${lastName}` });

        const collectionName = isTherapist ? "therapists" : "users";
        const userDocRef = doc(db, collectionName, user.uid);
        await setDoc(userDocRef, {
            firstName,
            lastName,
            email,
            displayName: `${firstName} ${lastName}`,
            isTherapist,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: user.uid,
            ...(isTherapist ? { patients: [] } : {})
        });

        console.log(`✅ New ${isTherapist ? "therapist" : "user"} created in Firestore:`, user.uid);
    },

    logout: async () => {
        await signOut(auth);
        console.log("🚪 User logged out");
    }
};