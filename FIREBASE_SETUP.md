# Firebase Setup Guide

## 🔥 การตั้งค่า Firebase Configuration

### ⚠️ สำคัญ: อย่า Hardcode ค่า Firebase Config ในโค้ด!

**ไม่ควรทำ:**

```typescript
// ❌ ไม่ควรทำแบบนี้
const firebaseConfig = {
  apiKey: "AIzaSyBx0SnZ-UGxWD0m4EhkCTVlhU3SZaiEhBQ",
  // ...
};
```

**ควรทำ:**

```typescript
// ✅ ใช้ environment variables แทน
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ...
};
```

## 📝 ขั้นตอนการตั้งค่า

### 1. สร้างไฟล์ `.env.local`

สร้างไฟล์ `.env.local` ใน root directory ของโปรเจกต์ (ข้างๆ `package.json`)

### 2. เพิ่ม Firebase Configuration

คัดลอกค่าจาก Firebase Console และใส่ลงใน `.env.local`:

```env
# Firebase Configuration สำหรับ LogiTrack
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBx0SnZ-UGxWD0m4EhkCTVlhU3SZaiEhBQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=logitrack-tms-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=logitrack-tms-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=logitrack-tms-dev.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=418575992058
NEXT_PUBLIC_FIREBASE_APP_ID=1:418575992058:web:422df06c8656c12cf53543
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-6XN1Y73Y3Q
```

### 3. ตรวจสอบว่าไฟล์ถูก ignore แล้ว

ตรวจสอบว่า `.env.local` อยู่ใน `.gitignore`:

```gitignore
# env files
.env*
!.env.example
```

### 4. Restart Development Server

หลังจากสร้างหรือแก้ไข `.env.local` ให้ restart development server:

```bash
# หยุด server (Ctrl+C) แล้วรันใหม่
npm run dev
```

## 📍 ตำแหน่งไฟล์ Configuration

ไฟล์ Firebase configuration อยู่ที่:

- **`src/lib/firebase/config.ts`** - ไฟล์หลักสำหรับ initialize Firebase

ไฟล์นี้จะอ่านค่าจาก environment variables อัตโนมัติ

## 🔍 ตรวจสอบการตั้งค่า

### ตรวจสอบว่า Environment Variables ถูกโหลดแล้ว

```typescript
// ใน browser console หรือ component
console.log(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
```

⚠️ **หมายเหตุ**: ใน Next.js เฉพาะ variables ที่ขึ้นต้นด้วย `NEXT_PUBLIC_` เท่านั้นที่จะถูก expose ไปยัง client-side

### ตรวจสอบว่า Firebase ถูก Initialize แล้ว

```typescript
import { app } from "@/lib/firebase";

console.log("Firebase App:", app);
console.log("Project ID:", app.options.projectId);
```

## 🎯 Firebase Services ที่พร้อมใช้งาน

หลังจากตั้งค่าแล้ว คุณสามารถใช้ Firebase services ต่อไปนี้ได้:

### 1. Authentication

```typescript
import { signIn, signUp, logout } from "@/lib/firebase";
```

### 2. Firestore Database

```typescript
import { jobsService, expensesService } from "@/lib/firebase";
```

### 3. Storage

```typescript
import { expenseReceiptsService, jobPhotosService } from "@/lib/firebase";
```

### 4. Cloud Functions

```typescript
import { jobFunctions, expenseFunctions } from "@/lib/firebase";
```

### 5. Analytics

```typescript
import { analytics } from "@/lib/firebase";
// Analytics จะทำงานอัตโนมัติเมื่อ initialize
```

### 6. App Check

```typescript
import { initializeAppCheckAuto } from "@/lib/firebase";
// App Check จะ initialize อัตโนมัติผ่าน AppCheckProvider
```

## 🔒 Security Best Practices

1. **อย่า Commit `.env.local`**:

   - ไฟล์ `.env.local` ควรอยู่ใน `.gitignore` เสมอ
   - ใช้ `.env.local.example` เป็น template แทน

2. **ใช้ Environment Variables**:

   - เก็บ sensitive data ใน environment variables
   - ไม่ hardcode credentials ในโค้ด

3. **แยก Environment**:

   - Development: `.env.local`
   - Production: ตั้งค่าใน hosting platform (Vercel, etc.)

4. **ตรวจสอบ Security Rules**:
   - ตั้งค่า Firestore Security Rules
   - ตั้งค่า Storage Security Rules
   - เปิดใช้งาน App Check

## 🚀 Production Deployment

เมื่อ deploy ไปยัง production (เช่น Vercel):

1. ไปที่ Project Settings > Environment Variables
2. เพิ่ม environment variables ทั้งหมด
3. Redeploy application

### Vercel Example:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... และอื่นๆ
```

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Firebase Console](https://console.firebase.google.com/)

## ❓ Troubleshooting

### Environment Variables ไม่ทำงาน

1. ตรวจสอบว่าไฟล์ชื่อ `.env.local` (ไม่ใช่ `.env.local.txt`)
2. ตรวจสอบว่า variables ขึ้นต้นด้วย `NEXT_PUBLIC_`
3. Restart development server
4. ตรวจสอบว่าไม่มี typo ในชื่อ variables

### Firebase ไม่ Initialize

1. ตรวจสอบว่า environment variables ถูกตั้งค่าแล้ว
2. ตรวจสอบ console สำหรับ error messages
3. ตรวจสอบว่า Firebase project ถูกสร้างแล้วใน Firebase Console

### Analytics ไม่ทำงาน

1. Analytics ทำงานเฉพาะใน browser environment
2. ตรวจสอบว่า measurementId ถูกตั้งค่าแล้ว
3. ตรวจสอบว่า Firebase Analytics ถูกเปิดใช้งานใน Firebase Console
