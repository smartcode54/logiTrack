/**
 * Cloud Functions Configuration
 * ตั้งค่าสำหรับ Firebase Cloud Functions รวมถึง App Check enforcement
 */

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
