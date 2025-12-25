/**
 * Utility functions for verifying reCAPTCHA Enterprise tokens
 */

export interface VerifyTokenParams {
  token: string;
  expectedAction?: string;
  siteKey: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  score?: number;
  action?: string;
  error?: string;
}

import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/config";

/**
 * Verify reCAPTCHA Enterprise token using Firebase Function
 * 
 * @param params - Token verification parameters
 * @returns Verification result
 */
export async function verifyRecaptchaToken(
  params: VerifyTokenParams
): Promise<VerifyTokenResponse> {
  try {
    const verifyRecaptcha = httpsCallable<
      { token: string; expectedAction?: string; siteKey?: string },
      VerifyTokenResponse
    >(functions, "verifyRecaptcha");

    const result = await verifyRecaptcha({
      token: params.token,
      expectedAction: params.expectedAction,
      siteKey: params.siteKey,
    });

    return result.data;
  } catch (error: any) {
    console.error("Error verifying reCAPTCHA token:", error);
    return {
      success: false,
      error: error.message || "Failed to verify token",
    };
  }
}

/**
 * Get reCAPTCHA token from grecaptcha.enterprise.execute()
 * This is a helper function to get token on client side
 * 
 * @param siteKey - reCAPTCHA Enterprise site key
 * @param action - User action (optional)
 * @returns Token string
 */
export async function getRecaptchaToken(
  siteKey: string,
  action?: string
): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  // Check if grecaptcha is loaded
  if (typeof (window as any).grecaptcha === "undefined") {
    console.error("grecaptcha is not loaded. Make sure reCAPTCHA script is included.");
    return null;
  }

  try {
    const grecaptcha = (window as any).grecaptcha;
    
    // Execute reCAPTCHA Enterprise
    const token = await grecaptcha.enterprise.execute(siteKey, {
      action: action || "verify",
    });

    return token;
  } catch (error: any) {
    console.error("Error getting reCAPTCHA token:", error);
    return null;
  }
}

/**
 * Verify reCAPTCHA token with automatic token retrieval
 * 
 * @param siteKey - reCAPTCHA Enterprise site key
 * @param action - User action (optional)
 * @returns Verification result
 */
export async function verifyRecaptchaWithAutoToken(
  siteKey: string,
  action?: string
): Promise<VerifyTokenResponse> {
  // Get token first
  const token = await getRecaptchaToken(siteKey, action);

  if (!token) {
    return {
      success: false,
      error: "Failed to get reCAPTCHA token",
    };
  }

  // Verify token
  return verifyRecaptchaToken({
    token,
    expectedAction: action,
    siteKey,
  });
}

