import { getCurrentUser, logout, onAuthStateChange, signIn, signInWithGoogle, signUp } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { useEffect, useState } from "react";

/**
 * Custom hook for Firebase Authentication
 * Hook สำหรับจัดการการยืนยันตัวตนด้วย Firebase Auth
 */
export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ฟังการเปลี่ยนแปลงสถานะการยืนยันตัวตน
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { user, error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
      return { success: false, error: signInError };
    }
    return { success: true, user };
  };

  const handleSignUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    setError(null);
    const { user, error: signUpError } = await signUp(email, password, displayName);
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
      return { success: false, error: signUpError };
    }
    return { success: true, user };
  };

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { user, error: googleError } = await signInWithGoogle();
    setLoading(false);
    if (googleError) {
      setError(googleError);
      return { success: false, error: googleError };
    }
    return { success: true, user };
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    const { error: logoutError } = await logout();
    setLoading(false);
    if (logoutError) {
      setError(logoutError);
      return { success: false, error: logoutError };
    }
    setUser(null);
    return { success: true };
  };

  return {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleSignInWithGoogle,
    logout: handleLogout,
    isAuthenticated: !!user,
  };
};
