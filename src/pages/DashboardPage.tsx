"use client";

import { PackageCheck } from "lucide-react";
import { DeliveredJobCard } from "@/components/dashboard/DeliveredJobCard";
import { DeliveredJob } from "@/types";

interface DashboardPageProps {
  deliveredJobs: DeliveredJob[];
  onJobClick: (job: DeliveredJob) => void;
}

export const DashboardPage = ({
  deliveredJobs,
  onJobClick,
}: DashboardPageProps) => {
  return (
    <div className="p-4 space-y-6 animate-fadeIn pb-40">
      <h2 className="text-2xl font-black text-gray-800 tracking-tight">
        สรุปงานที่จัดส่ง
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
              onClick={() => onJobClick(job)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

