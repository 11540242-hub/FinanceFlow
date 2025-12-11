import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Helper to safely get environment variables from process.env (injected by Vite define)
// or import.meta.env (native Vite)
const getEnv = (key: string) => {
  // 1. Try process.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // 2. Try import.meta.env
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    if (import.meta.env[key]) return import.meta.env[key];
    // @ts-ignore
    if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
  }
  return '';
};

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID')
};

// Log warning if config is missing (helps debugging)
if (!firebaseConfig.apiKey) {
  console.error("Firebase Configuration Error: API Key is missing. Check your .env file or GitHub Secrets.");
}

// Initialize Firebase
// If keys are missing, this might throw, but getEnv returning '' usually allows init to proceed
// until an actual network request is made.
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);