"use client";

import type { DeliveredJob } from "@/types";
import { startScanning } from "@/utils/scanning";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DeliverySuccessModal } from "@/components/common/DeliverySuccessModal";
import { BottomNav } from "@/components/layout/BottomNav";
// Components
import { Header } from "@/components/layout/Header";
import { ActiveJobPage } from "@/pages/ActiveJobPage";
import { AddExpensePage } from "@/pages/AddExpensePage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ExpensesPage } from "@/pages/ExpensesPage";
import { JobsPage } from "@/pages/JobsPage";

import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
// Hooks
import { useJobState } from "@/hooks/useJobState";
import { useLocation } from "@/hooks/useLocation";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useWorkflowLogic } from "@/hooks/useWorkflowLogic";
import { useWorkflowState } from "@/hooks/useWorkflowState";

export default function Home() {
  const { isAuthenticated, loading: authLoading } = useFirebaseAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#ccfff2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d39] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  // Don't render main content if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  // Job State
  const {
    jobs,
    currentJob,
    setCurrentJob,
    deliveredJobs,
    isStartingJob,
    setIsStartingJob,
    startingJobId,
    setStartingJobId,
    markJobAsDelivered,
    addDeliveredJob,
    resetCurrentJob,
  } = useJobState();

  // Tab Navigation (must be after currentJob to use it)
  const { activeTab, setActiveTab, setActiveTabState } = useTabNavigation(currentJob);

  // Workflow State
  const workflowState = useWorkflowState();

  // Location State
  const locationState = useLocation();

  // Scanning State
  const [isScanning, setIsScanning] = useState(false);

  // Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastDeliveryRecord, setLastDeliveryRecord] = useState<DeliveredJob | null>(null);
  const [viewJobModal, setViewJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<DeliveredJob | null>(null);

  const handleStartScanning = () => {
    startScanning(setIsScanning);
  };

  const handleStartJob = async (job: (typeof jobs)[0]) => {
    setIsStartingJob(true);
    setStartingJobId(job.id);

    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🚀 เริ่มงาน:", job.id);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Fetch location
      await locationState.fetchLocation();

      // เริ่มงานหลังจากดึงข้อมูลเสร็จแล้ว
      setCurrentJob(job);
      workflowState.setStep(0);
      setActiveTabState("active-job");
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการเริ่มงาน:", error);
      // ยังคงเริ่มงานต่อแม้จะเกิด error
      setCurrentJob(job);
      workflowState.setStep(0);
      setActiveTabState("active-job");
    } finally {
      setIsStartingJob(false);
      setStartingJobId(null);
    }
  };

  const handleCompleteJob = (deliveryRecord: DeliveredJob) => {
    addDeliveredJob(deliveryRecord);
    setLastDeliveryRecord(deliveryRecord);
    setShowSuccessModal(true);
    markJobAsDelivered(deliveryRecord.id);
  };

  const handleResetWorkflow = () => {
    resetCurrentJob();
    workflowState.resetWorkflow();
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setLastDeliveryRecord(null);
    setActiveTab("jobs");
  };

  const handleViewSummary = () => {
    setShowSuccessModal(false);
    setLastDeliveryRecord(null);
    setActiveTab("dashboard");
  };

  // Workflow Logic
  const workflowLogic = useWorkflowLogic({
    checkInPhotos: workflowState.checkInPhotos,
    step: workflowState.step,
    setStep: workflowState.setStep,
    isDelayed: workflowState.isDelayed,
    incidentType: workflowState.incidentType,
    incidentOtherDescription: workflowState.incidentOtherDescription,
    confirmedCheckInTime: workflowState.confirmedCheckInTime,
    confirmedPickupTime: workflowState.confirmedPickupTime,
    confirmedDepartureTime: workflowState.confirmedDepartureTime,
    confirmedArrivalTime: workflowState.confirmedArrivalTime,
    confirmedDeliveryTime: workflowState.confirmedDeliveryTime,
    confirmedIncidentTime: workflowState.confirmedIncidentTime,
    runSheetNumber: workflowState.runSheetNumber,
    currentAddress: locationState.currentAddress,
    currentJob,
    onCompleteJob: handleCompleteJob,
    incidentAddress: workflowState.incidentAddress,
    onResetWorkflow: handleResetWorkflow,
    setIncidentAddress: workflowState.setIncidentAddress,
    setConfirmedCheckInTime: workflowState.setConfirmedCheckInTime,
    setConfirmedPickupTime: workflowState.setConfirmedPickupTime,
    setConfirmedDepartureTime: workflowState.setConfirmedDepartureTime,
    setConfirmedIncidentTime: workflowState.setConfirmedIncidentTime,
    setConfirmedArrivalTime: workflowState.setConfirmedArrivalTime,
    setConfirmedDeliveryTime: workflowState.setConfirmedDeliveryTime,
    onRefreshLocation: locationState.fetchLocation,
  });

  return (
    <div className="min-h-screen bg-[#ccfff2] font-sans max-w-md mx-auto border-x shadow-2xl relative overflow-x-hidden select-none">
      <DeliverySuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onViewSummary={handleViewSummary}
        deliveryData={lastDeliveryRecord}
      />
      <DeliverySuccessModal
        isOpen={viewJobModal}
        onClose={() => {
          setViewJobModal(false);
          setSelectedJob(null);
        }}
        deliveryData={selectedJob}
        viewOnly={true}
      />
      <Header />

      <main className="min-h-screen pb-40 pt-24">
        {activeTab === "jobs" && (
          <JobsPage jobs={jobs} currentJob={currentJob} onStartJob={handleStartJob} isStartingJob={isStartingJob} startingJobId={startingJobId} />
        )}

        {activeTab === "active-job" && currentJob && (
          <ActiveJobPage
            jobId={currentJob.id}
            isScanning={isScanning}
            setIsScanning={setIsScanning}
            setRunSheetNumber={workflowState.setRunSheetNumber}
            currentAddress={locationState.currentAddress}
            isLoadingAddress={locationState.isLoadingAddress}
            locationSyncedTime={locationState.locationSyncedTime}
            onRefreshLocation={locationState.fetchLocation}
            step={workflowState.step}
            checkInPhotos={workflowState.checkInPhotos}
            setCheckInPhotos={workflowState.setCheckInPhotos}
            runSheetNumber={workflowState.runSheetNumber}
            pickupPhotos={workflowState.pickupPhotos}
            setPickupPhotos={workflowState.setPickupPhotos}
            confirmedCheckInTime={workflowState.confirmedCheckInTime}
            confirmedPickupTime={workflowState.confirmedPickupTime}
            confirmedDepartureTime={workflowState.confirmedDepartureTime}
            confirmedArrivalTime={workflowState.confirmedArrivalTime}
            confirmedDeliveryTime={workflowState.confirmedDeliveryTime}
            isDelayed={workflowState.isDelayed}
            setIsDelayed={workflowState.setIsDelayed}
            incidentType={workflowState.incidentType}
            setIncidentType={workflowState.setIncidentType}
            incidentOtherDescription={workflowState.incidentOtherDescription}
            setIncidentOtherDescription={workflowState.setIncidentOtherDescription}
            incidentPhotos={workflowState.incidentPhotos}
            setIncidentPhotos={workflowState.setIncidentPhotos}
            confirmedIncidentTime={workflowState.confirmedIncidentTime}
            incidentAddress={workflowState.incidentAddress}
            deliveryPhotos={workflowState.deliveryPhotos}
            setDeliveryPhotos={workflowState.setDeliveryPhotos}
            onNextStep={workflowLogic.nextStep}
            getSteps={workflowLogic.getSteps}
            getDisplayLabel={workflowLogic.getDisplayLabel}
            getStepIcon={workflowLogic.getStepIcon}
            onStartScanning={handleStartScanning}
          />
        )}

        {activeTab === "expenses" && <ExpensesPage onAddExpense={() => setActiveTabState("add-expense")} />}

        {activeTab === "add-expense" && <AddExpensePage onBack={() => setActiveTabState("expenses")} />}

        {activeTab === "dashboard" && (
          <DashboardPage
            deliveredJobs={deliveredJobs}
            onJobClick={(job) => {
              setSelectedJob(job);
              setViewJobModal(true);
            }}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} hasActiveJob={currentJob !== null} />
    </div>
  );
}
