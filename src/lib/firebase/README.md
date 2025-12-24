# Firebase Services

บริการ Firebase สำหรับ LogiTrack Application

## 📋 สารบัญ

- [การติดตั้ง](#การติดตั้ง)
- [การกำหนดค่า](#การกำหนดค่า)
- [Authentication](#authentication)
- [Database (Firestore)](#database-firestore)
- [Storage](#storage)
- [Cloud Functions](#cloud-functions)

## การติดตั้ง

Firebase SDK ได้ถูกติดตั้งไว้แล้วในโปรเจกต์ (`firebase: ^10.14.1`)

## การกำหนดค่า

สร้างไฟล์ `.env.local` ใน root directory และเพิ่มค่า Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Authentication

### การใช้งาน

```typescript
import { signIn, signUp, logout, getCurrentUser, onAuthStateChange } from "@/lib/firebase";

// เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
const { user, error } = await signIn("email@example.com", "password");

// สมัครสมาชิกใหม่
const { user, error } = await signUp("email@example.com", "password", "Display Name");

// เข้าสู่ระบบด้วย Google
const { user, error } = await signInWithGoogle();

// ออกจากระบบ
await logout();

// ดึงข้อมูลผู้ใช้ปัจจุบัน
const user = getCurrentUser();

// ฟังการเปลี่ยนแปลงสถานะการยืนยันตัวตน
const unsubscribe = onAuthStateChange((user) => {
  if (user) {
    console.log("User is signed in:", user.uid);
  } else {
    console.log("User is signed out");
  }
});

// ยกเลิกการฟัง
unsubscribe();
```

### ฟังก์ชันที่มีให้

- `signIn(email, password)` - เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
- `signUp(email, password, displayName?)` - สมัครสมาชิกใหม่
- `signInWithGoogle()` - เข้าสู่ระบบด้วย Google
- `signInWithFacebook()` - เข้าสู่ระบบด้วย Facebook
- `logout()` - ออกจากระบบ
- `getCurrentUser()` - ดึงข้อมูลผู้ใช้ปัจจุบัน
- `onAuthStateChange(callback)` - ฟังการเปลี่ยนแปลงสถานะการยืนยันตัวตน
- `resetPassword(email)` - ส่งอีเมลรีเซ็ตรหัสผ่าน
- `changePassword(newPassword)` - เปลี่ยนรหัสผ่าน
- `updateUserProfile(displayName?, photoURL?)` - อัปเดตโปรไฟล์ผู้ใช้

## Database (Firestore)

### Jobs Service

```typescript
import { jobsService } from "@/lib/firebase";

// ดึงงานทั้งหมดของผู้ใช้
const jobs = await jobsService.getJobs(userId);

// ดึงงานเดียว
const job = await jobsService.getJob(jobId);

// สร้างงานใหม่
const jobId = await jobsService.createJob({
  type: "LH",
  route: "กรุงเทพฯ - ชลบุรี",
  pickup: "คลังสินค้า A",
  status: "assigned",
  scheduledTime: "08:00 น.",
}, userId);

// อัปเดตงาน
await jobsService.updateJob(jobId, { status: "delivered" });

// ลบงาน
await jobsService.deleteJob(jobId);

// ฟังการเปลี่ยนแปลงงานแบบ real-time
const unsubscribe = jobsService.subscribeToJobs(userId, (jobs) => {
  console.log("Jobs updated:", jobs);
});
```

### Delivered Jobs Service

```typescript
import { deliveredJobsService } from "@/lib/firebase";

// ดึงงานที่ส่งแล้วทั้งหมด
const deliveredJobs = await deliveredJobsService.getDeliveredJobs(userId);

// สร้างงานที่ส่งแล้ว
const jobId = await deliveredJobsService.createDeliveredJob({
  runSheet: "RS-001",
  pickupTime: "08:00",
  deliveryTime: "10:30",
  route: "กรุงเทพฯ - ชลบุรี",
  type: "LH",
  date: "2025-01-15",
  status: "success",
}, userId);

// ฟังการเปลี่ยนแปลงงานที่ส่งแล้วแบบ real-time
const unsubscribe = deliveredJobsService.subscribeToDeliveredJobs(
  userId,
  (jobs) => {
    console.log("Delivered jobs updated:", jobs);
  }
);
```

### Expenses Service

```typescript
import { expensesService } from "@/lib/firebase";

// ดึงค่าใช้จ่ายทั้งหมด
const expenses = await expensesService.getExpenses(userId);

// ดึงค่าใช้จ่ายตามหมวดหมู่
const fuelExpenses = await expensesService.getExpensesByCategory(userId, "fuel");

// สร้างค่าใช้จ่ายใหม่
const expenseId = await expensesService.createExpense({
  category: "fuel",
  amount: 500,
  description: "เติมน้ำมัน",
  date: "2025-01-15",
  time: "10:30",
  timestamp: Date.now(),
  fuelData: {
    mileage: 50000,
    liters: 20,
    paymentType: "card",
    beforeFillImage: null,
    receiptImage: null,
  },
}, userId);

// อัปเดตค่าใช้จ่าย
await expensesService.updateExpense(expenseId, { amount: 600 });

// ลบค่าใช้จ่าย
await expensesService.deleteExpense(expenseId);

// ฟังการเปลี่ยนแปลงค่าใช้จ่ายแบบ real-time
const unsubscribe = expensesService.subscribeToExpenses(userId, (expenses) => {
  console.log("Expenses updated:", expenses);
});
```

### Workflow Service

```typescript
import { workflowService } from "@/lib/firebase";

// บันทึกสถานะ workflow
await workflowService.saveWorkflowState(jobId, {
  step: "pickup",
  photos: { ... },
  location: { ... },
}, userId);

// ดึงสถานะ workflow
const workflowState = await workflowService.getWorkflowState(jobId, userId);

// ลบสถานะ workflow
await workflowService.deleteWorkflowState(jobId, userId);
```

### Batch Operations

```typescript
import { batchService } from "@/lib/firebase";

// ดำเนินการหลายอย่างพร้อมกันแบบ atomic
await batchService.executeBatch([
  {
    type: "create",
    collection: "expenses",
    data: { amount: 500, category: "fuel" },
  },
  {
    type: "update",
    collection: "jobs",
    docId: "job-123",
    data: { status: "delivered" },
  },
  {
    type: "delete",
    collection: "jobs",
    docId: "job-456",
  },
]);
```

## Storage

### Expense Receipts

```typescript
import { expenseReceiptsService } from "@/lib/firebase";

// อัปโหลดใบเสร็จค่าใช้จ่าย
const receiptUrl = await expenseReceiptsService.uploadReceipt(
  file,
  userId,
  expenseId,
  0 // index สำหรับหลายใบเสร็จ
);

// อัปโหลดรูปภาพน้ำมัน
const beforeFillUrl = await expenseReceiptsService.uploadFuelImage(
  file,
  userId,
  expenseId,
  "beforeFill"
);

const receiptUrl = await expenseReceiptsService.uploadFuelImage(
  file,
  userId,
  expenseId,
  "receipt"
);

// ลบใบเสร็จ
await expenseReceiptsService.deleteReceipt(userId, expenseId, "receipt.jpg");
```

### Job Photos

```typescript
import { jobPhotosService } from "@/lib/firebase";

// อัปโหลดรูปภาพงาน
const photoUrl = await jobPhotosService.uploadJobPhoto(
  file,
  userId,
  jobId,
  "pickup"
);

// อัปโหลดรูปภาพ workflow
const photoUrl = await jobPhotosService.uploadWorkflowPhoto(
  file,
  userId,
  jobId,
  "pickup", // workflow step
  "beforeClose" // photo type
);

// อัปโหลดรูปภาพหลายรูปพร้อมกัน
const urls = await jobPhotosService.uploadWorkflowPhotos(
  [
    { file: file1, photoType: "beforeClose" },
    { file: file2, photoType: "seal" },
    { file: file3, photoType: "closedWithSeal" },
  ],
  userId,
  jobId,
  "pickup"
);

// ลบรูปภาพงาน
await jobPhotosService.deleteJobPhoto(userId, jobId, "pickup");
```

### Profile Photos

```typescript
import { profilePhotosService } from "@/lib/firebase";

// อัปโหลดรูปโปรไฟล์
const photoUrl = await profilePhotosService.uploadProfilePhoto(file, userId);

// ลบรูปโปรไฟล์
await profilePhotosService.deleteProfilePhoto(userId, "profile_1234567890.jpg");
```

### Generic Storage Functions

```typescript
import {
  uploadFile,
  uploadFileWithProgress,
  deleteFile,
  getFileURL,
  uploadBase64Image,
  uploadMultipleFiles,
} from "@/lib/firebase";

// อัปโหลดไฟล์
const url = await uploadFile(file, "path/to/file.jpg", {
  customMetadata: "value",
});

// อัปโหลดไฟล์พร้อมติดตามความคืบหน้า
const uploadTask = uploadFileWithProgress(
  file,
  "path/to/file.jpg",
  (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
);

// รอให้อัปโหลดเสร็จ
const snapshot = await uploadTask;
const url = await getFileURL(snapshot.ref.fullPath);

// อัปโหลดรูปภาพจาก base64
const url = await uploadBase64Image(
  "data:image/jpeg;base64,...",
  "path/to/image.jpg"
);

// อัปโหลดหลายไฟล์พร้อมกัน
const urls = await uploadMultipleFiles(
  [
    { file: file1, path: "path/to/file1.jpg" },
    { file: file2, path: "path/to/file2.jpg" },
  ],
  (progress) => {
    console.log(`Overall progress: ${progress}%`);
  }
);

// ลบไฟล์
await deleteFile("path/to/file.jpg");

// ดึง URL ของไฟล์
const url = await getFileURL("path/to/file.jpg");
```

## Cloud Functions

### Job Functions

```typescript
import { jobFunctions } from "@/lib/firebase";

// กำหนดงานให้กับคนขับ
const result = await jobFunctions.assignJob(jobId, driverId);

// เสร็จสิ้น workflow ของงาน
const result = await jobFunctions.completeJobWorkflow(jobId, workflowData);

// สร้างรายงานงาน
const report = await jobFunctions.generateJobReport(jobId, "pdf");
console.log("Report URL:", report.url);

// ส่งการแจ้งเตือนงาน
await jobFunctions.sendJobNotification(jobId, "assigned");
```

### Expense Functions

```typescript
import { expenseFunctions } from "@/lib/firebase";

// ประมวลผล OCR จากใบเสร็จ
const ocrResult = await expenseFunctions.processReceiptOCR(imageUrl);
console.log("Amount:", ocrResult.amount);
console.log("Merchant:", ocrResult.merchant);

// สร้างรายงานค่าใช้จ่าย
const report = await expenseFunctions.generateExpenseReport(
  userId,
  "2025-01-01",
  "2025-01-31",
  "pdf"
);

// ตรวจสอบความถูกต้องของค่าใช้จ่าย
const validation = await expenseFunctions.validateExpense(expenseId);

// คำนวณสถิติค่าใช้จ่าย
const stats = await expenseFunctions.calculateExpenseStats(
  userId,
  "2025-01-01",
  "2025-01-31"
);
```

### Notification Functions

```typescript
import { notificationFunctions } from "@/lib/firebase";

// ส่ง push notification
await notificationFunctions.sendPushNotification(
  userId,
  "งานใหม่",
  "คุณได้รับงานใหม่",
  { jobId: "job-123" }
);

// ส่งอีเมล
await notificationFunctions.sendEmailNotification(
  "user@example.com",
  "ยืนยันการส่งงาน",
  "job-completion",
  { jobId: "job-123" }
);
```

### Analytics Functions

```typescript
import { analyticsFunctions } from "@/lib/firebase";

// ดึงข้อมูล analytics ของคนขับ
const analytics = await analyticsFunctions.getDriverAnalytics(
  userId,
  "2025-01-01",
  "2025-01-31"
);

// เพิ่มประสิทธิภาพเส้นทาง
const optimized = await analyticsFunctions.optimizeRoute([
  "job-1",
  "job-2",
  "job-3",
]);
```

### Geocoding Functions

```typescript
import { geocodingFunctions } from "@/lib/firebase";

// Reverse geocode (แปลงพิกัดเป็นที่อยู่)
const address = await geocodingFunctions.reverseGeocode(13.7563, 100.5018);

// Geocode (แปลงที่อยู่เป็นพิกัด)
const location = await geocodingFunctions.geocodeAddress("กรุงเทพมหานคร");
```

### Image Processing Functions

```typescript
import { imageProcessingFunctions } from "@/lib/firebase";

// ตรวจสอบความเบลอของรูปภาพ
const blurCheck = await imageProcessingFunctions.detectBlur(imageUrl);

// บีบอัดรูปภาพ
const compressed = await imageProcessingFunctions.compressImage(imageUrl, 80);

// แยกข้อความจากรูปภาพ (OCR)
const text = await imageProcessingFunctions.extractTextFromImage(imageUrl);
```

### Custom Function Caller

```typescript
import { callCloudFunction } from "@/lib/firebase";

// เรียกใช้ Cloud Function แบบกำหนดเอง
const result = await callCloudFunction<{ input: string }, { output: string }>(
  "customFunction",
  { input: "data" }
);
```

## ตัวอย่างการใช้งานแบบเต็ม

```typescript
"use client";

import { useEffect, useState } from "react";
import {
  signIn,
  getCurrentUser,
  onAuthStateChange,
  jobsService,
  expensesService,
  expenseReceiptsService,
  jobPhotosService,
} from "@/lib/firebase";

export default function ExamplePage() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // ฟังการเปลี่ยนแปลงสถานะการยืนยันตัวตน
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        // โหลดข้อมูลเมื่อผู้ใช้เข้าสู่ระบบ
        loadUserData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    // โหลดงาน
    const userJobs = await jobsService.getJobs(userId);
    setJobs(userJobs);

    // ฟังการเปลี่ยนแปลงงานแบบ real-time
    const unsubscribeJobs = jobsService.subscribeToJobs(userId, (updatedJobs) => {
      setJobs(updatedJobs);
    });

    // โหลดค่าใช้จ่าย
    const userExpenses = await expensesService.getExpenses(userId);
    setExpenses(userExpenses);

    // ฟังการเปลี่ยนแปลงค่าใช้จ่ายแบบ real-time
    const unsubscribeExpenses = expensesService.subscribeToExpenses(
      userId,
      (updatedExpenses) => {
        setExpenses(updatedExpenses);
      }
    );

    return () => {
      unsubscribeJobs();
      unsubscribeExpenses();
    };
  };

  const handleLogin = async () => {
    const { user, error } = await signIn("email@example.com", "password");
    if (error) {
      console.error("Login error:", error);
    }
  };

  const handleUploadReceipt = async (file: File, expenseId: string) => {
    if (!user) return;

    try {
      const url = await expenseReceiptsService.uploadReceipt(
        file,
        user.uid,
        expenseId
      );
      console.log("Receipt uploaded:", url);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <p>Jobs: {jobs.length}</p>
          <p>Expenses: {expenses.length}</p>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## หมายเหตุ

- ทุก service จะทำงานเฉพาะใน client-side เท่านั้น (ตรวจสอบ `typeof window !== "undefined"`)
- ต้องมี Firebase project ที่ตั้งค่าไว้แล้ว
- ต้องตั้งค่า Firestore Security Rules และ Storage Rules ให้เหมาะสม
- Cloud Functions ต้องถูก deploy ไว้ใน Firebase project ก่อนใช้งาน

