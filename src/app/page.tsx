"use client";

import { useState } from "react";
import {
  Truck,
  MapPin,
  Navigation,
  CheckCircle,
  FileText,
  PackageCheck,
  Fuel,
  RefreshCw,
  LocateFixed,
} from "lucide-react";

// Components
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { ScannerOverlay } from "@/components/scanner/ScannerOverlay";
import { CheckInCapture } from "@/components/workflow/CheckInCapture";
import { PickupPhotoUpload } from "@/components/workflow/PickupPhotoUpload";
import { DepartureStatus } from "@/components/workflow/DepartureStatus";
import { ArrivalStatus } from "@/components/workflow/ArrivalStatus";
import { DeliveryPhotoUpload } from "@/components/workflow/DeliveryPhotoUpload";
import { JobCard } from "@/components/jobs/JobCard";
import { DeliveredJobCard } from "@/components/dashboard/DeliveredJobCard";

// Types
import {
  Job,
  DeliveredJob,
  Timestamp,
  PickupPhotos,
  DeliveryPhotos,
} from "@/types";

// Utils
import { createTimestamp } from "@/utils/dateTime";
import { startScanning } from "@/utils/scanning";
import { searchAddress } from "@/utils/geoapify";
import { getStoredCoordinate, setCoordinate } from "@/utils/coordinates";
import { GeoapifySearchResult } from "@/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [step, setStep] = useState(0);

  // Timestamps
  const [confirmedCheckInTime, setConfirmedCheckInTime] =
    useState<Timestamp | null>(null);
  const [confirmedPickupTime, setConfirmedPickupTime] =
    useState<Timestamp | null>(null);
  const [confirmedDepartureTime, setConfirmedDepartureTime] =
    useState<Timestamp | null>(null);
  const [confirmedArrivalTime, setConfirmedArrivalTime] =
    useState<Timestamp | null>(null);
  const [confirmedDeliveryTime, setConfirmedDeliveryTime] =
    useState<Timestamp | null>(null);

  // States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isStartingJob, setIsStartingJob] = useState(false);
  const [startingJobId, setStartingJobId] = useState<string | null>(null);
  const [currentAddress, setCurrentAddress] =
    useState<GeoapifySearchResult | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null);
  const [runSheetNumber, setRunSheetNumber] = useState("");
  const [pickupPhotos, setPickupPhotos] = useState<PickupPhotos>({
    beforeClose: null,
    seal: null,
    closedWithSeal: null,
    runSheet: null,
  });
  const [deliveryPhotos, setDeliveryPhotos] = useState<DeliveryPhotos>({
    beforeOpen: null,
    breakSeal: null,
    emptyContainer: null,
    deliveryRunSheet: null,
  });

  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "JOB-2025-001",
      type: "LH",
      route: "กรุงเทพฯ - ชลบุรี",
      pickup: "คลังสินค้า A (กทม.)",
      status: "assigned",
      scheduledTime: "08:00 น.",
    },
    {
      id: "JOB-2025-002",
      type: "FM",
      route: "โรงงานลูกค้า - กทม.",
      pickup: "โรงงานลูกค้า XY",
      status: "pending",
      scheduledTime: "10:30 น.",
    },
  ]);

  const [deliveredJobs, setDeliveredJobs] = useState<DeliveredJob[]>([]);

  const handleStartScanning = () => {
    startScanning(setScanProgress, setIsScanning, setRunSheetNumber);
  };

  const handleStartJob = async (job: Job) => {
    setIsStartingJob(true);
    setStartingJobId(job.id);

    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🚀 เริ่มงาน:", job.id);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // ตรวจสอบว่ามี coordinate หรือไม่ ถ้าไม่มีให้ดึงพิกัดก่อน
      let coordinate = getStoredCoordinate();

      if (!coordinate) {
        console.log("📍 กำลังดึงพิกัดปัจจุบัน...");
        coordinate = await new Promise<import("@/types").Coordinate | null>(
          (resolve) => {
            if (typeof window === "undefined" || !navigator.geolocation) {
              console.warn("⚠️ Browser ไม่รองรับ geolocation");
              resolve(null);
              return;
            }

            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const coord: import("@/types").Coordinate = {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy: pos.coords.accuracy ?? undefined,
                  timestamp: Date.now(),
                };
                setCoordinate(coord);
                console.log("✅ ดึงพิกัดสำเร็จ:", coord);
                resolve(coord);
              },
              (err) => {
                console.warn("⚠️ ไม่สามารถดึงพิกัดได้:", err.message);
                resolve(null);
              },
              {
                enableHighAccuracy: false,
                timeout: 20000,
                maximumAge: 60000,
              }
            );
          }
        );
      }

      // เรียก geoapify API เพื่อดึงที่อยู่และแสดงทันที
      if (coordinate) {
        console.log("🌐 กำลังดึงที่อยู่จาก Geoapify API...");
        setIsLoadingAddress(true);

        try {
          const addressResult = await searchAddress({ lang: "th" });
          setCurrentAddress(addressResult);

          if (addressResult) {
            console.log("✅ ได้ที่อยู่แล้ว:", addressResult.address.formatted);
          } else {
            console.warn("⚠️ ไม่สามารถดึงที่อยู่ได้");
          }
        } catch (error) {
          console.error("❌ เกิดข้อผิดพลาดในการดึงที่อยู่:", error);
          setCurrentAddress(null);
        } finally {
          setIsLoadingAddress(false);
        }
      } else {
        console.warn("⚠️ ไม่มีพิกัด ไม่สามารถดึงที่อยู่ได้");
        setCurrentAddress(null);
      }

      // เริ่มงานหลังจากดึงข้อมูลเสร็จแล้ว
      setCurrentJob(job);
      setStep(0);
      setActiveTab("active-job");
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการเริ่มงาน:", error);
      // ยังคงเริ่มงานต่อแม้จะเกิด error
      setCurrentJob(job);
      setStep(0);
      setActiveTab("active-job");
    } finally {
      setIsStartingJob(false);
      setStartingJobId(null);
    }
  };

  const handleTestGeoapifySearch = async () => {
    setIsLoadingAddress(true);

    try {
      // ตรวจสอบว่ามี coordinate หรือไม่ ถ้าไม่มีให้ดึงพิกัดก่อน
      let coordinate = getStoredCoordinate();

      if (!coordinate) {
        console.log("📍 กำลังดึงพิกัดปัจจุบัน...");
        coordinate = await new Promise<import("@/types").Coordinate | null>(
          (resolve) => {
            if (typeof window === "undefined" || !navigator.geolocation) {
              console.warn("⚠️ Browser ไม่รองรับ geolocation");
              resolve(null);
              return;
            }

            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const coord: import("@/types").Coordinate = {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy: pos.coords.accuracy ?? undefined,
                  timestamp: Date.now(),
                };
                setCoordinate(coord);
                console.log("✅ ดึงพิกัดสำเร็จ:", coord);
                resolve(coord);
              },
              (err) => {
                console.warn("⚠️ ไม่สามารถดึงพิกัดได้:", err.message);
                resolve(null);
              },
              {
                enableHighAccuracy: false,
                timeout: 20000,
                maximumAge: 60000,
              }
            );
          }
        );
      }

      if (!coordinate) {
        console.warn(
          "⚠️ ไม่สามารถดึงพิกัดได้ กรุณาตรวจสอบการตั้งค่า geolocation"
        );
        setCurrentAddress(null);
        setIsLoadingAddress(false);
        return;
      }

      // เรียก searchAddress หลังจากมี coordinate แล้ว
      const result = await searchAddress({ lang: "th" });
      setCurrentAddress(result);

      if (result) {
        console.log(`✅ พบที่อยู่: ${result.address.formatted}`);
      } else {
        console.log("⚠️ ไม่พบผลลัพธ์");
      }
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error);
      setCurrentAddress(null);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const nextStep = async () => {
    const timestamp = createTimestamp();

    if (step === 0) setConfirmedCheckInTime(timestamp);
    if (step === 1) setConfirmedPickupTime(timestamp);
    if (step === 2) setConfirmedDepartureTime(timestamp);
    if (step === 3) setConfirmedArrivalTime(timestamp);
    if (step === 4) setConfirmedDeliveryTime(timestamp);

    // Re-render สถานที่ปัจจุบันใหม่ทุกครั้งเมื่อกดปุ่มยืนยัน
    await handleTestGeoapifySearch();

    if (step < 4) {
      setStep(step + 1);
    } else {
      if (!currentJob) return;

      const finalDeliveryTime = step === 4 ? timestamp : confirmedDeliveryTime;
      if (confirmedPickupTime && finalDeliveryTime && runSheetNumber) {
        const deliveryRecord: DeliveredJob = {
          id: currentJob.id,
          runSheet: runSheetNumber,
          pickupTime: `${confirmedPickupTime.date} ${confirmedPickupTime.time}`,
          deliveryTime: `${finalDeliveryTime.date} ${finalDeliveryTime.time}`,
          route: currentJob.route,
          type: currentJob.type,
          date: finalDeliveryTime.date,
        };
        setDeliveredJobs((prev) => [deliveryRecord, ...prev]);
      }

      const updatedJobs = jobs.map((j) =>
        j.id === currentJob.id ? { ...j, status: "delivered" as const } : j
      );
      setJobs(updatedJobs);
      setCurrentJob(null);
      setStep(0);
      setCheckInPhoto(null);
      setRunSheetNumber("");
      setPickupPhotos({
        beforeClose: null,
        seal: null,
        closedWithSeal: null,
        runSheet: null,
      });
      setDeliveryPhotos({
        beforeOpen: null,
        breakSeal: null,
        emptyContainer: null,
        deliveryRunSheet: null,
      });
      setConfirmedCheckInTime(null);
      setConfirmedPickupTime(null);
      setConfirmedDepartureTime(null);
      setConfirmedArrivalTime(null);
      setConfirmedDeliveryTime(null);
      setActiveTab("jobs");
    }
  };

  const steps = [
    "บันทึก Check-in",
    "บันทึกรับสินค้า",
    "ออกเดินทาง",
    "ถึงจุดส่งของ",
    "จัดส่งสำเร็จ (POD)",
  ];

  const getDisplayLabel = (index: number): string => {
    const stepLabels: Record<number, string> = {
      0: `Check-in ยืนยันเข้ารับงานแล้ว @ ${confirmedCheckInTime?.date} ${confirmedCheckInTime?.time}`,
      1: `บันทึกรับสินค้าสำเร็จ [RS: ${runSheetNumber}] @ ${confirmedPickupTime?.date} ${confirmedPickupTime?.time}`,
      2: `ออกเดินทางเมื่อ @ ${confirmedDepartureTime?.date} ${confirmedDepartureTime?.time}`,
      3: `ถึงจุดส่งของเมื่อ @ ${confirmedArrivalTime?.date} ${confirmedArrivalTime?.time}`,
      4: `จัดส่งสินค้าสำเร็จ (POD) @ ${confirmedDeliveryTime?.date} ${confirmedDeliveryTime?.time}`,
    };

    if (index < step && stepLabels[index]) {
      return stepLabels[index];
    }
    return steps[index];
  };

  const stepIcons = [
    <Truck size={20} key="truck" />,
    <FileText size={20} key="file" />,
    <Navigation size={20} key="nav" />,
    <MapPin size={20} key="pin" />,
    <PackageCheck size={20} key="package" />,
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans max-w-md mx-auto border-x shadow-2xl relative overflow-x-hidden select-none">
      <Header />

      <main className="min-h-screen pb-40">
        {activeTab === "jobs" && (
          <div className="p-4 animate-fadeIn">
            <h2 className="text-2xl font-black text-gray-800 mb-5 tracking-tight">
              งานที่มอบหมาย
            </h2>
            {jobs
              .filter((j) => j.status !== "delivered")
              .map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onStartJob={handleStartJob}
                  isStarting={isStartingJob && startingJobId === job.id}
                />
              ))}
          </div>
        )}

        {activeTab === "active-job" && (
          <div className="p-4 space-y-6 animate-fadeIn">
            {isScanning && (
              <ScannerOverlay
                scanProgress={scanProgress}
                setIsScanning={setIsScanning}
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
                  onClick={handleTestGeoapifySearch}
                  disabled={isLoadingAddress}
                  className={`p-2 rounded-lg transition-all ${
                    isLoadingAddress
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-green-600 hover:text-green-700 hover:bg-green-50 active:scale-95"
                  }`}
                >
                  <RefreshCw
                    size={16}
                    className={isLoadingAddress ? "animate-spin" : ""}
                  />
                </button>
              </div>

              {isLoadingAddress ? (
                <div className="text-xs text-gray-500 text-center py-2">
                  กำลังโหลด...
                </div>
              ) : currentAddress ? (
                <div className="space-y-2">
                  <div className="text-xs font-black text-gray-800">
                    {currentAddress.address.address_line1 &&
                    currentAddress.address.address_line2
                      ? `${currentAddress.address.address_line1}, ${currentAddress.address.address_line2}`
                      : currentAddress.address.formatted ||
                        "ไม่พบข้อมูลที่อยู่"}
                  </div>
                  {currentAddress.address.latitude &&
                    currentAddress.address.longitude && (
                      <div className="text-[10px] font-mono text-gray-500 border-t pt-2 mt-2">
                        📍 {currentAddress.address.latitude.toFixed(6)},{" "}
                        {currentAddress.address.longitude.toFixed(6)}
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 text-center py-2">
                  กดปุ่ม refresh เพื่อดึงข้อมูล
                </div>
              )}
            </div>

            <div className="relative pl-2">
              <div className="absolute left-7 top-0 bottom-0 w-1 bg-gray-100 rounded-full"></div>
              <div className="space-y-10 relative">
                {steps.map((s, i) => {
                  const displayLabel = getDisplayLabel(i);

                  return (
                    <div
                      key={i}
                      className={`flex flex-col gap-4 transition-all duration-300 ${
                        i > step
                          ? "opacity-30 scale-95 origin-left"
                          : "opacity-100"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`z-10 w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                            i < step
                              ? "bg-green-500 text-white"
                              : i === step
                              ? "bg-blue-600 text-white"
                              : "bg-white border-2 border-gray-100 text-gray-300"
                          }`}
                        >
                          {i < step ? <CheckCircle size={20} /> : stepIcons[i]}
                        </div>
                        <div className="flex-1 pt-1">
                          <p
                            className={`font-black text-sm uppercase tracking-tight ${
                              i < step
                                ? "text-green-600"
                                : i === step
                                ? "text-blue-700"
                                : "text-gray-600"
                            }`}
                          >
                            {displayLabel}
                          </p>
                          {i === step && (
                            <div className="mt-1 text-[9px] text-blue-500 font-black uppercase animate-pulse tracking-widest">
                              In Progress...
                            </div>
                          )}
                        </div>
                      </div>

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
                          startScanning={handleStartScanning}
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
                      {i === 3 && (step === 3 || confirmedArrivalTime) && (
                        <ArrivalStatus
                          confirmedTime={confirmedArrivalTime}
                          currentAddress={currentAddress}
                        />
                      )}
                      {i === 4 && (step === 4 || confirmedDeliveryTime) && (
                        <DeliveryPhotoUpload
                          deliveryPhotos={deliveryPhotos}
                          setDeliveryPhotos={setDeliveryPhotos}
                          runSheetNumber={runSheetNumber}
                          confirmedTime={confirmedDeliveryTime}
                          currentAddress={currentAddress}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="fixed bottom-24 left-4 right-4 z-40 bg-white/80 backdrop-blur-sm p-2 rounded-2xl">
              <button
                onClick={nextStep}
                disabled={
                  (step === 0 && !checkInPhoto) ||
                  (step === 1 && (!pickupPhotos.runSheet || !runSheetNumber)) ||
                  (step === 4 && Object.values(deliveryPhotos).some((v) => !v))
                }
                className={`w-full text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 ${
                  (step === 0 && !checkInPhoto) ||
                  (step === 1 && (!pickupPhotos.runSheet || !runSheetNumber)) ||
                  (step === 4 && Object.values(deliveryPhotos).some((v) => !v))
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
                  ? "ยืนยันถึงจุดส่งของ"
                  : step === 4
                  ? confirmedDeliveryTime
                    ? "ปิดงานเสร็จสมบูรณ์"
                    : "ยืนยันปิดงานและส่งข้อมูล"
                  : "ถัดไป"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="min-h-screen animate-fadeIn p-4 space-y-6 pb-40 text-center">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
              <Fuel size={48} className="text-gray-300" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                ส่วนบันทึกค่าน้ำมันและค่าซ่อมบำรุง
              </p>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="p-4 space-y-6 animate-fadeIn pb-40">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              สรุปผลงาน
            </h2>

            {deliveredJobs.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
                <PackageCheck size={48} className="text-gray-300" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                  ยังไม่มีรายการจัดส่ง
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveredJobs.map((job, index) => (
                  <DeliveredJobCard
                    key={`${job.id}-${index}`}
                    job={job}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
