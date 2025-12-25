import type { DeliveredJob, Job } from "@/types";
import { useState } from "react";

const INITIAL_JOBS: Job[] = [
  {
    id: "JOB-2025-001",
    type: "LH",
    route: "กรุงเทพฯ - ชลบุรี",
    pickup: "คลังสินค้า A (กทม.)",
    status: "assigned",
    scheduledTime: "08:00 น.",
  },
  {
    id: "JOB-2025-002",
    type: "FM",
    route: "โรงงานลูกค้า - กทม.",
    pickup: "โรงงานลูกค้า XY",
    status: "pending",
    scheduledTime: "10:30 น.",
  },
];

export const useJobState = () => {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [deliveredJobs, setDeliveredJobs] = useState<DeliveredJob[]>([]);
  const [isStartingJob, setIsStartingJob] = useState(false);
  const [startingJobId, setStartingJobId] = useState<string | null>(null);

  const markJobAsDelivered = (jobId: string) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "delivered" as const } : j)));
  };

  const addDeliveredJob = (job: DeliveredJob) => {
    setDeliveredJobs((prev) => [job, ...prev]);
  };

  const resetCurrentJob = () => {
    setCurrentJob(null);
  };

  return {
    jobs,
    setJobs,
    currentJob,
    setCurrentJob,
    deliveredJobs,
    setDeliveredJobs,
    isStartingJob,
    setIsStartingJob,
    startingJobId,
    setStartingJobId,
    markJobAsDelivered,
    addDeliveredJob,
    resetCurrentJob,
  };
};
