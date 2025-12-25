/**
 * Workflow Activities Service
 * บริการสำหรับจัดการข้อมูล workflow activities ใน Firestore
 * ใช้ Cloud Functions สำหรับการบันทึกและดึงข้อมูล
 */

import {
  WorkflowActivity,
  CheckInActivity,
  PickupActivity,
  DepartureActivity,
  IncidentSelectionActivity,
  IncidentPhotosActivity,
  ArrivalActivity,
  DeliveryActivity,
} from "@/types/workflow";
import { workflowActivitiesFunctions } from "./functions";

/**
 * Save Check-in Activity
 * อัปโหลดรูปภาพไป Firebase Storage และบันทึก URL ลง Firestore
 * ใช้ Cloud Function สำหรับการประมวลผล
 * userId จะถูกดึงจาก authentication context ใน Cloud Function
 */
export const saveCheckInActivity = async (
  activity: Omit<CheckInActivity, "id" | "createdAt">,
  userId: string
): Promise<string> => {
  try {
    // Validate that both photos are provided
    if (!activity.data.photos.truckAndLicense || !activity.data.photos.customerCheckIn) {
      throw new Error("Both check-in photos (truckAndLicense and customerCheckIn) are required");
    }

    // userId is passed but will be overridden by Cloud Function auth context
    const result = await workflowActivitiesFunctions.saveCheckInActivity(activity, userId);
    return result.id;
  } catch (error) {
    console.error("Error saving check-in activity:", error);
    throw error;
  }
};

/**
 * Save Pickup Activity
 */
export const savePickupActivity = async (
  activity: Omit<PickupActivity, "id" | "createdAt">
): Promise<string> => {
  try {
    const result = await workflowActivitiesFunctions.savePickupActivity(activity);
    return result.id;
  } catch (error) {
    console.error("Error saving pickup activity:", error);
    throw error;
  }
};

/**
 * Save Departure Activity
 */
export const saveDepartureActivity = async (
  activity: Omit<DepartureActivity, "id" | "createdAt">
): Promise<string> => {
  try {
    const result = await workflowActivitiesFunctions.saveDepartureActivity(activity);
    return result.id;
  } catch (error) {
    console.error("Error saving departure activity:", error);
    throw error;
  }
};

/**
 * Save Incident Selection Activity
 */
export const saveIncidentSelectionActivity = async (
  activity: Omit<IncidentSelectionActivity, "id" | "createdAt">
): Promise<string> => {
  try {
    const result = await workflowActivitiesFunctions.saveIncidentSelectionActivity(activity);
    return result.id;
  } catch (error) {
    console.error("Error saving incident selection activity:", error);
    throw error;
  }
};

/**
 * Save Incident Photos Activity
 */
export const saveIncidentPhotosActivity = async (
  activity: Omit<IncidentPhotosActivity, "id" | "createdAt">
): Promise<string> => {
  try {
    const result = await workflowActivitiesFunctions.saveIncidentPhotosActivity(activity);
    return result.id;
  } catch (error) {
    console.error("Error saving incident photos activity:", error);
    throw error;
  }
};

/**
 * Save Arrival Activity
 */
export const saveArrivalActivity = async (
  activity: Omit<ArrivalActivity, "id" | "createdAt">
): Promise<string> => {
  try {
    const result = await workflowActivitiesFunctions.saveArrivalActivity(activity);
    return result.id;
  } catch (error) {
    console.error("Error saving arrival activity:", error);
    throw error;
  }
};

/**
 * Save Delivery Activity
 */
export const saveDeliveryActivity = async (
  activity: Omit<DeliveryActivity, "id" | "createdAt">
): Promise<string> => {
  try {
    const result = await workflowActivitiesFunctions.saveDeliveryActivity(activity);
    return result.id;
  } catch (error) {
    console.error("Error saving delivery activity:", error);
    throw error;
  }
};

/**
 * Generic function to save any workflow activity
 * ใช้ Cloud Function ตาม step type
 */
export const saveWorkflowActivity = async (
  activity: Omit<WorkflowActivity, "id" | "createdAt">
): Promise<string> => {
  try {
    switch (activity.step) {
      case "checkin":
        return await saveCheckInActivity(activity as Omit<CheckInActivity, "id" | "createdAt">, activity.driverId);
      case "pickup":
        return await savePickupActivity(activity as Omit<PickupActivity, "id" | "createdAt">);
      case "departure":
        return await saveDepartureActivity(activity as Omit<DepartureActivity, "id" | "createdAt">);
      case "incident_selection":
        return await saveIncidentSelectionActivity(activity as Omit<IncidentSelectionActivity, "id" | "createdAt">);
      case "incident_photos":
        return await saveIncidentPhotosActivity(activity as Omit<IncidentPhotosActivity, "id" | "createdAt">);
      case "arrival":
        return await saveArrivalActivity(activity as Omit<ArrivalActivity, "id" | "createdAt">);
      case "delivery":
        return await saveDeliveryActivity(activity as Omit<DeliveryActivity, "id" | "createdAt">);
      default:
        throw new Error(`Unknown workflow step: ${(activity as any).step}`);
    }
  } catch (error) {
    console.error("Error saving workflow activity:", error);
    throw error;
  }
};

/**
 * Get all activities for a job
 */
export const getJobActivities = async (
  jobId: string
): Promise<WorkflowActivity[]> => {
  try {
    const result = await workflowActivitiesFunctions.getJobActivities(jobId);
    return result.activities as WorkflowActivity[];
  } catch (error) {
    console.error("Error getting job activities:", error);
    throw error;
  }
};

/**
 * Get all activities for a driver
 */
export const getDriverActivities = async (
  driverId: string,
  limitCount?: number
): Promise<WorkflowActivity[]> => {
  try {
    const result = await workflowActivitiesFunctions.getDriverActivities(limitCount);
    return result.activities as WorkflowActivity[];
  } catch (error) {
    console.error("Error getting driver activities:", error);
    throw error;
  }
};

