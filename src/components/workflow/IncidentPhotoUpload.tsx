"use client";

import { CameraCapture } from "@/components/camera/CameraCapture";
import { ImageViewer } from "@/components/common/ImageViewer";
import type { GeoapifySearchResult, IncidentPhotos, Timestamp } from "@/types";
import { createTimestamp } from "@/utils/dateTime";
import { AlertTriangle, Camera, CheckCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import React from "react";

interface IncidentPhotoUploadProps {
  incidentPhotos: IncidentPhotos;
  setIncidentPhotos: (val: IncidentPhotos) => void;
  confirmedTime: Timestamp | null;
  currentAddress?: GeoapifySearchResult | null;
}

export const IncidentPhotoUpload = ({ incidentPhotos, setIncidentPhotos, confirmedTime, currentAddress }: IncidentPhotoUploadProps) => {
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const photoTypes = [
    { key: "incident1", label: "เหตุการณ์ที่ 1" },
    { key: "incident2", label: "เหตุการณ์ที่ 2" },
    { key: "incident3", label: "เหตุการณ์ที่ 3" },
    { key: "incident4", label: "เหตุการณ์ที่ 4" },
  ];

  const handlePhotoClick = (typeKey: string) => {
    setActiveCamera(typeKey);
  };

  if (confirmedTime) {
    const allPhotos = photoTypes.map((type) => incidentPhotos[type.key as keyof IncidentPhotos]).filter((photo): photo is string => photo !== null);

    return (
      <>
        {viewingImage !== null && (
          <ImageViewer
            imageSrc={allPhotos.length > 1 ? allPhotos : allPhotos[0] || ""}
            initialIndex={allPhotos.length > 1 ? allPhotos.findIndex((photo) => photo === viewingImage) : 0}
            onClose={() => setViewingImage(null)}
            alt="Incident photo"
          />
        )}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-600" /> ภาพเหตุการณ์ระหว่างเดินทาง (4 ภาพ)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {photoTypes.map((type) => {
              const photo = incidentPhotos[type.key as keyof IncidentPhotos];
              return (
                <div
                  key={type.key}
                  className={`relative aspect-square rounded-xl border-2 border-orange-500 bg-gray-900 overflow-hidden ${
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
                      <img src={photo} alt={type.label} className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute top-1 right-1 bg-orange-500 rounded-full p-1">
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
              <span className="text-orange-400 tracking-tight uppercase text-[9px]">บันทึกภาพเหตุการณ์ระหว่างเดินทาง</span>
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
      {activeCamera && (
        <CameraCapture
          onCapture={(imageData) => {
            setIncidentPhotos({
              ...incidentPhotos,
              [activeCamera]: imageData,
            });
            setActiveCamera(null);
          }}
          onClose={() => setActiveCamera(null)}
          label={photoTypes.find((t) => t.key === activeCamera)?.label || ""}
          currentAddress={currentAddress}
          timestamp={createTimestamp()}
          statusLabel="บันทึกภาพเหตุการณ์ระหว่างเดินทาง"
        />
      )}
      {viewingImage !== null &&
        (() => {
          const allPhotos = photoTypes
            .map((type) => incidentPhotos[type.key as keyof IncidentPhotos])
            .filter((photo): photo is string => photo !== null);

          return (
            <ImageViewer
              imageSrc={allPhotos.length > 1 ? allPhotos : allPhotos[0] || ""}
              initialIndex={allPhotos.length > 1 ? allPhotos.findIndex((photo) => photo === viewingImage) : 0}
              onClose={() => setViewingImage(null)}
              alt="Incident photo"
            />
          );
        })()}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-fadeIn">
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-600" /> ภาพเหตุการณ์ระหว่างเดินทาง (4 ภาพ)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {photoTypes.map((type) => {
            const hasPhoto = incidentPhotos[type.key as keyof IncidentPhotos] !== null;
            const photo = incidentPhotos[type.key as keyof IncidentPhotos];

            return (
              <div key={type.key} className="relative">
                <button
                  onClick={() => handlePhotoClick(type.key)}
                  className={`relative w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden aspect-square ${
                    hasPhoto ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-gray-50 text-gray-400 active:bg-gray-100"
                  }`}
                >
                  {photo ? (
                    <>
                      <img src={photo} alt={type.label} className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-orange-500 rounded-full p-1">
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
                        handlePhotoClick(type.key);
                      }}
                      className="flex-1 text-[8px] text-orange-600 font-black uppercase border border-orange-600 bg-white py-1 rounded-md hover:bg-orange-50 transition-colors"
                    >
                      ใหม่
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIncidentPhotos({
                          ...incidentPhotos,
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
