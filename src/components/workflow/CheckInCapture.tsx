/* eslint-disable @next/next/no-img-element */
"use client";

import { CameraCapture } from "@/components/camera/CameraCapture";
import { ImageViewer } from "@/components/common/ImageViewer";
import type { CheckInPhotos, GeoapifySearchResult, Timestamp } from "@/types";
import { createTimestamp } from "@/utils/dateTime";
import { Camera, CheckCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmedOverlay } from "./ConfirmedOverlay";

interface CheckInCaptureProps {
  checkInPhotos: CheckInPhotos;
  setCheckInPhotos: (val: CheckInPhotos) => void;
  confirmedTime: Timestamp | null;
  currentAddress?: GeoapifySearchResult | null;
}

export const CheckInCapture = ({ checkInPhotos, setCheckInPhotos, confirmedTime, currentAddress }: CheckInCaptureProps) => {
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const photoTypes = [
    { key: "truckAndLicense", label: "รถ+ทะเบียน" },
    { key: "customerCheckIn", label: "Check-in ลูกค้า" },
  ];

  const handlePhotoCapture = (key: keyof CheckInPhotos, imageData: string) => {
    setCheckInPhotos({
      ...checkInPhotos,
      [key]: imageData,
    });
    setActiveCamera(null);
  };

  const handleDeletePhoto = (key: keyof CheckInPhotos) => {
    setCheckInPhotos({
      ...checkInPhotos,
      [key]: null,
    });
  };

  if (confirmedTime) {
    const allPhotos = photoTypes.map((type) => checkInPhotos[type.key as keyof CheckInPhotos]).filter((photo): photo is string => photo !== null);

    const capturedPhotoTypes = photoTypes.filter((type) => checkInPhotos[type.key as keyof CheckInPhotos] !== null).map((type) => type.label);

    return (
      <>
        {viewingImage !== null && (
          <ImageViewer
            imageSrc={allPhotos.length > 1 ? allPhotos : allPhotos[0] || ""}
            initialIndex={allPhotos.length > 1 ? allPhotos.findIndex((photo) => photo === viewingImage) : 0}
            onClose={() => setViewingImage(null)}
            alt="Check-in photos"
          />
        )}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b pb-3 mb-1">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Camera size={18} className="text-green-600" /> ถ่ายรูป Check-in (2 ภาพ)
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {photoTypes.map((type) => {
              const photoKey = type.key as keyof CheckInPhotos;
              const photo = checkInPhotos[photoKey];

              return (
                <div key={photoKey} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-gray-700 leading-tight">{type.label}</span>
                    {photo && (
                      <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                        <Camera size={10} /> ✓
                      </span>
                    )}
                  </div>
                  <div
                    onClick={() => {
                      if (photo) {
                        setViewingImage(photo);
                      }
                    }}
                    className={`relative aspect-square rounded-lg border-2 overflow-hidden flex-1 ${
                      photo ? "border-karabao bg-karabao/10 cursor-pointer hover:border-karabao-dark" : "border-gray-200 bg-gray-100"
                    }`}
                  >
                    {photo ? (
                      <>
                        <img src={photo} alt={type.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white text-[10px] font-black uppercase opacity-0 hover:opacity-100 transition-opacity">
                            คลิกเพื่อดูภาพเต็มขนาด
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Camera size={24} className="mb-1 opacity-40" />
                        <span className="text-[9px] font-black uppercase tracking-tight text-center px-1.5 leading-tight">ไม่มีรูป</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-karabao/5 border border-karabao/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-karabao uppercase">
              <CheckCircle size={12} />
              <span>Check-in ยืนยันเข้ารับงานแล้ว</span>
            </div>
            {confirmedTime && (
              <p className="text-[9px] text-gray-600">
                {confirmedTime.date} {confirmedTime.time}
              </p>
            )}
            {currentAddress?.address && (
              <p className="text-[9px] text-gray-600 leading-tight">
                {currentAddress.address.formatted || currentAddress.address.address_line1 || "ไม่พบข้อมูลที่อยู่"}
              </p>
            )}
            {capturedPhotoTypes.length > 0 && (
              <p className="text-[9px] text-gray-600 border-t border-karabao/20 pt-2 mt-2">ถ่ายแล้ว: {capturedPhotoTypes.join(", ")}</p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {activeCamera && (
        <CameraCapture
          onCapture={(imageData) => {
            handlePhotoCapture(activeCamera as keyof CheckInPhotos, imageData);
          }}
          onClose={() => setActiveCamera(null)}
          label={`ถ่ายรูป ${photoTypes.find((t) => t.key === activeCamera)?.label || ""}`}
          currentAddress={currentAddress}
          timestamp={createTimestamp()}
          statusLabel="Check-in ยืนยันเข้ารับงานแล้ว"
        />
      )}
      {viewingImage && <ImageViewer imageSrc={viewingImage} onClose={() => setViewingImage(null)} alt="Check-in photo" />}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <Camera size={18} className="text-green-600" /> ถ่ายรูป Check-in
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {photoTypes.map((type) => {
            const photoKey = type.key as keyof CheckInPhotos;
            const photo = checkInPhotos[photoKey];

            return (
              <div key={photoKey} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">{type.label}</span>
                  {photo && (
                    <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                      <Camera size={10} /> ✓
                    </span>
                  )}
                </div>
                <div
                  onClick={() => {
                    if (photo) {
                      setViewingImage(photo);
                    } else {
                      setActiveCamera(photoKey);
                    }
                  }}
                  className={`relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden flex-1 ${
                    photo
                      ? "border-karabao bg-karabao/10 cursor-pointer hover:border-karabao-dark"
                      : "border-gray-200 bg-white text-gray-400 active:bg-gray-50"
                  }`}
                >
                  {photo ? (
                    <>
                      <img src={photo} alt={type.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="text-white text-[10px] font-black uppercase opacity-0 hover:opacity-100 transition-opacity">
                          คลิกเพื่อดูภาพเต็มขนาด
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera size={24} className="mb-1 opacity-40" />
                      <span className="text-[9px] font-black uppercase tracking-tight text-center px-1.5 leading-tight">คลิกเพื่อถ่ายรูป</span>
                    </>
                  )}
                </div>
                {photo && (
                  <div className="flex gap-1.5 mt-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingImage(photo);
                      }}
                      className="flex-1 text-[9px] text-green-600 font-bold uppercase border border-green-600 py-1 rounded-md hover:bg-green-50 transition-colors"
                    >
                      ดู
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCamera(photoKey);
                      }}
                      className="flex-1 text-[9px] text-orange-600 font-bold uppercase border border-orange-600 py-1 rounded-md hover:bg-orange-50 transition-colors"
                    >
                      ใหม่
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photoKey);
                      }}
                      className="px-2 text-[9px] text-orange-600 font-bold uppercase border border-orange-600 py-1 rounded-md hover:bg-orange-50 transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
          <p className="font-bold">คำแนะนำ:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>รูปที่ 1: ถ่ายหน้ารถให้เห็นทะเบียนชัดเจน</li>
            <li>รูปที่ 2: ถ่ายรูป หน้าจอ check-in ลูกค้า</li>
          </ul>
        </div>
      </div>
    </>
  );
};
