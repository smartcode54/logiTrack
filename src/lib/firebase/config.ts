import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import { AppCheck } from "firebase/app-check";

// Firebase configuration
// ควรเก็บค่าเหล่านี้ใน environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
if (typeof window !== "undefined") {
  const requiredFields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"];
  const missingFields = requiredFields.filter((field) => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error("Firebase Configuration Error: Missing required fields:", missingFields);
    console.error("Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set");
  }

  // Validate API key format
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("AIza")) {
    // Silent validation - no console logs
  }
}

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let analytics: Analytics | null = null;
let appCheck: AppCheck | null = null;

if (typeof window !== "undefined") {
  // Initialize Firebase only on client side
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  // Initialize Functions with region to match backend functions (asia-southeast1)
  functions = getFunctions(app, "asia-southeast1");
  
  // Initialize Analytics (only in browser environment)
  // Analytics will be initialized asynchronously if supported
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
    analytics = null;
  });
  
  // App Check will be initialized separately via appCheck.ts
  // to allow for conditional initialization based on environment
} else {
  // Server-side: create placeholder objects
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
  functions = {} as Functions;
}

export { app, auth, db, storage, functions, analytics, appCheck };
export default app;

