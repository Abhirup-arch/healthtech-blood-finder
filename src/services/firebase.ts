import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBugBUfNJaOLweq2YCBXYa3CX490OwaFlM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bloodlink-india-60076.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bloodlink-india-60076",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bloodlink-india-60076.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "75461588513",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:75461588513:web:a21275dfa79c922b4f5560",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7Z1LHZSYB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
