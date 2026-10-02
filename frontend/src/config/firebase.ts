import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase config object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
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
