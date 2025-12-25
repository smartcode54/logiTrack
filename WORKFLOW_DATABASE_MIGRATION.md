# Workflow Database Migration Guide

## Overview

โครงสร้างฐานข้อมูล workflow ที่สร้างไว้รองรับการอัปเดตและเปลี่ยนแปลงในอนาคต

## Design Principles

### 1. **Extensible Structure**
- ใช้ `data` object ที่สามารถเพิ่ม fields ใหม่ได้โดยไม่กระทบโครงสร้างเดิม
- ใช้ `metadata` สำหรับข้อมูลเพิ่มเติมที่ไม่จำเป็นต้อง query บ่อย
- ใช้ optional fields (`?`) สำหรับข้อมูลที่อาจเพิ่มในอนาคต

### 2. **Versioning Support**
- เพิ่ม `version` field ในอนาคตได้ถ้าต้องการ
- ใช้ `migratedAt` timestamp สำหรับ track การ migrate

### 3. **Backward Compatibility**
- เก็บข้อมูลเดิมไว้เสมอเมื่ออัปเดต
- ใช้ helper functions สำหรับ migrate ข้อมูล

## Future Update Scenarios

### Scenario 1: เพิ่ม Step ใหม่

```typescript
// เพิ่ม step ใหม่ใน WorkflowStep type
export type WorkflowStep =
  | "checkin"
  | "pickup"
  | "departure"
  | "incident_selection"
  | "incident_photos"
  | "arrival"
  | "delivery"
  | "return_trip"  // ← Step ใหม่
  | "vehicle_inspection";  // ← Step ใหม่

// สร้าง interface ใหม่
export interface ReturnTripActivity extends WorkflowActivityBase {
  step: "return_trip";
  data: {
    confirmedTime: Timestamp;
    location?: { /* ... */ };
    // เพิ่ม fields ใหม่ได้ตามต้องการ
  };
}

// เพิ่ม function สำหรับบันทึก
export const saveReturnTripActivity = async (
  activity: Omit<ReturnTripActivity, "id" | "createdAt">
): Promise<string> => {
  // Implementation
};
```

### Scenario 2: เพิ่ม Field ใหม่ใน Activity

```typescript
// อัปเดต interface
export interface CheckInActivity extends WorkflowActivityBase {
  step: "checkin";
  data: {
    photoUrl: string;
    confirmedTime: Timestamp;
    location?: { /* ... */ };
    // เพิ่ม fields ใหม่
    weatherCondition?: string;  // ← Field ใหม่
    temperature?: number;        // ← Field ใหม่
  };
}

// ใช้ helper function สำหรับอัปเดตข้อมูลเก่า
import { appendActivityData } from "@/lib/firebase/workflowDatabaseHelpers";

// อัปเดต activity ที่มีอยู่แล้ว
await appendActivityData(activityId, {
  weatherCondition: "sunny",
  temperature: 32,
});
```

### Scenario 3: เพิ่ม Collection ใหม่

```typescript
// สร้าง collection ใหม่
const WORKFLOW_ANALYTICS_COLLECTION = "workflowAnalytics";

export interface WorkflowAnalytics {
  id: string;
  jobId: string;
  driverId: string;
  averageStepDuration: Record<WorkflowStep, number>;
  totalDuration: number;
  efficiencyScore: number;
  createdAt: number;
}

export const saveWorkflowAnalytics = async (
  analytics: Omit<WorkflowAnalytics, "id" | "createdAt">
): Promise<string> => {
  // Implementation
};
```

### Scenario 4: Migrate ข้อมูลเก่า

```typescript
import { migrateActivityFormat } from "@/lib/firebase/workflowDatabaseHelpers";

// ตัวอย่าง: เพิ่ม location data ให้กับ activities เก่าที่ไม่มี
const migrationFn = (oldData: any) => {
  if (!oldData.location && oldData.data?.location) {
    return {
      ...oldData,
      location: oldData.data.location,
      data: {
        ...oldData.data,
        location: undefined, // ย้ายไปที่ root level แล้ว
      },
    };
  }
  return oldData;
};

// Migrate activity เดียว
await migrateActivityFormat(activityId, migrationFn);

// Migrate ทั้งหมด (ใช้ batch)
const activities = await getJobActivities(jobId);
for (const activity of activities) {
  await migrateActivityFormat(activity.id, migrationFn);
}
```

## Update Checklist

เมื่อต้องการอัปเดตโครงสร้าง:

- [ ] **Update Types** - อัปเดต interfaces ใน `src/types/workflow.ts`
- [ ] **Update Functions** - อัปเดตหรือเพิ่ม functions ใน `src/lib/firebase/workflowDatabase.ts`
- [ ] **Update Indexes** - เพิ่ม indexes ใหม่ใน `firestore.indexes.json` ถ้าจำเป็น
- [ ] **Update Security Rules** - อัปเดต Firestore security rules ถ้ามี collection ใหม่
- [ ] **Migration Script** - สร้าง migration script ถ้าต้องการ migrate ข้อมูลเก่า
- [ ] **Update Documentation** - อัปเดต `FIRESTORE_WORKFLOW_SCHEMA.md`
- [ ] **Test** - ทดสอบการทำงานกับข้อมูลเก่าและใหม่

## Best Practices

### 1. **Always Use Optional Fields for New Data**
```typescript
// ✅ Good - backward compatible
data: {
  photoUrl: string;
  confirmedTime: Timestamp;
  newField?: string;  // Optional
}

// ❌ Bad - breaks existing data
data: {
  photoUrl: string;
  confirmedTime: Timestamp;
  newField: string;  // Required - breaks old data
}
```

### 2. **Use Helper Functions for Updates**
```typescript
// ✅ Good - use helper
await appendActivityData(activityId, { newField: "value" });

// ❌ Bad - direct update might lose data
await updateDoc(activityRef, { data: { newField: "value" } });
```

### 3. **Version Your Schema**
```typescript
// เพิ่ม version field ในอนาคต
export interface WorkflowActivityBase {
  id: string;
  jobId: string;
  driverId: string;
  step: WorkflowStep;
  timestamp: number;
  createdAt: number;
  version?: number;  // Schema version
  // ...
}
```

### 4. **Keep Migration Functions**
```typescript
// เก็บ migration functions ไว้สำหรับอ้างอิง
export const migrateV1ToV2 = async (activityId: string) => {
  // Migration logic
};
```

## Example: Adding GPS Tracking

```typescript
// 1. Update type
export interface WorkflowActivityBase {
  // ... existing fields
  gpsTrack?: {  // ← New optional field
    points: Array<{
      latitude: number;
      longitude: number;
      timestamp: number;
    }>;
  };
}

// 2. Update save function
export const saveCheckInActivity = async (
  activity: Omit<CheckInActivity, "id" | "createdAt">,
  gpsTrack?: WorkflowActivityBase["gpsTrack"]  // ← Optional parameter
): Promise<string> => {
  const docRef = await addDoc(collection(db, WORKFLOW_ACTIVITIES_COLLECTION), {
    ...activity,
    ...(gpsTrack && { gpsTrack }),  // ← Add if provided
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// 3. Update existing activities (optional)
import { appendActivityData } from "./workflowDatabaseHelpers";

const activities = await getJobActivities(jobId);
for (const activity of activities) {
  if (!activity.gpsTrack) {
    // Generate or fetch GPS track
    const gpsTrack = await generateGPSTrack(activity);
    await appendActivityData(activity.id, { gpsTrack });
  }
}
```

## Testing Updates

```typescript
// Test backward compatibility
describe("Workflow Database Updates", () => {
  it("should handle old format activities", async () => {
    // Create activity with old format
    const oldActivity = await saveCheckInActivity({
      // Old format without new fields
    });
    
    // Should still work
    const activity = await getActivity(oldActivity);
    expect(activity).toBeDefined();
  });
  
  it("should support new format activities", async () => {
    // Create activity with new format
    const newActivity = await saveCheckInActivity({
      // New format with new fields
      gpsTrack: { /* ... */ },
    });
    
    // Should work
    const activity = await getActivity(newActivity);
    expect(activity.gpsTrack).toBeDefined();
  });
});
```

## Summary

โครงสร้างที่สร้างไว้:
- ✅ รองรับการเพิ่ม fields ใหม่
- ✅ รองรับการเพิ่ม steps ใหม่
- ✅ รองรับการเพิ่ม collections ใหม่
- ✅ มี helper functions สำหรับอัปเดต
- ✅ Backward compatible
- ✅ มี documentation สำหรับอ้างอิง

พร้อมสำหรับการอัปเดตในอนาคต!

