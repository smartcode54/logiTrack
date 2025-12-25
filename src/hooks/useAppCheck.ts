import { getAppCheck, initializeAppCheckAuto, isAppCheckInitialized } from "@/lib/firebase";
import { useEffect, useState } from "react";

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

    // Initialize App Check asynchronously to not block authentication
    const initAppCheck = async () => {
      try {
        // Enable Debug Mode BEFORE initializing App Check
        // Silent - no console logs to avoid clutter
        if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
          (window as Window & { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        }

        // Small delay to ensure reCAPTCHA script is loaded
        await new Promise((resolve) => setTimeout(resolve, 100));

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
        // But keep it for safety - silently handle
        setIsInitialized(false);
        setError(null); // Don't treat as error - App Check is optional
      } finally {
        setIsLoading(false);
      }
    };

    initAppCheck();
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

// Make debug utilities available globally in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).debugAppCheck = async () => {
    const { debugAppCheck } = await import("@/lib/firebase");
    return debugAppCheck();
  };

  (window as any).getAppCheckInfo = () => {
    const { getAppCheckDebugInfo } = require("@/lib/firebase");
    return getAppCheckDebugInfo();
  };
}
