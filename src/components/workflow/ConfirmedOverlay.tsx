"use client";

import { ImageViewer } from "@/components/common/ImageViewer";
import type { GeoapifySearchResult, Timestamp } from "@/types";
import { CheckCircle, Navigation } from "lucide-react";
import { useState } from "react";

interface ConfirmedOverlayProps {
  statusLabel: string;
  confirmedTime: Timestamp | null;
  mockText?: string;
  type?: "image" | "icon";
  imageData?: string | null;
  currentAddress?: GeoapifySearchResult | null;
  additionalInfo?: string;
}

export const ConfirmedOverlay = ({
  statusLabel,
  confirmedTime,
  mockText = "",
  type = "image",
  imageData,
  currentAddress,
  additionalInfo,
}: ConfirmedOverlayProps) => {
  const [showImageViewer, setShowImageViewer] = useState(false);

  // สร้างข้อความสถานที่ปัจจุบัน
  const getLocationText = () => {
    if (currentAddress?.address) {
      const addr = currentAddress.address;
      if (addr.address_line1 && addr.address_line2) {
        return `${addr.address_line1}, ${addr.address_line2}`;
      }
      return addr.formatted || "ไม่พบข้อมูลที่อยู่";
    }
    return mockText;
  };

  return (
    <>
      {showImageViewer && imageData && <ImageViewer imageSrc={imageData} onClose={() => setShowImageViewer(false)} alt="Captured" />}
      <div
        className={`relative ${
          type === "image" ? "aspect-video" : "p-6"
        } rounded-xl border-2 border-karabao bg-gray-900 overflow-hidden animate-fadeIn ${imageData ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (imageData) {
            setShowImageViewer(true);
          }
        }}
      >
        {type === "image" ? (
          imageData ? (
            <>
              <img src={imageData} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white text-xs font-black uppercase opacity-0 hover:opacity-100 transition-opacity">คลิกเพื่อดูภาพเต็มขนาด</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gray-800 opacity-50 flex items-center justify-center text-white text-[10px] font-bold text-center px-4">
              {getLocationText()}
            </div>
          )
        ) : (
          <div className="flex items-center justify-center py-8 opacity-20">
            <Navigation size={64} className="text-white" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/85 p-3 text-[10px] text-white space-y-1">
          <div className="flex justify-between border-b border-white/20 pb-1.5 mb-1 font-black">
            <span className="text-karabao-light tracking-tight uppercase text-[9px]">{statusLabel}</span>
          </div>
          {currentAddress?.address && (
            <p className="opacity-90 text-[8px] leading-tight mb-1">
              {getLocationText()}
              {currentAddress.address.latitude && currentAddress.address.longitude && (
                <span className="block mt-0.5 opacity-75">
                  📍 {currentAddress.address.latitude.toFixed(6)}, {currentAddress.address.longitude.toFixed(6)}
                </span>
              )}
            </p>
          )}
          {confirmedTime && (
            <p className="opacity-90 text-[8px] leading-tight">
              {confirmedTime.date} {confirmedTime.time}
            </p>
          )}
          {additionalInfo && <p className="opacity-75 text-[8px] leading-tight mt-1 border-t border-white/20 pt-1">{additionalInfo}</p>}
        </div>
        <div className="absolute top-2 right-2 bg-karabao text-white rounded-full p-1.5 shadow-xl border-2 border-white">
          <CheckCircle size={18} />
        </div>
      </div>
    </>
  );
};
