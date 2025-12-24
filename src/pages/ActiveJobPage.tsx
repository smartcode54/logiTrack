"use client";

import { CheckCircle, RefreshCw, LocateFixed, MapPin } from "lucide-react";
import { ScannerOverlay } from "@/components/scanner/ScannerOverlay";
import { CheckInCapture } from "@/components/workflow/CheckInCapture";
import { PickupPhotoUpload } from "@/components/workflow/PickupPhotoUpload";
import { DepartureStatus } from "@/components/workflow/DepartureStatus";
import { ArrivalStatus } from "@/components/workflow/ArrivalStatus";
import { DeliveryPhotoUpload } from "@/components/workflow/DeliveryPhotoUpload";
import { IncidentPhotoUpload } from "@/components/workflow/IncidentPhotoUpload";
import { IncidentSelection } from "@/components/workflow/IncidentSelection";
import React from "react";
import {
  Timestamp,
  GeoapifySearchResult,
  PickupPhotos,
  DeliveryPhotos,
  IncidentPhotos,
} from "@/types";

interface ActiveJobPageProps {
  isScanning: boolean;
  setIsScanning: (value: boolean) => void;
  setRunSheetNumber: (value: string) => void;
  currentAddress: GeoapifySearchResult | null;
  isLoadingAddress: boolean;
  locationSyncedTime: Timestamp | null;
  onRefreshLocation: () => void;
  step: number;
  checkInPhoto: string | null;
  setCheckInPhoto: (value: string | null) => void;
  runSheetNumber: string;
  pickupPhotos: PickupPhotos;
  setPickupPhotos: (value: PickupPhotos) => void;
  confirmedCheckInTime: Timestamp | null;
  confirmedPickupTime: Timestamp | null;
  confirmedDepartureTime: Timestamp | null;
  confirmedArrivalTime: Timestamp | null;
  confirmedDeliveryTime: Timestamp | null;
  isDelayed: boolean;
  setIsDelayed: (value: boolean) => void;
  incidentType: string;
  setIncidentType: (value: string) => void;
  incidentOtherDescription: string;
  setIncidentOtherDescription: (value: string) => void;
  incidentPhotos: IncidentPhotos;
  setIncidentPhotos: (value: IncidentPhotos) => void;
  confirmedIncidentTime: Timestamp | null;
  incidentAddress: GeoapifySearchResult | null;
  deliveryPhotos: DeliveryPhotos;
  setDeliveryPhotos: (value: DeliveryPhotos) => void;
  onNextStep: () => void;
  getSteps: () => string[];
  getDisplayLabel: (index: number) => string;
  getStepIcon: (index: number) => React.ReactElement | undefined;
  onStartScanning?: () => void;
}

export const ActiveJobPage = ({
  isScanning,
  setIsScanning,
  setRunSheetNumber,
  currentAddress,
  isLoadingAddress,
  locationSyncedTime,
  onRefreshLocation,
  step,
  checkInPhoto,
  setCheckInPhoto,
  runSheetNumber,
  pickupPhotos,
  setPickupPhotos,
  confirmedCheckInTime,
  confirmedPickupTime,
  confirmedDepartureTime,
  confirmedArrivalTime,
  confirmedDeliveryTime,
  isDelayed,
  setIsDelayed,
  incidentType,
  setIncidentType,
  incidentOtherDescription,
  setIncidentOtherDescription,
  incidentPhotos,
  setIncidentPhotos,
  confirmedIncidentTime,
  deliveryPhotos,
  setDeliveryPhotos,
  onNextStep,
  getSteps,
  getDisplayLabel,
  getStepIcon,
  onStartScanning,
}: ActiveJobPageProps) => {
  // onStartScanning is used in PickupPhotoUpload component
  const steps = getSteps();

  return (
    <div className="p-4 space-y-6 animate-fadeIn">
      {isScanning && (
        <ScannerOverlay
          setIsScanning={setIsScanning}
          setRunSheetNumber={setRunSheetNumber}
        />
      )}

      {/* แสดงข้อมูลสถานที่ปัจจุบัน */}
      <div className="bg-white border-l-4 border-green-500 p-4 rounded-r-xl shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-black text-green-600 uppercase">
            <LocateFixed size={16} />
            สถานที่ปัจจุบัน
          </div>
          <button
            onClick={onRefreshLocation}
            disabled={isLoadingAddress}
            className={`p-2 rounded-lg transition-all ${
              isLoadingAddress
                ? "text-gray-400 cursor-not-allowed"
                : "text-green-600 hover:text-green-700 hover:bg-green-50 active:scale-95"
            }`}
          >
            <RefreshCw
              size={18}
              className={isLoadingAddress ? "animate-spin" : ""}
            />
          </button>
        </div>
        {currentAddress?.address && (
          <>
            <p className="text-sm font-bold text-gray-800 leading-relaxed">
              {currentAddress.address.address_line1 &&
              currentAddress.address.address_line2
                ? `${currentAddress.address.address_line1}, ${currentAddress.address.address_line2}`
                : currentAddress.address.formatted || "ไม่พบข้อมูลที่อยู่"}
            </p>
            {currentAddress.address.latitude &&
              currentAddress.address.longitude && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={14} className="text-red-500" />
                  <span>
                    {currentAddress.address.latitude.toFixed(6)},{" "}
                    {currentAddress.address.longitude.toFixed(6)}
                  </span>
                </div>
              )}
            {locationSyncedTime && (
              <p className="text-xs text-gray-500">
                synced: {locationSyncedTime.date} {locationSyncedTime.time}
              </p>
            )}
          </>
        )}
      </div>

      {/* Workflow Steps */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="space-y-4">
          {steps.map((stepLabel, i) => (
            <div key={i} className="relative">
              <div className="flex items-start gap-4">
                <div
                  className={`z-10 w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                    i < step
                      ? isDelayed && i === 4
                        ? "bg-orange-600 text-white"
                        : "bg-green-500 text-white"
                      : i === step
                      ? "bg-blue-600 text-white"
                      : "bg-white border-2 border-gray-100 text-gray-300"
                  }`}
                >
                  {getStepIcon(i)}
                </div>
                <div className="flex-1 pt-2">
                  <p
                    className={`font-black text-sm uppercase tracking-tight ${
                      i < step
                        ? isDelayed && i === 4
                          ? "text-orange-700"
                          : "text-green-600"
                        : i === step
                        ? "text-blue-700"
                        : "text-gray-600"
                    }`}
                  >
                    {getDisplayLabel(i)}
                  </p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`absolute left-5 top-10 w-0.5 h-6 ${
                    i < step - 1
                      ? isDelayed && i === 3
                        ? "bg-orange-500"
                        : "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              )}

              {/* Render components based on step */}
              {i === 0 && (step === 0 || confirmedCheckInTime) && (
                <CheckInCapture
                  checkInPhoto={checkInPhoto}
                  setCheckInPhoto={setCheckInPhoto}
                  confirmedTime={confirmedCheckInTime}
                  currentAddress={currentAddress}
                />
              )}
              {i === 1 && (step === 1 || confirmedPickupTime) && (
                <PickupPhotoUpload
                  pickupPhotos={pickupPhotos}
                  setPickupPhotos={setPickupPhotos}
                  runSheetNumber={runSheetNumber}
                  setRunSheetNumber={setRunSheetNumber}
                  startScanning={onStartScanning || (() => {})}
                  confirmedTime={confirmedPickupTime}
                  currentAddress={currentAddress}
                />
              )}
              {i === 2 && (step === 2 || confirmedDepartureTime) && (
                <DepartureStatus
                  confirmedTime={confirmedDepartureTime}
                  currentAddress={currentAddress}
                />
              )}
              {i === 3 && (step === 3 || confirmedDepartureTime) && (
                <IncidentSelection
                  isDelayed={isDelayed}
                  setIsDelayed={setIsDelayed}
                  incidentType={incidentType}
                  setIncidentType={setIncidentType}
                  incidentOtherDescription={incidentOtherDescription}
                  setIncidentOtherDescription={setIncidentOtherDescription}
                  confirmedDepartureTime={!!confirmedDepartureTime}
                />
              )}
              {isDelayed &&
                i === 4 &&
                (step === 4 || confirmedIncidentTime) && (
                  <IncidentPhotoUpload
                    incidentPhotos={incidentPhotos}
                    setIncidentPhotos={setIncidentPhotos}
                    confirmedTime={confirmedIncidentTime}
                    currentAddress={currentAddress}
                  />
                )}
              {((isDelayed && i === 5) || (!isDelayed && i === 4)) &&
                (step === (isDelayed ? 5 : 4) || confirmedArrivalTime) && (
                  <ArrivalStatus
                    confirmedTime={confirmedArrivalTime}
                    currentAddress={currentAddress}
                  />
                )}
              {((isDelayed && i === 6) || (!isDelayed && i === 5)) &&
                (step === (isDelayed ? 6 : 5) || confirmedDeliveryTime) && (
                  <DeliveryPhotoUpload
                    deliveryPhotos={deliveryPhotos}
                    setDeliveryPhotos={setDeliveryPhotos}
                    runSheetNumber={runSheetNumber}
                    confirmedTime={confirmedDeliveryTime}
                    currentAddress={currentAddress}
                  />
                )}
            </div>
          ))}
        </div>

        <div className="fixed bottom-24 left-4 right-4 z-40 bg-white/80 backdrop-blur-sm p-2 rounded-2xl">
          <button
            onClick={onNextStep}
            disabled={
              (step === 0 && !checkInPhoto) ||
              (step === 1 && (!pickupPhotos.runSheet || !runSheetNumber)) ||
              (isDelayed &&
                step === 4 &&
                Object.values(incidentPhotos).some((v) => !v)) ||
              ((isDelayed ? step === 6 : step === 5) &&
                Object.values(deliveryPhotos).some((v) => !v))
            }
            className={`w-full text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 ${
              (step === 0 && !checkInPhoto) ||
              (step === 1 && (!pickupPhotos.runSheet || !runSheetNumber)) ||
              (isDelayed &&
                step === 4 &&
                Object.values(incidentPhotos).some((v) => !v)) ||
              ((isDelayed ? step === 6 : step === 5) &&
                Object.values(deliveryPhotos).some((v) => !v))
                ? "bg-gray-400 border-gray-500 opacity-60"
                : "bg-green-600 border-green-800"
            }`}
          >
            <CheckCircle size={24} />
            {step === 0
              ? "ยืนยัน Check-in"
              : step === 1
              ? "ยืนยันการรับสินค้า"
              : step === 2
              ? "ยืนยันการออกเดินทาง"
              : step === 3
              ? "ถัดไป"
              : isDelayed && step === 4
              ? confirmedIncidentTime
                ? "บันทึกภาพเหตุการณ์เสร็จแล้ว"
                : "ยืนยันบันทึกภาพเหตุการณ์"
              : (isDelayed && step === 5) || (!isDelayed && step === 4)
              ? "ยืนยันถึงจุดส่งของ"
              : (isDelayed && step === 6) || (!isDelayed && step === 5)
              ? confirmedDeliveryTime
                ? "ปิดงานเสร็จสมบูรณ์"
                : "ยืนยันปิดงานและส่งข้อมูล"
              : "ถัดไป"}
          </button>
        </div>
      </div>
    </div>
  );
};
