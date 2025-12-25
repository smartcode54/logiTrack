# App Check Troubleshooting Guide

## 🔍 Quick Debug Commands

### In Browser Console

```javascript
// Run comprehensive debug check
await debugAppCheck();

// Get App Check information
getAppCheckInfo();

// Check reCAPTCHA script status
const { verifyRecaptchaScript } = await import("@/lib/firebase");
verifyRecaptchaScript();
```

## Common Errors

### 401 Unauthorized from reCAPTCHA API

**Error:**
```
POST https://www.google.com/recaptcha/api2/pat?k=6LfMKZYsAAAAA... 401 (Unauthorized)
```

**Causes:**
1. **Domain not registered**: The domain you're using is not added to the reCAPTCHA site settings
2. **Site key mismatch**: The site key doesn't match the one registered in Firebase App Check
3. **Invalid site key**: The site key is incorrect or has been deleted

**Solutions:**

1. **Check domain registration:**
   - Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
   - Select your site
   - Check "Domains" section
   - For localhost: Add `localhost` (without port)
   - For production: Add your actual domain

2. **Verify site key in Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Navigate to **Build** > **App Check**
   - Check the site key matches your environment variable

3. **Check environment variables:**
   ```bash
   # In browser console
   console.log(process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY);
   console.log(process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY);
   console.log(process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY);
   ```

### 400 Bad Request from Firebase App Check

**Error:**
```
POST https://content-firebaseappcheck.googleapis.com/v1/projects/.../exchangeRecaptchaV3Token?key=... 400 (Bad Request)
```

**Causes:**
1. **Invalid reCAPTCHA token**: The token from reCAPTCHA API is invalid or expired
2. **Site key not registered in Firebase**: The site key is not added to Firebase App Check
3. **Token format issue**: The token format is incorrect

**Solutions:**

1. **Verify App Check configuration:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Navigate to **Build** > **App Check**
   - Ensure reCAPTCHA provider is added
   - Verify the site key matches your environment variable

2. **Check token generation:**
   ```javascript
   // In browser console
   const { testRecaptchaToken } = await import("@/lib/firebase");
   const siteKey = "YOUR_SITE_KEY";
   const result = await testRecaptchaToken(siteKey);
   console.log(result);
   ```

3. **Verify reCAPTCHA script is loaded:**
   ```javascript
   const { verifyRecaptchaScript } = await import("@/lib/firebase");
   const status = verifyRecaptchaScript();
   console.log(status);
   ```

## Step-by-Step Verification

### 1. Check Environment Variables

```javascript
// In browser console
const info = getAppCheckInfo();
console.log("Site Key:", info.siteKey);
console.log("Site Key Source:", info.siteKeySource);
console.log("Errors:", info.errors);
```

### 2. Verify reCAPTCHA Script

```javascript
// Check if script is loaded
if (typeof grecaptcha !== "undefined") {
  console.log("✓ reCAPTCHA script loaded");
  if (grecaptcha.enterprise) {
    console.log("  Type: Enterprise");
  } else {
    console.log("  Type: v3");
  }
} else {
  console.error("✗ reCAPTCHA script not loaded");
}
```

### 3. Test Token Generation

```javascript
// Get site key from environment
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY || 
                process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY ||
                process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;

if (siteKey) {
  const { testRecaptchaToken } = await import("@/lib/firebase");
  const result = await testRecaptchaToken(siteKey);
  if (result.success) {
    console.log("✓ Token generated:", result.token.substring(0, 20) + "...");
  } else {
    console.error("✗ Token generation failed:", result.error);
  }
}
```

### 4. Check Domain Configuration

```javascript
// Check current domain
console.log("Current domain:", window.location.hostname);
console.log("Full URL:", window.location.href);

// Verify domain is in reCAPTCHA settings
// Go to: https://www.google.com/recaptcha/admin
// Check if your domain is listed
```

### 5. Verify Firebase App Check Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Build** > **App Check**
4. Check:
   - Provider is added (reCAPTCHA v3 or Enterprise)
   - Site key matches your environment variable
   - Enforcement mode is set correctly

## Debug Checklist

- [ ] Environment variables are set correctly
- [ ] Site key format is valid (starts with "6L")
- [ ] Domain is added to reCAPTCHA site settings
- [ ] Site key matches between reCAPTCHA and Firebase
- [ ] reCAPTCHA script is loaded in browser
- [ ] App Check is initialized (check console logs)
- [ ] Token can be generated successfully
- [ ] Firebase App Check provider is configured

## Quick Fixes

### Fix 1: Domain Not Registered

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Select your site
3. Click "Settings"
4. Add your domain:
   - For localhost: `localhost` (no port)
   - For production: `yourdomain.com`

### Fix 2: Site Key Mismatch

1. Check your `.env` file for the site key
2. Go to Firebase Console > App Check
3. Verify the site key matches
4. If not, update either:
   - Your `.env` file, OR
   - Firebase App Check provider settings

### Fix 3: Script Not Loading

1. Check `src/app/layout.tsx` for reCAPTCHA script
2. Verify the script URL is correct
3. Check browser console for script loading errors
4. Ensure no ad blockers are interfering

## Getting Help

If issues persist:

1. Run `await debugAppCheck()` in browser console
2. Copy the output
3. Check Firebase Console logs
4. Check reCAPTCHA Admin console for errors
5. Verify all environment variables are set correctly

