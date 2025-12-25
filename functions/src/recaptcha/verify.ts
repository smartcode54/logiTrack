/**
 * reCAPTCHA Verification Cloud Function
 * Verifies reCAPTCHA tokens (supports both v3 and Enterprise)
 */

import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getRecaptchaConfig } from "../utils/config";

interface VerifyRequest {
  token: string;
  expectedAction?: string;
  siteKey?: string;
}

export const verifyRecaptcha = onCall<VerifyRequest>(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      const { token, expectedAction, siteKey: siteKeyFromBody } = request.data;

      if (!token) {
        throw new HttpsError("invalid-argument", "Token is required");
      }

      const { apiKey, secretKey, projectId } = getRecaptchaConfig();

      const siteKey =
        siteKeyFromBody ||
        process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY ||
        process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY ||
        process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

      const isEnterprise = !!(apiKey && projectId);

      if (isEnterprise) {
        if (!apiKey) {
          throw new HttpsError("invalid-argument", "GOOGLE_RECAPTCHA_API_KEY is required for Enterprise");
        }
        if (!projectId) {
          throw new HttpsError("failed-precondition", "FIREBASE_PROJECT_ID is required for Enterprise");
        }
      } else if (!secretKey && !apiKey) {
        throw new HttpsError("failed-precondition", "RECAPTCHA_SECRETKEY or GOOGLE_RECAPTCHA_API_KEY is required");
      }

      if (!siteKey) {
        throw new HttpsError("invalid-argument", "Site key is required.");
      }

      let response: Response;

      if (isEnterprise) {
        const requestBody = {
          event: {
            token,
            siteKey,
            ...(expectedAction && { expectedAction }),
          },
        };

        const apiUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;

        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(requestBody),
        });
      } else {
        const secretKeyToUse = secretKey || apiKey;
        const apiUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKeyToUse}&response=${token}`;

        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new HttpsError("internal", errorData.error?.message || "API request failed");
      }

      const responseData = await response.json();

      if (isEnterprise) {
        const { tokenProperties, riskAnalysis } = responseData;

        if (!tokenProperties?.valid) {
          return {
            success: false,
            error: tokenProperties?.invalidReason || "Invalid token",
          };
        }

        if (expectedAction && tokenProperties.action !== expectedAction) {
          return {
            success: false,
            error: `Action mismatch. Expected: ${expectedAction}`,
          };
        }

        return {
          success: true,
          score: riskAnalysis?.score || 0,
          action: tokenProperties.action,
        };
      }

      if (!responseData.success) {
        const errorCodes = responseData["error-codes"];
        return {
          success: false,
          error: errorCodes?.join(", ") || "Verification failed",
        };
      }

      if (expectedAction && responseData.action !== expectedAction) {
        return {
          success: false,
          error: `Action mismatch. Expected: ${expectedAction}`,
        };
      }

      return {
        success: true,
        score: responseData.score || 0,
        action: responseData.action,
      };
    } catch (error) {
      console.error("reCAPTCHA Error:", error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", "Internal server error");
    }
  }
);
