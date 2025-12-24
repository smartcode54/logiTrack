# Security Configuration Guide

## 🔒 Security Settings

### Current Status

✅ **Next.js Security Headers**: Configured
✅ **Firebase Services**: Configured
✅ **Firebase App Check**: Configured
⚠️ **Dependencies**: Need to check for latest versions

### Security Headers Configuration

Security headers have been configured in `next.config.ts`:

- **X-DNS-Prefetch-Control**: Enables DNS prefetching
- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Controls browser features
- **Content-Security-Policy (CSP)**: Restricts resource loading

### Firebase Security Rules

⚠️ **Important**: You need to configure Firebase Security Rules in Firebase Console:

#### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /{collection}/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    // Jobs collection
    match /jobs/{jobId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Expenses collection
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Delivered jobs collection
    match /deliveredJobs/{jobId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Workflows collection
    match /workflows/{workflowId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /{allPaths=**} {
      allow read, write: if request.auth != null &&
        request.resource.name.matches('.*/' + request.auth.uid + '/.*');
    }

    // Expense receipts
    match /expenses/receipts/{userId}/{expenseId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Fuel images
    match /expenses/fuel/{userId}/{expenseId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Job photos
    match /jobs/photos/{userId}/{jobId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Workflow photos
    match /workflows/photos/{userId}/{jobId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Profile photos
    match /profiles/photos/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Dependency Security

#### Current Versions

- **Next.js**: 16.1.1
- **React**: 19.2.3
- **React-DOM**: 19.2.3
- **Firebase**: 10.14.1

#### Security Recommendations

1. **Check for Security Vulnerabilities**:

   ```bash
   npm audit
   ```

2. **Update Dependencies**:

   ```bash
   npm update
   ```

3. **Check for Latest Stable Versions**:
   - Visit [Next.js Releases](https://github.com/vercel/next.js/releases)
   - Visit [React Releases](https://github.com/facebook/react/releases)

### Environment Variables Security

⚠️ **Important**: Never commit `.env.local` file to version control.

Ensure these environment variables are set securely:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Geoapify API Key
NEXT_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_key
```

### Security Best Practices

1. **Authentication**:

   - Always verify user authentication before accessing Firebase services
   - Use Firebase Auth state listeners
   - Implement proper error handling

2. **Data Validation**:

   - Validate all user inputs
   - Sanitize data before storing in Firestore
   - Use TypeScript types for type safety

3. **File Uploads**:

   - Validate file types and sizes
   - Scan uploaded files for malware (if possible)
   - Use Firebase Storage security rules

4. **API Security**:

   - Use HTTPS for all API calls
   - Implement rate limiting
   - Validate API requests

5. **Error Handling**:
   - Don't expose sensitive information in error messages
   - Log errors securely
   - Handle authentication errors gracefully

### Security Checklist

- [x] Security headers configured in `next.config.ts`
- [x] Firebase App Check configured
- [ ] Firebase Security Rules configured
- [ ] Environment variables secured
- [ ] Dependencies updated to latest stable versions
- [ ] Authentication implemented properly
- [ ] Input validation in place
- [ ] Error handling implemented
- [ ] HTTPS enabled in production
- [ ] Regular security audits performed
- [ ] reCAPTCHA site key configured
- [ ] App Check enforcement mode set in Firebase Console

### Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. Do not create a public GitHub issue
2. Contact the project maintainers directly
3. Provide detailed information about the vulnerability

### Resources

- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Security Guidelines](https://owasp.org/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
