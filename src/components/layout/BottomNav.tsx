"use client";

import { memo } from "react";
import { ClipboardList, Navigation, Fuel, LayoutDashboard } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasActiveJob: boolean;
}

export const BottomNav = memo(
  ({ activeTab, setActiveTab, hasActiveJob }: BottomNavProps) => {
    const handleTabClick = (tabId: string) => {
      // ป้องกันการไปหน้า "jobs" เมื่อมีงานที่กำลังทำอยู่
      if (tabId === "jobs" && hasActiveJob) {
        return;
      }
      // ป้องกันการไปหน้า "active-job" เมื่อยังไม่เริ่มงาน
      if (tabId === "active-job" && !hasActiveJob) {
        return;
      }
      setActiveTab(tabId);
    };

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 pb-6 z-50 shadow-lg">
        {[
          { id: "jobs", icon: ClipboardList, label: "งานที่ได้รับ" },
          { id: "active-job", icon: Navigation, label: "กำลังดำเนินการ" },
          { id: "expenses", icon: Fuel, label: "ค่าน้ำมัน/ซ่อม" },
          { id: "dashboard", icon: LayoutDashboard, label: "สรุปงาน" },
        ].map((tab) => {
          const isJobsTab = tab.id === "jobs";
          const isActiveJobTab = tab.id === "active-job";

          // Disable "jobs" เมื่อมีงานที่กำลังทำอยู่
          // Disable "active-job" เมื่อยังไม่เริ่มงาน
          const isDisabled =
            (isJobsTab && hasActiveJob) || (isActiveJobTab && !hasActiveJob);

          return (
            <button
              key={tab.id}
              onClick={() => {
                // ป้องกันการคลิกเมื่อ disabled
                if (isDisabled) {
                  return;
                }
                handleTabClick(tab.id);
              }}
              disabled={isDisabled}
              className={`flex flex-col items-center transition-colors ${
                isDisabled
                  ? "text-gray-300 cursor-not-allowed opacity-50 pointer-events-none"
                  : activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              <tab.icon size={24} />
              <span className="text-[10px] mt-1 font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
);
BottomNav.displayName = "BottomNav";
