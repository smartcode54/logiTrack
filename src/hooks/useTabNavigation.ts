import { useState, useCallback } from "react";
import { Job } from "@/types";

export const useTabNavigation = (currentJob: Job | null) => {
  const [activeTab, setActiveTabState] = useState("jobs");

  const setActiveTab = useCallback(
    (tab: string) => {
      // ป้องกันการไปหน้า "jobs" เมื่อมีงานที่กำลังทำอยู่
      if (tab === "jobs" && currentJob !== null) {
        console.log(
          "⚠️ ไม่สามารถไปหน้า 'งานที่ได้รับ' ได้ เพราะมีงานที่กำลังดำเนินการอยู่"
        );
        return;
      }
      // ป้องกันการไปหน้า "active-job" เมื่อยังไม่เริ่มงาน
      if (tab === "active-job" && currentJob === null) {
        console.log(
          "⚠️ ไม่สามารถไปหน้า 'กำลังดำเนินการ' ได้ เพราะยังไม่เริ่มงาน"
        );
        return;
      }
      setActiveTabState(tab);
    },
    [currentJob]
  );

  return {
    activeTab,
    setActiveTab,
    setActiveTabState, // สำหรับใช้เมื่อต้องการ bypass validation
  };
};

