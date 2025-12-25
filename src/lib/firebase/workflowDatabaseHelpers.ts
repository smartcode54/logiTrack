/**
 * Workflow Database Helper Functions
 * Helper functions สำหรับอัปเดตและจัดการ workflow activities ในอนาคต
 */

import {
  collection,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { WorkflowActivity, WorkflowSession } from "@/types/workflow";

const WORKFLOW_ACTIVITIES_COLLECTION = "workflowActivities";
const WORKFLOW_SESSIONS_COLLECTION = "workflowSessions";

/**
 * Update existing workflow activity
 * ใช้สำหรับอัปเดตข้อมูล activity ที่บันทึกไว้แล้ว
 */
export const updateWorkflowActivity = async (
  activityId: string,
  updates: Partial<WorkflowActivity>
): Promise<void> => {
  try {
    const activityRef = doc(db, WORKFLOW_ACTIVITIES_COLLECTION, activityId);
    await updateDoc(activityRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating workflow activity:", error);
    throw error;
  }
};

/**
 * Add additional data to existing activity
 * ใช้สำหรับเพิ่มข้อมูลเพิ่มเติมใน activity ที่มีอยู่แล้ว
 */
export const appendActivityData = async (
  activityId: string,
  additionalData: Record<string, any>
): Promise<void> => {
  try {
    const activityRef = doc(db, WORKFLOW_ACTIVITIES_COLLECTION, activityId);
    const activityDoc = await getDoc(activityRef);

    if (!activityDoc.exists()) {
      throw new Error("Activity not found");
    }

    const currentData = activityDoc.data();
    const updatedData = {
      ...currentData,
      data: {
        ...currentData.data,
        ...additionalData,
      },
      updatedAt: serverTimestamp(),
    };

    await updateDoc(activityRef, updatedData);
  } catch (error) {
    console.error("Error appending activity data:", error);
    throw error;
  }
};

/**
 * Update workflow session metadata
 * ใช้สำหรับอัปเดต metadata ของ session
 */
export const updateWorkflowSessionMetadata = async (
  sessionId: string,
  metadata: Partial<WorkflowSession["metadata"]>
): Promise<void> => {
  try {
    const sessionRef = doc(db, WORKFLOW_SESSIONS_COLLECTION, sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      throw new Error("Session not found");
    }

    const currentMetadata = sessionDoc.data().metadata || {};
    await updateDoc(sessionRef, {
      metadata: {
        ...currentMetadata,
        ...metadata,
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating session metadata:", error);
    throw error;
  }
};

/**
 * Add activity to session
 * ใช้สำหรับเพิ่ม activity ID เข้าไปใน session
 */
export const addActivityToSession = async (
  sessionId: string,
  activityId: string
): Promise<void> => {
  try {
    const sessionRef = doc(db, WORKFLOW_SESSIONS_COLLECTION, sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      throw new Error("Session not found");
    }

    const currentActivities = sessionDoc.data().activities || [];
    if (!currentActivities.includes(activityId)) {
      await updateDoc(sessionRef, {
        activities: [...currentActivities, activityId],
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error adding activity to session:", error);
    throw error;
  }
};

/**
 * Update session current step
 * ใช้สำหรับอัปเดตขั้นตอนปัจจุบันของ session
 */
export const updateSessionStep = async (
  sessionId: string,
  step: WorkflowSession["currentStep"]
): Promise<void> => {
  try {
    const sessionRef = doc(db, WORKFLOW_SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      currentStep: step,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating session step:", error);
    throw error;
  }
};

/**
 * Migrate old activity format to new format
 * ใช้สำหรับ migrate ข้อมูลจากรูปแบบเก่าไปรูปแบบใหม่ (ถ้ามีการเปลี่ยนแปลง schema)
 */
export const migrateActivityFormat = async (
  activityId: string,
  migrationFn: (oldData: any) => any
): Promise<void> => {
  try {
    const activityRef = doc(db, WORKFLOW_ACTIVITIES_COLLECTION, activityId);
    const activityDoc = await getDoc(activityRef);

    if (!activityDoc.exists()) {
      throw new Error("Activity not found");
    }

    const oldData = activityDoc.data();
    const newData = migrationFn(oldData);

    await updateDoc(activityRef, {
      ...newData,
      migratedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error migrating activity format:", error);
    throw error;
  }
};

/**
 * Bulk update activities
 * ใช้สำหรับอัปเดตหลาย activities พร้อมกัน
 */
export const bulkUpdateActivities = async (
  activityIds: string[],
  updates: Partial<WorkflowActivity>
): Promise<void> => {
  try {
    const updatePromises = activityIds.map((activityId) => {
      const activityRef = doc(db, WORKFLOW_ACTIVITIES_COLLECTION, activityId);
      return updateDoc(activityRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error bulk updating activities:", error);
    throw error;
  }
};

/**
 * Get activities by step
 * ใช้สำหรับดึง activities ตามขั้นตอน
 */
export const getActivitiesByStep = async (
  jobId: string,
  step: WorkflowActivity["step"]
): Promise<WorkflowActivity[]> => {
  try {
    const q = query(
      collection(db, WORKFLOW_ACTIVITIES_COLLECTION),
      where("jobId", "==", jobId),
      where("step", "==", step),
      orderBy("timestamp", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as WorkflowActivity[];
  } catch (error) {
    console.error("Error getting activities by step:", error);
    throw error;
  }
};

/**
 * Get latest activity for a job
 * ใช้สำหรับดึง activity ล่าสุดของงาน
 */
export const getLatestActivity = async (
  jobId: string
): Promise<WorkflowActivity | null> => {
  try {
    const q = query(
      collection(db, WORKFLOW_ACTIVITIES_COLLECTION),
      where("jobId", "==", jobId),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as unknown as WorkflowActivity;
  } catch (error) {
    console.error("Error getting latest activity:", error);
    throw error;
  }
};
