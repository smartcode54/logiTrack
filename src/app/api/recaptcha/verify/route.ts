import { NextRequest, NextResponse } from "next/server";

/**
 * API Route for verifying reCAPTCHA token (supports both v3 and Enterprise)
 *
 * POST /api/recaptcha/verify
 *
 * Request body:
 * {
 *   "token": "TOKEN_FROM_RECAPTCHA", // Required: token from grecaptcha.execute() or grecaptcha.enterprise.execute()
 *   "expectedAction": "USER_ACTION", // Optional: user action
 *   "siteKey": "SITE_KEY" // Optional: if not provided, uses environment variables
 * }
 *
 * Environment Variables (Priority Order):
 * - Site Key: NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY > NEXT_PUBLIC_RECAPTCHA_SITEKEY > NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY
 * - Secret/API Key: GOOGLE_RECAPTCHA_API_KEY (Enterprise) or RECAPTCHA_SECRETKEY (v3)
 *
 * API Endpoints:
 * - Enterprise: https://recaptchaenterprise.googleapis.com/v1/projects/{project}/assessments?key={apiKey}
 * - v3: https://www.google.com/recaptcha/api/siteverify?secret={secretKey}&response={token}
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
  siteKey?: string; // Optional: can be provided in request or from NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY env var
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
    const { token, expectedAction, siteKey: siteKeyFromBody } = body;

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    // Get API key, project ID, and site key from environment variables
    // For Enterprise: use GOOGLE_RECAPTCHA_API_KEY
    // For v3: use RECAPTCHA_SECRETKEY (legacy) or GOOGLE_RECAPTCHA_API_KEY
    const apiKey = process.env.GOOGLE_RECAPTCHA_API_KEY;
    const secretKey = process.env.RECAPTCHA_SECRETKEY; // v3 secret key (legacy)
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    // Use siteKey from request body, or fallback to environment variables
    // Priority: Enterprise > v3 sitekey > v3 site key
    const siteKey = siteKeyFromBody || 
      process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY ||
      process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY ||
      process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
    
    // Determine if using Enterprise (has API key and project ID) or v3 (has secret key)
    const isEnterprise = !!apiKey && !!projectId;

    // Validate configuration based on type
    if (isEnterprise) {
      // Enterprise requires API key and project ID
      if (!apiKey) {
        console.error(
          "GOOGLE_RECAPTCHA_API_KEY is not set in environment variables"
        );
        return NextResponse.json(
          { success: false, error: "Server configuration error: GOOGLE_RECAPTCHA_API_KEY is required for Enterprise" },
          { status: 500 }
        );
      }

      if (!projectId) {
        console.error(
          "NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in environment variables"
        );
        return NextResponse.json(
          { success: false, error: "Server configuration error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is required for Enterprise" },
          { status: 500 }
        );
      }
    } else {
      // v3 requires secret key (legacy) or API key
      if (!secretKey && !apiKey) {
        console.error(
          "RECAPTCHA_SECRETKEY or GOOGLE_RECAPTCHA_API_KEY is not set in environment variables"
        );
        return NextResponse.json(
          { success: false, error: "Server configuration error: RECAPTCHA_SECRETKEY or GOOGLE_RECAPTCHA_API_KEY is required for v3" },
          { status: 500 }
        );
      }
    }

    if (!siteKey) {
      return NextResponse.json(
        { success: false, error: "Site key is required. Provide it in the request body or set NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY, NEXT_PUBLIC_RECAPTCHA_SITEKEY, or NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY in environment variables" },
        { status: 400 }
      );
    }

    let response: Response;
    
    if (isEnterprise) {
      // Use Enterprise API
      // Format matches: https://cloud.google.com/recaptcha-enterprise/docs/rest/v1/projects.assessments/create
      const requestBody = {
        event: {
          token,
          siteKey,
          ...(expectedAction && { expectedAction }),
        },
      };

      // Send POST request to Google reCAPTCHA Enterprise API
      // API endpoint: https://recaptchaenterprise.googleapis.com/v1/projects/{project}/assessments
      const apiUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;

      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(requestBody),
      });
    } else {
      // Use v3 API (legacy)
      // API endpoint: https://www.google.com/recaptcha/api/siteverify
      const secretKeyToUse = secretKey || apiKey; // Use secret key if available, otherwise use API key
      const apiUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKeyToUse}&response=${token}`;

      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`reCAPTCHA ${isEnterprise ? 'Enterprise' : 'v3'} API error:`, errorData);

      return NextResponse.json(
        {
          success: false,
          error:
            errorData.error?.message ||
            errorData["error-codes"]?.join(", ") ||
            `API request failed with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (isEnterprise) {
      // Enterprise API response format
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
    } else {
      // v3 API response format
      if (!data.success) {
        return NextResponse.json({
          success: false,
          error: data["error-codes"]?.join(", ") || "Verification failed",
        });
      }

      // Check expected action if provided
      if (expectedAction && data.action !== expectedAction) {
        return NextResponse.json({
          success: false,
          error: `Action mismatch. Expected: ${expectedAction}, Got: ${data.action}`,
        });
      }

      // Return success with score and action
      const result: VerifyResponse = {
        success: true,
        score: data.score || 0,
        action: data.action,
      };

      return NextResponse.json(result);
    }
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
