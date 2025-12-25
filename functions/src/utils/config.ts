/**
 * Cloud Functions Configuration
 * ตั้งค่าสำหรับ Firebase Cloud Functions รวมถึง App Check enforcement
 */

// Load .env file for local development (only if not in production)
if (process.env.FUNCTIONS_EMULATOR === "true" || process.env.NODE_ENV !== "production") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("dotenv").config({ path: require("node:path").join(__dirname, "../.env") });
  } catch (error) {
    // .env file is optional, ignore if not found
    console.log("No .env file found, using environment variables from Firebase");
  }
}

/**
 * Environment detection
 * ตรวจสอบว่า environment เป็น test หรือไม่
 */
const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_TEST = ENVIRONMENT === "test" || process.env.FUNCTIONS_EMULATOR === "true";

/**
 * App Check Enforcement Configuration
 *
 * - Testing/Development: ปิด enforcement เพื่อให้ทดสอบได้ง่าย
 * - Production: เปิด enforcement เพื่อความปลอดภัย
 *
 * หมายเหตุ: App Check enforcement สามารถตั้งค่าได้ทั้งใน:
 * 1. Firebase Console (Build > App Check > Enforcement)
 * 2. Code level (enforceAppCheck option)
 *
 * การตั้งค่าใน code จะ override การตั้งค่าใน Console
 */
export const ENFORCE_APP_CHECK = !IS_TEST;

/**
 * Global Function Configuration
 * ใช้สำหรับ setGlobalOptions() ใน firebase-functions
 */
export const FUNCTION_CONFIG = {
  enforceAppCheck: ENFORCE_APP_CHECK,
  // เพิ่ม options อื่นๆ ได้ตามต้องการ
  // เช่น: maxInstances, memory, timeoutSeconds, etc.
};

/**
 * Export environment info for debugging
 */
export const CONFIG_INFO = {
  environment: ENVIRONMENT,
  isTest: IS_TEST,
  enforceAppCheck: ENFORCE_APP_CHECK,
};

/**
 * Environment Variables for External APIs
 * These should be set in Firebase Functions config or .env file
 */
export const getRecaptchaConfig = () => {
  const apiKey = process.env.GOOGLE_RECAPTCHA_API_KEY;
  const secretKey = process.env.RECAPTCHA_SECRETKEY;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;

  return {
    apiKey,
    secretKey,
    projectId,
  };
};

export const getGeoapifyConfig = () => {
  // Priority: NEXT_PUBLIC_GEOAPIFY_API_KEY (from .env) > GEOAPIFY_API_KEY > functions.config
  let apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || process.env.GEOAPIFY_API_KEY;

  // Fallback to functions.config (for legacy support, will be deprecated)
  if (!apiKey) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const functions = require("firebase-functions");
      const config = functions.config();
      apiKey = config?.geoapify?.api_key;
    } catch {
      // functions.config() not available, ignore
    }
  }

  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEOAPIFY_API_KEY, GEOAPIFY_API_KEY, or geoapify.api_key is not set");
  }
  return apiKey;
};

/**
 * Helper to get authenticated user ID from context
 */
export const getUserId = (context: { auth?: { uid: string } }): string => {
  if (!context.auth) {
    throw new Error("Unauthenticated: User must be logged in");
  }
  return context.auth.uid;
};
