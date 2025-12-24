import { NextRequest, NextResponse } from "next/server";

/**
 * API Route for verifying reCAPTCHA Enterprise token
 *
 * POST /api/recaptcha/verify
 *
 * Request body:
 * {
 *   "token": "TOKEN_FROM_RECAPTCHA",
 *   "expectedAction": "USER_ACTION" (optional),
 *   "siteKey": "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF"
 * }
 *
 * Response:
 * {
 *   "success": boolean,
 *   "score": number (0-1),
 *   "action": string,
 *   "error": string (if failed)
 * }
 */

interface VerifyRequest {
  token: string;
  expectedAction?: string;
  siteKey: string;
}

interface VerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json();
    const { token, expectedAction, siteKey } = body;

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    if (!siteKey) {
      return NextResponse.json(
        { success: false, error: "Site key is required" },
        { status: 400 }
      );
    }

    // Get API key and project ID from environment variables
    const apiKey = process.env.GOOGLE_RECAPTCHA_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!apiKey) {
      console.error(
        "GOOGLE_RECAPTCHA_API_KEY is not set in environment variables"
      );
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!projectId) {
      console.error(
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in environment variables"
      );
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create request body for Google reCAPTCHA Enterprise API
    const requestBody = {
      event: {
        token,
        siteKey,
        ...(expectedAction && { expectedAction }),
      },
    };

    // Send POST request to Google reCAPTCHA Enterprise API
    const apiUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("reCAPTCHA Enterprise API error:", errorData);

      return NextResponse.json(
        {
          success: false,
          error:
            errorData.error?.message ||
            `API request failed with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract assessment results
    const tokenProperties = data.tokenProperties;
    const riskAnalysis = data.riskAnalysis;

    // Check if token is valid
    if (!tokenProperties?.valid) {
      return NextResponse.json({
        success: false,
        error: tokenProperties?.invalidReason || "Invalid token",
      });
    }

    // Check expected action if provided
    if (expectedAction && tokenProperties.action !== expectedAction) {
      return NextResponse.json({
        success: false,
        error: `Action mismatch. Expected: ${expectedAction}, Got: ${tokenProperties.action}`,
      });
    }

    // Return success with score and action
    const result: VerifyResponse = {
      success: true,
      score: riskAnalysis?.score || 0,
      action: tokenProperties.action,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error verifying reCAPTCHA token:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
