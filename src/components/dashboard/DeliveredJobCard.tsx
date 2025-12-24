"use client";

import { Hash, CheckCircle, AlertTriangle, X, Clock } from "lucide-react";
import { DeliveredJob, JobStatus } from "@/types";

interface DeliveredJobCardProps {
  job: DeliveredJob;
  index: number;
  onClick?: () => void;
}

const getStatusConfig = (status: JobStatus) => {
  switch (status) {
    case "success":
      return {
        label: "สำเร็จ",
        icon: CheckCircle,
        bgColor: "bg-karabao/10",
        textColor: "text-karabao",
        iconColor: "text-karabao",
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

export const DeliveredJobCard = ({
  job,
  index,
  onClick,
}: DeliveredJobCardProps) => {
  const statusConfig = getStatusConfig(job.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      key={`${job.id}-${index}`}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${
        onClick
          ? "cursor-pointer hover:shadow-md active:scale-[0.98] transition-all"
          : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
              job.type === "LH"
                ? "bg-orange-100 text-orange-700"
                : "bg-karabao/10 text-karabao"
            }`}
          >
            {job.type}
          </span>
          <span
            className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.textColor}`}
          >
            <StatusIcon size={12} className={statusConfig.iconColor} />
            {statusConfig.label}
          </span>
          <span className="text-gray-400 text-[10px] font-mono">{job.id}</span>
        </div>
        <span className="text-[9px] text-gray-400 font-bold">{job.date}</span>
      </div>

      <h3 className="font-bold text-gray-800 text-lg mb-4">{job.route}</h3>

      <div className="space-y-3 border-t pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-blue-500" />
            <span className="text-xs font-black text-gray-600 uppercase">
              Run Sheet:
            </span>
          </div>
          <span className="text-sm font-black text-blue-600">
            {job.runSheet}
          </span>
        </div>
      </div>
    </div>
  );
};
