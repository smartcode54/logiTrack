"use client";

import { memo } from "react";
import { Truck, User, Hash } from "lucide-react";

export const Header = memo(() => (
  <div className="bg-blue-700 text-white p-4 fixed top-0 left-0 right-0 z-50 shadow-md">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <Truck size={24} />
        <h1 className="text-xl font-bold tracking-tight">LogiTrack Driver</h1>
      </div>
      <div className="flex items-center gap-3 text-sm font-medium">
        <span className="bg-blue-600 px-2 py-1 rounded">TH-DRV-092</span>
        <User size={20} />
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs font-medium text-blue-100 border-t border-blue-600 pt-2 mt-2">
      <Hash size={14} />
      <span>Fleet: TRK-2025-001</span>
      <span className="mx-2">•</span>
      <span>Vehicle: 30-1234</span>
    </div>
  </div>
));
Header.displayName = "Header";
