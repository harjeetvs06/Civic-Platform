// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkRSM55D0d1UMurcJQqZIBb_yI9YqVk9A",
  authDomain: "skilllab60.firebaseapp.com",
  projectId: "skilllab60",
  storageBucket: "skilllab60.firebasestorage.app",
  messagingSenderId: "1092095966559",
  appId: "1:1092095966559:web:0286d2928ad4c4825a0aea",
  measurementId: "G-YZDQ6WYCWR"
};

// Initialize Firebase (prevent re-initialization in hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics should only run in the browser
if (typeof window !== "undefined") {
  try {
    getAnalytics(app);
  } catch (e) {
    // ignore analytics errors
  }
}

export { app, auth, db, storage };

