"use client";

import { useAppCheck } from "@/hooks/useAppCheck";
import { useEffect, useRef } from "react";

/**
 * App Check Provider Component
 * Component สำหรับ initialize App Check ในแอปพลิเคชัน
 * ควรวางไว้ใน root layout หรือ component ที่ wrap ทั้งแอป
 */
export const AppCheckProvider = ({ children }: { children: React.ReactNode }) => {
  const { isInitialized, isLoading, error } = useAppCheck();
  const debugModeSet = useRef(false);

  useEffect(() => {
    // Enable Debug Mode for App Check (development only) - only once
    // Silent - no console logs to avoid clutter
    if (!debugModeSet.current && process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      (window as Window & { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      debugModeSet.current = true;
    }

    // App Check is optional - silently handle
    // Authentication will work even if App Check fails
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array is intentional - only run once on mount

  // App Check initialization happens automatically via useAppCheck hook
  // We don't need to block rendering if it's not initialized
  return <>{children}</>;
};
