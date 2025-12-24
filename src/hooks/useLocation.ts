import { useState } from "react";
import { GeoapifySearchResult, Timestamp } from "@/types";
import { searchAddress } from "@/utils/geoapify";
import { getStoredCoordinate, setCoordinate } from "@/utils/coordinates";
import { createTimestamp } from "@/utils/dateTime";

export const useLocation = () => {
  const [currentAddress, setCurrentAddress] =
    useState<GeoapifySearchResult | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [locationSyncedTime, setLocationSyncedTime] =
    useState<Timestamp | null>(null);

  const fetchLocation = async () => {
    setIsLoadingAddress(true);

    try {
      // ตรวจสอบว่ามี coordinate หรือไม่ ถ้าไม่มีให้ดึงพิกัดก่อน
      let coordinate = getStoredCoordinate();

      if (!coordinate) {
        console.log("📍 กำลังดึงพิกัดปัจจุบัน...");
        coordinate = await new Promise<import("@/types").Coordinate | null>(
          (resolve) => {
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
          }
        );
      }

      // เรียก geoapify API เพื่อดึงที่อยู่และแสดงทันที
      if (coordinate) {
        console.log("🌐 กำลังดึงที่อยู่จาก Geoapify API...");
        const addressResult = await searchAddress({ lang: "th" });
        setCurrentAddress(addressResult);

        // Update synced timestamp when address is successfully fetched
        if (addressResult) {
          setLocationSyncedTime(createTimestamp());
          console.log("✅ ได้ที่อยู่แล้ว:", addressResult.address.formatted);
        } else {
          console.warn("⚠️ ไม่สามารถดึงที่อยู่ได้");
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

