# คู่มือทดสอบ reCAPTCHA Enterprise Backend

## 📋 สารบัญ

1. [Prerequisites - สิ่งที่ต้องเตรียม](#prerequisites)
2. [วิธีที่ 1: ทดสอบด้วย Browser Console](#วิธีที่-1-ทดสอบด้วย-browser-console)
3. [วิธีที่ 2: ทดสอบด้วย request.json](#วิธีที่-2-ทดสอบด้วย-requestjson)
4. [วิธีที่ 3: ทดสอบด้วย PowerShell Scripts](#วิธีที่-3-ทดสอบด้วย-powershell-scripts)
5. [วิธีที่ 4: ทดสอบด้วย curl](#วิธีที่-4-ทดสอบด้วย-curl)
6. [วิธีที่ 5: ทดสอบจาก Frontend Code](#วิธีที่-5-ทดสอบจาก-frontend-code)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. ตรวจสอบ Environment Variables

ตรวจสอบว่าได้ตั้งค่า environment variables ใน `.env` แล้ว:

```env
# Google reCAPTCHA Enterprise API Key (สำหรับ backend)
GOOGLE_RECAPTCHA_API_KEY=your_api_key_here

# Firebase Project ID
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# reCAPTCHA Enterprise Site Key (สำหรับ frontend)
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY=your_site_key_here
```

### 2. เริ่ม Development Server

```powershell
npm run dev
```

Server จะรันที่ `http://localhost:3000`

---

## วิธีที่ 1: ทดสอบด้วย Browser Console

### ขั้นตอนที่ 1: เปิด Browser Console

1. เปิดเว็บไซต์ของคุณ (เช่น `http://localhost:3000`)
2. กด `F12` เพื่อเปิด Developer Tools
3. ไปที่แท็บ **Console**

### ขั้นตอนที่ 2: ตรวจสอบว่า reCAPTCHA Script ถูก Load แล้ว

```javascript
// ตรวจสอบว่า grecaptcha พร้อมใช้งาน
if (typeof grecaptcha !== "undefined" && grecaptcha.enterprise) {
  console.log("✓ reCAPTCHA Enterprise is loaded");
} else {
  console.error("✗ reCAPTCHA Enterprise is not loaded");
}
```

### ขั้นตอนที่ 3: ดึง Token จาก reCAPTCHA

```javascript
// แทนที่ SITE_KEY ด้วย site key ของคุณ
const siteKey = "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF"; // หรือใช้จาก process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY

// ดึง token
grecaptcha.enterprise
  .execute(siteKey, {
    action: "verify",
  })
  .then((token) => {
    console.log("Token:", token);
    console.log("Token length:", token.length);

    // คัดลอก token นี้ไปใช้ทดสอบ
    navigator.clipboard.writeText(token).then(() => {
      console.log("✓ Token copied to clipboard!");
    });
  });
```

### ขั้นตอนที่ 4: ทดสอบ API จาก Browser Console

```javascript
// ใช้ token ที่ได้จากขั้นตอนที่ 3
const token = "YOUR_TOKEN_HERE";
const siteKey = "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF";
const action = "verify";

// ส่ง request ไปยัง API
fetch("http://localhost:3000/api/recaptcha/verify", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    token: token,
    expectedAction: action,
    siteKey: siteKey,
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Response:", data);
    if (data.success) {
      console.log("✓ Verification SUCCESS");
      console.log("Score:", data.score);
      console.log("Action:", data.action);
    } else {
      console.error("✗ Verification FAILED:", data.error);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

---

## วิธีที่ 2: ทดสอบด้วย request.json

### ขั้นตอนที่ 1: สร้าง request.json

คัดลอก `request.json.example` เป็น `request.json` และแก้ไข:

```json
{
  "event": {
    "token": "YOUR_TOKEN_HERE",
    "expectedAction": "verify",
    "siteKey": "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF"
  }
}
```

**หมายเหตุ:**

- `token`: ต้องได้จาก `grecaptcha.enterprise.execute()` (ดูวิธีที่ 1)
- `expectedAction`: Optional, ใช้ action ที่ส่งไปใน `grecaptcha.enterprise.execute()`
- `siteKey`: ใช้ site key ของคุณ หรือปล่อยว่างไว้จะใช้จาก `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` ใน `.env`

### ขั้นตอนที่ 2: ทดสอบด้วย PowerShell

```powershell
# อ่าน request.json และส่ง request
$requestBody = Get-Content -Path "request.json" -Raw

Invoke-RestMethod -Uri "http://localhost:3000/api/recaptcha/verify" `
    -Method Post `
    -ContentType "application/json; charset=utf-8" `
    -Body $requestBody
```

### ขั้นตอนที่ 3: ทดสอบด้วย PowerShell

```powershell
# อ่าน request.json และส่ง request
$requestBody = Get-Content -Path "request.json" -Raw

Invoke-RestMethod -Uri "http://localhost:3000/api/recaptcha/verify" `
    -Method Post `
    -ContentType "application/json; charset=utf-8" `
    -Body $requestBody
```

**หมายเหตุ:** ใน PowerShell `curl` เป็น alias ของ `Invoke-WebRequest` ซึ่งมี syntax ต่างจาก curl จริงๆ ควรใช้ `Invoke-RestMethod` แทน

---

## วิธีที่ 3: ทดสอบด้วย PowerShell Scripts

### Script 1: Simple Test (แนะนำสำหรับผู้เริ่มต้น)

```powershell
.\test-recaptcha-api-simple.ps1
```

Script นี้จะ:

- ถาม token จากคุณ
- สร้าง request.json อัตโนมัติ
- ส่ง request และแสดงผลลัพธ์

### Script 2: Parameter-based Test

```powershell
.\test-recaptcha-api.ps1 `
    -Token "YOUR_TOKEN_HERE" `
    -Action "verify" `
    -SiteKey "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF" `
    -BaseUrl "http://localhost:3000"
```

### Script 3: With curl command generation

```powershell
.\test-recaptcha-api-with-curl.ps1
```

---

## วิธีที่ 4: ทดสอบด้วย PowerShell (Invoke-RestMethod)

### ขั้นตอนที่ 1: สร้าง request body

```powershell
# สร้าง request body
$body = @{
    token = "YOUR_TOKEN_HERE"
    expectedAction = "verify"
    siteKey = "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF"
} | ConvertTo-Json

# บันทึกเป็นไฟล์ (optional)
$body | Out-File -FilePath "request.json" -Encoding UTF8
```

### ขั้นตอนที่ 2: ส่ง request

```powershell
# วิธีที่ 1: ส่งโดยตรง
$body = @{
    token = "YOUR_TOKEN_HERE"
    expectedAction = "verify"
    siteKey = "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/recaptcha/verify" `
    -Method Post `
    -ContentType "application/json; charset=utf-8" `
    -Body $body
```

### ขั้นตอนที่ 3: อ่านจากไฟล์ request.json

```powershell
# อ่าน request.json และส่ง request
$requestBody = Get-Content -Path "request.json" -Raw

Invoke-RestMethod -Uri "http://localhost:3000/api/recaptcha/verify" `
    -Method Post `
    -ContentType "application/json; charset=utf-8" `
    -Body $requestBody
```

### หมายเหตุเกี่ยวกับ curl ใน PowerShell

**⚠️ สำคัญ:** ใน PowerShell `curl` เป็น alias ของ `Invoke-WebRequest` ซึ่งมี syntax ต่างจาก curl จริงๆ

**ถ้าต้องการใช้ curl จริงๆ:**

1. ใช้ `curl.exe` แทน `curl`:

```powershell
curl.exe -X POST "http://localhost:3000/api/recaptcha/verify" `
  -H "Content-Type: application/json; charset=utf-8" `
  -d "@request.json"
```

2. หรือใช้ `Invoke-RestMethod` (แนะนำ):

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/recaptcha/verify" `
    -Method Post `
    -ContentType "application/json; charset=utf-8" `
    -Body (Get-Content -Path "request.json" -Raw)
```

---

## วิธีที่ 5: ทดสอบจาก Frontend Code

### ตัวอย่าง: ทดสอบใน React Component

```typescript
"use client";

import { useState } from "react";
import { verifyRecaptchaWithAutoToken } from "@/lib/recaptcha";

export function TestRecaptcha() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY!;
      const action = "test_action";

      const result = await verifyRecaptchaWithAutoToken(siteKey, action);
      setResult(result);

      if (result.success) {
        console.log("✓ Verification SUCCESS");
        console.log("Score:", result.score);
        console.log("Action:", result.action);
      } else {
        console.error("✗ Verification FAILED:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleTest} disabled={loading}>
        {loading ? "Testing..." : "Test reCAPTCHA"}
      </button>

      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

### ตัวอย่าง: ทดสอบด้วย Manual Token

```typescript
import { verifyRecaptchaToken } from "@/lib/recaptcha";

// ดึง token จาก grecaptcha
const token = await grecaptcha.enterprise.execute(
  process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY!,
  { action: "test_action" }
);

// ตรวจสอบ token
const result = await verifyRecaptchaToken({
  token,
  expectedAction: "test_action",
  // siteKey จะใช้จาก .env อัตโนมัติถ้าไม่ระบุ
});

if (result.success) {
  console.log("Score:", result.score);
} else {
  console.error("Error:", result.error);
}
```

---

## Response Examples

### Success Response

```json
{
  "success": true,
  "score": 0.9,
  "action": "verify"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Invalid token"
}
```

### Score Interpretation

- **0.0 - 0.3**: Likely a bot (ควร reject)
- **0.3 - 0.5**: Suspicious (อาจต้อง verification เพิ่ม)
- **0.5 - 0.7**: Probably human (ยอมรับได้)
- **0.7 - 1.0**: Likely human (ยอมรับได้)

**Recommended threshold**: 0.5

---

## Troubleshooting

### Error: "GOOGLE_RECAPTCHA_API_KEY is not set"

**สาเหตุ:** ไม่ได้ตั้งค่า API key ใน environment variables

**วิธีแก้:**

1. ตรวจสอบว่าได้เพิ่ม `GOOGLE_RECAPTCHA_API_KEY` ใน `.env` แล้ว
2. Restart development server (`npm run dev`)
3. ตรวจสอบว่า API key ถูกต้องและมี permission สำหรับ reCAPTCHA Enterprise API

### Error: "Site key is required"

**สาเหตุ:** ไม่ได้ระบุ site key ใน request หรือ environment variable

**วิธีแก้:**

1. ระบุ `siteKey` ใน request body
2. หรือตั้งค่า `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` ใน `.env`

### Error: "CONFIGURATION_NOT_FOUND"

**สาเหตุ:** Project ID หรือ API key ไม่ถูกต้อง

**วิธีแก้:**

1. ตรวจสอบว่า `NEXT_PUBLIC_FIREBASE_PROJECT_ID` ถูกต้อง
2. ตรวจสอบว่า API key มี permission สำหรับ reCAPTCHA Enterprise API
3. ตรวจสอบว่า API key ถูก restrict ถูกต้อง

### Error: "Invalid token"

**สาเหตุ:** Token หมดอายุหรือไม่ถูกต้อง

**วิธีแก้:**

1. Token มีอายุประมาณ 2 นาที ต้องใช้ทันทีหลังจากได้มา
2. ตรวจสอบว่า token มาจาก site key ที่ถูกต้อง
3. ตรวจสอบว่า token ไม่ได้ถูกใช้ซ้ำ

### Error: "Connection refused" หรือ "ECONNREFUSED"

**สาเหตุ:** Development server ไม่ได้รันอยู่

**วิธีแก้:**

1. ตรวจสอบว่า development server กำลังรันอยู่ (`npm run dev`)
2. ตรวจสอบว่า URL ถูกต้อง (default: `http://localhost:3000`)
3. ตรวจสอบว่า port 3000 ไม่ได้ถูกใช้งานโดยโปรแกรมอื่น

### Error: "grecaptcha is not loaded"

**สาเหตุ:** reCAPTCHA script ยังไม่ถูก load

**วิธีแก้:**

1. ตรวจสอบว่าได้ include reCAPTCHA script ใน HTML แล้ว
2. รอให้ script load เสร็จก่อนเรียก `grecaptcha.enterprise.execute()`
3. ตรวจสอบว่า site key ถูกต้อง

---

## Quick Test Checklist

- [ ] Environment variables ตั้งค่าแล้ว (`GOOGLE_RECAPTCHA_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY`)
- [ ] Development server รันอยู่ (`npm run dev`)
- [ ] reCAPTCHA script ถูก load ใน browser
- [ ] ได้ token จาก `grecaptcha.enterprise.execute()` แล้ว
- [ ] ส่ง request ไปยัง `/api/recaptcha/verify` แล้ว
- [ ] ได้ response กลับมาแล้ว

---

## หมายเหตุสำคัญ

1. **Token มีอายุประมาณ 2 นาที** - ต้องใช้ทันทีหลังจากได้มา
2. **API key ต้องเก็บเป็นความลับ** - ใช้เฉพาะ server-side เท่านั้น
3. **Site key สามารถ public ได้** - ใช้ใน frontend ได้
4. **สำหรับ production** - เปลี่ยน `BaseUrl` เป็น production URL
5. **Score threshold** - แนะนำใช้ 0.5 เป็น threshold สำหรับยอมรับ request

---

## Additional Resources

- [Google reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)
- [Google Cloud API Authentication](https://docs.cloud.google.com/docs/authentication/api-keys)
- [reCAPTCHA Enterprise REST API](https://cloud.google.com/recaptcha-enterprise/docs/rest/v1/projects.assessments/create)
