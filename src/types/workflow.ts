/**
 * Workflow Activity Types
 * Types สำหรับเก็บข้อมูลทุกกิจกรรมของพนักงานขับรถใน Workflow
 */

import type { CheckInPhotos, DeliveryPhotos, GeoapifyAddress, IncidentPhotos, PickupPhotos, Timestamp } from "./index";

/**
 * Workflow Step Types
 */
export type WorkflowStep = "checkin" | "pickup" | "departure" | "incident_selection" | "incident_photos" | "arrival" | "delivery";

/**
 * Workflow Activity Base Interface
 */
export interface WorkflowActivityBase {
  id: string;
  jobId: string;
  driverId: string;
  step: WorkflowStep;
  timestamp: number; // Unix timestamp in milliseconds
  createdAt: number; // Firestore server timestamp
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: GeoapifyAddress;
  };
}

/**
 * Check-in Activity
 */
export interface CheckInActivity extends WorkflowActivityBase {
  step: "checkin";
  data: {
    photos: CheckInPhotos;
    confirmedTime: Timestamp;
    location?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      address?: GeoapifyAddress;
    };
  };
}

/**
 * Pickup Activity
 */
export interface PickupActivity extends WorkflowActivityBase {
  step: "pickup";
  data: {
    photos: PickupPhotos;
    runSheetNumber: string;
    confirmedTime: Timestamp;
    location?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      address?: GeoapifyAddress;
    };
  };
}

/**
 * Departure Activity
 */
export interface DepartureActivity extends WorkflowActivityBase {
  step: "departure";
  data: {
    confirmedTime: Timestamp;
    location?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      address?: GeoapifyAddress;
    };
  };
}

/**
 * Incident Selection Activity
 */
export interface IncidentSelectionActivity extends WorkflowActivityBase {
  step: "incident_selection";
  data: {
    incidentType: string;
    incidentOtherDescription?: string;
    isDelayed: boolean;
    confirmedTime: Timestamp;
    location?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      address?: GeoapifyAddress;
    };
  };
}

/**
 * Incident Photos Activity
 */
export interface IncidentPhotosActivity extends WorkflowActivityBase {
  step: "incident_photos";
  data: {
    photos: IncidentPhotos;
    incidentType: string;
    incidentOtherDescription?: string;
    confirmedTime: Timestamp;
    location?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      address?: GeoapifyAddress;
    };
  };
}

/**
 * Arrival Activity
 */
export interface ArrivalActivity extends WorkflowActivityBase {
  step: "arrival";
  data: {
    confirmedTime: Timestamp;
    location?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      address?: GeoapifyAddress;
    };
  };
}

/**
 * Delivery Activity
 */
export interface DeliveryActivity extends WorkflowActivityBase {
  step: "delivery";
  data: {
    photos: DeliveryPhotos;
    confirmedTime: Timestamp;
    status: "success" | "delay" | "cancel" | "standby";
    location?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      address?: GeoapifyAddress;
    };
  };
}

/**
 * Union type for all workflow activities
 */
export type WorkflowActivity =
  | CheckInActivity
  | PickupActivity
  | DepartureActivity
  | IncidentSelectionActivity
  | IncidentPhotosActivity
  | ArrivalActivity
  | DeliveryActivity;

/**
 * Workflow Session
 * เก็บข้อมูล session ของ workflow ทั้งหมดสำหรับงานหนึ่งงาน
 */
export interface WorkflowSession {
  id: string;
  jobId: string;
  driverId: string;
  startedAt: number; // Unix timestamp
  completedAt?: number; // Unix timestamp
  status: "in_progress" | "completed" | "cancelled";
  currentStep: WorkflowStep;
  activities: string[]; // Array of activity IDs
  metadata?: {
    isDelayed?: boolean;
    incidentType?: string;
    runSheetNumber?: string;
    finalStatus?: "success" | "delay" | "cancel" | "standby";
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * Workflow Summary
 * สรุปข้อมูล workflow สำหรับแสดงใน dashboard
 */
export interface WorkflowSummary {
  jobId: string;
  driverId: string;
  sessionId: string;
  runSheetNumber?: string;
  checkInTime?: Timestamp;
  pickupTime?: Timestamp;
  departureTime?: Timestamp;
  incidentTime?: Timestamp;
  arrivalTime?: Timestamp;
  deliveryTime?: Timestamp;
  status: "success" | "delay" | "cancel" | "standby";
  incidentType?: string;
  totalDuration?: number; // in minutes
  createdAt: number;
  completedAt?: number;
}
