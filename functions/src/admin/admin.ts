/**
 * Admin Cloud Functions
 * Functions สำหรับจัดการ admin operations เช่น set admin role, check admin status, get users
 */

import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

/**
 * Helper function to check if user is admin
 * ตรวจสอบว่า user เป็น admin หรือไม่จาก custom claims
 */
const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const user = await auth.getUser(userId);
    return user.customClaims?.admin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Set admin role for a user
 * ตั้งค่า admin role ให้กับ user
 *
 * @param request.data.userId - User ID ที่ต้องการตั้งเป็น admin
 * @param request.data.isAdmin - true = set เป็น admin, false = remove admin
 */
export const set_admin_role = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      // Check authentication
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const currentUserId = request.auth.uid;
      const { userId, isAdmin: shouldBeAdmin } = request.data;

      // Validate input
      if (!userId || typeof userId !== "string") {
        throw new HttpsError("invalid-argument", "userId is required and must be a string");
      }

      if (typeof shouldBeAdmin !== "boolean") {
        throw new HttpsError("invalid-argument", "isAdmin must be a boolean");
      }

      // Check if current user is admin
      const currentUserIsAdmin = await isAdmin(currentUserId);
      if (!currentUserIsAdmin) {
        throw new HttpsError("permission-denied", "Only admins can set admin roles");
      }

      // Prevent removing own admin status
      if (userId === currentUserId && !shouldBeAdmin) {
        throw new HttpsError("permission-denied", "Cannot remove your own admin status");
      }

      // Get user to update
      const user = await auth.getUser(userId);

      // Update custom claims
      const customClaims = user.customClaims || {};
      if (shouldBeAdmin) {
        customClaims.admin = true;
      } else {
        customClaims.admin = undefined;
      }

      await auth.setCustomUserClaims(userId, customClaims);

      // Log the action
      await db.collection("adminLogs").add({
        action: shouldBeAdmin ? "set_admin" : "remove_admin",
        targetUserId: userId,
        targetUserEmail: user.email,
        performedBy: currentUserId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: shouldBeAdmin ? "Admin role set successfully" : "Admin role removed successfully",
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error("Error setting admin role:", error);
      throw new HttpsError("internal", "Failed to set admin role");
    }
  }
);

/**
 * Check if current user is admin
 * ตรวจสอบว่า user ปัจจุบันเป็น admin หรือไม่
 */
export const check_admin = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      if (!request.auth) {
        return { isAdmin: false };
      }

      const userId = request.auth.uid;
      const adminStatus = await isAdmin(userId);

      return { isAdmin: adminStatus };
    } catch (error) {
      console.error("Error checking admin status:", error);
      return { isAdmin: false };
    }
  }
);

/**
 * Get all users with pagination
 * ดึงข้อมูล users ทั้งหมดพร้อม pagination
 *
 * @param request.data.limit - จำนวน users ต่อหน้า (default: 50)
 * @param request.data.pageToken - Token สำหรับ pagination
 * @param request.data.searchEmail - ค้นหา user ตาม email (optional)
 */
export const get_all_users = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      // Check authentication
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const currentUserId = request.auth.uid;

      // Check if current user is admin
      const currentUserIsAdmin = await isAdmin(currentUserId);
      if (!currentUserIsAdmin) {
        throw new HttpsError("permission-denied", "Only admins can view all users");
      }

      const { limit = 50, pageToken, searchEmail } = request.data;

      // Validate limit
      if (typeof limit !== "number" || limit < 1 || limit > 1000) {
        throw new HttpsError("invalid-argument", "limit must be between 1 and 1000");
      }

      let listUsersResult: admin.auth.ListUsersResult;
      if (searchEmail) {
        // Search by email
        try {
          const user = await auth.getUserByEmail(searchEmail);
          listUsersResult = {
            users: [user],
            pageToken: undefined,
          };
        } catch (error: unknown) {
          const authError = error as { code?: string };
          if (authError.code === "auth/user-not-found") {
            listUsersResult = {
              users: [],
              pageToken: undefined,
            };
          } else {
            throw error;
          }
        }
      } else {
        // List all users with pagination
        listUsersResult = await auth.listUsers(limit, pageToken);
      }

      // Get admin status for each user
      const usersWithAdminStatus = await Promise.all(
        listUsersResult.users.map(async (user) => {
          const isUserAdmin = user.customClaims?.admin === true;
          return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            disabled: user.disabled,
            metadata: {
              creationTime: user.metadata.creationTime,
              lastSignInTime: user.metadata.lastSignInTime,
            },
            isAdmin: isUserAdmin,
          };
        })
      );

      return {
        users: usersWithAdminStatus,
        pageToken: listUsersResult.pageToken,
        hasMore: !!listUsersResult.pageToken,
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error("Error getting users:", error);
      throw new HttpsError("internal", "Failed to get users");
    }
  }
);

/**
 * Get user statistics
 * ดึงสถิติผู้ใช้ทั้งหมด
 */
export const get_user_stats = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      // Check authentication
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const currentUserId = request.auth.uid;

      // Check if current user is admin
      const currentUserIsAdmin = await isAdmin(currentUserId);
      if (!currentUserIsAdmin) {
        throw new HttpsError("permission-denied", "Only admins can view user statistics");
      }

      // Get total users count
      let totalUsers = 0;
      let totalAdmins = 0;
      let pageToken: string | undefined;

      do {
        const listUsersResult = await auth.listUsers(1000, pageToken);
        totalUsers += listUsersResult.users.length;
        totalAdmins += listUsersResult.users.filter((user) => user.customClaims?.admin === true).length;
        pageToken = listUsersResult.pageToken;
      } while (pageToken);

      return {
        totalUsers,
        totalAdmins,
        totalRegularUsers: totalUsers - totalAdmins,
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error("Error getting user stats:", error);
      throw new HttpsError("internal", "Failed to get user statistics");
    }
  }
);
