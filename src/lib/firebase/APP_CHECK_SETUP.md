# Firebase App Check Setup Guide

## 📋 สารบัญ

- [ภาพรวม](#ภาพรวม)
- [การตั้งค่า reCAPTCHA](#การตั้งค่า-recaptcha)
- [การตั้งค่าใน Firebase Console](#การตั้งค่าใน-firebase-console)
- [การใช้งาน](#การใช้งาน)
- [Step-by-Step: reCAPTCHA Request Token Flow](#step-by-step-recaptcha-request-token-flow)
- [Step-by-Step: Verify Token Flow](#step-by-step-verify-token-flow)
- [การใช้งานกับ Firebase Services](#การใช้งานกับ-firebase-services)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

## ภาพรวม

Firebase App Check ช่วยป้องกันการใช้งาน API และ backend resources โดยไม่ได้รับอนุญาต โดยการตรวจสอบว่า requests มาจากแอปที่ถูกต้องและเชื่อถือได้

### ประโยชน์

- ✅ ป้องกัน Abuse และ Bot Attacks
- ✅ ป้องกัน Unauthorized API Access
- ✅ ป้องกัน Resource Abuse
- ✅ เพิ่มความปลอดภัยให้กับ Firebase Services

## การตั้งค่า reCAPTCHA

### ตัวเลือกที่ 1: reCAPTCHA v3 (แนะนำสำหรับเริ่มต้น)

1. **ไปที่ Google reCAPTCHA Admin**:

   - เปิด [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
   - Sign in ด้วย Google Account

2. **สร้าง Site**:

   - คลิก "+" เพื่อสร้าง site ใหม่
   - เลือก **reCAPTCHA v3**
   - ใส่ Label (เช่น "LogiTrack Development" หรือ "LogiTrack Production")
   - **ใส่ Domains**:
     - สำหรับ **Development**: ใส่ `localhost` (ไม่ต้องใส่ port เช่น `:3000`)
     - สำหรับ **Production**: ใส่ domain จริง เช่น `yourdomain.com`, `app.yourdomain.com`
     - **หมายเหตุ**: reCAPTCHA ไม่รองรับ port ใน domain ดังนั้นใช้แค่ `localhost` จะทำงานได้กับทุก port (3000, 3001, etc.)
   - ยอมรับ Terms of Service
   - คลิก Submit

3. **คัดลอก Site Key**:
   - คัดลอก **Site Key** ที่ได้
   - เพิ่มลงใน `.env.local`:
     ```env
     NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY=your_site_key_here
     ```

### ตัวเลือกที่ 2: reCAPTCHA Enterprise (สำหรับ production scale)

1. **เปิดใช้งาน reCAPTCHA Enterprise**:

   - ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
   - เปิดใช้งาน reCAPTCHA Enterprise API
   - สร้าง Site Key

2. **เพิ่ม Environment Variable**:
   ```env
   NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY=your_enterprise_site_key_here
   ```

## การตั้งค่าใน Firebase Console

1. **เปิด Firebase Console**:

   - ไปที่ [Firebase Console](https://console.firebase.google.com/)
   - เลือกโปรเจกต์ของคุณ

2. **เปิด App Check**:

   - ไปที่ **Build** > **App Check** ในเมนูด้านซ้าย

3. **เพิ่ม Provider**:

   - คลิก **Add Provider**
   - เลือก **reCAPTCHA v3** หรือ **reCAPTCHA Enterprise**
   - ใส่ Site Key ที่ได้จาก Google reCAPTCHA
   - คลิก **Save**

4. **ตั้งค่า Enforcement**:
   - เลือก **Enforcement** tab
   - สำหรับแต่ละ service (Firestore, Storage, Functions):
     - **Testing Mode**: อนุญาต requests ทั้งหมด แต่ log requests ที่ไม่มี valid token (แนะนำสำหรับเริ่มต้น)
     - **Enforced Mode**: ปฏิเสธ requests ที่ไม่มี valid token (ใช้ใน production)

⚠️ **สำคัญ**: เริ่มต้นด้วย **Testing Mode** เพื่อทดสอบก่อน แล้วค่อยเปลี่ยนเป็น **Enforced Mode** เมื่อพร้อม

## การใช้งาน

### Automatic Initialization

App Check จะถูก initialize อัตโนมัติเมื่อแอปเริ่มทำงานผ่าน `AppCheckProvider` ใน `layout.tsx`:

```tsx
// src/app/layout.tsx
import { AppCheckProvider } from "@/components/firebase/AppCheckProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppCheckProvider>{children}</AppCheckProvider>
      </body>
    </html>
  );
}
```

### Manual Initialization (ถ้าต้องการ)

```typescript
import { initializeAppCheckV3 } from "@/lib/firebase";

// Initialize with reCAPTCHA v3
const appCheck = initializeAppCheckV3("your-site-key");
```

### ตรวจสอบสถานะ App Check

```typescript
import { useAppCheck } from "@/hooks/useAppCheck";

function MyComponent() {
  const { isInitialized, isLoading, error } = useAppCheck();

  if (isLoading) {
    return <div>Initializing App Check...</div>;
  }

  if (error) {
    console.warn("App Check error:", error);
  }

  if (isInitialized) {
    console.log("App Check is active");
  }

  return <div>Your content</div>;
}
```

## Step-by-Step: reCAPTCHA Request Token Flow

### Step 1: Client-side initialization

ในโค้ดของคุณ (`src/lib/firebase/appCheck.ts`), App Check ถูก initialize:

```typescript
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  ),
  isTokenAutoRefreshEnabled: true,
});
```

**สิ่งที่เกิดขึ้น:**

- ✅ โหลด reCAPTCHA script โดยใช้ Site Key ของคุณ
- ✅ ลงทะเบียนแอปของคุณกับ Google's reCAPTCHA service
- ✅ เริ่มต้นการตรวจสอบ user interactions

### Step 2: Request token generation

เมื่อแอปของคุณทำการ request ไปยัง Firebase (เช่น Cloud Functions):

App Check จะขอ reCAPTCHA token อัตโนมัติ:

- ✅ วิเคราะห์พฤติกรรมผู้ใช้ (การเคลื่อนไหวของเมาส์, การคลิก, รูปแบบการพิมพ์)
- ✅ คำนวณ risk score (0.0 = bot, 1.0 = human)
- ✅ สร้าง token ที่มีอายุสั้น (โดยทั่วไป 1 ชั่วโมง)

**Token ประกอบด้วย:**

- reCAPTCHA response token
- Timestamp
- App identifier
- Risk score (v3)

### Step 3: Token attachment

Firebase SDK จะทำอัตโนมัติ:

- ✅ แนบ App Check token ไปกับ outgoing requests
- ✅ รวมไว้ใน headers สำหรับ Cloud Functions calls
- ✅ รีเฟรช token เมื่อหมดอายุ (ถ้า `isTokenAutoRefreshEnabled: true`)

---

## Step-by-Step: Verify Token Flow

### Step 4: Server-side verification

ใน Cloud Functions ของคุณ, App Check enforcement ถูกตั้งค่า:

```typescript
// ตัวอย่าง: ใน Cloud Functions configuration
const ENFORCE_APP_CHECK = ENVIRONMENT !== "test";
const FUNCTION_CONFIG = {
  enforceAppCheck: ENFORCE_APP_CHECK,
  // ...
};
```

**สิ่งที่เกิดขึ้นระหว่างการตรวจสอบ:**

1. Request มาถึง Cloud Function
2. มี App Check token อยู่ใน headers
3. Firebase Functions SDK จะ intercept request
4. Firebase ตรวจสอบ token:

```
┌─────────────────┐   
│  Cloud Function │   
└────────┬────────┘            
         │            
         ▼   
┌─────────────────┐   
│  Firebase Admin │   
│  SDK verifies   │  
│  App Check token│   
└────────┬────────┘            
         │            
         ▼   
┌─────────────────┐   
│  Google's       │   
│  reCAPTCHA API  │   
│  validates token│   
└─────────────────┘
```

**การตรวจสอบที่ทำ:**

- ✅ Token signature ถูกต้อง
- ✅ Token ยังไม่หมดอายุ
- ✅ Token ตรงกับ Firebase project ของคุณ
- ✅ reCAPTCHA score ผ่าน threshold ที่ตั้งไว้ (ถ้ามีการตั้งค่า)

**ผลลัพธ์:**

- ✅ **Valid token**: Request ผ่านไปได้
- ❌ **Invalid/missing token**: Request ถูกปฏิเสธ (ถ้า `enforceAppCheck: true`)

## การใช้งานกับ Firebase Services

เมื่อ App Check ถูก initialize แล้ว มันจะทำงานอัตโนมัติกับ Firebase services ทั้งหมด:

- **Firestore**: App Check tokens จะถูกส่งไปพร้อมกับ requests
- **Storage**: App Check tokens จะถูกส่งไปพร้อมกับ upload/download requests
- **Cloud Functions**: App Check tokens จะถูกส่งไปพร้อมกับ function calls

### ตรวจสอบ App Check ใน Security Rules

คุณสามารถตรวจสอบ App Check token ใน Security Rules:

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null
        && request.appCheck.token.valid
        && request.appCheck.token.claims.aud == 'your-project-id';
    }
  }
}
```

```javascript
// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null
        && request.appCheck.token.valid
        && request.appCheck.token.claims.aud == 'your-project-id';
    }
  }
}
```

## Troubleshooting

### App Check ไม่ทำงาน

1. **ตรวจสอบ Environment Variables**:

   ```bash
   # ตรวจสอบว่า environment variables ถูกตั้งค่าแล้ว
   echo $NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY
   ```

2. **ตรวจสอบ Console Logs**:

   - เปิด Browser Console
   - ดูว่ามี error messages หรือไม่
   - ตรวจสอบว่า App Check ถูก initialize หรือไม่

3. **ตรวจสอบ reCAPTCHA Site Key**:

   - ตรวจสอบว่า Site Key ถูกต้อง
   - ตรวจสอบว่า Domain ถูกเพิ่มใน reCAPTCHA settings

4. **ตรวจสอบ Firebase Console**:
   - ตรวจสอบว่า Provider ถูกเพิ่มแล้ว
   - ตรวจสอบว่า Enforcement mode ถูกตั้งค่าแล้ว

### Requests ถูกปฏิเสธ

1. **ตรวจสอบ Enforcement Mode**:

   - ถ้าเป็น Testing Mode: requests ควรจะผ่านได้
   - ถ้าเป็น Enforced Mode: requests ที่ไม่มี valid token จะถูกปฏิเสธ

2. **ตรวจสอบ Token Validity**:

   - ตรวจสอบว่า App Check token ถูก generate แล้ว
   - ตรวจสอบว่า token ยังไม่หมดอายุ

3. **ตรวจสอบ Domain**:
   - ตรวจสอบว่า domain ที่ใช้ถูกเพิ่มใน reCAPTCHA settings
   - สำหรับ localhost: ต้องเพิ่ม `localhost` ใน reCAPTCHA domains (⚠️ **ไม่ใส่ port** เช่น `:3000`)
   - **Error**: ถ้าเห็น error "โดเมน localhost:3000 ไม่ถูกต้อง" ให้ลบ `localhost:3000` และเพิ่ม `localhost` แทน

### Development vs Production

**Development (localhost)**:

- ใช้ reCAPTCHA v3 (ฟรี)
- เพิ่ม `localhost` ใน reCAPTCHA domains (⚠️ **ไม่ใส่ port** เช่น `:3000`)
- ใช้ Testing Mode ใน Firebase Console

**Production**:

- ใช้ reCAPTCHA Enterprise (แนะนำ) หรือ reCAPTCHA v3
- เพิ่ม production domain ใน reCAPTCHA domains (เช่น `yourdomain.com`)
- ใช้ Enforced Mode ใน Firebase Console

**หมายเหตุ**: reCAPTCHA ไม่รองรับ port ใน domain ดังนั้น:

- ✅ ใช้ `localhost` (จะทำงานได้กับทุก port)
- ❌ ไม่ใช้ `localhost:3000` (จะ error)

## Resources

- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)
- [App Check Security Rules](https://firebase.google.com/docs/app-check/cloud-firestore)
