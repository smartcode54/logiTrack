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

export interface DeliveredJob {
  id: string;
  runSheet: string;
  pickupTime: string;
  deliveryTime: string;
  route: string;
  type: string;
  date: string;
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

