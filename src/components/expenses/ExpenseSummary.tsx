"use client";

import { Fuel, Wrench, MoreHorizontal, TrendingUp } from "lucide-react";
import { ExpenseCategory } from "@/types";

interface ExpenseSummaryProps {
  totalFuel: number;
  totalMaintenance: number;
  totalOther: number;
  totalAll: number;
}

export const ExpenseSummary = ({
  totalFuel,
  totalMaintenance,
  totalOther,
  totalAll,
}: ExpenseSummaryProps) => {
  const summaryItems: Array<{
    category: ExpenseCategory;
    label: string;
    icon: typeof Fuel;
    amount: number;
    bgColor: string;
    textColor: string;
    iconColor: string;
  }> = [
    {
      category: "fuel",
      label: "น้ำมัน",
      icon: Fuel,
      amount: totalFuel,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      iconColor: "text-blue-600",
    },
    {
      category: "maintenance",
      label: "ซ่อมบำรุง",
      icon: Wrench,
      amount: totalMaintenance,
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      iconColor: "text-orange-600",
    },
    {
      category: "other",
      label: "อื่นๆ",
      icon: MoreHorizontal,
      amount: totalOther,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-gray-800">สรุปค่าใช้จ่าย</h3>
        <TrendingUp size={20} className="text-gray-400" />
      </div>

      <div className="space-y-3">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.category}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}
                >
                  <Icon size={18} className={item.iconColor} />
                </div>
                <span className={`text-sm font-black ${item.textColor}`}>
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-black text-gray-800">
                ฿{item.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-gray-800 uppercase">
            รวมทั้งหมด
          </span>
          <span className="text-2xl font-black text-karabao">
            ฿{totalAll.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

