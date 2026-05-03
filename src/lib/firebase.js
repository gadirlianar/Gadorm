import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCks4MiMJyiVR1hlKt5D1EjhsgJQOEXuGg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gadorm-ca70e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gadorm-ca70e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gadorm-ca70e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "868886975639",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:868886975639:web:1ff71d4ab06b7ee0b905d2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize anonymous auth for the session
signInAnonymously(auth).catch((error) => {
  console.error("Anonymous auth failed:", error);
});
