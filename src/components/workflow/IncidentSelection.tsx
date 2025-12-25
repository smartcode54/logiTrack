"use client";

import { AlertTriangle, ChevronDown } from "lucide-react";

interface IncidentSelectionProps {
  isDelayed: boolean;
  setIsDelayed: (value: boolean) => void;
  incidentType: string;
  setIncidentType: (value: string) => void;
  incidentOtherDescription: string;
  setIncidentOtherDescription: (value: string) => void;
  confirmedDepartureTime: boolean;
}

const INCIDENT_OPTIONS = [
  { value: "", label: "เลือกเหตุการณ์" },
  { value: "traffic", label: "รถติด / การจราจร" },
  { value: "accident", label: "อุบัติเหตุ" },
  { value: "weather", label: "สภาพอากาศ" },
  { value: "vehicle", label: "ปัญหาเครื่องยนต์ / ยานพาหนะ" },
  { value: "road", label: "ปัญหาถนน / สภาพถนน" },
  { value: "other", label: "อื่นๆ" },
];

export const IncidentSelection = ({
  isDelayed,
  setIsDelayed,
  incidentType,
  setIncidentType,
  incidentOtherDescription,
  setIncidentOtherDescription,
  confirmedDepartureTime,
}: IncidentSelectionProps) => {
  const handleCheckboxChange = (checked: boolean) => {
    setIsDelayed(checked);
    if (!checked) {
      // Reset when unchecking
      setIncidentType("");
      setIncidentOtherDescription("");
    }
  };

  const handleIncidentChange = (value: string) => {
    setIncidentType(value);
    // Clear other description when switching away from "other"
    if (value !== "other") {
      setIncidentOtherDescription("");
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3 animate-fadeIn">
      <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
        <AlertTriangle size={18} className="text-orange-600" />
        เหตุการณ์ระหว่างเดินทาง
      </h3>
      <div className="space-y-3">
        {/* Checkbox สำหรับแจ้งเหตุการณ์ */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isDelayed}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="w-5 h-5 rounded border-2 border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer"
          />
          <span className="text-sm font-black text-gray-800">มีเหตุการณ์ระหว่างเดินทาง</span>
        </label>

        {/* Dropdown สำหรับเลือกประเภทเหตุการณ์ */}
        {isDelayed && (
          <div className="space-y-2 animate-fadeIn">
            <label className="block text-sm font-bold text-gray-700">เลือกประเภทเหตุการณ์:</label>
            <div className="relative">
              <select
                value={incidentType}
                onChange={(e) => handleIncidentChange(e.target.value)}
                className="w-full p-3 pr-10 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white text-gray-800 font-medium appearance-none cursor-pointer transition-all"
              >
                {INCIDENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Input box เมื่อเลือก "อื่นๆ" */}
            {incidentType === "other" && (
              <div className="space-y-2 animate-fadeIn">
                <label className="block text-sm font-bold text-gray-700">กรุณาระบุเหตุการณ์:</label>
                <input
                  type="text"
                  value={incidentOtherDescription}
                  onChange={(e) => setIncidentOtherDescription(e.target.value)}
                  placeholder="ระบุรายละเอียดเหตุการณ์..."
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white text-gray-800 font-medium transition-all"
                />
              </div>
            )}

            <p className="text-[10px] text-gray-500">กรุณาบันทึกภาพเหตุการณ์ 4 ภาพ หลังจากเลือกเหตุการณ์</p>
          </div>
        )}
      </div>
    </div>
  );
};
