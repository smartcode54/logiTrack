# คู่มือทดสอบแบบย่อ - reCAPTCHA Enterprise

## 🚀 วิธีทดสอบแบบเร็ว (3 ขั้นตอน)

### ขั้นตอนที่ 1: เริ่ม Server

```powershell
npm run dev
```

### ขั้นตอนที่ 2: ดึง Token จาก Browser Console

**Token มาจากไหน?**

- Token มาจาก `grecaptcha.enterprise.execute()` ใน browser
- reCAPTCHA จะสร้าง token ที่มีอายุ 2 นาที
- Token นี้ใช้สำหรับยืนยันว่า request มาจากมนุษย์จริงๆ

**วิธีดึง Token:**

1. **เปิด Browser Console (F12)**

   - เปิดเว็บไซต์ของคุณ (เช่น `http://localhost:3000`)
   - กด `F12` เพื่อเปิด Developer Tools
   - ไปที่แท็บ **Console**

2. **วิธีที่ 1: ใช้ Test Script (แนะนำ - ง่ายที่สุด)**

   - เปิดไฟล์ `test-recaptcha-browser.js`
   - Copy ทั้งหมด
   - Paste ใน Browser Console
   - กด Enter
   - Script จะทำงานอัตโนมัติและแสดง token

   **หรือใช้คำสั่งนี้:**

   ```javascript
   // Load และรัน test script
   fetch("/test-recaptcha-browser.js")
     .then((r) => r.text())
     .then(eval);
   ```

3. **วิธีที่ 2: ตรวจสอบและดึง Token แบบ Manual**

   **ตรวจสอบว่า reCAPTCHA Script ถูก Load แล้ว:**

```javascript
// ตรวจสอบว่า grecaptcha พร้อมใช้งาน
if (typeof grecaptcha !== "undefined" && grecaptcha.enterprise) {
  console.log("✓ reCAPTCHA Enterprise is loaded");
} else {
  console.error("✗ reCAPTCHA Enterprise is not loaded");
  // ถ้ายังไม่ load ให้รอสักครู่แล้วลองใหม่
}
```

**ดึง Token:**

```javascript
// แทนที่ SITE_KEY ด้วย site key ของคุณ
const siteKey = "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF";

grecaptcha.enterprise
  .execute(siteKey, {
    action: "verify",
  })
  .then((token) => {
    console.log("Token:", token);
    console.log("Token length:", token.length);

    // คัดลอก token ไป clipboard (ถ้าต้องการ)
    navigator.clipboard.writeText(token).then(() => {
      console.log("✓ Token copied to clipboard!");
    });
  })
  .catch((error) => {
    console.error("Error getting token:", error);
  });
```

**ตัวอย่าง Token ที่ได้:**

```
03AGdBq27... (ยาวประมาณ 1000+ ตัวอักษร)
```

**⚠️ หมายเหตุ:**

- Token มีอายุ **2 นาที** - ต้องใช้ทันทีหลังจากได้มา
- Token แต่ละครั้งจะไม่เหมือนกัน - ต้องดึงใหม่ทุกครั้งที่ต้องการทดสอบ
- ถ้า reCAPTCHA script ยังไม่ load ให้รอสักครู่แล้วลองใหม่

### ขั้นตอนที่ 3: ทดสอบ API

**วิธีที่ 1: ใช้ PowerShell Script (ง่ายที่สุด)**

```powershell
.\test-recaptcha-api-simple.ps1
# แล้วใส่ token ที่ได้จากขั้นตอนที่ 2
```

**วิธีที่ 2: ใช้ Browser Console**

```javascript
fetch("http://localhost:3000/api/recaptcha/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    token: "YOUR_TOKEN_HERE",
    expectedAction: "verify",
    siteKey: "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

**วิธีที่ 3: ใช้ PowerShell (Invoke-RestMethod)**

```powershell
$body = @{
    token = "YOUR_TOKEN"
    expectedAction = "verify"
    siteKey = "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/recaptcha/verify" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

**หมายเหตุ:** ใน PowerShell `curl` เป็น alias ของ `Invoke-WebRequest` ซึ่งมี syntax ต่างจาก curl จริงๆ ควรใช้ `Invoke-RestMethod` แทน

---

## ✅ ตรวจสอบก่อนทดสอบ

- [ ] `.env` มี `GOOGLE_RECAPTCHA_API_KEY`
- [ ] `.env` มี `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `.env` มี `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` (optional)
- [ ] Server รันอยู่ (`npm run dev`)
- [ ] reCAPTCHA script ถูก load ใน browser

---

## 📝 ตัวอย่าง Response

**สำเร็จ:**

```json
{
  "success": true,
  "score": 0.9,
  "action": "verify"
}
```

**ล้มเหลว:**

```json
{
  "success": false,
  "error": "Invalid token"
}
```

---

## ⚠️ หมายเหตุ

- Token มีอายุ **2 นาที** - ใช้ทันทีหลังจากได้มา
- Score **≥ 0.5** = ยอมรับได้
- Score **< 0.5** = อาจเป็น bot

---

ดูคู่มือเต็มที่ [TESTING-RECAPTCHA.md](./TESTING-RECAPTCHA.md)
