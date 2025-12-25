import { geocodingFunctions } from "@/lib/firebase/functions";
import type { GeoapifySearchResult, Timestamp } from "@/types";
import { getStoredCoordinate, setCoordinate } from "@/utils/coordinates";
import { createTimestamp } from "@/utils/dateTime";
import { useState } from "react";

export const useLocation = () => {
  const [currentAddress, setCurrentAddress] = useState<GeoapifySearchResult | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [locationSyncedTime, setLocationSyncedTime] = useState<Timestamp | null>(null);

  const fetchLocation = async () => {
    setIsLoadingAddress(true);

    try {
      // ตรวจสอบว่ามี coordinate หรือไม่ ถ้าไม่มีให้ดึงพิกัดก่อน
      let coordinate = getStoredCoordinate();

      if (!coordinate) {
        console.log("📍 กำลังดึงพิกัดปัจจุบัน...");
        coordinate = await new Promise<import("@/types").Coordinate | null>((resolve) => {
          if (typeof window === "undefined" || !navigator.geolocation) {
            console.warn("⚠️ Browser ไม่รองรับ geolocation");
            resolve(null);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coord: import("@/types").Coordinate = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy ?? undefined,
                timestamp: Date.now(),
              };
              setCoordinate(coord);
              console.log("✅ ดึงพิกัดสำเร็จ:", coord);
              resolve(coord);
            },
            (err) => {
              console.warn("⚠️ ไม่สามารถดึงพิกัดได้:", err.message);
              resolve(null);
            },
            {
              enableHighAccuracy: false,
              timeout: 20000,
              maximumAge: 60000,
            }
          );
        });
      }

      // เรียก Firebase Function เพื่อดึงที่อยู่และแสดงทันที
      if (coordinate) {
        console.log("🌐 กำลังดึงที่อยู่จาก Firebase Function...");
        try {
          const result = await geocodingFunctions.reverseGeocode(coordinate.latitude, coordinate.longitude);

          // Convert Firebase Function response to GeoapifySearchResult format
          if (result && result.address) {
            const addressResult: GeoapifySearchResult = {
              address: result.address,
              confidence: result.confidence,
              match_type: result.match_type,
            };

            setCurrentAddress(addressResult);

            // Update synced timestamp when address is successfully fetched
            setLocationSyncedTime(createTimestamp());
            console.log("✅ ได้ที่อยู่แล้ว:", addressResult.address.formatted);
          } else {
            console.warn("⚠️ ไม่สามารถดึงที่อยู่ได้");
            setCurrentAddress(null);
          }
        } catch (error) {
          console.error("❌ เกิดข้อผิดพลาดในการเรียก Firebase Function:", error);
          setCurrentAddress(null);
        }
      } else {
        console.warn("⚠️ ไม่มีพิกัด ไม่สามารถดึงที่อยู่ได้");
        setCurrentAddress(null);
      }
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการดึงที่อยู่:", error);
      setCurrentAddress(null);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  return {
    currentAddress,
    setCurrentAddress,
    isLoadingAddress,
    setIsLoadingAddress,
    locationSyncedTime,
    setLocationSyncedTime,
    fetchLocation,
  };
};
