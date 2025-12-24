"use client";

import {
  CheckCircle,
  X,
  PackageCheck,
  Hash,
  Calendar,
  MapPin,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { DeliveredJob, JobStatus } from "@/types";

interface DeliverySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewSummary?: () => void;
  deliveryData: DeliveredJob | null;
  viewOnly?: boolean;
}

const getStatusConfig = (status: JobStatus) => {
  switch (status) {
    case "success":
      return {
        label: "สำเร็จ",
        icon: CheckCircle,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        iconColor: "text-green-600",
      };
    case "delay":
      return {
        label: "ล่าช้า",
        icon: AlertTriangle,
        bgColor: "bg-orange-100",
        textColor: "text-orange-700",
        iconColor: "text-orange-600",
      };
    case "cancel":
      return {
        label: "ยกเลิก",
        icon: X,
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        iconColor: "text-red-600",
      };
    case "standby":
      return {
        label: "รอ",
        icon: Clock,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700",
        iconColor: "text-yellow-600",
      };
    default:
      return {
        label: "ไม่ทราบ",
        icon: CheckCircle,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        iconColor: "text-gray-600",
      };
  }
};

export const DeliverySuccessModal = ({
  isOpen,
  onClose,
  onViewSummary,
  deliveryData,
  viewOnly = false,
}: DeliverySuccessModalProps) => {
  if (!isOpen) return null;

  const statusConfig = deliveryData
    ? getStatusConfig(deliveryData.status)
    : null;
  const StatusIcon = statusConfig?.icon || CheckCircle;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                จัดส่งสำเร็จ
              </h2>
              <p className="text-green-100 text-sm mt-1">
                งานของคุณเสร็จสมบูรณ์แล้ว
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {deliveryData && (
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <PackageCheck size={18} className="text-blue-600" />
                  <span className="text-sm font-black text-gray-800 uppercase">
                    รายละเอียดงาน
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded text-[10px] font-black uppercase ${
                    deliveryData.type === "LH"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {deliveryData.type}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-gray-500 text-xs">เส้นทาง:</span>
                    <p className="font-bold text-gray-800">
                      {deliveryData.route}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-gray-400" />
                  <div className="flex-1">
                    <span className="text-gray-500 text-xs">Run Sheet:</span>
                    <p className="font-black text-blue-600">
                      {deliveryData.runSheet}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <div className="flex-1">
                    <span className="text-gray-500 text-xs">วันที่:</span>
                    <p className="font-bold text-gray-800">
                      {deliveryData.date}
                    </p>
                  </div>
                </div>

                {statusConfig && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <StatusIcon size={16} className={statusConfig.iconColor} />
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs">สถานะ:</span>
                      <p
                        className={`font-bold text-sm ${statusConfig.textColor}`}
                      >
                        {statusConfig.label}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  <div>
                    <span className="text-gray-500 text-xs block">
                      เวลารับ:
                    </span>
                    <p className="font-bold text-gray-800 text-sm">
                      {deliveryData.pickupTime}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">
                      เวลาส่ง:
                    </span>
                    <p className="font-bold text-green-600 text-sm">
                      {deliveryData.deliveryTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* แสดงข้อมูลเหตุการณ์ถ้ามี */}
            {deliveryData.incidentType && (
              <div className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-600" />
                  <span className="text-sm font-black text-orange-800 uppercase">
                    เหตุการณ์ระหว่างเดินทาง
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={16}
                      className="text-orange-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-orange-600 text-xs">
                        ประเภทเหตุการณ์:
                      </span>
                      <p className="font-bold text-orange-800">
                        {deliveryData.incidentType}
                      </p>
                    </div>
                  </div>
                  {deliveryData.incidentTime && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-orange-500" />
                      <div className="flex-1">
                        <span className="text-orange-600 text-xs">
                          วัน เวลา:
                        </span>
                        <p className="font-bold text-orange-800">
                          {deliveryData.incidentTime}
                        </p>
                      </div>
                    </div>
                  )}
                  {deliveryData.incidentAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-orange-500 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-orange-600 text-xs">
                          สถานที่:
                        </span>
                        <p className="font-bold text-orange-800">
                          {deliveryData.incidentAddress}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-6 pt-0 space-y-3">
          {!viewOnly && onViewSummary && (
            <button
              onClick={onViewSummary}
              className="w-full bg-green-600 text-white font-black py-4 rounded-xl uppercase tracking-wider hover:bg-green-700 active:scale-95 transition-all shadow-lg"
            >
              ดูสรุปผลงาน
            </button>
          )}
          <button
            onClick={onClose}
            className={`w-full bg-gray-100 text-gray-700 font-black py-3 rounded-xl uppercase tracking-wider hover:bg-gray-200 active:scale-95 transition-all ${
              viewOnly ? "py-4" : ""
            }`}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
