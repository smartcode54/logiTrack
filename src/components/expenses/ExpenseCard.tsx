"use client";

import { ImageViewer } from "@/components/common/ImageViewer";
import type { Expense } from "@/types";
import { Banknote, Camera, CreditCard, Fuel, Gauge, MoreHorizontal, Trash2, Wrench } from "lucide-react";
import { useState } from "react";

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

const getCategoryConfig = (category: Expense["category"]) => {
  switch (category) {
    case "fuel":
      return {
        icon: Fuel,
        label: "น้ำมัน",
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        iconColor: "text-green-600",
      };
    case "maintenance":
      return {
        icon: Wrench,
        label: "ซ่อมบำรุง",
        bgColor: "bg-orange-100",
        textColor: "text-orange-700",
        iconColor: "text-orange-600",
      };
    case "other":
      return {
        icon: MoreHorizontal,
        label: "อื่นๆ",
        bgColor: "bg-purple-100",
        textColor: "text-purple-700",
        iconColor: "text-purple-600",
      };
  }
};

export const ExpenseCard = ({ expense, onDelete }: ExpenseCardProps) => {
  const config = getCategoryConfig(expense.category);
  const Icon = config.icon;
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const fuelData = expense.fuelData;
  const images: string[] = [];

  // Add fuel-specific images
  if (fuelData?.beforeFillImage) images.push(fuelData.beforeFillImage);
  if (fuelData?.receiptImage) images.push(fuelData.receiptImage);

  // Add receipt images for maintenance and other categories
  if (expense.receiptImages && expense.receiptImages.length > 0) {
    images.push(...expense.receiptImages);
  }

  const handleImageClick = (image: string, index: number) => {
    setImageIndex(index);
    setViewingImage(image);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
              <Icon size={20} className={config.iconColor} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${config.bgColor} ${config.textColor}`}>
                  {config.label}
                </span>
                {expense.category === "other" && expense.otherType && <span className="text-xs text-gray-600 font-bold">({expense.otherType})</span>}
                {fuelData?.paymentType && (
                  <span className="text-xs text-gray-600 font-bold flex items-center gap-1">
                    {fuelData.paymentType === "card" ? (
                      <>
                        <CreditCard size={12} />
                        บัตรน้ำมัน
                      </>
                    ) : (
                      <>
                        <Banknote size={12} />
                        เงินสด
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {expense.date} {expense.time}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm("ต้องการลบค่าใช้จ่ายนี้หรือไม่?")) {
                onDelete(expense.id);
              }
            }}
            className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-orange-500"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Fuel-specific info */}
        {fuelData && (
          <div className="mb-3 space-y-2">
            {fuelData.mileage !== null && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Gauge size={14} className="text-green-500" />
                <span className="font-bold">เลขไมล์: {fuelData.mileage.toLocaleString("th-TH")} กม.</span>
              </div>
            )}
            {fuelData.liters !== null && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Fuel size={14} className="text-green-500" />
                <span className="font-bold">จำนวนลิตร: {fuelData.liters.toFixed(2)} ลิตร</span>
              </div>
            )}
          </div>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {/* Fuel-specific images */}
            {fuelData?.beforeFillImage && (
              <div className="relative flex-1 min-w-[calc(50%-4px)]">
                <img
                  src={fuelData.beforeFillImage}
                  alt="Before fill"
                  className="w-full h-24 object-cover rounded-lg cursor-pointer"
                  onClick={() => {
                    const index = images.indexOf(fuelData.beforeFillImage!);
                    handleImageClick(fuelData.beforeFillImage!, index);
                  }}
                />
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-black">ถังน้ำมัน</div>
              </div>
            )}
            {fuelData?.receiptImage && (
              <div className="relative flex-1 min-w-[calc(50%-4px)]">
                <img
                  src={fuelData.receiptImage}
                  alt="Receipt"
                  className="w-full h-24 object-cover rounded-lg cursor-pointer"
                  onClick={() => {
                    const index = images.indexOf(fuelData.receiptImage!);
                    handleImageClick(fuelData.receiptImage!, index);
                  }}
                />
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-black">บิล/ใบเสร็จ</div>
              </div>
            )}

            {/* Receipt images for maintenance and other */}
            {expense.receiptImages &&
              expense.receiptImages.map((image, index) => {
                const imageIndex = images.indexOf(image);
                return (
                  <div key={index} className="relative flex-1 min-w-[calc(50%-4px)]">
                    <img
                      src={image}
                      alt={`Receipt ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer"
                      onClick={() => handleImageClick(image, imageIndex)}
                    />
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-black">
                      {expense.category === "maintenance" ? `บิล ${index + 1}` : "บิล/ใบเสร็จ"}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-xs font-black text-gray-600 uppercase">จำนวนเงิน</span>
          <span className="text-lg font-black text-karabao">฿{expense.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Image Viewer */}
      {viewingImage && images.length > 0 && (
        <ImageViewer imageSrc={images} onClose={() => setViewingImage(null)} alt="Expense image" initialIndex={imageIndex} />
      )}
    </>
  );
};
