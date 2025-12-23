import { useState } from "react";
import { Coordinate } from "@/types";

/**
 * เก็บค่า coordinate ปัจจุบัน (สำหรับใช้กับ geoapify.ts)
 */
let currentCoordinate: Coordinate | null = null;

/**
 * Position interface สำหรับ hook (ใช้ lat/lng แทน latitude/longitude)
 */
interface Position {
  lat: number;
  lng: number;
}

/**
 * ตัวเลือกสำหรับการดึงพิกัด (สำหรับ watchCoordinate)
 */
interface GetCoordinateOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * React Hook สำหรับดึงพิกัดปัจจุบัน (Current Location)
 * @param defaultPosition ค่าเริ่มต้นของ position (optional)
 * @returns { isLoading, position, error, getPosition }
 */
function useGeolocation(defaultPosition: Position | null = null) {
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<Position | null>(defaultPosition);
  const [error, setError] = useState<string | null>(null);

  function getPosition() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Your browser does not support geolocation");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition: Position = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        console.log("newPosition", newPosition);

        // เก็บค่าไว้ใน state
        setPosition(newPosition);

        // เก็บค่าไว้ใน currentCoordinate สำหรับใช้กับ geoapify.ts
        currentCoordinate = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? undefined,
          timestamp: Date.now(),
        };

        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
  }

  return { isLoading, position, error, getPosition };
}

export default useGeolocation;

/**
 * ดึงค่า coordinate ที่เก็บไว้ล่าสุด (สำหรับใช้กับ geoapify.ts)
 * @returns Coordinate | null
 */
export const getStoredCoordinate = (): Coordinate | null => {
  return currentCoordinate;
};

/**
 * ตั้งค่า coordinate ใหม่
 * @param coordinate ค่า coordinate ที่ต้องการเก็บ
 */
export const setCoordinate = (coordinate: Coordinate): void => {
  currentCoordinate = {
    ...coordinate,
    timestamp: Date.now(),
  };
};

/**
 * ล้างค่า coordinate ที่เก็บไว้
 */
export const clearCoordinate = (): void => {
  currentCoordinate = null;
};

/**
 * ตรวจสอบว่ามี coordinate ที่เก็บไว้หรือไม่
 * @returns boolean
 */
export const hasStoredCoordinate = (): boolean => {
  return currentCoordinate !== null;
};

/**
 * ดึงพิกัดแบบ watch (ติดตามการเปลี่ยนแปลง)
 * @param callback ฟังก์ชันที่จะถูกเรียกเมื่อได้พิกัดใหม่
 * @param options ตัวเลือกสำหรับการดึงพิกัด
 * @returns number | null (watchId สำหรับใช้กับ clearWatch)
 */
export const watchCoordinate = (
  callback: (coordinate: Coordinate | null) => void,
  options: GetCoordinateOptions = {}
): number | null => {
  if (typeof window === "undefined" || !navigator.geolocation) {
    console.warn("Geolocation is not supported");
    callback(null);
    return null;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: options.enableHighAccuracy ?? true,
    timeout: options.timeout ?? 10000,
    maximumAge: options.maximumAge ?? 0,
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const coordinate: Coordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
        timestamp: Date.now(),
      };

      // เก็บค่าไว้
      currentCoordinate = coordinate;
      callback(coordinate);
    },
    (error) => {
      console.warn("Failed to watch coordinate:", error.message);
      callback(null);
    },
    defaultOptions
  );

  return watchId;
};

/**
 * หยุดการ watch coordinate
 * @param watchId ID ที่ได้จาก watchCoordinate
 */
export const stopWatchingCoordinate = (watchId: number): void => {
  if (typeof window !== "undefined" && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};
