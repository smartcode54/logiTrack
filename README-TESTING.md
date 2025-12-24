# Testing reCAPTCHA Enterprise Verify API

## วิธีทดสอบ API Endpoint

### วิธีที่ 1: ใช้ PowerShell Script (แนะนำ)

#### Script 1: Simple Test (ง่ายที่สุด)
```powershell
.\test-recaptcha-api-simple.ps1
```
- Script จะถาม token จากคุณ
- สร้าง request.json อัตโนมัติ
- ส่ง request และแสดงผลลัพธ์

#### Script 2: Parameter-based Test
```powershell
.\test-recaptcha-api.ps1 -Token "YOUR_TOKEN_HERE" -Action "submit_form" -SiteKey "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF"
```

#### Script 3: With curl command generation
```powershell
.\test-recaptcha-api-with-curl.ps1
```
- สร้าง request.json file
- แสดง curl command สำหรับทดสอบ
- สามารถ execute ได้ทันที

### วิธีที่ 2: ใช้ curl command โดยตรง

1. **สร้าง request.json file:**
```json
{
  "token": "YOUR_TOKEN_HERE",
  "expectedAction": "verify",
  "siteKey": "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF"
}
```

2. **ส่ง request:**
```powershell
curl -X POST "http://localhost:3000/api/recaptcha/verify" `
  -H "Content-Type: application/json" `
  -d '@request.json'
```

### วิธีที่ 3: ใช้ Invoke-RestMethod ใน PowerShell

```powershell
$body = @{
    token = "YOUR_TOKEN_HERE"
    expectedAction = "verify"
    siteKey = "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/recaptcha/verify" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

## วิธีได้ Token สำหรับทดสอบ

### วิธีที่ 1: จาก Browser Console

1. เปิด browser console (F12)
2. ตรวจสอบว่า reCAPTCHA script ถูก load แล้ว
3. รันคำสั่ง:

```javascript
// สำหรับ reCAPTCHA Enterprise
grecaptcha.enterprise.execute('6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF', {
    action: 'verify'
}).then(token => {
    console.log('Token:', token);
    // คัดลอก token นี้ไปใช้ใน PowerShell script
});
```

### วิธีที่ 2: จากหน้าเว็บที่ใช้ reCAPTCHA

1. เปิดหน้าเว็บที่ใช้ reCAPTCHA
2. เปิด Browser DevTools (F12)
3. ไปที่ Console tab
4. รันคำสั่งข้างต้นเพื่อได้ token

## ตัวอย่าง Response

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

## Score Interpretation

- **0.0 - 0.3**: Likely a bot (ควร reject)
- **0.3 - 0.5**: Suspicious (อาจต้อง verification เพิ่ม)
- **0.5 - 0.7**: Probably human (ยอมรับได้)
- **0.7 - 1.0**: Likely human (ยอมรับได้)

**Recommended threshold**: 0.5

## Troubleshooting

### Error: "GOOGLE_RECAPTCHA_API_KEY is not set"
- ตรวจสอบว่าได้เพิ่ม `GOOGLE_RECAPTCHA_API_KEY` ใน `.env` file แล้ว
- Restart development server หลังจากเพิ่ม environment variable

### Error: "CONFIGURATION_NOT_FOUND"
- ตรวจสอบว่า project ID ถูกต้อง
- ตรวจสอบว่า API key มี permission สำหรับ reCAPTCHA Enterprise API

### Error: "Invalid token"
- Token อาจหมดอายุแล้ว (token มีอายุประมาณ 2 นาที)
- ตรวจสอบว่า token ถูกต้องและมาจาก site key ที่ถูกต้อง

### Error: Connection refused
- ตรวจสอบว่า development server กำลังรันอยู่ (`npm run dev`)
- ตรวจสอบว่า URL ถูกต้อง (default: `http://localhost:3000`)

## หมายเหตุ

- Token มีอายุประมาณ 2 นาที ต้องใช้ทันทีหลังจากได้มา
- สำหรับ production ให้เปลี่ยน `BaseUrl` เป็น production URL
- API key ต้องเก็บเป็นความลับ (server-side only)

