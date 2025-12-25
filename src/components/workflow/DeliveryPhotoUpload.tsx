"use client";

import { CameraCapture } from "@/components/camera/CameraCapture";
import { ImageViewer } from "@/components/common/ImageViewer";
import type { DeliveryPhotos, GeoapifySearchResult, Timestamp } from "@/types";
import { createTimestamp } from "@/utils/dateTime";
import { Camera, CheckCircle, Hash, Image as ImageIcon, PackageCheck, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type React from "react";

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
  const [showRunSheetOptions, setShowRunSheetOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setDeliveryPhotos({
          ...deliveryPhotos,
          deliveryRunSheet: base64String,
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRunSheetClick = () => {
    setShowRunSheetOptions(true);
  };

  const handleRunSheetCamera = () => {
    setShowRunSheetOptions(false);
    setActiveCamera("deliveryRunSheet");
  };

  const handleRunSheetGallery = () => {
    setShowRunSheetOptions(false);
    fileInputRef.current?.click();
  };

  const photoTypes = [
    { key: "beforeOpen", label: "ก่อนเปิดตู้" },
    { key: "breakSeal", label: "ระหว่าง Break Seal" },
    { key: "emptyContainer", label: "ตู้เปล่าหลังลงสินค้า" },
    { key: "deliveryRunSheet", label: "Run Sheet (จัดส่ง)" },
  ];

  if (confirmedTime) {
    const allPhotos = photoTypes.map((type) => deliveryPhotos[type.key as keyof DeliveryPhotos]).filter((photo): photo is string => photo !== null);

    return (
      <>
        {viewingImage !== null && (
          <ImageViewer
            imageSrc={allPhotos.length > 1 ? allPhotos : allPhotos[0] || ""}
            initialIndex={allPhotos.length > 1 ? allPhotos.findIndex((photo) => photo === viewingImage) : 0}
            onClose={() => setViewingImage(null)}
            alt="Delivery photo"
          />
        )}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b pb-3 mb-1">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <PackageCheck size={18} className="text-karabao" /> หลักฐานจัดส่ง (4 ภาพ)
            </h3>
            <div className="bg-green-50 px-2 py-1 rounded-md border border-green-100 flex items-center gap-1">
              <Hash size={10} className="text-green-500" />
              <span className="text-[10px] font-black text-green-700">RS: {runSheetNumber || "-"}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {photoTypes.map((type) => {
              const photo = deliveryPhotos[type.key as keyof DeliveryPhotos];
              return (
                <div
                  key={type.key}
                  className={`relative aspect-square rounded-xl border-2 border-karabao bg-gray-900 overflow-hidden ${photo ? "cursor-pointer" : ""}`}
                  onClick={() => {
                    if (photo) {
                      setViewingImage(photo);
                    }
                  }}
                >
                  {photo ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={type.label} className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute top-1 right-1 bg-karabao rounded-full p-1">
                        <CheckCircle size={16} className="text-white" />
                      </div>
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="text-white text-[8px] font-black uppercase opacity-0 hover:opacity-100 transition-opacity">คลิกดู</span>
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
              <span className="text-karabao-light tracking-tight uppercase text-[9px]">จัดส่งสินค้าสำเร็จ (POD)</span>
            </div>
            {currentAddress?.address && (
              <p className="opacity-90 text-[8px] leading-tight mb-1">
                {currentAddress.address.address_line1 && currentAddress.address.address_line2
                  ? `${currentAddress.address.address_line1}, ${currentAddress.address.address_line2}`
                  : currentAddress.address.formatted || "ไม่พบข้อมูลที่อยู่"}
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
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
      {showRunSheetOptions && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full space-y-3">
            <h3 className="text-sm font-black text-gray-800 uppercase text-center mb-4">เลือกวิธีเพิ่มรูป Run Sheet</h3>
            <button
              onClick={handleRunSheetCamera}
              className="w-full flex items-center justify-center gap-3 p-4 bg-green-600 text-white rounded-xl font-black uppercase active:scale-95 transition-all"
            >
              <Camera size={20} />
              ถ่ายรูป
            </button>
            <button
              onClick={handleRunSheetGallery}
              className="w-full flex items-center justify-center gap-3 p-4 bg-karabao text-white rounded-xl font-black uppercase active:scale-95 transition-all"
            >
              <ImageIcon size={20} />
              เลือกจากแกลเลอรี่
            </button>
            <button
              onClick={() => setShowRunSheetOptions(false)}
              className="w-full p-3 text-gray-600 rounded-xl font-black uppercase border-2 border-gray-200 active:scale-95 transition-all"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
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
          statusLabel={`จัดส่งสินค้าสำเร็จ [RS: ${runSheetNumber}]`}
        />
      )}
      {viewingImage !== null &&
        (() => {
          const allPhotos = photoTypes
            .map((type) => deliveryPhotos[type.key as keyof DeliveryPhotos])
            .filter((photo): photo is string => photo !== null);

          return (
            <ImageViewer
              imageSrc={allPhotos.length > 1 ? allPhotos : allPhotos[0] || ""}
              initialIndex={allPhotos.length > 1 ? allPhotos.findIndex((photo) => photo === viewingImage) : 0}
              onClose={() => setViewingImage(null)}
              alt="Delivery photo"
            />
          );
        })()}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
        <div className="flex justify-between items-center border-b pb-3 mb-1">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <PackageCheck size={18} className="text-green-600" /> หลักฐานจัดส่ง (4 ภาพ)
          </h3>
          <div className="bg-green-50 px-2 py-1 rounded-md border border-green-100 flex items-center gap-1">
            <Hash size={10} className="text-green-500" />
            <span className="text-[10px] font-black text-green-700">RS: {runSheetNumber || "-"}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {photoTypes.map((type) => {
            const hasPhoto = deliveryPhotos[type.key as keyof DeliveryPhotos] !== null;
            const photo = deliveryPhotos[type.key as keyof DeliveryPhotos];

            return (
              <div key={type.key} className="relative">
                <button
                  onClick={() => {
                    if (type.key === "deliveryRunSheet") {
                      handleRunSheetClick();
                    } else {
                      setActiveCamera(type.key);
                    }
                  }}
                  className={`relative w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden aspect-square ${
                    hasPhoto ? "border-karabao bg-karabao/10" : "border-gray-200 bg-gray-50 text-gray-400 active:bg-gray-100"
                  }`}
                >
                  {photo ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={type.label} className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-karabao rounded-full p-1">
                        <CheckCircle size={16} className="text-white" />
                      </div>
                      <div
                        className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingImage(photo);
                        }}
                      >
                        <span className="text-white text-[8px] font-black uppercase opacity-0 hover:opacity-100 transition-opacity">คลิกดู</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera size={24} className="mb-1 opacity-50" />
                      <span className="text-[9px] font-black uppercase text-center leading-tight px-1">{type.label}</span>
                    </>
                  )}
                </button>
                {photo && (
                  <div className="absolute -bottom-1 left-0 right-0 flex gap-1 px-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingImage(photo);
                      }}
                      className="flex-1 text-[8px] text-green-600 font-black uppercase border border-green-600 bg-white py-1 rounded-md hover:bg-green-50 transition-colors"
                    >
                      ดู
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (type.key === "deliveryRunSheet") {
                          handleRunSheetClick();
                        } else {
                          setActiveCamera(type.key);
                        }
                      }}
                      className="flex-1 text-[8px] text-orange-600 font-black uppercase border border-orange-600 bg-white py-1 rounded-md hover:bg-orange-50 transition-colors"
                    >
                      ใหม่
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeliveryPhotos({
                          ...deliveryPhotos,
                          [type.key]: null,
                        });
                      }}
                      className="px-2 text-[8px] text-orange-600 font-black uppercase border border-orange-600 bg-white py-1 rounded-md hover:bg-orange-50 transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
