"use client";

// 1. เพิ่ม Icon ให้ครบเพื่อแก้ปัญหา 'Truck' refers to a value but is used as a type
import { AlertTriangle, CheckCircle, FileText, LocateFixed, MapPin, Navigation, RefreshCw, Truck } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";

import { ScannerOverlay } from "@/components/scanner/ScannerOverlay";
import { ArrivalStatus } from "@/components/workflow/ArrivalStatus";
import { CheckInCapture } from "@/components/workflow/CheckInCapture";
import { DeliveryPhotoUpload } from "@/components/workflow/DeliveryPhotoUpload";
import { DepartureStatus } from "@/components/workflow/DepartureStatus";
import { IncidentPhotoUpload } from "@/components/workflow/IncidentPhotoUpload";
import { IncidentSelection } from "@/components/workflow/IncidentSelection";
import { PickupPhotoUpload } from "@/components/workflow/PickupPhotoUpload";

import type { CheckInPhotos, DeliveryPhotos, GeoapifySearchResult, IncidentPhotos, PickupPhotos, Timestamp } from "@/types";

interface ActiveJobPageProps {
  jobId?: string;
  isScanning: boolean;
  setIsScanning: (value: boolean) => void;
  setRunSheetNumber: (value: string) => void;
  currentAddress: GeoapifySearchResult | null;
  isLoadingAddress: boolean;
  locationSyncedTime: Timestamp | null;
  onRefreshLocation: () => void;
  step: number;
  checkInPhotos: CheckInPhotos;
  setCheckInPhotos: (value: CheckInPhotos) => void;
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
  incidentAddress?: GeoapifySearchResult | null;
  deliveryPhotos: DeliveryPhotos;
  setDeliveryPhotos: (value: DeliveryPhotos) => void;
  onNextStep: () => void;
  getSteps: () => string[];
  getDisplayLabel: (index: number) => string;
  getStepIcon: (index: number) => React.ReactElement | null;
  onStartScanning?: () => void;
}

export const ActiveJobPage = (props: ActiveJobPageProps) => {
  // Destructure with defaults to prevent "is not a function" errors
  const {
    jobId,
    isScanning,
    setIsScanning,
    setRunSheetNumber,
    currentAddress,
    isLoadingAddress,
    locationSyncedTime,
    onRefreshLocation,
    step,
    checkInPhotos,
    setCheckInPhotos,
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
    onNextStep = () => {},
    getSteps = () => [],
    getDisplayLabel = (i: number) => "",
    getStepIcon = (i: number) => null,
    onStartScanning,
  } = props;

  // 2. ป้องกัน Prerender Error: เรียกใช้ฟังก์ชันเฉพาะเมื่อ Component Mount แล้ว
  const [mounted, setMounted] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    if (typeof getSteps === "function") {
      setSteps(getSteps());
    }
  }, [getSteps]);

  // ถ้ายังไม่ Mount (ช่วง SSR) ให้คืนค่าว่างเพื่อไม่ให้พังจากฟังก์ชันที่ยังไม่มา
  if (!mounted) return <div className="p-4 italic text-gray-400">Loading Workflow...</div>;

  return (
    <div className="p-4 space-y-6 animate-fadeIn">
      {isScanning && <ScannerOverlay setIsScanning={setIsScanning} setRunSheetNumber={setRunSheetNumber} />}

      {/* Location Section */}
      <div className="bg-white border-l-4 border-karabao p-4 rounded-r-xl shadow-sm space-y-3">
        {jobId && <h1 className="text-2xl font-black text-karabao uppercase tracking-wider mb-2 text-right">#{jobId}</h1>}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-black text-karabao uppercase">
            <LocateFixed size={16} />
            สถานที่ปัจจุบัน
          </div>
          <button
            onClick={onRefreshLocation}
            disabled={isLoadingAddress}
            className={`p-2 rounded-lg transition-all ${isLoadingAddress ? "text-gray-400" : "text-karabao hover:bg-karabao/10"}`}
          >
            <RefreshCw size={18} className={isLoadingAddress ? "animate-spin" : ""} />
          </button>
        </div>
        {currentAddress?.address && (
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-800">{currentAddress.address.formatted || "ตรวจพบพิกัดแล้ว"}</p>
            {locationSyncedTime && <p className="text-xs text-gray-500">อัปเดตเมื่อ: {locationSyncedTime.time}</p>}
          </div>
        )}
      </div>

      {/* Workflow Steps */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="space-y-4">
          {steps.map((stepLabel, i) => {
            const stepIcon = typeof getStepIcon === "function" ? getStepIcon(i) : null;

            return (
              <div key={`step-${i}`} className="relative">
                <div className="flex items-start gap-4">
                  <div
                    className={`z-10 w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                      i < step ? "bg-karabao text-white" : i === step ? "bg-green-600 text-white" : "bg-white border-2 border-gray-100 text-gray-300"
                    }`}
                  >
                    {/* 3. แก้ไขจุดที่อาจเกิด TypeError: S is not a function */}
                    {React.isValidElement(stepIcon) ? stepIcon : <Truck size={18} />}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className={`font-black text-sm uppercase ${i < step ? "text-karabao" : i === step ? "text-green-700" : "text-gray-400"}`}>
                      {typeof getDisplayLabel === "function" ? getDisplayLabel(i) : stepLabel}
                    </p>
                  </div>
                </div>

                {/* Vertical Line */}
                {i < steps.length - 1 && <div className={`absolute left-5 top-10 w-0.5 h-6 ${i < step ? "bg-karabao" : "bg-gray-200"}`} />}

                {/* Step Components */}
                <div className="mt-2">
                  {i === 0 && (step === 0 || confirmedCheckInTime) && (
                    <CheckInCapture
                      checkInPhotos={checkInPhotos}
                      setCheckInPhotos={setCheckInPhotos}
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
                    <DepartureStatus confirmedTime={confirmedDepartureTime} currentAddress={currentAddress} />
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
                  {isDelayed && i === 4 && (step === 4 || confirmedIncidentTime) && (
                    <IncidentPhotoUpload
                      incidentPhotos={incidentPhotos}
                      setIncidentPhotos={setIncidentPhotos}
                      confirmedTime={confirmedIncidentTime}
                      currentAddress={currentAddress}
                    />
                  )}
                  {isDelayed && i === 5 && (step === 5 || confirmedArrivalTime) && (
                    <ArrivalStatus confirmedTime={confirmedArrivalTime} currentAddress={currentAddress} />
                  )}
                  {isDelayed && i === 6 && (step === 6 || confirmedDeliveryTime) && (
                    <DeliveryPhotoUpload
                      deliveryPhotos={deliveryPhotos}
                      setDeliveryPhotos={setDeliveryPhotos}
                      runSheetNumber={runSheetNumber}
                      confirmedTime={confirmedDeliveryTime}
                      currentAddress={currentAddress}
                    />
                  )}
                  {!isDelayed && i === 4 && (step === 4 || confirmedArrivalTime) && (
                    <ArrivalStatus confirmedTime={confirmedArrivalTime} currentAddress={currentAddress} />
                  )}
                  {!isDelayed && i === 5 && (step === 5 || confirmedDeliveryTime) && (
                    <DeliveryPhotoUpload
                      deliveryPhotos={deliveryPhotos}
                      setDeliveryPhotos={setDeliveryPhotos}
                      runSheetNumber={runSheetNumber}
                      confirmedTime={confirmedDeliveryTime}
                      currentAddress={currentAddress}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-24 left-4 right-4 z-40 bg-white/80 backdrop-blur-sm p-2 rounded-2xl">
          <button
            onClick={onNextStep}
            disabled={
              (step === 0 && (!checkInPhotos?.truckAndLicense || !checkInPhotos?.customerCheckIn)) ||
              (step === 1 && (!pickupPhotos?.runSheet || !runSheetNumber)) ||
              (step === 3 && isDelayed && (!incidentType || (incidentType === "other" && !incidentOtherDescription))) ||
              (isDelayed &&
                step === 4 &&
                (!incidentPhotos?.incident1 || !incidentPhotos?.incident2 || !incidentPhotos?.incident3 || !incidentPhotos?.incident4)) ||
              (isDelayed &&
                step === 6 &&
                (!deliveryPhotos?.beforeOpen ||
                  !deliveryPhotos?.breakSeal ||
                  !deliveryPhotos?.emptyContainer ||
                  !deliveryPhotos?.deliveryRunSheet)) ||
              (!isDelayed &&
                step === 5 &&
                (!deliveryPhotos?.beforeOpen || !deliveryPhotos?.breakSeal || !deliveryPhotos?.emptyContainer || !deliveryPhotos?.deliveryRunSheet))
            }
            className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 ${
              (step === 0 && (!checkInPhotos?.truckAndLicense || !checkInPhotos?.customerCheckIn)) ||
              (step === 1 && !runSheetNumber) ||
              (step === 3 && isDelayed && (!incidentType || (incidentType === "other" && !incidentOtherDescription))) ||
              (isDelayed &&
                step === 4 &&
                (!incidentPhotos?.incident1 || !incidentPhotos?.incident2 || !incidentPhotos?.incident3 || !incidentPhotos?.incident4)) ||
              (isDelayed &&
                step === 6 &&
                (!deliveryPhotos?.beforeOpen ||
                  !deliveryPhotos?.breakSeal ||
                  !deliveryPhotos?.emptyContainer ||
                  !deliveryPhotos?.deliveryRunSheet)) ||
              (
                !isDelayed &&
                  step === 5 &&
                  (!deliveryPhotos?.beforeOpen || !deliveryPhotos?.breakSeal || !deliveryPhotos?.emptyContainer || !deliveryPhotos?.deliveryRunSheet)
              )
                ? "bg-gray-400"
                : "bg-karabao active:scale-95"
            }`}
          >
            <CheckCircle size={24} />
            ยืนยันขั้นตอนปัจจุบัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveJobPage;
