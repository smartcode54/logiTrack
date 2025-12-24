/**
 * Firebase Types
 * ประเภทข้อมูลสำหรับ Firebase services
 */

import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

/**
 * Base document interface with common fields
 */
export interface BaseDocument {
  id?: string;
  userId: string;
  createdAt?: Timestamp | Date | number;
  updatedAt?: Timestamp | Date | number;
}

/**
 * Firestore timestamp converter
 */
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

/**
 * Storage upload metadata
 */
export interface StorageMetadata {
  contentType?: string;
  customMetadata?: Record<string, string>;
  cacheControl?: string;
}

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Error response from Firebase operations
 */
export interface FirebaseError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Success response from Firebase operations
 */
export interface FirebaseSuccess<T = any> {
  success: true;
  data: T;
}

/**
 * Firebase operation result
 */
export type FirebaseResult<T = any> =
  | FirebaseSuccess<T>
  | { success: false; error: FirebaseError | string };

/**
 * Query options for Firestore queries
 */
export interface QueryOptions {
  limit?: number;
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  };
  where?: Array<{
    field: string;
    operator: "<" | "<=" | "==" | "!=" | ">=" | ">" | "array-contains" | "in" | "array-contains-any";
    value: any;
  }>;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  pageSize: number;
  lastDoc?: any;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  lastDoc: any | null;
  hasMore: boolean;
}

