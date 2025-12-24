"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { X } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const startScanning = async () => {
      try {
        setError(null);
        setIsScanning(true);

        const videoInputDevices = await codeReader.listVideoInputDevices();
        const selectedDeviceId =
          videoInputDevices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear") ||
              device.label.toLowerCase().includes("environment")
          )?.deviceId || videoInputDevices[0]?.deviceId;

        if (!selectedDeviceId) {
          throw new Error("ไม่พบกล้อง");
        }

        const result = await codeReader.decodeOnceFromVideoDevice(
          selectedDeviceId,
          videoRef.current!
        );

        if (result) {
          onScanSuccess(result.getText());
          stopScanning();
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "NotFoundException") {
          // ยังไม่เจอ QR code (ปกติ)
          return;
        }
        console.error("Error scanning:", err);
        setError("ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบสิทธิ์การเข้าถึงกล้อง");
        setIsScanning(false);
      }
    };

    const stopScanning = () => {
      try {
        if (codeReaderRef.current) {
          codeReaderRef.current.reset();
        }
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    };

    if (videoRef.current) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [onScanSuccess]);

  const handleClose = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="relative w-full aspect-square max-w-[280px] border-2 border-white/20 rounded-3xl overflow-hidden bg-gray-900">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
      </div>
      <div className="mt-8 text-center space-y-2 text-white">
        <h3 className="font-black text-xl tracking-wider uppercase">
          Scanning QR/Barcode
        </h3>
        <p className="text-gray-400 text-sm">
          จัดวาง QR หรือ Barcode ให้ตรงกับกรอบ
        </p>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {isScanning && (
          <p className="text-green-400 text-xs mt-2 animate-pulse">
            กำลังสแกน...
          </p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="mt-12 bg-white/10 text-white p-4 rounded-full active:scale-90 transition-all"
      >
        <X size={24} />
      </button>
    </div>
  );
};
