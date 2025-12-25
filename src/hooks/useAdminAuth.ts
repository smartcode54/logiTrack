/**
 * Admin Authentication Hook
 * Hook สำหรับตรวจสอบและจัดการ admin authentication
 */

import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/config";
import { useFirebaseAuth } from "./useFirebaseAuth";
import { useEffect, useState } from "react";
import type { AdminUser } from "@/types";

interface CheckAdminResponse {
  isAdmin: boolean;
}

/**
 * Hook สำหรับตรวจสอบ admin status และจัดการ admin authentication
 */
export const useAdminAuth = () => {
  const { user, isAuthenticated, loading: authLoading } = useFirebaseAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check admin status via Cloud Function
        const checkAdmin = httpsCallable<unknown, CheckAdminResponse>(functions, "check_admin");
        const result = await checkAdmin();

        setIsAdmin(result.data.isAdmin);
      } catch (err: any) {
        console.error("Error checking admin status:", err);
        setError(err.message || "Failed to check admin status");
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, user]);

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading: authLoading || loading,
    error,
  };
};

