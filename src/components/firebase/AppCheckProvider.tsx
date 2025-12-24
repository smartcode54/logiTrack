"use client";

import { useEffect } from "react";
import { useAppCheck } from "@/hooks/useAppCheck";

/**
 * App Check Provider Component
 * Component สำหรับ initialize App Check ในแอปพลิเคชัน
 * ควรวางไว้ใน root layout หรือ component ที่ wrap ทั้งแอป
 */
export const AppCheckProvider = ({ children }: { children: React.ReactNode }) => {
  const { isInitialized, isLoading, error } = useAppCheck();

  useEffect(() => {
    // App Check is optional - only log if successfully initialized
    // Don't log warnings if not initialized (this is normal when not configured)
    if (isInitialized) {
      console.log("App Check initialized successfully");
    }
    // Silently handle missing App Check - it's optional
  }, [isInitialized, error]);

  // App Check initialization happens automatically via useAppCheck hook
  // We don't need to block rendering if it's not initialized
  return <>{children}</>;
};

