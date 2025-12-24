import { useEffect, useState } from "react";
import {
  initializeAppCheckAuto,
  getAppCheck,
  isAppCheckInitialized,
} from "@/lib/firebase";

/**
 * Custom hook for Firebase App Check
 * Hook สำหรับจัดการ App Check initialization และ state
 */
export const useAppCheck = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      // Initialize App Check automatically
      const appCheckInstance = initializeAppCheckAuto();
      
      if (appCheckInstance) {
        setIsInitialized(true);
        setError(null);
      } else {
        // App Check is optional - don't set error if not configured
        // This is normal when App Check is not set up in Firebase Console
        setIsInitialized(false);
        setError(null);
      }
    } catch (err: any) {
      // This shouldn't happen now since initializeAppCheckAuto doesn't throw
      // But keep it for safety
      console.warn("App Check initialization warning:", err?.message || err);
      setIsInitialized(false);
      setError(null); // Don't treat as error - App Check is optional
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAppCheckInstance = () => {
    return getAppCheck();
  };

  return {
    isInitialized,
    isLoading,
    error,
    appCheck: getAppCheckInstance(),
  };
};

