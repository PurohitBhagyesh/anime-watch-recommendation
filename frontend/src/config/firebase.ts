import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "animesenpai-online.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "animesenpai-online",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "animesenpai-online.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase App & Auth
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Lazy-load Firestore only when needed (sign in, sign up, profile actions)
// This saves ~380 KiB of unused JavaScript on initial page loads for visitors and search engine bots
let firestoreInstance: Firestore | null = null;
export async function getDb(): Promise<Firestore> {
  if (!firestoreInstance) {
    const { getFirestore } = await import("firebase/firestore");
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}
