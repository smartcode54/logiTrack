"use client";

import { JobCard } from "@/components/jobs/JobCard";
import { Job } from "@/types";

interface JobsPageProps {
  jobs: Job[];
  currentJob: Job | null;
  onStartJob: (job: Job) => void;
  isStartingJob: boolean;
  startingJobId: string | null;
}

export const JobsPage = ({
  jobs,
  currentJob,
  onStartJob,
  isStartingJob,
  startingJobId,
}: JobsPageProps) => {
  return (
    <div className="p-4 animate-fadeIn">
      <h2 className="text-2xl font-black text-gray-800 mb-5 tracking-tight">
        งานที่มอบหมาย
      </h2>
      {currentJob ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-xl mb-4">
          <p className="text-sm font-bold text-yellow-800">
            ⚠️ คุณมีงานที่กำลังดำเนินการอยู่ กรุณาปิดงานก่อนเลือกงานใหม่
          </p>
        </div>
      ) : (
        jobs
          .filter((j) => j.status !== "delivered")
          .map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onStartJob={onStartJob}
              isStarting={isStartingJob && startingJobId === job.id}
              disabled={false}
            />
          ))
      )}
    </div>
  );
};

