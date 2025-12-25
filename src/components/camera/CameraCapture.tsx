"use client";

import type { GeoapifySearchResult, Timestamp } from "@/types";
import { BLUR_THRESHOLD, detectBlur } from "@/utils/blurDetection";
import { addOverlayToCanvas } from "@/utils/imageOverlay";
import { Camera, X } from "lucide-react";
import React, { useState, useEffect, memo } from "react";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  label: string;
  currentAddress?: GeoapifySearchResult | null;
  timestamp?: Timestamp | null;
  statusLabel?: string;
}

export const CameraCapture = memo(({ onCapture, onClose, label, currentAddress, timestamp, statusLabel }: CameraCaptureProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBlurry, setIsBlurry] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        // Reset states เมื่อเริ่มใหม่
        setError(null);
        setIsBlurry(false);
        setCapturedImage(null);
        setIsVideoReady(false);

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;

          // รอให้ video พร้อม
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              setIsVideoReady(true);
              videoRef.current.play().catch((err) => {
                console.error("Error playing video:", err);
                setIsVideoReady(false);
              });
            }
          };

          videoRef.current.onplaying = () => {
            setIsVideoReady(true);
          };
        }
      } catch (err) {
        setError("ไม่สามารถเข้าถึงกล้องได้");
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("กล้องยังไม่พร้อม");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // ตรวจสอบว่า video พร้อมและมีขนาดที่ถูกต้อง
    if (
      !isVideoReady ||
      video.readyState < 2 || // HAVE_CURRENT_DATA
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setError("กล้องยังไม่พร้อม กรุณารอสักครู่แล้วลองใหม่");
      return;
    }

    // ใช้ขนาดหน้าจอจริงๆ
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // ใช้ขนาดจริงของวิดีโอจากกล้อง
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // ตั้งค่า canvas ให้มีขนาดเท่ากับหน้าจอ
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setError("ไม่สามารถเข้าถึง canvas context ได้");
      return;
    }

    try {
      // วาดภาพจากวิดีโอโดยไม่ซูม - แสดงภาพทั้งหมดโดยไม่ crop
      // คำนวณขนาดที่เหมาะสมเพื่อให้แสดงภาพทั้งหมดใน canvas
      const videoAspect = videoWidth / videoHeight;
      const canvasAspect = screenWidth / screenHeight;

      let drawWidth, drawHeight, drawX, drawY;

      if (videoAspect > canvasAspect) {
        // วิดีโอกว้างกว่า canvas ให้ปรับตามความกว้าง
        drawWidth = screenWidth;
        drawHeight = drawWidth / videoAspect;
        drawX = 0;
        drawY = (screenHeight - drawHeight) / 2;
      } else {
        // วิดีโอสูงกว่า canvas ให้ปรับตามความสูง
        drawHeight = screenHeight;
        drawWidth = drawHeight * videoAspect;
        drawX = (screenWidth - drawWidth) / 2;
        drawY = 0;
      }

      // วาดภาพโดยไม่ซูม - แสดงภาพทั้งหมด
      ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

      // เพิ่ม overlay ลงในภาพ (ถ้ามีข้อมูล)
      if (currentAddress || timestamp || statusLabel) {
        addOverlayToCanvas(canvas, {
          address: currentAddress,
          timestamp: timestamp,
          statusLabel: statusLabel,
        });
      }

      // ตรวจสอบว่า canvas มีขนาดถูกต้องก่อน getImageData
      if (canvas.width === 0 || canvas.height === 0) {
        setError("ขนาดภาพไม่ถูกต้อง กรุณาลองใหม่");
        return;
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const blurScore = detectBlur(imageData);

      if (blurScore < BLUR_THRESHOLD) {
        setIsBlurry(true);
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
        return;
      }

      const imageDataUrl = canvas.toDataURL("image/jpeg");
      onCapture(imageDataUrl);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onClose();
    } catch (err) {
      console.error("Error capturing photo:", err);
      setError("เกิดข้อผิดพลาดในการถ่ายรูป กรุณาลองใหม่");
    }
  };

  const handleUseBlurryImage = async () => {
    if (capturedImage) {
      onCapture(capturedImage);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onClose();
    }
  };

  const handleRetakePhoto = () => {
    setIsBlurry(false);
    setCapturedImage(null);
    setError(null);
    setIsVideoReady(false);
    // รอให้ video พร้อมก่อนถ่ายใหม่
    if (videoRef.current && stream) {
      videoRef.current
        .play()
        .then(() => {
          // รอให้ video มี metadata
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              setIsVideoReady(true);
            };
          }
        })
        .catch((err) => {
          console.error("Error playing video:", err);
          setError("ไม่สามารถเริ่มกล้องได้");
        });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center text-white p-4 bg-black/50">
        <h3 className="text-lg font-black uppercase">{label}</h3>
        <button
          onClick={() => {
            if (stream) {
              stream.getTracks().forEach((track) => track.stop());
            }
            onClose();
          }}
          className="p-2 bg-white/10 rounded-full"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {error ? (
          <div className="bg-orange-500 text-white p-4 rounded-xl text-center">{error}</div>
        ) : isBlurry && capturedImage ? (
          <>
            <div className="bg-orange-500 text-white p-4 rounded-xl text-center space-y-3 mb-4">
              <div className="flex items-center justify-center gap-2">
                <X size={24} className="text-white" />
                <h3 className="font-black text-lg">ภาพเบลอ ไม่ชัด</h3>
              </div>
              <p className="text-sm">กรุณาถ่ายใหม่เพื่อให้ได้ภาพที่ชัดเจน</p>
            </div>
            <div className="relative w-full h-full bg-black rounded-xl overflow-hidden border-4 border-orange-500 mb-4">
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/70 text-white px-4 py-2 rounded-lg font-black">ภาพเบลอ</div>
              </div>
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => {
                  if (stream) {
                    stream.getTracks().forEach((track) => track.stop());
                  }
                  onClose();
                }}
                className="flex-1 bg-gray-600 text-white font-black py-4 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRetakePhoto}
                className="flex-1 bg-orange-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2"
              >
                <Camera size={24} />
                ถ่ายใหม่
              </button>
              <button onClick={handleUseBlurryImage} className="flex-1 bg-gray-500 text-white font-black py-4 rounded-xl">
                ใช้ภาพนี้
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="relative w-full h-full bg-black overflow-hidden flex-1 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-4 w-full mt-4">
              <button
                onClick={() => {
                  if (stream) {
                    stream.getTracks().forEach((track) => track.stop());
                  }
                  onClose();
                }}
                className="flex-1 bg-gray-600 text-white font-black py-4 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                onClick={capturePhoto}
                disabled={!isVideoReady}
                className={`flex-1 font-black py-4 rounded-xl flex items-center justify-center gap-2 ${
                  isVideoReady ? "bg-green-600 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                <Camera size={24} />
                {isVideoReady ? "ถ่ายรูป" : "กำลังโหลด..."}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
CameraCapture.displayName = "CameraCapture";
