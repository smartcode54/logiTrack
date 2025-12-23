"use client";

import { QrCode, X } from "lucide-react";

interface ScannerOverlayProps {
  scanProgress: number;
  setIsScanning: (val: boolean) => void;
}

export const ScannerOverlay = ({
  scanProgress,
  setIsScanning,
}: ScannerOverlayProps) => (
  <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 animate-fadeIn">
    <div className="relative w-full aspect-square max-w-[280px] border-2 border-white/20 rounded-3xl overflow-hidden bg-gray-900">
      <div className="absolute inset-0 flex items-center justify-center">
        <QrCode size={100} className="text-white/10" />
      </div>
      <div
        className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scanLine"
        style={{ top: `${scanProgress}%` }}
      ></div>
      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
    </div>
    <div className="mt-8 text-center space-y-2 text-white">
      <h3 className="font-black text-xl tracking-wider uppercase">
        Scanning Run Sheet
      </h3>
      <p className="text-gray-400 text-sm">
        จัดวาง QR หรือ Barcode ให้ตรงกับกรอบ
      </p>
    </div>
    <button
      onClick={() => setIsScanning(false)}
      className="mt-12 bg-white/10 text-white p-4 rounded-full active:scale-90 transition-all"
    >
      <X size={24} />
    </button>
  </div>
);

