/**
 * App Check Debug Utilities
 * Utilities for debugging and verifying App Check token requests
 */

import { getAppCheck } from "./appCheck";

/**
 * Debug information about App Check initialization
 */
export interface AppCheckDebugInfo {
  isInitialized: boolean;
  siteKey?: string;
  siteKeySource?: string;
  environment: string;
  errors: string[];
}

/**
 * Get debug information about App Check
 */
export function getAppCheckDebugInfo(): AppCheckDebugInfo {
  const appCheck = getAppCheck();
  const info: AppCheckDebugInfo = {
    isInitialized: appCheck !== null,
    environment: process.env.NODE_ENV || "development",
    errors: [],
  };

  // Check which site key is being used
  const enterpriseKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  const v3Key =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY ||
    process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

  if (enterpriseKey) {
    info.siteKey = enterpriseKey;
    info.siteKeySource = "NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY";
  } else if (v3Key) {
    info.siteKey = v3Key;
    info.siteKeySource =
      process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY
        ? "NEXT_PUBLIC_RECAPTCHA_SITEKEY"
        : "NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY";
  } else {
    info.errors.push("No reCAPTCHA site key found in environment variables");
  }

  // Validate site key format
  if (info.siteKey) {
    if (!info.siteKey.startsWith("6L")) {
      info.errors.push(
        `Invalid site key format. Site keys should start with "6L". Got: ${info.siteKey.substring(0, 10)}...`
      );
    }
  }

  return info;
}

/**
 * Log debug information to console
 */
export function logAppCheckDebugInfo(): void {
  const info = getAppCheckDebugInfo();
  console.group("🔍 App Check Debug Information");
  console.log("Initialized:", info.isInitialized);
  console.log("Environment:", info.environment);
  if (info.siteKey) {
    console.log("Site Key:", info.siteKey);
    console.log("Site Key Source:", info.siteKeySource);
  }
  if (info.errors.length > 0) {
    console.error("Errors:", info.errors);
  } else {
    console.log("✓ No configuration errors detected");
  }
  console.groupEnd();
}

/**
 * Verify reCAPTCHA script is loaded
 */
export function verifyRecaptchaScript(): {
  loaded: boolean;
  type?: "v3" | "enterprise";
  error?: string;
} {
  if (typeof window === "undefined") {
    return { loaded: false, error: "Not in browser environment" };
  }

  const grecaptcha = (window as any).grecaptcha;
  if (!grecaptcha) {
    return { loaded: false, error: "grecaptcha is not defined" };
  }

  if (grecaptcha.enterprise) {
    return { loaded: true, type: "enterprise" };
  } else if (grecaptcha.execute) {
    return { loaded: true, type: "v3" };
  } else {
    return { loaded: false, error: "grecaptcha is loaded but missing execute method" };
  }
}

/**
 * Test reCAPTCHA token generation
 */
export async function testRecaptchaToken(
  siteKey: string
): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  if (typeof window === "undefined") {
    return { success: false, error: "Not in browser environment" };
  }

  const scriptCheck = verifyRecaptchaScript();
  if (!scriptCheck.loaded) {
    return {
      success: false,
      error: `reCAPTCHA script not loaded: ${scriptCheck.error}`,
    };
  }

  try {
    const grecaptcha = (window as any).grecaptcha;
    let token: string;

    if (scriptCheck.type === "enterprise") {
      token = await grecaptcha.enterprise.execute(siteKey, {
        action: "test",
      });
    } else {
      token = await grecaptcha.execute(siteKey, {
        action: "test",
      });
    }

    return { success: true, token };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || String(error),
    };
  }
}

/**
 * Comprehensive debug check
 */
export async function debugAppCheck(): Promise<void> {
  console.group("🔍 App Check Comprehensive Debug");
  
  // 1. Check App Check initialization
  const debugInfo = getAppCheckDebugInfo();
  console.log("1. App Check Status:", debugInfo);
  
  // 2. Check reCAPTCHA script
  const scriptCheck = verifyRecaptchaScript();
  console.log("2. reCAPTCHA Script:", scriptCheck);
  
  // 3. Test token generation (if site key available)
  if (debugInfo.siteKey && scriptCheck.loaded) {
    console.log("3. Testing token generation...");
    const tokenTest = await testRecaptchaToken(debugInfo.siteKey);
    console.log("   Token Test:", tokenTest);
    
    if (tokenTest.success && tokenTest.token) {
      console.log("   ✓ Token generated successfully");
      console.log("   Token length:", tokenTest.token.length);
      console.log("   Token preview:", tokenTest.token.substring(0, 20) + "...");
    } else {
      console.error("   ✗ Token generation failed:", tokenTest.error);
      
      // Provide specific guidance based on error
      if (tokenTest.error?.includes("401") || tokenTest.error?.includes("Unauthorized")) {
        console.error("   ⚠️ 401 Unauthorized - Common causes:");
        console.error("     • Domain not registered in reCAPTCHA settings");
        console.error("     • Site key doesn't match domain");
        console.error("     • For localhost: Use 'localhost' (no port) in reCAPTCHA settings");
        console.error("     • Check: https://www.google.com/recaptcha/admin");
      }
    }
  } else {
    console.warn("3. Skipping token test (missing site key or script)");
    if (!debugInfo.siteKey) {
      console.warn("   → Set NEXT_PUBLIC_RECAPTCHA_SITEKEY or NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY");
    }
    if (!scriptCheck.loaded) {
      console.warn("   → Check reCAPTCHA script loading in layout.tsx");
    }
  }
  
  // 4. Check current domain
  if (typeof window !== "undefined") {
    console.log("4. Current Domain:", window.location.hostname);
    console.log("   Full URL:", window.location.href);
    
    // Warn about localhost port issues
    if (window.location.hostname === "localhost") {
      console.warn("   ⚠️ For localhost, add 'localhost' (without port) to reCAPTCHA domains");
    }
  }
  
  // 5. Check for common configuration issues
  console.log("5. Configuration Check:");
  if (debugInfo.errors.length > 0) {
    console.error("   ✗ Configuration errors found:", debugInfo.errors);
  } else {
    console.log("   ✓ No configuration errors");
  }
  
  // 6. Recommendations
  console.log("6. Recommendations:");
  if (!debugInfo.isInitialized) {
    console.warn("   → App Check is not initialized");
    console.warn("   → Check Firebase Console > App Check > Providers");
    console.warn("   → Verify site key is registered in Firebase");
  }
  
  console.groupEnd();
}

