// FIX: Switched to Firebase v8 compatibility imports. The rest of the file uses the v8 namespaced
// syntax (e.g. firebase.auth()), which requires the '/compat/' imports when using firebase SDK v9+.
// This resolves all module-related type errors in this file.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Firebase configuration provided by the user.
export const firebaseConfig = {
  apiKey: "AIzaSyBMfW7PyRgF-ypfHHjt9Td0aj1Sp7ABEBo",
  authDomain: "scholarai-9d451.firebaseapp.com",
  projectId: "scholarai-9d451",
  storageBucket: "scholarai-9d451.firebasestorage.app",
  messagingSenderId: "745532888661",
  appId: "1:745532888661:web:a9441d2dbf6deb5bc626dc",
  measurementId: "G-DSVZTZNVBJ"
};

// Initialize Firebase
let app: firebase.app.App;
export let auth: firebase.auth.Auth;
export let db: firebase.firestore.Firestore;

// Export a promise that resolves when Firebase is initialized.
export const firebasePromise = new Promise<void>((resolve) => {
    try {
        if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("REPLACE_WITH")) {
            if (!firebase.apps.length) {
                app = firebase.initializeApp(firebaseConfig);
            } else {
                app = firebase.app();
            }
            auth = firebase.auth();
            db = firebase.firestore();

            // FIX: Suppress Firebase's informational connection error logs.
            firebase.firestore.setLogLevel('silent');
            
            // FIX: Disabled persistence to simplify the connection for troubleshooting.
            // This makes the connection more direct and removes a potential point of failure.
            console.log("Firebase initialized without offline persistence for debugging.");
            resolve();
            
        } else {
            console.warn("Firebase is not configured. Authentication and session features will be disabled.");
            resolve();
        }
    } catch (error) {
        console.error("An unexpected error occurred during Firebase initialization:", error);
        // Resolve to prevent the app from crashing.
        resolve();
    }
});


// Re-export things to be compatible with v9 modular API as used in the rest of the app
const createUserWithEmailAndPassword = (authInstance: firebase.auth.Auth, email: string, pass: string) => authInstance.createUserWithEmailAndPassword(email, pass);
const signInWithEmailAndPassword = (authInstance: firebase.auth.Auth, email: string, pass: string) => authInstance.signInWithEmailAndPassword(email, pass);
const signOut = (authInstance: firebase.auth.Auth) => authInstance.signOut();
const onAuthStateChanged = (authInstance: firebase.auth.Auth, callback: (user: firebase.User | null) => void) => authInstance.onAuthStateChanged(callback);
const updateProfile = (user: firebase.User, profile: { displayName: string | null; photoURL?: string | null; }) => user.updateProfile(profile);
const sendPasswordResetEmail = (authInstance: firebase.auth.Auth, email: string) => authInstance.sendPasswordResetEmail(email);

// The User type from firebase v8 namespace
type User = firebase.User;


export { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
};
export type { User };

// User Profile Management
export const createUserProfileDocument = async (user: User, additionalData: object = {}) => {
    if (!db || !user) return;
    const userRef = db.doc(`users/${user.uid}`);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
        const { displayName, email } = user;
        // FIX: Use a client-side timestamp to reduce server-side dependencies during the write.
        const createdAt = firebase.firestore.Timestamp.now();
        try {
            await userRef.set({
                displayName,
                email,
                createdAt,
                ...additionalData
            }, { merge: true });
        } catch (error) {
            console.error("Error creating user profile", error);
            throw error; // Re-throw to be caught by the calling function
        }
    }
};

export const getUserPreferences = async (userId: string): Promise<{ showUserGuide: boolean }> => {
    if (!db) return { showUserGuide: true }; // Default if db is not available
    try {
        const userRef = await db.doc(`users/${userId}`).get();
        if (userRef.exists) {
            const data = userRef.data();
            // If preferences object exists and showUserGuide is explicitly false, return false.
            // Otherwise, default to true (show the guide).
            if (data && data.preferences && data.preferences.showUserGuide === false) {
                return { showUserGuide: false };
            }
        }
    } catch (error: any) {
        // Gracefully handle offline errors without polluting the console for expected behavior.
        if (error.code === 'unavailable') {
            console.log("Could not fetch user preferences while offline. Using cached or default settings.");
        } else {
            console.error("Error fetching user preferences:", error);
        }
    }
    return { showUserGuide: true };
};

export const updateUserPreferences = async (userId: string, prefs: { showUserGuide: boolean }) => {
    if (!db) return;
    const userRef = db.doc(`users/${userId}`);
    try {
        await userRef.set({ preferences: prefs }, { merge: true });
    } catch (error) {
        console.error("Error updating user preferences:", error);
    }
};
