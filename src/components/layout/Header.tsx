"use client";

import { memo } from "react";
import { Truck, User } from "lucide-react";

export const Header = memo(() => (
  <div className="bg-blue-700 text-white p-4 sticky top-0 z-50 shadow-md flex justify-between items-center">
    <div className="flex items-center gap-2">
      <Truck size={24} />
      <h1 className="text-xl font-bold tracking-tight">LogiTrack Driver</h1>
    </div>
    <div className="flex items-center gap-3 text-sm font-medium">
      <span className="bg-blue-600 px-2 py-1 rounded">TH-DRV-092</span>
      <User size={20} />
    </div>
  </div>
));
Header.displayName = "Header";

