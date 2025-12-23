"use client";

import { MapPin } from "lucide-react";
import { Timestamp, GeoapifySearchResult } from "@/types";

interface ArrivalStatusProps {
  confirmedTime: Timestamp | null;
  currentAddress?: GeoapifySearchResult | null;
}

export const ArrivalStatus = ({
  confirmedTime,
  currentAddress,
}: ArrivalStatusProps) => {
  if (confirmedTime) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
        <div className="bg-gray-900 rounded-xl p-4 text-white space-y-2">
          <div className="flex items-center justify-between border-b border-white/20 pb-2">
            <h3 className="text-green-400 font-black text-sm uppercase">
              ถึงจุดส่งของ
            </h3>
            <div className="bg-green-500 text-white rounded-full p-1.5">
              <MapPin size={18} />
            </div>
          </div>
          
          {confirmedTime && (
            <div className="text-[10px] opacity-90">
              <p>{confirmedTime.date} {confirmedTime.time}</p>
            </div>
          )}
          
          {currentAddress?.address && (
            <div className="text-[10px] opacity-90 space-y-1">
              <p>
                {currentAddress.address.address_line1 &&
                currentAddress.address.address_line2
                  ? `${currentAddress.address.address_line1}, ${currentAddress.address.address_line2}`
                  : currentAddress.address.formatted || "ไม่พบข้อมูลที่อยู่"}
              </p>
              {currentAddress.address.latitude &&
                currentAddress.address.longitude && (
                  <p className="opacity-75">
                    📍 {currentAddress.address.latitude.toFixed(6)},{" "}
                    {currentAddress.address.longitude.toFixed(6)}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 animate-fadeIn">
      <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
        <MapPin size={32} />
      </div>
      <div>
        <h3 className="font-black text-gray-800 text-sm uppercase">
          ถึงจุดส่งของแล้ว
        </h3>
        <p className="text-[10px] text-gray-400 font-bold mt-1">
          กดปุ่ม &quot;ยืนยันถึงจุดส่งของ&quot; เมื่อมาถึงสถานที่จัดส่ง
        </p>
      </div>
    </div>
  );
};

