# reCAPTCHA Keys Configuration Guide

## 🔑 Keys ที่ใช้ในโปรเจกต์

### 1. Site Key (Public Key - Frontend)
- **Variable Name**: `NEXT_PUBLIC_RECAPTCHA_SITEKEY` หรือ `NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY`
- **Value**: `6LfMKzYsAAAAAOkt_oOVzmUDKhc0Iol63lSr1uEW`
- **Usage**: ใช้ใน frontend เพื่อ load reCAPTCHA script และดึง token
- **Location**: ใช้ใน `src/app/layout.tsx` และ browser console

### 2. Secret Key (Private Key - Backend)
- **Variable Name**: `RECAPTCHA_SECRETKEY`
- **Value**: `6LfMKzYsAAAAAPQxcmsPNC3IBymeI-0_vc39qfRp`
- **Usage**: ใช้ใน backend เพื่อ verify token กับ Google reCAPTCHA API (v3 legacy)
- **Location**: ใช้ใน `src/app/api/recaptcha/verify/route.ts`

---

## 📝 Environment Variables Setup

เพิ่มในไฟล์ `.env`:

```env
# reCAPTCHA v3 Site Key (Public - Frontend)
NEXT_PUBLIC_RECAPTCHA_SITEKEY=6LfMKzYsAAAAAOkt_oOVzmUDKhc0Iol63lSr1uEW

# reCAPTCHA v3 Secret Key (Private - Backend)
RECAPTCHA_SECRETKEY=6LfMKzYsAAAAAPQxcmsPNC3IBymeI-0_vc39qfRp

# Optional: สำหรับ reCAPTCHA Enterprise (ถ้ามี)
# NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY=your_enterprise_site_key
# GOOGLE_RECAPTCHA_API_KEY=your_api_key

# Firebase Project ID (สำหรับ Enterprise)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

---

## 🔄 Priority Order

โค้ดจะตรวจสอบ keys ตามลำดับความสำคัญ:

### สำหรับ Site Key (Frontend):
1. `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` (Enterprise - ถ้ามี)
2. `NEXT_PUBLIC_RECAPTCHA_SITEKEY` (v3 - ใช้ตัวนี้)
3. `NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY` (v3 - fallback)

### สำหรับ Secret Key (Backend):
1. `GOOGLE_RECAPTCHA_API_KEY` (Enterprise API key - ถ้ามี)
2. `RECAPTCHA_SECRETKEY` (v3 secret key - ใช้ตัวนี้)

---

## 📍 ไฟล์ที่ใช้ Keys เหล่านี้

### 1. `src/app/layout.tsx`
- **ใช้**: `NEXT_PUBLIC_RECAPTCHA_SITEKEY`
- **Purpose**: Load reCAPTCHA script ในหน้าเว็บ
- **Script URL**: 
  - v3: `https://www.google.com/recaptcha/api.js?render={siteKey}`
  - Enterprise: `https://www.google.com/recaptcha/enterprise.js?render={siteKey}`

### 2. `src/app/api/recaptcha/verify/route.ts`
- **ใช้**: `RECAPTCHA_SECRETKEY` หรือ `GOOGLE_RECAPTCHA_API_KEY`
- **Purpose**: Verify token กับ Google reCAPTCHA API
- **API Endpoints**:
  - v3: `https://www.google.com/recaptcha/api/siteverify`
  - Enterprise: `https://recaptchaenterprise.googleapis.com/v1/projects/{project}/assessments`

### 3. `src/lib/firebase/appCheck.ts`
- **ใช้**: `NEXT_PUBLIC_RECAPTCHA_SITEKEY` สำหรับ App Check
- **Purpose**: Initialize Firebase App Check

### 4. `test-recaptcha-browser.js`
- **ใช้**: `NEXT_PUBLIC_RECAPTCHA_SITEKEY` (hardcoded ใน script)
- **Purpose**: Test script สำหรับดึง token ใน browser console

---

## 🔍 ตรวจสอบว่า Keys ถูกใช้ถูกต้อง

### ตรวจสอบใน Browser Console:
```javascript
// ตรวจสอบว่า reCAPTCHA script ถูก load
if (typeof grecaptcha !== "undefined") {
  if (grecaptcha.enterprise) {
    console.log("✓ reCAPTCHA Enterprise loaded");
  } else if (grecaptcha.execute) {
    console.log("✓ reCAPTCHA v3 loaded");
  }
} else {
  console.error("✗ reCAPTCHA not loaded");
}
```

### ตรวจสอบใน Server Logs:
- ดูว่า API route ใช้ Enterprise หรือ v3
- ตรวจสอบ error messages ถ้ามีปัญหา

---

## ⚠️ หมายเหตุสำคัญ

1. **Site Key (Public)**: 
   - ปลอดภัยที่จะ expose ใน frontend
   - ใช้ใน HTML, JavaScript, หรือ public code ได้

2. **Secret Key (Private)**:
   - **ห้าม expose ใน frontend**
   - ใช้เฉพาะใน backend/server-side เท่านั้น
   - เก็บใน `.env` และไม่ commit ลง git

3. **Domain Registration**:
   - ต้อง register domain ใน [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
   - สำหรับ development: ใช้ `localhost` (ไม่ใส่ port)
   - สำหรับ production: ใช้ domain จริง

---

## 🚀 Quick Start

1. **เพิ่ม Keys ใน `.env`**:
   ```env
   NEXT_PUBLIC_RECAPTCHA_SITEKEY=6LfMKzYsAAAAAOkt_oOVzmUDKhc0Iol63lSr1uEW
   RECAPTCHA_SECRETKEY=6LfMKzYsAAAAAPQxcmsPNC3IBymeI-0_vc39qfRp
   ```

2. **Restart Development Server**:
   ```powershell
   npm run dev
   ```

3. **ทดสอบใน Browser Console**:
   - เปิด `test-recaptcha-browser.js`
   - Copy และ paste ใน Browser Console
   - ตรวจสอบว่าได้ token แล้ว

---

## 📚 Additional Resources

- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)
- [Domain Setup Guide](./RECAPTCHA_DOMAIN_SETUP.md)
- [Testing Guide](./QUICK-TEST-GUIDE.md)

