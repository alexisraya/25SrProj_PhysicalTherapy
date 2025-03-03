// Import env vars
import { 
  PUBLIC_FIREBASE_API_KEY, 
  PUBLIC_FIREBASE_AUTH_DOMAIN, 
  PUBLIC_FIREBASE_PROJECT_ID, 
  PUBLIC_FIREBASE_STORAGE_BUCKET, 
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID, 
  PUBLIC_FIREBASE_APP_ID, 
  PUBLIC_FIREBASE_MEASUREMENT_ID 
} from "$env/static/public";

// Import the functions you need from the SDKs you need
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Analytics can be added later if needed
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: PUBLIC_FIREBASE_API_KEY, // ✅ Uses environment variables for security
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: PUBLIC_FIREBASE_APP_ID,
  measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
// Ensures we don't initialize Firebase multiple times
let firebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
} else {
    firebaseApp = getApp();
    try {
        deleteApp(firebaseApp); // Ensures a clean re-initialization
    } catch (error) {
        console.warn("🔥 Firebase app could not be deleted before re-initializing:", error);
    }
    firebaseApp = initializeApp(firebaseConfig);
}

// const analytics = getAnalytics(firebaseApp); // Use later for event analytics

// Export Firebase Authentication & Firestore Database
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);