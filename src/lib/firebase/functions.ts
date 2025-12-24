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
 * Job-related Cloud Functions
 */
export const jobFunctions = {
  // Assign job to driver
  assignJob: async (jobId: string, driverId: string) => {
    return callFunction<{ jobId: string; driverId: string }, { success: boolean }>(
      "assignJob",
      { jobId, driverId }
    );
  },

  // Complete job workflow
  completeJobWorkflow: async (jobId: string, workflowData: any) => {
    return callFunction<
      { jobId: string; workflowData: any },
      { success: boolean; jobId: string }
    >("completeJobWorkflow", { jobId, workflowData });
  },

  // Generate job report
  generateJobReport: async (jobId: string, format: "pdf" | "excel" = "pdf") => {
    return callFunction<
      { jobId: string; format: string },
      { url: string; expiresAt: number }
    >("generateJobReport", { jobId, format });
  },

  // Send job notification
  sendJobNotification: async (jobId: string, notificationType: string) => {
    return callFunction<
      { jobId: string; notificationType: string },
      { success: boolean }
    >("sendJobNotification", { jobId, notificationType });
  },
};

/**
 * Expense-related Cloud Functions
 */
export const expenseFunctions = {
  // Process expense receipt OCR
  processReceiptOCR: async (imageUrl: string) => {
    return callFunction<
      { imageUrl: string },
      {
        success: boolean;
        amount?: number;
        merchant?: string;
        date?: string;
        items?: Array<{ name: string; price: number }>;
      }
    >("processReceiptOCR", { imageUrl });
  },

  // Generate expense report
  generateExpenseReport: async (
    userId: string,
    startDate: string,
    endDate: string,
    format: "pdf" | "excel" = "pdf"
  ) => {
    return callFunction<
      {
        userId: string;
        startDate: string;
        endDate: string;
        format: string;
      },
      { url: string; expiresAt: number }
    >("generateExpenseReport", { userId, startDate, endDate, format });
  },

  // Validate expense
  validateExpense: async (expenseId: string) => {
    return callFunction<
      { expenseId: string },
      { valid: boolean; errors?: string[] }
    >("validateExpense", { expenseId });
  },

  // Calculate expense statistics
  calculateExpenseStats: async (
    userId: string,
    startDate: string,
    endDate: string
  ) => {
    return callFunction<
      { userId: string; startDate: string; endDate: string },
      {
        total: number;
        byCategory: Record<string, number>;
        averagePerDay: number;
        count: number;
      }
    >("calculateExpenseStats", { userId, startDate, endDate });
  },
};

/**
 * Notification-related Cloud Functions
 */
export const notificationFunctions = {
  // Send push notification
  sendPushNotification: async (
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ) => {
    return callFunction<
      { userId: string; title: string; body: string; data?: Record<string, any> },
      { success: boolean; messageId: string }
    >("sendPushNotification", { userId, title, body, data });
  },

  // Send email notification
  sendEmailNotification: async (
    email: string,
    subject: string,
    template: string,
    data?: Record<string, any>
  ) => {
    return callFunction<
      {
        email: string;
        subject: string;
        template: string;
        data?: Record<string, any>;
      },
      { success: boolean; messageId: string }
    >("sendEmailNotification", { email, subject, template, data });
  },
};

/**
 * Analytics-related Cloud Functions
 */
export const analyticsFunctions = {
  // Get driver analytics
  getDriverAnalytics: async (
    userId: string,
    startDate: string,
    endDate: string
  ) => {
    return callFunction<
      { userId: string; startDate: string; endDate: string },
      {
        totalJobs: number;
        completedJobs: number;
        totalDistance: number;
        averageDeliveryTime: number;
        onTimeRate: number;
      }
    >("getDriverAnalytics", { userId, startDate, endDate });
  },

  // Get route optimization
  optimizeRoute: async (jobIds: string[]) => {
    return callFunction<
      { jobIds: string[] },
      { optimizedOrder: string[]; estimatedTime: number; distance: number }
    >("optimizeRoute", { jobIds });
  },
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
        address: string;
        formatted: string;
        components: Record<string, string>;
      }
    >("reverseGeocode", { latitude, longitude });
  },

  // Geocode address
  geocodeAddress: async (address: string) => {
    return callFunction<
      { address: string },
      {
        latitude: number;
        longitude: number;
        formatted: string;
        placeId: string;
      }
    >("geocodeAddress", { address });
  },
};

/**
 * Image processing Cloud Functions
 */
export const imageProcessingFunctions = {
  // Detect blur in image
  detectBlur: async (imageUrl: string) => {
    return callFunction<
      { imageUrl: string },
      { isBlurry: boolean; blurScore: number }
    >("detectBlur", { imageUrl });
  },

  // Compress image
  compressImage: async (imageUrl: string, quality: number = 80) => {
    return callFunction<
      { imageUrl: string; quality: number },
      { compressedUrl: string; originalSize: number; compressedSize: number }
    >("compressImage", { imageUrl, quality });
  },

  // Extract text from image (OCR)
  extractTextFromImage: async (imageUrl: string) => {
    return callFunction<
      { imageUrl: string },
      { text: string; confidence: number }
    >("extractTextFromImage", { imageUrl });
  },
};

/**
 * Custom function caller for any Cloud Function
 */
export const callCloudFunction = callFunction;

