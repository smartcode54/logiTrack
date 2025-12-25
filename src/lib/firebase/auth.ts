import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth } from "./config";

/**
 * Firebase Authentication Service
 * บริการสำหรับจัดการการยืนยันตัวตนผู้ใช้
 */

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    // Validate auth is initialized
    if (!auth || (typeof auth === "object" && Object.keys(auth).length === 0)) {
      return { user: null, error: "Firebase Authentication ยังไม่ได้ initialize กรุณาตรวจสอบ configuration" };
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    // Handle 400 Bad Request from Identity Toolkit API
    if (error.message?.includes("400") || error.message?.includes("Bad Request")) {
      console.error("Firebase API Error (400 Bad Request):", {
        code: error.code,
        message: error.message,
        apiKey: auth.app?.options?.apiKey?.substring(0, 10) + "...",
      });
      return {
        user: null,
        error: "API Key หรือ Firebase configuration ไม่ถูกต้อง กรุณาตรวจสอบ .env.local และ restart dev server",
      };
    }
    return { user: null, error: error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
  }
};

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  displayName?: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }

    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Check if auth is properly initialized
    if (typeof window === "undefined") {
      return { user: null, error: "Firebase Authentication ต้องทำงานบน client-side เท่านั้น" };
    }
    
    if (!auth || (typeof auth === "object" && Object.keys(auth).length === 0)) {
      return { user: null, error: "Firebase Authentication ยังไม่ได้ initialize กรุณาตรวจสอบ configuration" };
    }

    // Validate auth domain
    if (!auth.app?.options?.authDomain) {
      return { user: null, error: "Firebase authDomain ไม่ถูกต้อง กรุณาตรวจสอบ configuration" };
    }

    const provider = new GoogleAuthProvider();
    // Add custom parameters for better UX
    provider.setCustomParameters({
      prompt: "select_account",
    });
    
    // Use popup for Google sign in
    const userCredential = await signInWithPopup(auth, provider);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    // Handle specific error cases
    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
      // User closed the popup - don't treat as error
      return { user: null, error: null };
    }
    if (error.code === "auth/popup-blocked") {
      return { user: null, error: "กรุณาอนุญาต popup ใน browser เพื่อเข้าสู่ระบบด้วย Google" };
    }
    if (error.code === "auth/configuration-not-found") {
      return { user: null, error: "Firebase configuration ไม่ถูกต้อง กรุณาตรวจสอบ .env.local และ restart dev server" };
    }
    if (error.code === "auth/invalid-api-key" || error.code === "auth/api-key-not-valid.-please-pass-a-valid-api-key") {
      return { user: null, error: "API Key ไม่ถูกต้อง กรุณาตรวจสอบ Firebase configuration" };
    }
    if (error.code === "auth/operation-not-allowed") {
      return { user: null, error: "Google Sign-In ยังไม่ได้เปิดใช้งานใน Firebase Console" };
    }
    if (error.code === "auth/unauthorized-domain") {
      return { user: null, error: "Domain นี้ยังไม่ได้อนุญาตใน Firebase Console" };
    }
    // Handle 400 Bad Request from Identity Toolkit API
    if (error.message?.includes("400") || error.message?.includes("Bad Request")) {
      console.error("Firebase API Error (400 Bad Request):", {
        code: error.code,
        message: error.message,
        apiKey: auth.app?.options?.apiKey?.substring(0, 10) + "...",
        authDomain: auth.app?.options?.authDomain,
      });
      return {
        user: null,
        error: "API Key หรือ Firebase configuration ไม่ถูกต้อง กรุณาตรวจสอบ:\n1. API Key ใน .env.local\n2. เปิดใช้งาน Identity Toolkit API ใน Google Cloud Console\n3. Domain อนุญาตใน Firebase Console",
      };
    }
    // Log full error for debugging
    console.error("Google Sign-In Error:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
      apiKey: auth.app?.options?.apiKey?.substring(0, 10) + "...",
    });
    return { user: null, error: error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google" };
  }
};

// Sign in with Facebook
export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};

// Send password reset email
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Update password
export const changePassword = async (newPassword: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: "No user is currently signed in" };
    }
    await updatePassword(user, newPassword);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Update user profile
export const updateUserProfile = async (displayName?: string, photoURL?: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: "No user is currently signed in" };
    }
    await updateProfile(user, { displayName, photoURL });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

