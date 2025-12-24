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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;
    let isScanningActive = true;
    let scanInterval: number | null = null;
    let stream: MediaStream | null = null;

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

        // เริ่ม video stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // สแกนจาก canvas ที่ crop เฉพาะส่วนในกรอบ
        scanInterval = window.setInterval(() => {
          if (
            !isScanningActive ||
            !videoRef.current ||
            !canvasRef.current ||
            !scanAreaRef.current
          ) {
            return;
          }

          try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const scanArea = scanAreaRef.current;

            if (video.readyState < 2) return; // ยังไม่พร้อม

            // รอให้ video มีขนาดจริง
            if (video.videoWidth === 0 || video.videoHeight === 0) return;

            const videoRect = video.getBoundingClientRect();
            const areaRect = scanArea.getBoundingClientRect();

            // คำนวณตำแหน่งและขนาดของ scan area เปอร์เซ็นต์ของ video
            // ใช้ video.videoWidth และ video.videoHeight เพื่อความแม่นยำ
            const scaleX = video.videoWidth / videoRect.width;
            const scaleY = video.videoHeight / videoRect.height;

            // คำนวณตำแหน่งสัมพัทธ์ของ scan area
            const relativeX =
              (areaRect.left - videoRect.left) / videoRect.width;
            const relativeY = (areaRect.top - videoRect.top) / videoRect.height;
            const relativeWidth = areaRect.width / videoRect.width;
            const relativeHeight = areaRect.height / videoRect.height;

            const x = Math.max(0, relativeX * video.videoWidth);
            const y = Math.max(0, relativeY * video.videoHeight);
            const width = Math.min(
              video.videoWidth - x,
              relativeWidth * video.videoWidth
            );
            const height = Math.min(
              video.videoHeight - y,
              relativeHeight * video.videoHeight
            );

            // ตั้งค่า canvas ให้เท่ากับขนาดของ scan area
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Crop ภาพเฉพาะส่วนในกรอบ
            ctx.drawImage(
              video,
              x,
              y,
              width,
              height, // source
              0,
              0,
              width,
              height // destination
            );

            // สแกนจาก canvas โดยแปลงเป็น ImageData
            const imageData = ctx.getImageData(0, 0, width, height);

            // สร้าง Image element จาก canvas
            canvas.toBlob((blob) => {
              if (!blob || !isScanningActive) return;

              const img = new Image();
              img.onload = () => {
                if (!isScanningActive) return;

                codeReader.decodeFromImageElement(img).then(
                  (result) => {
                    if (result && isScanningActive) {
                      onScanSuccess(result.getText());
                      if (scanInterval !== null) {
                        window.clearInterval(scanInterval);
                        scanInterval = null;
                      }
                      stopScanning();
                    }
                  },
                  (err: Error) => {
                    if (err.name !== "NotFoundException" && isScanningActive) {
                      // NotFoundException เป็นเรื่องปกติ (ยังไม่เจอ QR code)
                    }
                  }
                );
              };
              img.src = URL.createObjectURL(blob);
            }, "image/png");
          } catch (err) {
            if (err instanceof Error && err.name !== "NotFoundException") {
              console.error("Error scanning:", err);
            }
          }
        }, 300); // สแกนทุก 300ms
      } catch (err: unknown) {
        if (!isScanningActive) return;
        console.error("Error starting scanner:", err);
        setError("ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบสิทธิ์การเข้าถึงกล้อง");
        setIsScanning(false);
      }
    };

    const stopScanning = () => {
      isScanningActive = false;
      try {
        if (scanInterval !== null && scanInterval !== undefined) {
          window.clearInterval(scanInterval);
          scanInterval = null;
        }
        if (codeReaderRef.current) {
          codeReaderRef.current.reset();
        }
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          stream = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
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
      <div className="relative w-full aspect-square max-w-[280px] overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover brightness-110 contrast-110"
          playsInline
          muted
          style={{ filter: "brightness(1.2) contrast(1.15)" }}
        />
        {/* Overlay with darkened areas */}
        <div className="absolute inset-0">
          {/* Darkened overlay with cutout */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <mask id="scanMask">
                <rect width="100%" height="100%" fill="black" />
                <rect
                  x="12.5%"
                  y="12.5%"
                  width="75%"
                  height="75%"
                  fill="white"
                  rx="8"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="black"
              fillOpacity="0.4"
              mask="url(#scanMask)"
            />
          </svg>
          {/* Scan area rectangle - transparent center */}
          <div
            ref={scanAreaRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-4 border-karabao rounded-lg bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
          >
            {/* Corner indicators */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-karabao rounded-tl-lg"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-karabao rounded-tr-lg"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-karabao rounded-bl-lg"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-karabao rounded-br-lg"></div>
          </div>
        </div>
        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
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
          <p className="text-karabao-light text-xs mt-2 animate-pulse">
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
