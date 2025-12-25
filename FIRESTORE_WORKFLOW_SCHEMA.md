# Firestore Workflow Database Schema

## ภาพรวม

โครงสร้างฐานข้อมูลสำหรับเก็บข้อมูลทุกกิจกรรมของพนักงานขับรถใน Workflow

## Collections

### 1. `workflowActivities`

เก็บข้อมูลทุกกิจกรรมที่เกิดขึ้นใน workflow

**Document Structure:**
```typescript
{
  id: string;                    // Auto-generated document ID
  jobId: string;                // Reference to job
  driverId: string;             // Reference to driver
  step: WorkflowStep;           // "checkin" | "pickup" | "departure" | "incident_selection" | "incident_photos" | "arrival" | "delivery"
  timestamp: number;            // Unix timestamp in milliseconds
  createdAt: Timestamp;         // Firestore server timestamp
  location?: {                   // Optional location data
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: GeoapifyAddress;
  };
  data: {                        // Step-specific data
    // Check-in
    photoUrl?: string;
    confirmedTime?: Timestamp;
    
    // Pickup
    photos?: PickupPhotos;
    runSheetNumber?: string;
    
    // Departure
    // (no additional data)
    
    // Incident Selection
    incidentType?: string;
    incidentOtherDescription?: string;
    isDelayed?: boolean;
    
    // Incident Photos
    photos?: IncidentPhotos;
    
    // Arrival
    // (no additional data)
    
    // Delivery
    photos?: DeliveryPhotos;
    status?: "success" | "delay" | "cancel" | "standby";
  };
}
```

**Indexes:**
- `jobId` (ascending)
- `driverId` (ascending)
- `timestamp` (ascending)
- `step` (ascending)
- Composite: `jobId` + `timestamp`
- Composite: `driverId` + `timestamp`

**Query Examples:**
```typescript
// Get all activities for a job
query(
  collection(db, "workflowActivities"),
  where("jobId", "==", jobId),
  orderBy("timestamp", "asc")
)

// Get recent activities for a driver
query(
  collection(db, "workflowActivities"),
  where("driverId", "==", driverId),
  orderBy("timestamp", "desc"),
  limit(50)
)
```

---

### 2. `workflowSessions`

เก็บข้อมูล session ของ workflow สำหรับงานหนึ่งงาน

**Document Structure:**
```typescript
{
  id: string;                    // Auto-generated document ID
  jobId: string;                // Reference to job
  driverId: string;             // Reference to driver
  startedAt: number;            // Unix timestamp
  completedAt?: number;          // Unix timestamp (if completed)
  status: "in_progress" | "completed" | "cancelled";
  currentStep: WorkflowStep;    // Current step in workflow
  activities: string[];         // Array of activity document IDs
  metadata?: {
    isDelayed?: boolean;
    incidentType?: string;
    runSheetNumber?: string;
    finalStatus?: "success" | "delay" | "cancel" | "standby";
  };
  createdAt: Timestamp;        // Firestore server timestamp
  updatedAt: Timestamp;        // Firestore server timestamp
}
```

**Indexes:**
- `jobId` (ascending)
- `driverId` (ascending)
- `status` (ascending)
- `startedAt` (descending)
- Composite: `jobId` + `driverId` + `status`

**Query Examples:**
```typescript
// Get active session for a job
query(
  collection(db, "workflowSessions"),
  where("jobId", "==", jobId),
  where("driverId", "==", driverId),
  where("status", "==", "in_progress")
)

// Get all completed sessions for a driver
query(
  collection(db, "workflowSessions"),
  where("driverId", "==", driverId),
  where("status", "==", "completed"),
  orderBy("startedAt", "desc")
)
```

---

### 3. `workflowSummaries`

เก็บข้อมูลสรุป workflow สำหรับแสดงใน dashboard

**Document Structure:**
```typescript
{
  id: string;                    // Auto-generated document ID
  jobId: string;                // Reference to job
  driverId: string;             // Reference to driver
  sessionId: string;            // Reference to workflow session
  runSheetNumber?: string;      // Run sheet number from pickup
  checkInTime?: Timestamp;      // Check-in timestamp
  pickupTime?: Timestamp;       // Pickup timestamp
  departureTime?: Timestamp;     // Departure timestamp
  incidentTime?: Timestamp;     // Incident timestamp (if any)
  arrivalTime?: Timestamp;      // Arrival timestamp
  deliveryTime?: Timestamp;     // Delivery timestamp
  status: "success" | "delay" | "cancel" | "standby";
  incidentType?: string;        // Type of incident (if any)
  totalDuration?: number;       // Total duration in minutes
  createdAt: number;            // Unix timestamp
  completedAt?: number;         // Unix timestamp
}
```

**Indexes:**
- `jobId` (ascending)
- `driverId` (ascending)
- `status` (ascending)
- `completedAt` (descending)
- Composite: `driverId` + `completedAt`
- Composite: `status` + `completedAt`

**Query Examples:**
```typescript
// Get workflow summaries for a driver
query(
  collection(db, "workflowSummaries"),
  where("driverId", "==", driverId),
  orderBy("completedAt", "desc"),
  limit(50)
)

// Get summaries by status
query(
  collection(db, "workflowSummaries"),
  where("status", "==", "delay"),
  orderBy("completedAt", "desc")
)
```

---

## Workflow Steps

### 1. Check-in (`checkin`)
- **Data Required:**
  - `photoUrl`: URL ของรูปภาพ check-in
  - `confirmedTime`: Timestamp ที่ยืนยัน check-in
  - `location`: พิกัดและที่อยู่ (optional)

### 2. Pickup (`pickup`)
- **Data Required:**
  - `photos`: 4 รูปภาพ (beforeClose, seal, closedWithSeal, runSheet)
  - `runSheetNumber`: เลขที่ run sheet
  - `confirmedTime`: Timestamp ที่ยืนยัน pickup
  - `location`: พิกัดและที่อยู่ (optional)

### 3. Departure (`departure`)
- **Data Required:**
  - `confirmedTime`: Timestamp ที่ยืนยัน departure
  - `location`: พิกัดและที่อยู่ (optional)

### 4. Incident Selection (`incident_selection`)
- **Data Required:**
  - `incidentType`: ประเภทเหตุการณ์
  - `incidentOtherDescription`: คำอธิบายเพิ่มเติม (ถ้าเลือก "อื่นๆ")
  - `isDelayed`: ระบุว่ามีการล่าช้าหรือไม่
  - `confirmedTime`: Timestamp ที่ยืนยัน
  - `location`: พิกัดและที่อยู่ (optional)

### 5. Incident Photos (`incident_photos`)
- **Data Required:**
  - `photos`: 4 รูปภาพเหตุการณ์
  - `incidentType`: ประเภทเหตุการณ์
  - `incidentOtherDescription`: คำอธิบายเพิ่มเติม (optional)
  - `confirmedTime`: Timestamp ที่ยืนยัน
  - `location`: พิกัดและที่อยู่ (optional)

### 6. Arrival (`arrival`)
- **Data Required:**
  - `confirmedTime`: Timestamp ที่ยืนยัน arrival
  - `location`: พิกัดและที่อยู่ (optional)

### 7. Delivery (`delivery`)
- **Data Required:**
  - `photos`: 4 รูปภาพ (beforeOpen, breakSeal, emptyContainer, deliveryRunSheet)
  - `confirmedTime`: Timestamp ที่ยืนยัน delivery
  - `status`: สถานะการจัดส่ง ("success" | "delay" | "cancel" | "standby")
  - `location`: พิกัดและที่อยู่ (optional)

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Workflow Activities
    match /workflowActivities/{activityId} {
      allow read: if request.auth != null && 
                     (resource.data.driverId == request.auth.uid || 
                      isAdmin());
      allow create: if request.auth != null && 
                       request.resource.data.driverId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.driverId == request.auth.uid;
    }
    
    // Workflow Sessions
    match /workflowSessions/{sessionId} {
      allow read: if request.auth != null && 
                     (resource.data.driverId == request.auth.uid || 
                      isAdmin());
      allow create: if request.auth != null && 
                       request.resource.data.driverId == request.auth.uid;
      allow update: if request.auth != null && 
                       resource.data.driverId == request.auth.uid;
      allow delete: if request.auth != null && isAdmin();
    }
    
    // Workflow Summaries
    match /workflowSummaries/{summaryId} {
      allow read: if request.auth != null && 
                     (resource.data.driverId == request.auth.uid || 
                      isAdmin());
      allow create: if request.auth != null && 
                       (request.resource.data.driverId == request.auth.uid || 
                        isAdmin());
      allow update, delete: if request.auth != null && isAdmin();
    }
    
    // Helper function
    function isAdmin() {
      return request.auth.token.admin == true;
    }
  }
}
```

---

## Firestore Indexes Configuration

เพิ่ม indexes เหล่านี้ใน `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "workflowActivities",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "jobId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "workflowActivities",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "driverId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "workflowSessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "jobId", "order": "ASCENDING" },
        { "fieldPath": "driverId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "workflowSummaries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "driverId", "order": "ASCENDING" },
        { "fieldPath": "completedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "workflowSummaries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "completedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Usage Examples

### บันทึก Check-in Activity

```typescript
import { saveCheckInActivity } from "@/lib/firebase/workflowDatabase";

const activityId = await saveCheckInActivity({
  jobId: "job123",
  driverId: "driver456",
  step: "checkin",
  timestamp: Date.now(),
  data: {
    photoUrl: "https://storage.../checkin.jpg",
    confirmedTime: { date: "2024-01-01", time: "08:00" },
    location: {
      latitude: 13.7563,
      longitude: 100.5018,
      address: { /* GeoapifyAddress */ }
    }
  }
});
```

### บันทึก Pickup Activity

```typescript
import { savePickupActivity } from "@/lib/firebase/workflowDatabase";

const activityId = await savePickupActivity({
  jobId: "job123",
  driverId: "driver456",
  step: "pickup",
  timestamp: Date.now(),
  data: {
    photos: {
      beforeClose: "https://storage.../before.jpg",
      seal: "https://storage.../seal.jpg",
      closedWithSeal: "https://storage.../closed.jpg",
      runSheet: "https://storage.../runsheet.jpg"
    },
    runSheetNumber: "RS-2024-001",
    confirmedTime: { date: "2024-01-01", time: "08:30" },
    location: { /* location data */ }
  }
});
```

### ดึงข้อมูล Activities ของงาน

```typescript
import { getJobActivities } from "@/lib/firebase/workflowDatabase";

const activities = await getJobActivities("job123");
console.log("Total activities:", activities.length);
```

### สร้าง Workflow Session

```typescript
import { saveWorkflowSession } from "@/lib/firebase/workflowDatabase";

const sessionId = await saveWorkflowSession({
  jobId: "job123",
  driverId: "driver456",
  startedAt: Date.now(),
  status: "in_progress",
  currentStep: "checkin",
  activities: []
});
```

---

## Notes

1. **Timestamps**: ใช้ Unix timestamp (milliseconds) สำหรับ `timestamp` และ Firestore Timestamp สำหรับ `createdAt`/`updatedAt`

2. **Location Data**: เก็บข้อมูล location ในทุก activity เพื่อติดตามเส้นทาง

3. **Photos**: เก็บ URL ของรูปภาพที่อัปโหลดไปยัง Firebase Storage

4. **Session Management**: ใช้ `workflowSessions` เพื่อติดตามสถานะ workflow ปัจจุบัน

5. **Summary**: ใช้ `workflowSummaries` สำหรับแสดงผลใน dashboard โดยไม่ต้อง query activities ทั้งหมด

