import {
  httpsCallable,
  HttpsCallable,
  Functions,
  HttpsCallableResult,
} from "firebase/functions";
import { functions } from "./config";

/**
 * Firebase Cloud Functions Service
 * บริการสำหรับเรียกใช้ Cloud Functions
 */

/**
 * Generic function caller
 */
const callFunction = async <T = any, R = any>(
  functionName: string,
  data?: T
): Promise<R> => {
  try {
    const callable: HttpsCallable<T, R> = httpsCallable<T, R>(
      functions,
      functionName
    );
    const result: HttpsCallableResult<R> = await callable(data);
    return result.data;
  } catch (error) {
    console.error(`Error calling function ${functionName}:`, error);
    throw error;
  }
};

/**
 * Geocoding-related Cloud Functions
 */
export const geocodingFunctions = {
  // Reverse geocode coordinates
  reverseGeocode: async (latitude: number, longitude: number) => {
    return callFunction<
      { latitude: number; longitude: number },
      {
        address: {
          formatted: string;
          address_line1?: string;
          address_line2?: string;
          country?: string;
          country_code?: string;
          state?: string;
          county?: string;
          city?: string;
          postcode?: string;
          suburb?: string;
          street?: string;
          housenumber?: string;
          latitude: number;
          longitude: number;
          place_id?: string;
          plus_code?: string;
        };
        confidence?: number;
        match_type?: string;
      } | null
    >("reverse_geocode", { latitude, longitude });
  },
};

/**
 * Workflow Activities Cloud Functions
 */
export const workflowActivitiesFunctions = {
  // Save Check-in Activity
  saveCheckInActivity: async (activity: any, userId: string) => {
    return callFunction<{ activity: any }, { id: string }>("save_check_in_activity", { activity });
  },

  // Save Pickup Activity
  savePickupActivity: async (activity: any) => {
    return callFunction<{ activity: any }, { id: string }>("save_pickup_activity", { activity });
  },

  // Save Departure Activity
  saveDepartureActivity: async (activity: any) => {
    return callFunction<{ activity: any }, { id: string }>("save_departure_activity", { activity });
  },

  // Save Incident Selection Activity
  saveIncidentSelectionActivity: async (activity: any) => {
    return callFunction<{ activity: any }, { id: string }>("save_incident_selection_activity", { activity });
  },

  // Save Incident Photos Activity
  saveIncidentPhotosActivity: async (activity: any) => {
    return callFunction<{ activity: any }, { id: string }>("save_incident_photos_activity", { activity });
  },

  // Save Arrival Activity
  saveArrivalActivity: async (activity: any) => {
    return callFunction<{ activity: any }, { id: string }>("save_arrival_activity", { activity });
  },

  // Save Delivery Activity
  saveDeliveryActivity: async (activity: any) => {
    return callFunction<{ activity: any }, { id: string }>("save_delivery_activity", { activity });
  },

  // Get all activities for a job
  getJobActivities: async (jobId: string) => {
    return callFunction<{ jobId: string }, { activities: any[] }>("get_job_activities", { jobId });
  },

  // Get all activities for a driver
  getDriverActivities: async (limitCount?: number) => {
    return callFunction<{ limitCount?: number }, { activities: any[] }>("get_driver_activities", { limitCount });
  },
};

/**
 * Custom function caller for any Cloud Function
 */
export const callCloudFunction = callFunction;

