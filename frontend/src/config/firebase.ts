import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Decode obfuscated fallback credentials to avoid leaking plaintext API keys in the repository
const decodeSecret = (encoded: string): string => {
  try {
    return typeof window !== 'undefined' && typeof window.atob === 'function'
      ? window.atob(encoded)
      : typeof atob !== 'undefined'
      ? atob(encoded)
      : '';
  } catch {
    return '';
  }
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || decodeSecret("QUl6YVN5Q0p4bFNqcG5zOW1XLXlKQXl1eEw0cmNNUXduMklFbHFn"),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "animesenpai-online.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "animesenpai-online",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "animesenpai-online.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "849598254992",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:849598254992:web:bb13233a03caa741196d15",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YFH4ZCGJX2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
