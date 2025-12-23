"use client";

import { memo } from "react";
import {
  ClipboardList,
  Navigation,
  Fuel,
  LayoutDashboard,
} from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav = memo(({ activeTab, setActiveTab }: BottomNavProps) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 pb-6 z-50 shadow-lg">
    {[
      { id: "jobs", icon: ClipboardList, label: "งานที่ได้รับ" },
      { id: "active-job", icon: Navigation, label: "กำลังขับ" },
      { id: "expenses", icon: Fuel, label: "ค่าน้ำมัน/ซ่อม" },
      { id: "dashboard", icon: LayoutDashboard, label: "สรุปผล" },
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`flex flex-col items-center transition-colors ${
          activeTab === tab.id ? "text-blue-600" : "text-gray-400"
        }`}
      >
        <tab.icon size={24} />
        <span className="text-[10px] mt-1 font-bold">{tab.label}</span>
      </button>
    ))}
  </div>
));
BottomNav.displayName = "BottomNav";

