# Firebase Functions Deployment Guide

## ภาพรวม

ต้อง deploy Firebase Functions ขึ้น Firebase Cloud ก่อนถึงจะใช้งานได้ เพราะ client code เรียกใช้ functions เหล่านี้

## ขั้นตอนการ Deploy

### 1. ตั้งค่า Environment Variables

Firebase Functions ต้องการ environment variables สำหรับ API keys:

#### วิธีที่ 1: ใช้ Firebase Functions Config (แนะนำ)

```bash
# ตั้งค่า environment variables
firebase functions:config:set recaptcha.api_key="YOUR_RECAPTCHA_API_KEY"
firebase functions:config:set recaptcha.secret_key="YOUR_RECAPTCHA_SECRET_KEY"
firebase functions:config:set geoapify.api_key="YOUR_GEOAPIFY_API_KEY"
firebase functions:config:set firebase.project_id="YOUR_PROJECT_ID"

# สำหรับ email (ถ้าใช้)
firebase functions:config:set email.host="smtp.gmail.com"
firebase functions:config:set email.port="587"
firebase functions:config:set email.user="YOUR_EMAIL"
firebase functions:config:set email.password="YOUR_EMAIL_PASSWORD"
```

#### วิธีที่ 2: ใช้ .env file (สำหรับ local development)

สร้างไฟล์ `functions/.env`:

```env
GOOGLE_RECAPTCHA_API_KEY=your_recaptcha_api_key
RECAPTCHA_SECRETKEY=your_recaptcha_secret_key
GEOAPIFY_API_KEY=your_geoapify_api_key
FIREBASE_PROJECT_ID=your_project_id

# Email (ถ้าใช้)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
```

**หมายเหตุ**: `.env` file ใช้ได้เฉพาะกับ Firebase Emulator เท่านั้น สำหรับ production ต้องใช้ `firebase functions:config:set`

### 2. Install Dependencies

```bash
cd functions
npm install
```

### 3. Build Functions

```bash
cd functions
npm run build
```

### 4. Deploy Functions

#### Deploy ทั้งหมด:

```bash
# จาก root directory
npm run deploy:functions

# หรือจาก functions directory
cd functions
npm run deploy
```

#### Deploy เฉพาะ function ที่ต้องการ:

```bash
firebase deploy --only functions:verifyRecaptcha
firebase deploy --only functions:reverseGeocode
firebase deploy --only functions:geocodeAddress
```

### 5. ตรวจสอบการ Deploy

```bash
# ดู logs
firebase functions:log

# ดู functions ที่ deploy แล้ว
firebase functions:list
```

## Environment Variables ที่ต้องตั้งค่า

### Required (จำเป็นต้องมี):

1. **reCAPTCHA**:
   - `GOOGLE_RECAPTCHA_API_KEY` หรือ `RECAPTCHA_SECRETKEY`
   - `FIREBASE_PROJECT_ID`

2. **Geoapify**:
   - `GEOAPIFY_API_KEY`

### Optional (ถ้าใช้ features เหล่านี้):

3. **Email** (สำหรับ sendEmailNotification):
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `EMAIL_FROM`

## การตั้งค่า Environment Variables ใน Firebase Console

### สำหรับ Production:

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือก Project
3. ไปที่ **Functions** > **Configuration**
4. เพิ่ม environment variables ตามที่ต้องการ

หรือใช้ Firebase CLI:

```bash
firebase functions:config:set \
  recaptcha.api_key="YOUR_KEY" \
  geoapify.api_key="YOUR_KEY"
```

## Testing ก่อน Deploy

### 1. ทดสอบด้วย Firebase Emulator:

```bash
cd functions
npm run serve
```

หรือ:

```bash
cd functions
npm run server
```

### 2. ทดสอบจาก Client:

```typescript
// ใน client code
import { geocodingFunctions } from "@/lib/firebase/functions";

// ทดสอบเรียกใช้
const result = await geocodingFunctions.reverseGeocode(13.7563, 100.5018);
console.log(result);
```

## Checklist ก่อน Deploy

- [ ] Install dependencies (`npm install` ใน functions directory)
- [ ] Build functions (`npm run build`)
- [ ] ตั้งค่า environment variables
- [ ] ทดสอบด้วย Firebase Emulator
- [ ] ตรวจสอบ lint errors (`npm run lint`)
- [ ] Deploy functions

## Troubleshooting

### Error: Function not found

**ปัญหา**: Client เรียกใช้ function แต่ไม่พบ

**แก้ไข**:
1. ตรวจสอบว่า function ถูก deploy แล้ว: `firebase functions:list`
2. ตรวจสอบว่า function name ตรงกับที่เรียกใช้
3. ตรวจสอบว่า Firebase project ถูกต้อง

### Error: Environment variable not set

**ปัญหา**: Function ต้องการ environment variable แต่ไม่พบ

**แก้ไข**:
1. ตั้งค่า environment variables ด้วย `firebase functions:config:set`
2. Redeploy functions: `firebase deploy --only functions`
3. ตรวจสอบว่า variable name ถูกต้อง

### Error: Permission denied

**ปัญหา**: ไม่มีสิทธิ์ deploy

**แก้ไข**:
1. ตรวจสอบว่า login Firebase CLI: `firebase login`
2. ตรวจสอบว่าเลือก project ถูกต้อง: `firebase use <project-id>`
3. ตรวจสอบสิทธิ์ใน Firebase Console

## Commands Reference

```bash
# Login to Firebase
firebase login

# Select project
firebase use <project-id>

# List projects
firebase projects:list

# Set environment variables
firebase functions:config:set key="value"

# Get environment variables
firebase functions:config:get

# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:functionName

# View logs
firebase functions:log

# List deployed functions
firebase functions:list

# Delete function
firebase functions:delete functionName
```

## Quick Start

```bash
# 1. ไปที่ functions directory
cd functions

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. ตั้งค่า environment variables (ถ้ายังไม่ได้ตั้ง)
firebase functions:config:set geoapify.api_key="YOUR_KEY"

# 5. Deploy
npm run deploy

# หรือ deploy จาก root
cd ..
npm run deploy:functions
```

## หมายเหตุสำคัญ

1. **Environment Variables**: 
   - สำหรับ local development ใช้ `.env` file
   - สำหรับ production ใช้ `firebase functions:config:set`

2. **App Check**: 
   - Functions จะ enforce App Check ใน production
   - ต้องตั้งค่า App Check ใน client ก่อนเรียกใช้ functions

3. **Cost**: 
   - Firebase Functions มี free tier
   - ตรวจสอบ usage ใน Firebase Console

4. **Region**: 
   - Functions จะ deploy ไปยัง region ที่ตั้งค่าไว้ใน `firebase.json`
   - Default: `us-central1`

## หลังจาก Deploy

1. ตรวจสอบว่า functions ทำงาน: `firebase functions:log`
2. ทดสอบจาก client application
3. ตรวจสอบ errors ใน Firebase Console
4. Monitor usage และ costs

