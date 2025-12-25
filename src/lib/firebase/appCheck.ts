import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider,
  AppCheck,
} from "firebase/app-check";
import { app } from "./config";

/**
 * Firebase App Check Service
 * บริการสำหรับป้องกันการใช้งาน API และ backend resources โดยไม่ได้รับอนุญาต
 *
 * App Check ช่วยป้องกัน:
 * - Abuse และ bot attacks
 * - Unauthorized API access
 * - Resource abuse
 */

let appCheck: AppCheck | null = null;

/**
 * Initialize App Check with reCAPTCHA v3
 * สำหรับใช้งาน reCAPTCHA v3 (ฟรี)
 */
export const initializeAppCheckV3 = (siteKey: string): AppCheck | null => {
  if (typeof window === "undefined") {
    return null;
  }

  if (appCheck) {
    return appCheck;
  }

  if (!siteKey) {
    // Silent validation - no console logs
    return null;
  }

  try {
    // Validate site key format before initialization
    if (!siteKey.startsWith("6L")) {
      // Silent validation - no console logs
      return null;
    }

    const provider = new ReCaptchaV3Provider(siteKey);

    appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true, // Auto-refresh tokens
    });

    // Silent initialization - no console logs
    return appCheck;
  } catch (error: any) {
    // Don't throw error - allow app to continue without App Check
    // This is especially important for authentication to work
    // Silent error handling - no console logs
    // Return null instead of throwing - this allows authentication to proceed
    return null;
  }
};

/**
 * Initialize App Check with reCAPTCHA Enterprise
 * สำหรับใช้งาน reCAPTCHA Enterprise (ต้องมี subscription)
 */
export const initializeAppCheckEnterprise = (
  siteKey: string
): AppCheck | null => {
  if (typeof window === "undefined") {
    return null;
  }

  if (appCheck) {
    return appCheck;
  }

  if (!siteKey) {
    // Silent validation - no console logs
    return null;
  }

  try {
    // Enable Debug Mode BEFORE creating provider
    // Silent - no console logs to avoid clutter
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      (window as Window & { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    // Validate site key format before initialization
    if (!siteKey.startsWith("6L")) {
      // Silent validation - no console logs
      return null;
    }

    // ใช้ ReCaptchaEnterpriseProvider แทน ReCaptchaV3Provider
    const provider = new ReCaptchaEnterpriseProvider(siteKey);
    appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true, // Auto-refresh tokens
    });

    // Silent initialization - no console logs
    return appCheck;
  } catch (error: any) {
    // Don't throw error - allow app to continue without App Check
    // This is especially important for authentication to work
    // Silent error handling - no console logs
    // Return null instead of throwing - this allows authentication to proceed
    return null;
  }
};

/**
 * Get App Check instance
 */
export const getAppCheck = (): AppCheck | null => {
  return appCheck;
};

/**
 * Initialize App Check based on environment variables
 * ใช้ reCAPTCHA Enterprise เป็นหลัก (6LfMkZsAAAAAOKt...)
 * หรือใช้ reCAPTCHA v3 ถ้าไม่มี Enterprise key
 */
export const initializeAppCheckAuto = (): AppCheck | null => {
  if (typeof window === "undefined") {
    return null;
  }

  // If already initialized, return existing instance
  if (appCheck) {
    return appCheck;
  }

  // Enable Debug Mode for App Check (development only)
  // Silent - no console logs to avoid clutter
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    (window as Window & { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  // Priority: Enterprise > V3 SiteKey > V3 Site Key
  // ใช้ Enterprise key จากรูป: 6LfMkZsAAAAAOKt...
  const enterpriseKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  const v3Key =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY ||
    process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

  try {
    if (enterpriseKey) {
      return initializeAppCheckEnterprise(enterpriseKey);
    } else if (v3Key) {
      return initializeAppCheckV3(v3Key);
    } else {
      // Silently skip if no keys are configured - this is normal for development
      return null;
    }
  } catch (error: any) {
    // Don't throw - App Check is optional and shouldn't block the app
    // Silent error handling - no console logs
    return null;
  }
};

/**
 * Check if App Check is initialized
 */
export const isAppCheckInitialized = (): boolean => {
  return appCheck !== null;
};

export default appCheck;

// Export debug utilities
export {
  getAppCheckDebugInfo,
  logAppCheckDebugInfo,
  verifyRecaptchaScript,
  testRecaptchaToken,
  debugAppCheck,
} from "./appCheckDebug";
