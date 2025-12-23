"use client";

import { Hash } from "lucide-react";
import { DeliveredJob } from "@/types";

interface DeliveredJobCardProps {
  job: DeliveredJob;
  index: number;
}

export const DeliveredJobCard = ({ job, index }: DeliveredJobCardProps) => {
  return (
    <div
      key={`${job.id}-${index}`}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
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
