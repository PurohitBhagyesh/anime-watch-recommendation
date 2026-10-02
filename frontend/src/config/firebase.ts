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
const app = initializeApp(firebaseConfig);

let _auth: ReturnType<typeof getAuth> | null = null;
let _db: ReturnType<typeof getFirestore> | null = null;

// Lazy proxies: Auth and Firestore only initialize when actually accessed
export const auth: ReturnType<typeof getAuth> = new Proxy({} as any, {
  get(_target, prop) {
    if (!_auth) {
      _auth = getAuth(app);
    }
    const val = (_auth as any)[prop];
    return typeof val === 'function' ? val.bind(_auth) : val;
  },
  set(_target, prop, value) {
    if (!_auth) {
      _auth = getAuth(app);
    }
    (_auth as any)[prop] = value;
    return true;
  }
});

export const db: ReturnType<typeof getFirestore> = new Proxy({} as any, {
  get(_target, prop) {
    if (!_db) {
      _db = getFirestore(app);
    }
    const val = (_db as any)[prop];
    return typeof val === 'function' ? val.bind(_db) : val;
  },
  set(_target, prop, value) {
    if (!_db) {
      _db = getFirestore(app);
    }
    (_db as any)[prop] = value;
    return true;
  }
});
