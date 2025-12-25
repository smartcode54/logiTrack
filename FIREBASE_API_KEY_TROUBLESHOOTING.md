# Firebase API Key 400 Bad Request - แก้ไขปัญหา

## 🔴 Error: `GET https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=... 400 (Bad Request)`

Error นี้เกิดจากปัญหาเกี่ยวกับ Firebase API Key หรือการตั้งค่า Firebase

## 🔍 สาเหตุที่เป็นไปได้

### 1. **API Key ไม่ถูกต้องหรือหมดอายุ**
- API Key ใน `.env.local` ไม่ตรงกับ Firebase Console
- API Key ถูกลบหรือปิดใช้งาน

### 2. **Identity Toolkit API ไม่ได้เปิดใช้งาน**
- ต้องเปิดใช้งาน Identity Toolkit API ใน Google Cloud Console

### 3. **Domain ไม่ได้รับอนุญาต**
- Domain ที่ใช้ (เช่น `localhost`, `ngrok`, etc.) ไม่ได้เพิ่มใน Firebase Console

### 4. **API Key ถูก Restrict เกินไป**
- API Key มี restrictions ที่ block การใช้งาน

## ✅ วิธีแก้ไข

### ขั้นตอนที่ 1: ตรวจสอบ Firebase Console

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือก Project ของคุณ
3. ไปที่ **Project Settings** (⚙️) > **General**
4. ตรวจสอบว่า **Web API Key** ตรงกับใน `.env.local`

### ขั้นตอนที่ 2: ตรวจสอบ Identity Toolkit API

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เลือก Project เดียวกับ Firebase
3. ไปที่ **APIs & Services** > **Library**
4. ค้นหา "Identity Toolkit API"
5. ตรวจสอบว่า **Enabled** แล้ว
6. ถ้ายังไม่ได้เปิด ให้กด **Enable**

### ขั้นตอนที่ 3: ตรวจสอบ Authorized Domains

1. ไปที่ Firebase Console > **Authentication** > **Settings**
2. ไปที่แท็บ **Authorized domains**
3. เพิ่ม domain ที่ใช้:
   - `localhost` (สำหรับ development)
   - `ngrok-free.app` หรือ domain ของ ngrok (ถ้าใช้ ngrok)
   - Domain ของ production (ถ้ามี)

### ขั้นตอนที่ 4: ตรวจสอบ API Key Restrictions

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** > **Credentials**
3. คลิกที่ API Key ที่ใช้
4. ตรวจสอบ **API restrictions**:
   - ถ้ามี restrictions ให้เพิ่ม "Identity Toolkit API"
   - หรือเปลี่ยนเป็น "Don't restrict key" (สำหรับ development)

5. ตรวจสอบ **Application restrictions**:
   - ถ้าใช้ HTTP referrers ให้เพิ่ม domain ที่ใช้
   - หรือเปลี่ยนเป็น "None" (สำหรับ development)

### ขั้นตอนที่ 5: ตรวจสอบ .env.local

ตรวจสอบว่าไฟล์ `.env.local` มีค่าถูกต้อง:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBx0SnZ-UGxWD0m4EhkCTVlhU3SZaiEhBQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=logitrack-tms-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=logitrack-tms-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=logitrack-tms-dev.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=418575992058
NEXT_PUBLIC_FIREBASE_APP_ID=1:418575992058:web:422df06c8656c12cf53543
```

### ขั้นตอนที่ 6: Restart Development Server

หลังจากแก้ไข `.env.local` หรือ Firebase settings:

```bash
# หยุด server (Ctrl+C)
# แล้วรันใหม่
npm run dev
```

## 🧪 ทดสอบ

1. เปิด Browser Console (F12)
2. ตรวจสอบว่าไม่มี error เกี่ยวกับ Firebase configuration
3. ลอง login ดู

## 📝 Checklist

- [ ] API Key ใน `.env.local` ตรงกับ Firebase Console
- [ ] Identity Toolkit API เปิดใช้งานแล้ว
- [ ] Domain ถูกเพิ่มใน Authorized domains
- [ ] API Key restrictions ถูกต้อง
- [ ] Restart development server แล้ว
- [ ] ตรวจสอบ Browser Console ไม่มี error

## 🔗 Links ที่เกี่ยวข้อง

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Identity Toolkit API](https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com)

## 💡 Tips

- สำหรับ development: ใช้ `localhost` และไม่ต้อง restrict API key
- สำหรับ production: ควร restrict API key ให้เฉพาะ domain ที่ใช้
- ใช้ environment variables แทน hardcode API key ในโค้ด

