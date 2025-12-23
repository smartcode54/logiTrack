"use client";

import { useState } from "react";
import { FileText, Camera, CheckCircle, Hash, Scan } from "lucide-react";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { ImageViewer } from "@/components/common/ImageViewer";
import { createTimestamp } from "@/utils/dateTime";
import { PickupPhotos, Timestamp, GeoapifySearchResult } from "@/types";

interface PickupPhotoUploadProps {
  pickupPhotos: PickupPhotos;
  setPickupPhotos: (val: PickupPhotos) => void;
  runSheetNumber: string;
  setRunSheetNumber: (val: string) => void;
  startScanning: () => void;
  confirmedTime: Timestamp | null;
  currentAddress?: GeoapifySearchResult | null;
}

export const PickupPhotoUpload = ({
  pickupPhotos,
  setPickupPhotos,
  runSheetNumber,
  setRunSheetNumber,
  startScanning,
  confirmedTime,
  currentAddress,
}: PickupPhotoUploadProps) => {
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const photoTypes = [
    { key: "beforeClose", label: "ก่อนปิดตู้" },
    { key: "seal", label: "Seal" },
    { key: "closedWithSeal", label: "ปิดตู้ + Seal" },
    { key: "runSheet", label: "Run Sheet (รูป)" },
  ];

  if (confirmedTime) {
    const allPhotos = photoTypes
      .map((type) => pickupPhotos[type.key as keyof PickupPhotos])
      .filter((photo): photo is string => photo !== null);

    const capturedPhotoTypes = photoTypes
      .filter((type) => pickupPhotos[type.key as keyof PickupPhotos] !== null)
      .map((type) => type.label);

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
            alt="Pickup photo"
          />
        )}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <FileText size={18} className="text-blue-600" /> ข้อมูลการรับสินค้า
            (4 ภาพ)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {photoTypes.map((type) => {
              const photo = pickupPhotos[type.key as keyof PickupPhotos];
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
                {`บันทึกรับสินค้าสำเร็จ: ${capturedPhotoTypes.join(", ")}`}
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
            setPickupPhotos({
              ...pickupPhotos,
              [activeCamera]: imageData,
            });
            setActiveCamera(null);
          }}
          onClose={() => setActiveCamera(null)}
          label={photoTypes.find((t) => t.key === activeCamera)?.label || ""}
          currentAddress={currentAddress}
          timestamp={createTimestamp()}
          statusLabel={`บันทึกรับสินค้า [RS: ${runSheetNumber}]`}
        />
      )}
      {viewingImage !== null &&
        (() => {
          const allPhotos = photoTypes
            .map((type) => pickupPhotos[type.key as keyof PickupPhotos])
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
              alt="Pickup photo"
            />
          );
        })()}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <FileText size={18} className="text-blue-600" /> ข้อมูลการรับสินค้า (4
          ภาพ)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {photoTypes.map((type) => {
            const hasPhoto =
              pickupPhotos[type.key as keyof PickupPhotos] !== null;

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
                {pickupPhotos[type.key as keyof PickupPhotos] ? (
                  <>
                    <img
                      src={pickupPhotos[type.key as keyof PickupPhotos]!}
                      alt={type.label}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                    <div
                      className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingImage(
                          pickupPhotos[type.key as keyof PickupPhotos]!
                        );
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
        <div
          className={`space-y-2 pt-2 transition-all duration-300 ${
            pickupPhotos.runSheet
              ? "opacity-100"
              : "opacity-30 pointer-events-none"
          }`}
        >
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <Hash size={12} className="text-blue-500" /> หมายเลข Run Sheet
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="แสกนหรือกรอกรหัส..."
              value={runSheetNumber}
              onChange={(e) => setRunSheetNumber(e.target.value)}
              className="w-full p-4 pr-14 bg-gray-50 border-2 border-gray-100 rounded-xl font-black text-blue-600 placeholder:text-gray-300 focus:border-blue-500 focus:bg-white transition-all outline-none"
            />
            <button
              onClick={startScanning}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 text-white rounded-lg flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-blue-100"
            >
              <Scan size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
