# reCAPTCHA Domain Setup Guide

## 🔧 การตั้งค่า Domain สำหรับ reCAPTCHA

### ⚠️ สำคัญ: reCAPTCHA ไม่รองรับ Port ใน Domain

reCAPTCHA **ไม่ยอมรับ** domain ที่มี port number เช่น:
- ❌ `localhost:3000`
- ❌ `127.0.0.1:3000`
- ❌ `example.com:8080`

### ✅ Domain ที่ถูกต้อง

#### สำหรับ Development (Localhost)

ใช้แค่:
```
localhost
```

**ทำไม?**
- reCAPTCHA จะทำงานได้กับ **ทุก port** บน localhost
- ไม่ต้องระบุ port number
- ใช้ได้กับ `localhost:3000`, `localhost:3001`, `localhost:8080`, etc.

**ตัวอย่างการตั้งค่า:**
1. ไปที่ [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. ในส่วน "โดเมน" (Domain) ให้เพิ่ม:
   - `localhost` (ไม่ใส่ port)

#### สำหรับ Production

ใช้ domain จริง:
```
yourdomain.com
app.yourdomain.com
www.yourdomain.com
```

**ตัวอย่าง:**
- `logitrack.com`
- `app.logitrack.com`
- `logitrack-tms-dev.firebaseapp.com` (Firebase Hosting domain)

### 📝 ขั้นตอนการตั้งค่า

1. **ลบ Domain ที่ผิด**:
   - คลิก "X" ข้าง `localhost:3000` เพื่อลบ

2. **เพิ่ม Domain ที่ถูกต้อง**:
   - คลิก "+" เพื่อเพิ่ม domain ใหม่
   - ใส่ `localhost` (สำหรับ development)
   - หรือใส่ domain จริง (สำหรับ production)

3. **สำหรับ Development + Production**:
   - คุณสามารถเพิ่มหลาย domains ได้:
     - `localhost` (development)
     - `yourdomain.com` (production)
     - `app.yourdomain.com` (production subdomain)

### 🎯 ตัวอย่างการตั้งค่า

#### Development Only:
```
Domains:
- localhost
```

#### Production Only:
```
Domains:
- logitrack.com
- app.logitrack.com
```

#### Development + Production:
```
Domains:
- localhost
- logitrack.com
- app.logitrack.com
```

### 🔍 ตรวจสอบการตั้งค่า

หลังจากตั้งค่าแล้ว:

1. **Development**:
   - รัน `npm run dev`
   - เปิด `http://localhost:3000`
   - reCAPTCHA ควรทำงานได้ (ไม่มี errors ใน console)

2. **Production**:
   - Deploy ไปยัง domain ที่ตั้งค่าไว้
   - ตรวจสอบว่า reCAPTCHA ทำงานได้

### ❓ FAQ

**Q: ทำไมต้องใช้ `localhost` แทน `localhost:3000`?**
A: เพราะ reCAPTCHA ไม่รองรับ port ใน domain แต่ `localhost` จะทำงานได้กับทุก port

**Q: ใช้ `127.0.0.1` แทนได้ไหม?**
A: ได้ แต่แนะนำให้ใช้ `localhost` เพราะอ่านง่ายกว่า

**Q: ต้องสร้าง reCAPTCHA site แยกสำหรับ development และ production ไหม?**
A: ไม่จำเป็น คุณสามารถเพิ่มหลาย domains ใน site เดียวกันได้

**Q: ถ้าใช้ Firebase Hosting domain ต้องใส่อะไร?**
A: ใส่ domain ที่ Firebase ให้มา เช่น `yourproject.firebaseapp.com` หรือ `yourproject.web.app`

### 📚 Resources

- [reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/domain_validation)
- [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)

