"use client";

import { QRScanner } from "./QRScanner";

interface ScannerOverlayProps {
  setIsScanning: (val: boolean) => void;
  setRunSheetNumber: (number: string) => void;
}

export const ScannerOverlay = ({ setIsScanning, setRunSheetNumber }: ScannerOverlayProps) => {
  const handleScanSuccess = (decodedText: string) => {
    setRunSheetNumber(decodedText);
    setIsScanning(false);
  };

  return <QRScanner onScanSuccess={handleScanSuccess} onClose={() => setIsScanning(false)} />;
};
