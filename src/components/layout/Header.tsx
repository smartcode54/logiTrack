"use client";

import { Hash, Truck, User } from "lucide-react";
import { memo } from "react";

export const Header = memo(() => (
  <div className="bg-[#004d39] text-white p-4 fixed top-0 left-0 right-0 z-50 shadow-md border-b border-[#2F3633]">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <Truck size={24} />
        <h1 className="text-xl font-bold tracking-tight">LogiTrack Driver</h1>
      </div>
      <div className="flex items-center gap-3 text-sm font-medium">
        <span className="bg-[#38B04A] px-2 py-1 rounded text-white font-bold">TH-DRV-092</span>
        <User size={20} />
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs font-medium text-white border-t border-[#2F3633] pt-2 mt-2">
      <Hash size={14} />
      <span>Fleet: TRK-2025-001</span>
      <span className="mx-2">•</span>
      <span>Vehicle: 30-1234</span>
    </div>
  </div>
));
Header.displayName = "Header";
