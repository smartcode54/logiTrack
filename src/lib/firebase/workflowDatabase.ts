/**
 * Workflow Database Service
 * บริการสำหรับจัดการข้อมูล workflow sessions และ summaries ใน Firestore
 * สำหรับ activity functions ดูที่ workflowActivities.ts
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
// Note: For update helpers, see workflowDatabaseHelpers.ts
import { db } from "./config";
import {
  WorkflowSession,
  WorkflowSummary,
} from "@/types/workflow";

// Re-export activity functions for backward compatibility
export {
  saveCheckInActivity,
  savePickupActivity,
  saveDepartureActivity,
  saveIncidentSelectionActivity,
  saveIncidentPhotosActivity,
  saveArrivalActivity,
  saveDeliveryActivity,
  saveWorkflowActivity,
  getJobActivities,
  getDriverActivities,
} from "./workflowActivities";

const WORKFLOW_SESSIONS_COLLECTION = "workflowSessions";
const WORKFLOW_SUMMARIES_COLLECTION = "workflowSummaries";

/**
 * Create or update workflow session
 */
export const saveWorkflowSession = async (
  session: Omit<WorkflowSession, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    // Check if session already exists for this job
    const existingQuery = query(
      collection(db, WORKFLOW_SESSIONS_COLLECTION),
      where("jobId", "==", session.jobId),
      where("driverId", "==", session.driverId),
      where("status", "==", "in_progress")
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      // Update existing session
      const existingDoc = existingSnapshot.docs[0];
      await updateDoc(existingDoc.ref, {
        ...session,
        updatedAt: serverTimestamp(),
      });
      return existingDoc.id;
    } else {
      // Create new session
      const docRef = await addDoc(
        collection(db, WORKFLOW_SESSIONS_COLLECTION),
        {
          ...session,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving workflow session:", error);
    throw error;
  }
};

/**
 * Get workflow session by job ID
 */
export const getWorkflowSession = async (
  jobId: string,
  driverId: string
): Promise<WorkflowSession | null> => {
  try {
    const q = query(
      collection(db, WORKFLOW_SESSIONS_COLLECTION),
      where("jobId", "==", jobId),
      where("driverId", "==", driverId),
      orderBy("startedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as unknown as WorkflowSession;
  } catch (error) {
    console.error("Error getting workflow session:", error);
    throw error;
  }
};

/**
 * Complete workflow session
 */
export const completeWorkflowSession = async (
  sessionId: string,
  finalStatus: "success" | "delay" | "cancel" | "standby"
): Promise<void> => {
  try {
    const sessionRef = doc(db, WORKFLOW_SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      status: "completed",
      completedAt: Date.now(),
      updatedAt: serverTimestamp(),
      metadata: {
        finalStatus,
      },
    });
  } catch (error) {
    console.error("Error completing workflow session:", error);
    throw error;
  }
};

/**
 * Save workflow summary
 */
export const saveWorkflowSummary = async (
  summary: Omit<WorkflowSummary, "id">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, WORKFLOW_SUMMARIES_COLLECTION), {
      ...summary,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving workflow summary:", error);
    throw error;
  }
};

/**
 * Get workflow summaries for a driver
 */
export const getDriverWorkflowSummaries = async (
  driverId: string,
  limitCount?: number
): Promise<WorkflowSummary[]> => {
  try {
    const q = query(
      collection(db, WORKFLOW_SUMMARIES_COLLECTION),
      where("driverId", "==", driverId),
      orderBy("completedAt", "desc"),
      ...(limitCount ? [limit(limitCount)] : [])
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as WorkflowSummary[];
  } catch (error) {
    console.error("Error getting driver workflow summaries:", error);
    throw error;
  }
};

/**
 * Get workflow summary by job ID
 */
export const getWorkflowSummaryByJobId = async (
  jobId: string
): Promise<WorkflowSummary | null> => {
  try {
    const q = query(
      collection(db, WORKFLOW_SUMMARIES_COLLECTION),
      where("jobId", "==", jobId)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as unknown as WorkflowSummary;
  } catch (error) {
    console.error("Error getting workflow summary:", error);
    throw error;
  }
};
