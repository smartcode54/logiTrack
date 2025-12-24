"use client";

import { MapPin } from "lucide-react";
import { Job } from "@/types";

interface JobCardProps {
  job: Job;
  onStartJob: (job: Job) => void;
  isStarting?: boolean;
  disabled?: boolean;
}

export const JobCard = ({
  job,
  onStartJob,
  isStarting = false,
  disabled = false,
}: JobCardProps) => {
  const isButtonDisabled = disabled || isStarting;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 p-5">
      <div className="flex justify-between items-start mb-4">
        <span
          className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
            job.type === "LH"
              ? "bg-orange-100 text-orange-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {job.type}
        </span>
        <span className="text-gray-400 text-[10px] font-mono">{job.id}</span>
      </div>
      <h3 className="font-bold text-gray-800 text-xl mb-3">{job.route}</h3>
      <div className="space-y-2 mb-5">
        <p className="text-xs text-gray-500 flex items-center gap-2 font-bold">
          <MapPin size={14} className="text-red-500" /> {job.pickup}
        </p>
      </div>
      <button
        onClick={() => onStartJob(job)}
        disabled={isButtonDisabled}
        className={`w-full text-white font-black py-4 rounded-xl shadow-lg border-b-4 transition-all uppercase tracking-wide flex items-center justify-center gap-2 ${
          isButtonDisabled
            ? "bg-gray-400 border-gray-500 cursor-not-allowed opacity-70"
            : "bg-blue-600 border-blue-800 active:translate-y-1 hover:bg-blue-700"
        }`}
      >
        {isStarting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            กำลังโหลด...
          </>
        ) : disabled ? (
          "ไม่สามารถเริ่มงานได้"
        ) : (
          "รับแผนและเริ่มงาน"
        )}
      </button>
    </div>
  );
};

