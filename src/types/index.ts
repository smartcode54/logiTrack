export interface Timestamp {
  date: string;
  time: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeoapifyAddress {
  formatted: string;
  address_line1?: string;
  address_line2?: string;
  country?: string;
  country_code?: string;
  state?: string;
  county?: string;
  city?: string;
  postcode?: string;
  suburb?: string;
  street?: string;
  housenumber?: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  plus_code?: string;
}

export interface GeoapifySearchResult {
  address: GeoapifyAddress;
  confidence?: number;
  match_type?: string;
}

export interface Job {
  id: string;
  type: "LH" | "FM";
  route: string;
  pickup: string;
  status: "assigned" | "pending" | "delivered";
  scheduledTime: string;
}

export type JobStatus = "success" | "delay" | "cancel" | "standby";

export interface DeliveredJob {
  id: string;
  runSheet: string;
  pickupTime: string;
  deliveryTime: string;
  route: string;
  type: string;
  date: string;
  status: JobStatus;
  incidentType?: string;
  incidentTime?: string;
  incidentAddress?: string;
}

export interface CheckInPhotos {
  truckAndLicense: string | null; // รูปถ่ายหน้ารถและทะเบียน
  customerCheckIn: string | null; // รูปถ่าย check-in กับพนักงานลูกค้า
}

export interface PickupPhotos {
  beforeClose: string | null;
  seal: string | null;
  closedWithSeal: string | null;
  runSheet: string | null;
}

export interface DeliveryPhotos {
  beforeOpen: string | null;
  breakSeal: string | null;
  emptyContainer: string | null;
  deliveryRunSheet: string | null;
}

export interface IncidentPhotos {
  incident1: string | null;
  incident2: string | null;
  incident3: string | null;
  incident4: string | null;
}

export type ExpenseCategory = "fuel" | "maintenance" | "other";
export type PaymentType = "card" | "cash";

export interface FuelExpenseData {
  mileage: number | null; // เลขไมล์ก่อนเติม
  liters: number | null; // จำนวนลิตรที่เติม
  paymentType: PaymentType | null; // ประเภทการเติม: บัตรน้ำมัน/เงินสด
  beforeFillImage: string | null; // รูปภาพถังน้ำมันก่อนเติม (เพื่อดูระดับน้ำมัน)
  receiptImage: string | null; // รูปภาพบิล/ใบเสร็จน้ำมัน
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  time: string;
  timestamp: number; // For sorting
  otherType?: string; // For "other" category (tire, car washed, etc.)
  fuelData?: FuelExpenseData; // ข้อมูลเพิ่มเติมสำหรับค่าใช้จ่ายน้ำมัน
  receiptImages?: string[]; // รูปภาพใบเสร็จสำหรับ maintenance (4 ภาพ) และ other (1 ภาพ)
}

// Export workflow types
export * from "./workflow";

// Export admin types
export * from "./admin";
