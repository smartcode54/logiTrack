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
    console.warn("App Check: reCAPTCHA v3 site key is missing");
    return null;
  }

  try {
    const provider = new ReCaptchaV3Provider(siteKey);
    appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true, // Auto-refresh tokens
    });

    console.log("App Check initialized successfully with reCAPTCHA v3");
    return appCheck;
  } catch (error: any) {
    // Don't throw error - allow app to continue without App Check
    console.warn(
      "App Check initialization failed (reCAPTCHA v3):",
      error?.message || error
    );
    console.warn(
      "App will continue without App Check protection. This is normal if App Check is not configured in Firebase Console."
    );
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
    console.warn("App Check: reCAPTCHA Enterprise site key is missing");
    return null;
  }

  try {
    const provider = new ReCaptchaEnterpriseProvider(siteKey);
    appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true, // Auto-refresh tokens
    });

    console.log("App Check initialized successfully with reCAPTCHA Enterprise");
    return appCheck;
  } catch (error: any) {
    // Don't throw error - allow app to continue without App Check
    console.warn(
      "App Check initialization failed (reCAPTCHA Enterprise):",
      error?.message || error
    );
    console.warn(
      "App will continue without App Check protection. This is normal if App Check is not configured in Firebase Console."
    );
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
 * ใช้ reCAPTCHA v3 ถ้ามี NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY
 * หรือใช้ reCAPTCHA Enterprise ถ้ามี NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY
 */
export const initializeAppCheckAuto = (): AppCheck | null => {
  if (typeof window === "undefined") {
    return null;
  }

  // Priority: Enterprise > V3
  const enterpriseKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  const v3Key = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

  if (enterpriseKey) {
    console.log("Initializing App Check with reCAPTCHA Enterprise");
    return initializeAppCheckEnterprise(enterpriseKey);
  } else if (v3Key) {
    console.log("Initializing App Check with reCAPTCHA v3");
    return initializeAppCheckV3(v3Key);
  } else {
    // Silently skip if no keys are configured - this is normal for development
    // Only log if we're in a production-like environment
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "App Check not initialized: No reCAPTCHA site key found. " +
          "Set NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY or NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY"
      );
    }
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
