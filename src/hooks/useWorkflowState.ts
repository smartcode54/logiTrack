import { useState } from "react";
import {
  Timestamp,
  PickupPhotos,
  DeliveryPhotos,
  IncidentPhotos,
  GeoapifySearchResult,
} from "@/types";

const INITIAL_PICKUP_PHOTOS: PickupPhotos = {
  beforeClose: null,
  seal: null,
  closedWithSeal: null,
  runSheet: null,
};

const INITIAL_DELIVERY_PHOTOS: DeliveryPhotos = {
  beforeOpen: null,
  breakSeal: null,
  emptyContainer: null,
  deliveryRunSheet: null,
};

const INITIAL_INCIDENT_PHOTOS: IncidentPhotos = {
  incident1: null,
  incident2: null,
  incident3: null,
  incident4: null,
};

export const useWorkflowState = () => {
  const [step, setStep] = useState(0);
  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null);
  const [runSheetNumber, setRunSheetNumber] = useState("");
  const [pickupPhotos, setPickupPhotos] =
    useState<PickupPhotos>(INITIAL_PICKUP_PHOTOS);
  const [deliveryPhotos, setDeliveryPhotos] =
    useState<DeliveryPhotos>(INITIAL_DELIVERY_PHOTOS);
  const [isDelayed, setIsDelayed] = useState(false);
  const [incidentType, setIncidentType] = useState("");
  const [incidentOtherDescription, setIncidentOtherDescription] = useState("");
  const [incidentPhotos, setIncidentPhotos] =
    useState<IncidentPhotos>(INITIAL_INCIDENT_PHOTOS);

  // Timestamps
  const [confirmedCheckInTime, setConfirmedCheckInTime] =
    useState<Timestamp | null>(null);
  const [confirmedPickupTime, setConfirmedPickupTime] =
    useState<Timestamp | null>(null);
  const [confirmedDepartureTime, setConfirmedDepartureTime] =
    useState<Timestamp | null>(null);
  const [confirmedArrivalTime, setConfirmedArrivalTime] =
    useState<Timestamp | null>(null);
  const [confirmedDeliveryTime, setConfirmedDeliveryTime] =
    useState<Timestamp | null>(null);
  const [confirmedIncidentTime, setConfirmedIncidentTime] =
    useState<Timestamp | null>(null);
  const [incidentAddress, setIncidentAddress] =
    useState<GeoapifySearchResult | null>(null);

  const resetWorkflow = () => {
    setStep(0);
    setCheckInPhoto(null);
    setRunSheetNumber("");
    setPickupPhotos(INITIAL_PICKUP_PHOTOS);
    setDeliveryPhotos(INITIAL_DELIVERY_PHOTOS);
    setIncidentPhotos(INITIAL_INCIDENT_PHOTOS);
    setConfirmedCheckInTime(null);
    setConfirmedPickupTime(null);
    setConfirmedDepartureTime(null);
    setConfirmedArrivalTime(null);
    setConfirmedDeliveryTime(null);
    setConfirmedIncidentTime(null);
    setIsDelayed(false);
    setIncidentType("");
    setIncidentOtherDescription("");
    setIncidentAddress(null);
  };

  return {
    step,
    setStep,
    checkInPhoto,
    setCheckInPhoto,
    runSheetNumber,
    setRunSheetNumber,
    pickupPhotos,
    setPickupPhotos,
    deliveryPhotos,
    setDeliveryPhotos,
    isDelayed,
    setIsDelayed,
    incidentType,
    setIncidentType,
    incidentOtherDescription,
    setIncidentOtherDescription,
    incidentPhotos,
    setIncidentPhotos,
    confirmedCheckInTime,
    setConfirmedCheckInTime,
    confirmedPickupTime,
    setConfirmedPickupTime,
    confirmedDepartureTime,
    setConfirmedDepartureTime,
    confirmedArrivalTime,
    setConfirmedArrivalTime,
    confirmedDeliveryTime,
    setConfirmedDeliveryTime,
    confirmedIncidentTime,
    setConfirmedIncidentTime,
    incidentAddress,
    setIncidentAddress,
    resetWorkflow,
  };
};

