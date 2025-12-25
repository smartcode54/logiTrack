/**
 * Workflow Activities Cloud Functions
 * บริการสำหรับจัดการข้อมูล workflow activities ใน Firestore
 */

import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();
const WORKFLOW_ACTIVITIES_COLLECTION = "workflowActivities";

/**
 * Helper function to upload base64 image to Firebase Storage
 */
const uploadBase64ToStorage = async (
  base64String: string,
  userId: string,
  jobId: string,
  workflowStep: string,
  photoType: string
): Promise<string> => {
  try {
    // Convert base64 to buffer
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate file path
    const fileName = `${photoType}.jpg`;
    const filePath = `workflows/photos/${userId}/${jobId}/${workflowStep}/${fileName}`;

    // Upload to Storage
    const bucket = storage.bucket();
    const file = bucket.file(filePath);

    await file.save(buffer, {
      metadata: {
        contentType: "image/jpeg",
        metadata: {
          jobId,
          userId,
          workflowStep,
          photoType,
        },
      },
    });

    // Make file publicly accessible and get URL
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  } catch (error) {
    console.error("Error uploading to Storage:", error);
    throw new HttpsError("internal", `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

/**
 * Save Check-in Activity
 * อัปโหลดรูปภาพไป Firebase Storage และบันทึก URL ลง Firestore
 */
export const save_check_in_activity = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      // Verify authentication
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const userId = request.auth.uid;
      const { activity } = request.data;

      // Validate input
      if (!activity) {
        throw new HttpsError("invalid-argument", "Activity data is required");
      }

      if (!activity.data?.photos?.truckAndLicense || !activity.data?.photos?.customerCheckIn) {
        throw new HttpsError("invalid-argument", "Both check-in photos (truckAndLicense and customerCheckIn) are required");
      }

      // Upload photos to Storage
      const uploadPromises = [
        uploadBase64ToStorage(activity.data.photos.truckAndLicense, userId, activity.jobId, "checkin", "truckAndLicense"),
        uploadBase64ToStorage(activity.data.photos.customerCheckIn, userId, activity.jobId, "checkin", "customerCheckIn"),
      ];

      const [truckAndLicenseUrl, customerCheckInUrl] = await Promise.all(uploadPromises);

      // Create activity with Storage URLs
      const activityWithUrls = {
        ...activity,
        driverId: userId, // Ensure driverId matches authenticated user
        data: {
          ...activity.data,
          photos: {
            truckAndLicense: truckAndLicenseUrl,
            customerCheckIn: customerCheckInUrl,
          },
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Save to Firestore
      const docRef = await db.collection(WORKFLOW_ACTIVITIES_COLLECTION).add(activityWithUrls);

      return { id: docRef.id };
    } catch (error) {
      console.error("Error saving check-in activity:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", `Failed to save check-in activity: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
);

/**
 * Save Pickup Activity
 */
export const save_pickup_activity = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const userId = request.auth.uid;
      const { activity } = request.data;

      if (!activity) {
        throw new HttpsError("invalid-argument", "Activity data is required");
      }

      const activityData = {
        ...activity,
        driverId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection(WORKFLOW_ACTIVITIES_COLLECTION).add(activityData);

      return { id: docRef.id };
    } catch (error) {
      console.error("Error saving pickup activity:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", `Failed to save pickup activity: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
);

/**
 * Save Departure Activity
 */
export const save_departure_activity = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const userId = request.auth.uid;
      const { activity } = request.data;

      if (!activity) {
        throw new HttpsError("invalid-argument", "Activity data is required");
      }

      const activityData = {
        ...activity,
        driverId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection(WORKFLOW_ACTIVITIES_COLLECTION).add(activityData);

      return { id: docRef.id };
    } catch (error) {
      console.error("Error saving departure activity:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", `Failed to save departure activity: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
);

/**
 * Save Incident Selection Activity
 */
export const save_incident_selection_activity = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const userId = request.auth.uid;
      const { activity } = request.data;

      if (!activity) {
        throw new HttpsError("invalid-argument", "Activity data is required");
      }

      const activityData = {
        ...activity,
        driverId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection(WORKFLOW_ACTIVITIES_COLLECTION).add(activityData);

      return { id: docRef.id };
    } catch (error) {
      console.error("Error saving incident selection activity:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", `Failed to save incident selection activity: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
);

/**
 * Save Incident Photos Activity
 */
export const save_incident_photos_activity = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const userId = request.auth.uid;
      const { activity } = request.data;

      if (!activity) {
        throw new HttpsError("invalid-argument", "Activity data is required");
      }

      const activityData = {
        ...activity,
        driverId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection(WORKFLOW_ACTIVITIES_COLLECTION).add(activityData);

      return { id: docRef.id };
    } catch (error) {
      console.error("Error saving incident photos activity:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", `Failed to save incident photos activity: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
);

/**
 * Save Arrival Activity
 */
export const save_arrival_activity = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const userId = request.auth.uid;
      const { activity } = request.data;

      if (!activity) {
        throw new HttpsError("invalid-argument", "Activity data is required");
      }

      const activityData = {
        ...activity,
        driverId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection(WORKFLOW_ACTIVITIES_COLLECTION).add(activityData);

      return { id: docRef.id };
    } catch (error) {
      console.error("Error saving arrival activity:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", `Failed to save arrival activity: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
);

/**
 * Save Delivery Activity
 */
export const save_delivery_activity = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const userId = request.auth.uid;
      const { activity } = request.data;

      if (!activity) {
        throw new HttpsError("invalid-argument", "Activity data is required");
      }

      const activityData = {
        ...activity,
        driverId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection(WORKFLOW_ACTIVITIES_COLLECTION).add(activityData);

      return { id: docRef.id };
    } catch (error) {
      console.error("Error saving delivery activity:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", `Failed to save delivery activity: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
);

/**
 * Get all activities for a job
 */
export const get_job_activities = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const { jobId } = request.data;

      if (!jobId) {
        throw new HttpsError("invalid-argument", "Job ID is required");
      }

      const snapshot = await db.collection(WORKFLOW_ACTIVITIES_COLLECTION).where("jobId", "==", jobId).orderBy("timestamp", "asc").get();

      const activities = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { activities };
    } catch (error) {
      console.error("Error getting job activities:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", `Failed to get job activities: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
);

/**
 * Get all activities for a driver
 */
export const get_driver_activities = onCall(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const userId = request.auth.uid;
      const { limitCount } = request.data;

      let query = db.collection(WORKFLOW_ACTIVITIES_COLLECTION).where("driverId", "==", userId).orderBy("timestamp", "desc");

      if (limitCount && typeof limitCount === "number") {
        query = query.limit(limitCount);
      }

      const snapshot = await query.get();

      const activities = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { activities };
    } catch (error) {
      console.error("Error getting driver activities:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", `Failed to get driver activities: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
);
