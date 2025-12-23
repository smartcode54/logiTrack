"use client";

import { useState } from "react";
import { PackageCheck, Camera, CheckCircle, Hash } from "lucide-react";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { ConfirmedOverlay } from "./ConfirmedOverlay";
import { ImageViewer } from "@/components/common/ImageViewer";
import { createTimestamp } from "@/utils/dateTime";
import { DeliveryPhotos, Timestamp, GeoapifySearchResult } from "@/types";

interface DeliveryPhotoUploadProps {
  deliveryPhotos: DeliveryPhotos;
  setDeliveryPhotos: (val: DeliveryPhotos) => void;
  runSheetNumber: string;
  confirmedTime: Timestamp | null;
  currentAddress?: GeoapifySearchResult | null;
}

export const DeliveryPhotoUpload = ({
  deliveryPhotos,
  setDeliveryPhotos,
  runSheetNumber,
  confirmedTime,
  currentAddress,
}: DeliveryPhotoUploadProps) => {
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const photoTypes = [
    { key: "beforeOpen", label: "ก่อนเปิดตู้" },
    { key: "breakSeal", label: "ระหว่าง Break Seal" },
    { key: "emptyContainer", label: "ตู้เปล่าหลังลงสินค้า" },
    { key: "deliveryRunSheet", label: "Run Sheet (จัดส่ง)" },
  ];

  if (confirmedTime) {
    const allPhotos = photoTypes
      .map((type) => deliveryPhotos[type.key as keyof DeliveryPhotos])
      .filter((photo): photo is string => photo !== null);

    return (
      <>
        {viewingImage !== null && (
          <ImageViewer
            imageSrc={allPhotos.length > 1 ? allPhotos : allPhotos[0] || ""}
            initialIndex={
              allPhotos.length > 1
                ? allPhotos.findIndex((photo) => photo === viewingImage)
                : 0
            }
            onClose={() => setViewingImage(null)}
            alt="Delivery photo"
          />
        )}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b pb-3 mb-1">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <PackageCheck size={18} className="text-green-600" /> หลักฐานจัดส่ง
              (4 ภาพ)
            </h3>
            <div className="bg-blue-50 px-2 py-1 rounded-md border border-blue-100 flex items-center gap-1">
              <Hash size={10} className="text-blue-500" />
              <span className="text-[10px] font-black text-blue-700">
                RS: {runSheetNumber || "-"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {photoTypes.map((type) => {
              const photo = deliveryPhotos[type.key as keyof DeliveryPhotos];
              return (
                <div
                  key={type.key}
                  className={`relative aspect-square rounded-xl border-2 border-green-500 bg-gray-900 overflow-hidden ${
                    photo ? "cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    if (photo) {
                      setViewingImage(photo);
                    }
                  }}
                >
                {photo ? (
                  <>
                    <img
                      src={photo}
                      alt={type.label}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="text-white text-[8px] font-black uppercase opacity-0 hover:opacity-100 transition-opacity">
                        คลิกดู
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-800 opacity-50 flex items-center justify-center text-white text-[10px] font-bold text-center px-4">
                    {type.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="bg-gray-900 rounded-xl p-3 text-[10px] text-white space-y-1">
          <div className="flex justify-between border-b border-white/20 pb-1.5 mb-1 font-black">
            <span className="text-green-400 tracking-tight uppercase text-[9px]">
              จัดส่งสินค้าสำเร็จ (POD)
            </span>
          </div>
          {currentAddress?.address && (
            <p className="opacity-90 text-[8px] leading-tight mb-1">
              {currentAddress.address.address_line1 &&
              currentAddress.address.address_line2
                ? `${currentAddress.address.address_line1}, ${currentAddress.address.address_line2}`
                : currentAddress.address.formatted || "ไม่พบข้อมูลที่อยู่"}
              {currentAddress.address.latitude &&
                currentAddress.address.longitude && (
                  <span className="block mt-0.5 opacity-75">
                    📍 {currentAddress.address.latitude.toFixed(6)},{" "}
                    {currentAddress.address.longitude.toFixed(6)}
                  </span>
                )}
            </p>
          )}
          {confirmedTime && (
            <p className="opacity-90 text-[8px] leading-tight">
              {confirmedTime.date} {confirmedTime.time}
            </p>
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
            setDeliveryPhotos({
              ...deliveryPhotos,
              [activeCamera]: imageData,
            });
            setActiveCamera(null);
          }}
          onClose={() => setActiveCamera(null)}
          label={photoTypes.find((t) => t.key === activeCamera)?.label || ""}
          currentAddress={currentAddress}
          timestamp={createTimestamp()}
          statusLabel="จัดส่งสินค้าสำเร็จ (POD)"
        />
      )}
      {viewingImage !== null && (() => {
        const allPhotos = photoTypes
          .map((type) => deliveryPhotos[type.key as keyof DeliveryPhotos])
          .filter((photo): photo is string => photo !== null);
        
        return (
          <ImageViewer
            imageSrc={allPhotos.length > 1 ? allPhotos : allPhotos[0] || ""}
            initialIndex={
              allPhotos.length > 1
                ? allPhotos.findIndex((photo) => photo === viewingImage)
                : 0
            }
            onClose={() => setViewingImage(null)}
            alt="Delivery photo"
          />
        );
      })()}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
        <div className="flex justify-between items-center border-b pb-3 mb-1">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <PackageCheck size={18} className="text-green-600" /> หลักฐานจัดส่ง
            (4 ภาพ)
          </h3>
          <div className="bg-blue-50 px-2 py-1 rounded-md border border-blue-100 flex items-center gap-1">
            <Hash size={10} className="text-blue-500" />
            <span className="text-[10px] font-black text-blue-700">
              RS: {runSheetNumber || "-"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {photoTypes.map((type) => {
            const hasPhoto = deliveryPhotos[type.key as keyof DeliveryPhotos] !== null;
            
            return (
              <button
                key={type.key}
                onClick={() => setActiveCamera(type.key)}
                className={`relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden aspect-square ${
                  hasPhoto
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-gray-50 text-gray-400 active:bg-gray-100"
                }`}
              >
              {deliveryPhotos[type.key as keyof DeliveryPhotos] ? (
                <>
                  <img
                    src={deliveryPhotos[type.key as keyof DeliveryPhotos]!}
                    alt={type.label}
                    className="w-full h-full object-cover"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingImage(deliveryPhotos[type.key as keyof DeliveryPhotos]!);
                    }}
                  />
                  <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingImage(deliveryPhotos[type.key as keyof DeliveryPhotos]!);
                    }}
                  >
                    <span className="text-white text-[8px] font-black uppercase opacity-0 hover:opacity-100 transition-opacity">
                      คลิกดู
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Camera size={24} className="mb-1 opacity-50" />
                  <span className="text-[9px] font-black uppercase text-center leading-tight px-1">
                    {type.label}
                  </span>
                </>
              )}
                  </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

