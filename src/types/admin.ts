/**
 * Admin Types
 * Type definitions สำหรับ Admin Portal
 */

import type { User } from "firebase/auth";

/**
 * Admin User Interface
 * ข้อมูล user พร้อม admin status
 */
export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  disabled: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string | null;
  };
  isAdmin: boolean;
}

/**
 * User Statistics
 * สถิติผู้ใช้ทั้งหมด
 */
export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
}

/**
 * Admin Log Entry
 * บันทึกการกระทำของ admin
 */
export interface AdminLog {
  id: string;
  action: "set_admin" | "remove_admin" | "disable_user" | "enable_user";
  targetUserId: string;
  targetUserEmail: string | null;
  performedBy: string;
  timestamp: Date;
}

/**
 * Paginated Users Response
 * ผลลัพธ์ users พร้อม pagination
 */
export interface PaginatedUsersResponse {
  users: AdminUser[];
  pageToken?: string;
  hasMore: boolean;
}

/**
 * Admin Dashboard Stats
 * สถิติสำหรับ admin dashboard
 */
export interface AdminDashboardStats {
  userStats: UserStats;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalWorkflows: number;
  activeWorkflows: number;
}

