import type { GeoapifyAddress, GeoapifySearchResult } from "@/types";
import { getStoredCoordinate } from "./coordinates";

/**
 * Geoapify API Configuration
 * API Documentation: https://apidocs.geoapify.com/docs/geocoding/
 *
 * ตั้งค่า API key ในไฟล์ .env.local:
 * NEXT_PUBLIC_GEOAPIFY_API_KEY=your_api_key_here
 */
const GEOAPIFY_API_BASE_URL = "https://api.geoapify.com/v1";

/**
 * ดึง API key จาก environment variable
 * @returns string
 * @throws Error ถ้าไม่มี API key
 */
const getApiKey = (): string => {
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("Geoapify API key is missing. Please add NEXT_PUBLIC_GEOAPIFY_API_KEY to your .env.local file.");
  }

  return apiKey;
};

/**
 * Reverse Geocoding: ดึงที่อยู่จากพิกัดปัจจุบัน (ใช้ lat/lng จาก coordinates.ts)
 * ใช้ endpoint: /geocode/reverse?lat={lat}&lon={lon}&format=json&apiKey={apiKey}
 * @param options ตัวเลือกเพิ่มเติม
 * @returns Promise<GeoapifySearchResult | null>
 */
export const searchAddress = async (
  options: {
    lang?: string;
  } = {}
): Promise<GeoapifySearchResult | null> => {
  // ดึง lat, lng จาก coordinates.ts
  const coordinate = getStoredCoordinate();

  if (!coordinate) {
    console.warn("⚠️ ไม่มี coordinate ที่เก็บไว้ กรุณาดึงพิกัดก่อน");
    return null;
  }

  const lat = coordinate.latitude;
  const lon = coordinate.longitude;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 ใช้ lat/lng จาก coordinates.ts:");
  console.log(`  Lat: ${lat}, Lon: ${lon}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // เรียก reverse geocoding ด้วย lat/lng จาก coordinates.ts
  return reverseGeocode(lat, lon, {
    lang: options.lang || "th",
  });
};

/**
 * Reverse Geocoding: ค้นหาที่อยู่จากพิกัด (coordinates → address)
 * @param latitude ละติจูด
 * @param longitude ลองจิจูด
 * @param options ตัวเลือกเพิ่มเติม
 * @returns Promise<GeoapifySearchResult | null>
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
  options: {
    lang?: string;
  } = {}
): Promise<GeoapifySearchResult | null> => {
  // Validate coordinates
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error(`Invalid coordinates: lat=${latitude}, lng=${longitude}`);
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error(`Latitude out of range: ${latitude}. Must be between -90 and 90.`);
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error(`Longitude out of range: ${longitude}. Must be between -180 and 180.`);
  }

  const apiKey = getApiKey();

  // สร้าง parameters ตามรูปแบบที่กำหนด: lat, lon, format, apiKey
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: "json",
    apiKey: apiKey,
  });

  // เพิ่ม lang parameter ถ้ามี
  if (options.lang) {
    params.append("lang", options.lang);
  }

  const url = `${GEOAPIFY_API_BASE_URL}/geocode/reverse?${params.toString()}`;

  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🌐 Calling Geoapify Reverse Geocoding API...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Coordinates:", { latitude, longitude });
    console.log("URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Geoapify API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 Geoapify Reverse Geocoding API Response:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(JSON.stringify(data, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Geoapify API ใช้ results แทน features
    if (!data.results || data.results.length === 0) {
      console.log("⚠️ No results found");
      return null;
    }

    const result = data.results[0];
    const props = result;

    // ใช้ค่า coordinate ที่ส่งเข้ามา (จาก currentCoordinate) แทนค่าจาก Geoapify response
    const address: GeoapifyAddress = {
      formatted: props.formatted || "",
      address_line1: props.address_line1,
      address_line2: props.address_line2,
      country: props.country,
      country_code: props.country_code,
      state: props.state,
      county: props.county,
      city: props.city,
      postcode: props.postcode,
      suburb: props.suburb,
      street: props.street,
      housenumber: props.housenumber,
      latitude: latitude, // ใช้ค่าจาก currentCoordinate
      longitude: longitude, // ใช้ค่าจาก currentCoordinate
      place_id: props.place_id,
      plus_code: props.plus_code,
    };

    const searchResult: GeoapifySearchResult = {
      address,
      confidence: props.rank?.popularity, // Geoapify ใช้ popularity แทน confidence
      match_type: props.result_type,
    };

    console.log("✅ Reverse Geocoding Result:");
    console.log(`  Address: ${searchResult.address.formatted}`);
    console.log(`  Lat: ${searchResult.address.latitude}, Lng: ${searchResult.address.longitude}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return searchResult;
  } catch (error) {
    console.error("❌ Error calling Geoapify Reverse Geocoding API:", error);
    throw error;
  }
};

/**
 * ดึงที่อยู่จากพิกัดปัจจุบัน (ใช้ coordinate ที่เก็บไว้ใน coordinates.ts)
 * ใช้ reverse geocoding endpoint: /geocode/reverse?lat={lat}&lon={lon}&format=json&apiKey={apiKey}
 * @returns Promise<GeoapifySearchResult | null>
 */
export const getAddressFromCoordinate = async (): Promise<GeoapifySearchResult | null> => {
  const coordinate = getStoredCoordinate();

  if (!coordinate) {
    console.warn("⚠️ ไม่มี coordinate ที่เก็บไว้ กรุณาดึงพิกัดก่อน");
    return null;
  }

  // ดึง lat, lng จาก coordinates.ts
  const lat = coordinate.latitude;
  const lon = coordinate.longitude;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 ใช้ coordinate ที่เก็บไว้จาก coordinates.ts:");
  console.log(`  Lat: ${lat}, Lon: ${lon}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // เรียก reverse geocoding endpoint ด้วย lat, lon จาก coordinates.ts
  return reverseGeocode(lat, lon, {
    lang: "th", // ภาษาไทย
  });
};
