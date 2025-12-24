"use client";

import { Fuel } from "lucide-react";

export const ExpensesPage = () => {
  return (
    <div className="min-h-screen animate-fadeIn p-4 space-y-6 pb-40 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
        <Fuel size={48} className="text-gray-300" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
          ฟีเจอร์นี้กำลังพัฒนา
        </p>
      </div>
    </div>
  );
};

