/**
 * Admin Users Management Hook
 * Hook สำหรับจัดการ users ใน admin portal
 */

import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/config";
import { useState, useCallback } from "react";
import type { AdminUser, PaginatedUsersResponse, UserStats } from "@/types";

interface GetAllUsersParams {
  limit?: number;
  pageToken?: string;
  searchEmail?: string;
}

interface SetAdminRoleParams {
  userId: string;
  isAdmin: boolean;
}

interface SetAdminRoleResponse {
  success: boolean;
  message: string;
}

/**
 * Hook สำหรับจัดการ users ใน admin portal
 */
export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  /**
   * Load users with pagination
   */
  const loadUsers = useCallback(async (params: GetAllUsersParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const getAllUsers = httpsCallable<GetAllUsersParams, PaginatedUsersResponse>(functions, "get_all_users");
      const result = await getAllUsers(params);

      if (params.pageToken) {
        // Append to existing users (pagination)
        setUsers((prev) => [...prev, ...result.data.users]);
      } else {
        // Replace users (new search or first load)
        setUsers(result.data.users);
      }

      setPageToken(result.data.pageToken);
      setHasMore(result.data.hasMore);
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load more users (pagination)
   */
  const loadMore = useCallback(() => {
    if (hasMore && pageToken && !loading) {
      loadUsers({ limit: 50, pageToken });
    }
  }, [hasMore, pageToken, loading, loadUsers]);

  /**
   * Search users by email
   */
  const searchUsers = useCallback(
    (email: string) => {
      if (!email.trim()) {
        loadUsers({ limit: 50 });
        return;
      }
      loadUsers({ limit: 50, searchEmail: email.trim() });
    },
    [loadUsers]
  );

  /**
   * Set admin role for a user
   */
  const setAdminRole = useCallback(async (userId: string, isAdmin: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const setAdminRoleFn = httpsCallable<SetAdminRoleParams, SetAdminRoleResponse>(functions, "set_admin_role");
      const result = await setAdminRoleFn({ userId, isAdmin });

      // Update local state
      setUsers((prev) =>
        prev.map((user) => (user.uid === userId ? { ...user, isAdmin } : user))
      );

      return { success: true, message: result.data.message };
    } catch (err: any) {
      console.error("Error setting admin role:", err);
      const errorMessage = err.message || "Failed to set admin role";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load user statistics
   */
  const loadUserStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const getUserStats = httpsCallable<unknown, UserStats>(functions, "get_user_stats");
      const result = await getUserStats();

      setUserStats(result.data);
    } catch (err: any) {
      console.error("Error loading user stats:", err);
      setError(err.message || "Failed to load user statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset users list
   */
  const resetUsers = useCallback(() => {
    setUsers([]);
    setPageToken(undefined);
    setHasMore(false);
  }, []);

  return {
    users,
    loading,
    error,
    pageToken,
    hasMore,
    userStats,
    loadUsers,
    loadMore,
    searchUsers,
    setAdminRole,
    loadUserStats,
    resetUsers,
  };
};

