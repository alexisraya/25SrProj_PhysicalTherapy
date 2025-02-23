import { writable } from "svelte/store";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from "$lib/helpers/firebase";
import { goto } from "$app/navigation";
import { assignPatientToTherapist } from "$firebase/therapistService";

const db = getFirestore();

type AuthState = {
    isLoading: boolean;
    currentUser: User | null;
  }

export const authStore = writable<AuthState>({
    isLoading: true,
    currentUser: null
});

export const authHandlers = {
    login: async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await checkUserRole(userCredential.user.uid);
    },

    signup: async (email: string, password: string, firstName: string, lastName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: `${firstName} ${lastName}` });

        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            userId: user.uid,
            firstName,
            lastName,
            displayName: `${firstName} ${lastName}`,
            email,
            isTherapist: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            therapistId: "mY8JFfhiJvdFm54wG57ALJmVYit2",
            stats: {
                completedExercises: 0,
                completedPrograms: 0,
                totalSets: 0,
                totalReps: 0,
                totalWeight: 0,
                totalDistance: 0,
                totalTime: 0
            }
        });

        const programRef = doc(db, "users", user.uid, "program", "currentProgram");
        await setDoc(programRef, {
            exercises: [],
            estimatedTime: 0,
            assignedAt: new Date().toISOString(),
            completed: false
        });

        await assignPatientToTherapist(user.uid);
        goto("/patient-dashboard");
    },

    logout: async () => {
        await signOut(auth);
        console.log("User logged out");
        goto("/login");
    }
};

async function checkUserRole(userId: string) {
    // Skip redirection for exploration/test routes
    if (window.location.pathname.includes('/exploration/') || 
        window.location.pathname.includes('/firebase-test/')) {
        console.log("Test route detected - skipping redirection");
        return;
    }
    
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
        console.log("Patient logged in:", userId);
        goto("/patient-dashboard");
        return;
    }

    const therapistRef = doc(db, "therapists", userId);
    const therapistSnap = await getDoc(therapistRef);

    if (therapistSnap.exists()) {
        console.log("Therapist logged in:", userId);
        goto("/therapist-dashboard");
        return;
    }

    console.warn("No valid user or therapist found.");
    await signOut(auth);
    goto("/login");
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.warn("No user signed in.");
        authStore.set({ isLoading: false, currentUser: null });
        return;
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            
            authStore.set({
                isLoading: false,
                currentUser: {
                    ...user,
                    ...userData,
                    stats: userData.stats ?? null
                }
            });
        } else {
            console.warn("User document not found in Firestore.");
            authStore.set({ isLoading: false, currentUser: null });
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        authStore.set({ isLoading: false, currentUser: null });
    }
});
