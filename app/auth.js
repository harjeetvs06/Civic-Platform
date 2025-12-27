import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function createAccount(email, password, role = "citizen", name = "") {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(result.user);
    
    // Store user role and name in Firestore
    await setDoc(doc(db, "users", result.user.uid), {
      email: email,
      role: role, // "citizen", "municipality", "thinktank"
      name: name || email.split("@")[0],
      createdAt: new Date().toISOString(),
    });
    
    return result;
  } catch (error) {
    console.error("createAccount error:", error);
    throw error;
  }
}

export async function login(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    console.error("login error:", error);
    throw error;
  }
}

export async function logout() {
  try {
    return await firebaseSignOut(auth);
  } catch (error) {
    console.error("logout error:", error);
    throw error;
  }
}

export async function resetEmail(email) {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("resetEmail error:", error);
    throw error;
  }
}

export async function getUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data().role || "citizen";
    }
    return "citizen";
  } catch (error) {
    console.error("getUserRole error:", error);
    return "citizen";
  }
}

