"use client";

import { useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { ConfirmedOverlay } from "./ConfirmedOverlay";
import { ImageViewer } from "@/components/common/ImageViewer";
import { createTimestamp } from "@/utils/dateTime";
import { Timestamp, GeoapifySearchResult } from "@/types";

interface CheckInCaptureProps {
  checkInPhoto: string | null;
  setCheckInPhoto: (val: string | null) => void;
  confirmedTime: Timestamp | null;
  currentAddress?: GeoapifySearchResult | null;
}

export const CheckInCapture = ({
  checkInPhoto,
  setCheckInPhoto,
  confirmedTime,
  currentAddress,
}: CheckInCaptureProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  if (confirmedTime) {
    return (
      <ConfirmedOverlay
        statusLabel="Check-in ยืนยันเข้ารับงานแล้ว"
        confirmedTime={confirmedTime}
        mockText={checkInPhoto ? undefined : "[ รูปถ่ายหน้ารถและทะเบียน ]"}
        imageData={checkInPhoto}
        currentAddress={currentAddress}
      />
    );
  }
  return (
    <>
      {showCamera && (
        <CameraCapture
          onCapture={(imageData) => {
            setCheckInPhoto(imageData);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
          label="ถ่ายรูป Check-in (รถ+ทะเบียน)"
          currentAddress={currentAddress}
          timestamp={createTimestamp()}
          statusLabel="Check-in ยืนยันเข้ารับงานแล้ว"
        />
      )}
      {showImageViewer && checkInPhoto && (
        <ImageViewer
          imageSrc={checkInPhoto}
          onClose={() => setShowImageViewer(false)}
          alt="Check-in photo"
        />
      )}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <Camera size={18} className="text-blue-600" /> ถ่ายรูป Check-in
          (รถ+ทะเบียน)
        </h3>
        <div
          onClick={() => {
            if (checkInPhoto) {
              setShowImageViewer(true);
            } else {
              setShowCamera(true);
            }
          }}
          className={`relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
            checkInPhoto
              ? "border-karabao bg-karabao/10 cursor-pointer hover:border-karabao-dark"
              : "border-gray-200 bg-gray-50 text-gray-400 active:bg-gray-100"
          }`}
        >
          {checkInPhoto ? (
            <>
              <img
                src={checkInPhoto}
                alt="Check-in photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="text-white text-xs font-black uppercase opacity-0 hover:opacity-100 transition-opacity">
                  คลิกเพื่อดูภาพเต็มขนาด
                </span>
              </div>
            </>
          ) : (
            <>
              <Camera size={36} className="mb-2 opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-tight text-center px-4">
                ถ่ายรูปหน้ารถให้เห็นทะเบียนชัดเจน
              </span>
            </>
          )}
        </div>
        {checkInPhoto && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowImageViewer(true)}
              className="flex-1 text-xs text-blue-600 font-black uppercase border border-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              ดูภาพเต็มขนาด
            </button>
            <button
              onClick={() => setShowCamera(true)}
              className="flex-1 text-xs text-orange-600 font-black uppercase border border-orange-600 py-2 rounded-lg hover:bg-orange-50 transition-colors"
            >
              ถ่ายใหม่
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCheckInPhoto(null);
              }}
              className="px-4 text-xs text-red-600 font-black uppercase border border-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 size={14} />
              ลบ
            </button>
          </div>
        )}
      </div>
    </>
  );
};
