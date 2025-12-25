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
    // Validate site key format before initialization
    if (!siteKey.startsWith("6L")) {
      console.error(
        `App Check: Invalid site key format. Site keys should start with "6L". Got: ${siteKey.substring(
          0,
          10
        )}...`
      );
      return null;
    }

    // Log initialization attempt with site key info (first 10 chars only for security)
    console.log(
      `App Check: Initializing with reCAPTCHA v3 (site key: ${siteKey.substring(
        0,
        10
      )}...)`
    );

    const provider = new ReCaptchaV3Provider(siteKey);

    // #region agent log
    // Intercept reCAPTCHA API calls to capture 401 errors
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      // Handle different types: string, URL, or Request
      let url = "";
      if (typeof args[0] === "string") {
        url = args[0];
      } else if (args[0] instanceof URL) {
        url = args[0].toString();
      } else if (args[0] instanceof Request) {
        url = args[0].url;
      }

      if (
        url.includes("google.com/recaptcha") ||
        url.includes("api2/pat") ||
        url.includes("api2/clr")
      ) {
        const siteKeyFromUrl = url.match(/[?&]k=([^&]+)/)?.[1] || "not found";
        fetch(
          "http://127.0.0.1:7243/ingest/794127e4-2397-4f04-a65f-c2ecca93a186",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "appCheck.ts:56",
              message: "reCAPTCHA API request",
              data: {
                url,
                siteKeyFromUrl: siteKeyFromUrl.substring(0, 20),
                method: args[1]?.method || "GET",
                domain:
                  typeof window !== "undefined"
                    ? window.location.hostname
                    : "N/A",
              },
              timestamp: Date.now(),
              sessionId: "debug-session",
              runId: "run1",
              hypothesisId: "D",
            }),
          }
        ).catch(() => {});

        return originalFetch.apply(this, args).then((response) => {
          // #region agent log
          // Log all reCAPTCHA responses to check for PrivateToken challenge
          const wwwAuthenticate = response.headers.get("Www-Authenticate");
          fetch(
            "http://127.0.0.1:7243/ingest/794127e4-2397-4f04-a65f-c2ecca93a186",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "appCheck.ts:65",
                message: "reCAPTCHA API response headers",
                data: {
                  status: response.status,
                  statusText: response.statusText,
                  url,
                  hasWwwAuthenticate: !!wwwAuthenticate,
                  wwwAuthenticatePreview:
                    wwwAuthenticate?.substring(0, 100) || "none",
                  domain:
                    typeof window !== "undefined"
                      ? window.location.hostname
                      : "N/A",
                },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "run1",
                hypothesisId: "H",
              }),
            }
          ).catch(() => {});
          // #endregion

          if (!response.ok) {
            response
              .clone()
              .text()
              .then((errorText) => {
                fetch(
                  "http://127.0.0.1:7243/ingest/794127e4-2397-4f04-a65f-c2ecca93a186",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      location: "appCheck.ts:71",
                      message: "reCAPTCHA API error",
                      data: {
                        status: response.status,
                        statusText: response.statusText,
                        url,
                        siteKeyFromUrl: siteKeyFromUrl.substring(0, 20),
                        errorPreview: errorText.substring(0, 200),
                        wwwAuthenticate:
                          wwwAuthenticate?.substring(0, 200) || "none",
                        domain:
                          typeof window !== "undefined"
                            ? window.location.hostname
                            : "N/A",
                      },
                      timestamp: Date.now(),
                      sessionId: "debug-session",
                      runId: "run1",
                      hypothesisId: "A",
                    }),
                  }
                ).catch(() => {});
              })
              .catch(() => {});
          }
          return response;
        });
      }
      return originalFetch.apply(this, args);
    };
    // #endregion

    appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true, // Auto-refresh tokens
    });

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/794127e4-2397-4f04-a65f-c2ecca93a186", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "appCheck.ts:78",
        message: "App Check initialized with site key",
        data: {
          siteKeyPrefix: siteKey.substring(0, 20),
          fullSiteKey: siteKey,
          domain:
            typeof window !== "undefined" ? window.location.hostname : "N/A",
          fullUrl: typeof window !== "undefined" ? window.location.href : "N/A",
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "B",
      }),
    }).catch(() => {});
    // #endregion

    console.log("✓ App Check initialized successfully with reCAPTCHA v3");
    console.log(`  Site key: ${siteKey.substring(0, 10)}...`);
    console.log(
      `  Domain: ${
        typeof window !== "undefined" ? window.location.hostname : "N/A"
      }`
    );
    return appCheck;
  } catch (error: any) {
    // Don't throw error - allow app to continue without App Check
    console.error(
      "✗ App Check initialization failed (reCAPTCHA v3):",
      error?.message || error
    );
    console.error("  Site key used:", siteKey.substring(0, 10) + "...");
    console.error(
      "  Domain:",
      typeof window !== "undefined" ? window.location.hostname : "N/A"
    );
    console.warn(
      "App will continue without App Check protection. This is normal if App Check is not configured in Firebase Console."
    );
    console.warn(
      "Common issues:",
      "\n  1. Site key not registered in Firebase App Check",
      "\n  2. Domain not added to reCAPTCHA site settings",
      "\n  3. Site key mismatch between reCAPTCHA and Firebase"
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
    // Validate site key format before initialization
    if (!siteKey.startsWith("6L")) {
      console.error(
        `App Check: Invalid site key format. Site keys should start with "6L". Got: ${siteKey.substring(
          0,
          10
        )}...`
      );
      return null;
    }

    // Log initialization attempt with site key info (first 10 chars only for security)
    console.log(
      `App Check: Initializing with reCAPTCHA Enterprise (site key: ${siteKey.substring(
        0,
        10
      )}...)`
    );

    const provider = new ReCaptchaEnterpriseProvider(siteKey);
    appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true, // Auto-refresh tokens
    });

    console.log(
      "✓ App Check initialized successfully with reCAPTCHA Enterprise"
    );
    console.log(`  Site key: ${siteKey.substring(0, 10)}...`);
    console.log(
      `  Domain: ${
        typeof window !== "undefined" ? window.location.hostname : "N/A"
      }`
    );
    return appCheck;
  } catch (error: any) {
    // Don't throw error - allow app to continue without App Check
    console.error(
      "✗ App Check initialization failed (reCAPTCHA Enterprise):",
      error?.message || error
    );
    console.error("  Site key used:", siteKey.substring(0, 10) + "...");
    console.error(
      "  Domain:",
      typeof window !== "undefined" ? window.location.hostname : "N/A"
    );
    console.warn(
      "App will continue without App Check protection. This is normal if App Check is not configured in Firebase Console."
    );
    console.warn(
      "Common issues:",
      "\n  1. Site key not registered in Firebase App Check",
      "\n  2. Domain not added to reCAPTCHA site settings",
      "\n  3. Site key mismatch between reCAPTCHA and Firebase"
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

  // Priority: Enterprise > V3 SiteKey > V3 Site Key
  const enterpriseKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  const v3Key =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY ||
    process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

  // #region agent log
  const currentDomain =
    typeof window !== "undefined" ? window.location.hostname : "N/A";
  fetch("http://127.0.0.1:7243/ingest/794127e4-2397-4f04-a65f-c2ecca93a186", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "appCheck.ts:168",
      message: "Site key selection",
      data: {
        enterpriseKey: enterpriseKey?.substring(0, 10) || "not set",
        v3Key: v3Key?.substring(0, 10) || "not set",
        domain: currentDomain,
        allEnvKeys: {
          NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY: !!enterpriseKey,
          NEXT_PUBLIC_RECAPTCHA_SITEKEY:
            !!process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY,
          NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY:
            !!process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY,
        },
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "C",
    }),
  }).catch(() => {});
  // #endregion

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

// Export debug utilities
export {
  getAppCheckDebugInfo,
  logAppCheckDebugInfo,
  verifyRecaptchaScript,
  testRecaptchaToken,
  debugAppCheck,
} from "./appCheckDebug";
