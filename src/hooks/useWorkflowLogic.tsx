"use client";

import React, { useCallback } from "react";
import { createTimestamp } from "@/utils/dateTime";
import { INCIDENT_OPTIONS } from "@/constants/incidents";
import { Job, DeliveredJob, Timestamp, GeoapifySearchResult } from "@/types";
import {
  Truck,
  FileText,
  Navigation,
  AlertTriangle,
  MapPin,
  PackageCheck,
} from "lucide-react";

interface UseWorkflowLogicProps {
  step: number;
  setStep: (step: number) => void;
  isDelayed: boolean;
  incidentType: string;
  incidentOtherDescription: string;
  confirmedCheckInTime: Timestamp | null;
  confirmedPickupTime: Timestamp | null;
  confirmedDepartureTime: Timestamp | null;
  confirmedArrivalTime: Timestamp | null;
  confirmedDeliveryTime: Timestamp | null;
  confirmedIncidentTime: Timestamp | null;
  runSheetNumber: string;
  currentAddress: GeoapifySearchResult | null;
  currentJob: Job | null;
  onCompleteJob: (record: DeliveredJob) => void;
  onResetWorkflow: () => void;
  incidentAddress: GeoapifySearchResult | null;
  setIncidentAddress: (address: GeoapifySearchResult | null) => void;
  setConfirmedIncidentTime: (time: Timestamp | null) => void;
  setConfirmedArrivalTime: (time: Timestamp | null) => void;
  setConfirmedDeliveryTime: (time: Timestamp | null) => void;
  onRefreshLocation: () => Promise<void>;
}

export const useWorkflowLogic = ({
  step,
  setStep,
  isDelayed,
  incidentType,
  incidentOtherDescription,
  confirmedCheckInTime,
  confirmedPickupTime,
  confirmedDepartureTime,
  confirmedArrivalTime,
  confirmedDeliveryTime,
  confirmedIncidentTime,
  runSheetNumber,
  currentAddress,
  currentJob,
  onCompleteJob,
  onResetWorkflow,
  incidentAddress,
  setIncidentAddress,
  setConfirmedIncidentTime,
  setConfirmedArrivalTime,
  setConfirmedDeliveryTime,
  onRefreshLocation,
}: UseWorkflowLogicProps) => {
  const getSteps = useCallback(() => {
    const baseSteps = ["บันทึก Check-in", "บันทึกรับสินค้า", "ออกเดินทาง"];
    if (isDelayed) {
      return [
        ...baseSteps,
        "เลือกเหตุการณ์ระหว่างเดินทาง",
        "บันทึกภาพเหตุการณ์ระหว่างเดินทาง",
        "ถึงจุดส่งของ",
        "จัดส่งสำเร็จ (POD)",
      ];
    }
    return [
      ...baseSteps,
      "เลือกเหตุการณ์ระหว่างเดินทาง",
      "ถึงจุดส่งของ",
      "จัดส่งสำเร็จ (POD)",
    ];
  }, [isDelayed]);

  const getDisplayLabel = useCallback(
    (index: number): string => {
      const steps = getSteps();
      const stepLabels: Record<number, string> = {
        0: `Check-in ยืนยันเข้ารับงานแล้ว @ ${confirmedCheckInTime?.date} ${confirmedCheckInTime?.time}`,
        1: `บันทึกรับสินค้าสำเร็จ [RS: ${runSheetNumber}] @ ${confirmedPickupTime?.date} ${confirmedPickupTime?.time}`,
        2: `ออกเดินทางเมื่อ @ ${confirmedDepartureTime?.date} ${confirmedDepartureTime?.time}`,
        3: "เลือกเหตุการณ์ระหว่างเดินทาง",
        4: isDelayed
          ? `บันทึกภาพเหตุการณ์ระหว่างเดินทาง @ ${confirmedIncidentTime?.date} ${confirmedIncidentTime?.time}`
          : `ถึงจุดส่งของเมื่อ @ ${confirmedArrivalTime?.date} ${confirmedArrivalTime?.time}`,
        5: isDelayed
          ? `ถึงจุดส่งของเมื่อ @ ${confirmedArrivalTime?.date} ${confirmedArrivalTime?.time}`
          : `จัดส่งสินค้าสำเร็จ (POD) @ ${confirmedDeliveryTime?.date} ${confirmedDeliveryTime?.time}`,
        6: isDelayed
          ? `จัดส่งสินค้าสำเร็จ (POD) @ ${confirmedDeliveryTime?.date} ${confirmedDeliveryTime?.time}`
          : "",
      };

      if (index < step && stepLabels[index]) {
        return stepLabels[index];
      }
      return steps[index];
    },
    [
      step,
      isDelayed,
      confirmedCheckInTime,
      confirmedPickupTime,
      confirmedDepartureTime,
      confirmedArrivalTime,
      confirmedDeliveryTime,
      confirmedIncidentTime,
      runSheetNumber,
      getSteps,
    ]
  );

  const getStepIcon = useCallback(
    (index: number): React.ReactElement | null => {
      // Return null for SSR to avoid issues
      if (typeof window === "undefined") {
        return null;
      }

      try {
        if (isDelayed) {
          const icons: React.ReactElement[] = [
            React.createElement(Truck, { size: 20, key: "truck" }),
            React.createElement(FileText, { size: 20, key: "file" }),
            React.createElement(Navigation, { size: 20, key: "nav" }),
            React.createElement(AlertTriangle, { size: 20, key: "alert" }),
            React.createElement(AlertTriangle, { size: 20, key: "incident" }),
            React.createElement(MapPin, { size: 20, key: "pin" }),
            React.createElement(PackageCheck, { size: 20, key: "package" }),
          ];
          return icons[index] || null;
        } else {
          const icons: React.ReactElement[] = [
            React.createElement(Truck, { size: 20, key: "truck" }),
            React.createElement(FileText, { size: 20, key: "file" }),
            React.createElement(Navigation, { size: 20, key: "nav" }),
            React.createElement(AlertTriangle, { size: 20, key: "alert" }),
            React.createElement(MapPin, { size: 20, key: "pin" }),
            React.createElement(PackageCheck, { size: 20, key: "package" }),
          ];
          return icons[index] || null;
        }
      } catch (error) {
        // Fallback to null if there's any error
        return null;
      }
    },
    [isDelayed]
  );

  const nextStep = useCallback(async () => {
    const timestamp = createTimestamp();

    // Set timestamps based on step
    if (step === 0) {
      // Handled by CheckInCapture component
    }
    if (step === 1) {
      // Handled by PickupPhotoUpload component
    }
    if (step === 2) {
      // Handled by DepartureStatus component
    }

    // Step 3 is incident selection - no timestamp needed
    if (isDelayed) {
      if (step === 4) {
        setConfirmedIncidentTime(timestamp);
        setIncidentAddress(currentAddress);
      }
      if (step === 5) setConfirmedArrivalTime(timestamp);
      if (step === 6) setConfirmedDeliveryTime(timestamp);
    } else {
      if (step === 4) setConfirmedArrivalTime(timestamp);
      if (step === 5) setConfirmedDeliveryTime(timestamp);
    }

    // Re-render สถานที่ปัจจุบันใหม่ทุกครั้งเมื่อกดปุ่มยืนยัน
    await onRefreshLocation();

    // Step 3 is incident selection - check if delayed to determine next step
    if (step === 3) {
      if (isDelayed) {
        setStep(4);
      } else {
        setStep(4);
      }
      return;
    }

    const maxStep = isDelayed ? 6 : 5;
    if (step < maxStep) {
      setStep(step + 1);
    } else {
      if (!currentJob) return;

      const finalDeliveryTime =
        (isDelayed && step === 6) || (!isDelayed && step === 5)
          ? timestamp
          : confirmedDeliveryTime;
      if (confirmedPickupTime && finalDeliveryTime && runSheetNumber) {
        // Get incident type label, use other description if "other" is selected
        const incidentTypeLabel =
          incidentType === "other"
            ? incidentOtherDescription || "อื่นๆ"
            : INCIDENT_OPTIONS.find(
                (opt: { value: string; label: string }) =>
                  opt.value === incidentType
              )?.label || "";
        const deliveryRecord: DeliveredJob = {
          id: currentJob.id,
          runSheet: runSheetNumber,
          pickupTime: `${confirmedPickupTime.date} ${confirmedPickupTime.time}`,
          deliveryTime: `${finalDeliveryTime.date} ${finalDeliveryTime.time}`,
          route: currentJob.route,
          type: currentJob.type,
          date: finalDeliveryTime.date,
          status: isDelayed ? "delay" : "success",
          incidentType: isDelayed ? incidentTypeLabel : undefined,
          incidentTime:
            isDelayed && confirmedIncidentTime
              ? `${confirmedIncidentTime.date} ${confirmedIncidentTime.time}`
              : undefined,
          incidentAddress:
            isDelayed && incidentAddress
              ? incidentAddress.address.formatted
              : undefined,
        };
        onCompleteJob(deliveryRecord);
        onResetWorkflow();
      }
    }
  }, [
    step,
    isDelayed,
    incidentType,
    incidentOtherDescription,
    confirmedPickupTime,
    confirmedDeliveryTime,
    confirmedIncidentTime,
    runSheetNumber,
    currentAddress,
    currentJob,
    onCompleteJob,
    onResetWorkflow,
    setStep,
    setConfirmedIncidentTime,
    setConfirmedArrivalTime,
    setConfirmedDeliveryTime,
    setIncidentAddress,
    onRefreshLocation,
  ]);

  return {
    getSteps,
    getDisplayLabel,
    getStepIcon,
    nextStep,
  };
};
