"use client";

import { AlertTriangle } from "lucide-react";

interface IncidentSelectionProps {
  isDelayed: boolean;
  setIsDelayed: (value: boolean) => void;
  confirmedDepartureTime: boolean;
}

export const IncidentSelection = ({
  isDelayed,
  setIsDelayed,
  confirmedDepartureTime,
}: IncidentSelectionProps) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3 animate-fadeIn">
      <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
        <AlertTriangle size={18} className="text-orange-600" />
        เหตุการณ์ระหว่างเดินทาง
      </h3>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isDelayed}
          onChange={(e) => setIsDelayed(e.target.checked)}
          className="w-5 h-5 rounded border-2 border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer"
        />
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm font-black text-gray-800">
            มีเหตุการณ์ระหว่างเดินทาง (บันทึกภาพ 4 ภาพ)
          </span>
        </div>
      </label>
      {isDelayed && (
        <p className="text-[10px] text-gray-500 pl-8">
          หากมีเหตุการณ์ระหว่างเดินทาง กรุณาเลือกเพื่อบันทึกภาพเหตุการณ์
        </p>
      )}
    </div>
  );
};

