# reCAPTCHA Enterprise Token Verification

Utility functions for verifying reCAPTCHA Enterprise tokens using Google reCAPTCHA Enterprise API.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Google reCAPTCHA Enterprise API Key
GOOGLE_RECAPTCHA_API_KEY=your_api_key_here

# Firebase Project ID (should already be set)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

### 2. Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Create or use an existing API key
5. Restrict the API key to **reCAPTCHA Enterprise API**

## Usage

### Method 1: Verify with Manual Token

```typescript
import { verifyRecaptchaToken } from "@/lib/recaptcha";

// Get token from grecaptcha.enterprise.execute()
const token = await grecaptcha.enterprise.execute(
  "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF",
  { action: "submit_form" }
);

// Verify token
const result = await verifyRecaptchaToken({
  token,
  expectedAction: "submit_form",
  siteKey: "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF",
});

if (result.success) {
  console.log("Token verified! Score:", result.score);
  console.log("Action:", result.action);
} else {
  console.error("Verification failed:", result.error);
}
```

### Method 2: Auto Token Retrieval and Verification

```typescript
import { verifyRecaptchaWithAutoToken } from "@/lib/recaptcha";

const result = await verifyRecaptchaWithAutoToken(
  "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF",
  "submit_form"
);

if (result.success) {
  console.log("Token verified! Score:", result.score);
} else {
  console.error("Verification failed:", result.error);
}
```

### Method 3: Get Token Only

```typescript
import { getRecaptchaToken } from "@/lib/recaptcha";

const token = await getRecaptchaToken(
  "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF",
  "submit_form"
);

if (token) {
  // Use token for your own verification logic
  console.log("Token:", token);
}
```

## Example: Form Submission with reCAPTCHA

```typescript
"use client";

import { useState } from "react";
import { verifyRecaptchaWithAutoToken } from "@/lib/recaptcha";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Verify reCAPTCHA token
      const recaptchaResult = await verifyRecaptchaWithAutoToken(
        process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY!,
        "submit_contact_form"
      );

      if (!recaptchaResult.success) {
        alert("reCAPTCHA verification failed: " + recaptchaResult.error);
        return;
      }

      // Check score (0.0 = bot, 1.0 = human)
      // Recommended threshold: 0.5
      if (recaptchaResult.score && recaptchaResult.score < 0.5) {
        alert("reCAPTCHA score too low. Please try again.");
        return;
      }

      // Proceed with form submission
      // ... your form submission logic here
      
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## API Response

### Success Response

```json
{
  "success": true,
  "score": 0.9,
  "action": "submit_form"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Invalid token"
}
```

## Score Interpretation

- **0.0 - 0.3**: Likely a bot
- **0.3 - 0.7**: Suspicious, may need additional verification
- **0.7 - 1.0**: Likely a human

**Recommended threshold**: 0.5

## Notes

- The API route (`/api/recaptcha/verify`) handles the server-side verification
- Tokens are verified against Google reCAPTCHA Enterprise API
- The API key should be kept secret (server-side only)
- Site key can be public (client-side)

