"use client";

import { CameraCapture } from "@/components/camera/CameraCapture";
import { ImageViewer } from "@/components/common/ImageViewer";
import { useExpenseState } from "@/hooks/useExpenseState";
import { useLocation } from "@/hooks/useLocation";
import type { ExpenseCategory, FuelExpenseData, PaymentType } from "@/types";
import { createTimestamp } from "@/utils/dateTime";
import {
  ArrowLeft,
  Banknote,
  Camera,
  Check,
  CheckCircle,
  CreditCard,
  FileText,
  Fuel,
  Gauge,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Wrench,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface AddExpensePageProps {
  onBack: () => void;
}

const OTHER_TYPES = ["ปะยาง", "ล้างรถ", "อื่นๆ"];

export const AddExpensePage = ({ onBack }: AddExpensePageProps) => {
  const { addExpense } = useExpenseState();
  const locationState = useLocation();
  const [category, setCategory] = useState<ExpenseCategory>("fuel");
  const [amount, setAmount] = useState("");
  const [otherType, setOtherType] = useState("");
  const [isOtherCustom, setIsOtherCustom] = useState(false);

  // Fuel-specific fields
  const [mileage, setMileage] = useState("");
  const [liters, setLiters] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);
  const [beforeFillImage, setBeforeFillImage] = useState<string | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Receipt images for maintenance (4 images) and other (1 image)
  const [maintenanceReceiptImages, setMaintenanceReceiptImages] = useState<(string | null)[]>([null, null, null, null]);
  const [otherReceiptImage, setOtherReceiptImage] = useState<string | null>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<"beforeFill" | "receipt" | "maintenanceReceipt" | "otherReceipt" | null>(null);
  const [receiptImageIndex, setReceiptImageIndex] = useState<number | null>(null); // For maintenance receipt images
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const receiptFileInputRef = useRef<HTMLInputElement>(null);
  const maintenanceReceiptFileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);
  const otherReceiptFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch location when page loads
  useEffect(() => {
    locationState.fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      return;
    }
    // Show preview modal instead of saving immediately
    setShowPreviewModal(true);
  };

  const handleConfirmSave = () => {
    const amountNum = Number.parseFloat(amount);

    // Prepare fuel data if category is fuel
    let fuelData: FuelExpenseData | undefined;
    let receiptImages: string[] | undefined;

    if (category === "fuel") {
      fuelData = {
        mileage: mileage ? Number.parseInt(mileage, 10) : null,
        liters: liters ? Number.parseFloat(Number.parseFloat(liters).toFixed(2)) : null,
        paymentType: paymentType,
        beforeFillImage: beforeFillImage,
        receiptImage: receiptImage,
      };
    } else if (category === "maintenance") {
      // Filter out null values and keep only actual images
      receiptImages = maintenanceReceiptImages.filter((img): img is string => img !== null);
    } else if (category === "other") {
      // Other category has optional receipt image
      if (otherReceiptImage) {
        receiptImages = [otherReceiptImage];
      }
    }

    addExpense(category, Number.parseFloat(amountNum.toFixed(2)), "", category === "other" ? otherType : undefined, fuelData, receiptImages);

    // Reset form and go back
    setAmount("");
    setOtherType("");
    setIsOtherCustom(false);
    setMileage("");
    setLiters("");
    setPaymentType(null);
    setBeforeFillImage(null);
    setReceiptImage(null);
    setMaintenanceReceiptImages([null, null, null, null]);
    setOtherReceiptImage(null);
    setShowPreviewModal(false);
    onBack();
  };

  const handleImageCapture = (imageData: string) => {
    if (cameraType === "beforeFill") {
      setBeforeFillImage(imageData);
    } else if (cameraType === "receipt") {
      setReceiptImage(imageData);
    } else if (cameraType === "maintenanceReceipt" && receiptImageIndex !== null) {
      const newImages = [...maintenanceReceiptImages];
      newImages[receiptImageIndex] = imageData;
      setMaintenanceReceiptImages(newImages);
      setReceiptImageIndex(null);
    } else if (cameraType === "otherReceipt") {
      setOtherReceiptImage(imageData);
    }
    setShowCamera(false);
    setCameraType(null);
  };

  const handleReceiptFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    // อ่านไฟล์เป็น base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      if (category === "fuel") {
        setReceiptImage(imageData);
      } else if (category === "other") {
        setOtherReceiptImage(imageData);
      }
    };
    reader.readAsDataURL(file);

    // Reset input เพื่อให้สามารถเลือกไฟล์เดิมได้อีกครั้ง
    if (receiptFileInputRef.current) {
      receiptFileInputRef.current.value = "";
    }
    if (otherReceiptFileInputRef.current) {
      otherReceiptFileInputRef.current.value = "";
    }
  };

  const handleMaintenanceReceiptFileSelect = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    // อ่านไฟล์เป็น base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const newImages = [...maintenanceReceiptImages];
      newImages[index] = imageData;
      setMaintenanceReceiptImages(newImages);
    };
    reader.readAsDataURL(file);

    // Reset input เพื่อให้สามารถเลือกไฟล์เดิมได้อีกครั้ง
    if (maintenanceReceiptFileInputRefs.current[index]) {
      maintenanceReceiptFileInputRefs.current[index]!.value = "";
    }
  };

  const handleReceiptClick = () => {
    setShowReceiptOptions(true);
  };

  const handleReceiptCamera = () => {
    setShowReceiptOptions(false);
    if (category === "fuel") {
      setCameraType("receipt");
    } else if (category === "other") {
      setCameraType("otherReceipt");
    }
    setShowCamera(true);
  };

  const handleReceiptGallery = () => {
    setShowReceiptOptions(false);
    if (category === "fuel") {
      receiptFileInputRef.current?.click();
    } else if (category === "other") {
      otherReceiptFileInputRef.current?.click();
    }
  };

  const handleMaintenanceReceiptClick = (index: number) => {
    setReceiptImageIndex(index);
    setShowReceiptOptions(true);
  };

  const handleMaintenanceReceiptCamera = () => {
    setShowReceiptOptions(false);
    setCameraType("maintenanceReceipt");
    setShowCamera(true);
  };

  const handleMaintenanceReceiptGallery = () => {
    setShowReceiptOptions(false);
    if (receiptImageIndex !== null) {
      maintenanceReceiptFileInputRefs.current[receiptImageIndex]?.click();
    }
    setReceiptImageIndex(null);
  };

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case "fuel":
        return Fuel;
      case "maintenance":
        return Wrench;
      case "other":
        return MoreHorizontal;
    }
  };

  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case "fuel":
        return "น้ำมัน";
      case "maintenance":
        return "เช็คระยะ";
      case "other":
        return "อื่นๆ";
    }
  };

  // Validation function
  const isFormValid = () => {
    // Check amount
    const amountNum = Number.parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return false;
    }

    if (category === "fuel") {
      // Check all fuel-specific fields
      const mileageNum = Number.parseInt(mileage, 10);
      const litersNum = Number.parseFloat(liters);

      return (
        !isNaN(mileageNum) &&
        mileageNum > 0 &&
        !isNaN(litersNum) &&
        litersNum > 0 &&
        paymentType !== null &&
        beforeFillImage !== null &&
        receiptImage !== null
      );
    } else if (category === "other") {
      // Check otherType for "other" category (receipt image is optional)
      return otherType.trim() !== "";
    } else if (category === "maintenance") {
      // Check that at least 1 receipt image is provided
      const hasAtLeastOneImage = maintenanceReceiptImages.some((img) => img !== null);
      return hasAtLeastOneImage;
    }

    return false;
  };

  return (
    <div className="min-h-screen animate-fadeIn p-4 space-y-6 pb-40 bg-[#ccfff2]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">เพิ่มค่าใช้จ่าย</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="text-sm font-black text-gray-700 uppercase mb-4 block">ประเภทค่าใช้จ่าย</label>
          <div className="grid grid-cols-3 gap-3">
            {(["fuel", "maintenance", "other"] as ExpenseCategory[]).map((cat) => {
              const Icon = getCategoryIcon(cat);
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    if (cat !== "other") {
                      setOtherType("");
                      setIsOtherCustom(false);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-all relative ${
                    isSelected ? "border-karabao bg-karabao/10 shadow-sm" : "border-gray-200 bg-white"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-karabao rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  <Icon size={24} className={`mb-2 mx-auto ${isSelected ? "text-karabao" : "text-gray-400"}`} />
                  <p className={`text-xs font-black uppercase ${isSelected ? "text-karabao-dark" : "text-gray-500"}`}>{getCategoryLabel(cat)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Other Type Selection */}
        {category === "other" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="text-sm font-black text-gray-700 uppercase mb-4 block">เลือกประเภท</label>
            <div className="grid grid-cols-3 gap-2">
              {OTHER_TYPES.map((type) => {
                const isSelected = otherType === type || (type === "อื่นๆ" && isOtherCustom);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      if (type === "อื่นๆ") {
                        setIsOtherCustom(true);
                        setOtherType(""); // Clear value to show placeholder
                      } else {
                        setIsOtherCustom(false);
                        setOtherType(type);
                      }
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-black relative ${
                      isSelected ? "border-karabao bg-karabao/10 text-karabao-dark shadow-sm" : "border-gray-200 bg-white text-gray-600"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-karabao rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    {type}
                  </button>
                );
              })}
            </div>
            {isOtherCustom && (
              <input
                type="text"
                value={otherType}
                onChange={(e) => setOtherType(e.target.value)}
                placeholder="ระบุประเภท"
                required
                className="mt-3 w-full p-3 border-2 border-gray-200 rounded-lg focus:border-karabao focus:outline-none text-sm text-gray-900"
              />
            )}
          </div>
        )}

        {/* Fuel-specific fields */}
        {category === "fuel" && (
          <>
            {/* Before Fill Image - ถ่ายรูปเลขไมล์+ระดับน้ำมันคงเหลือ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="text-sm font-black text-gray-700 uppercase mb-3 block">ถ่ายรูปเลขไมล์+ระดับน้ำมันคงเหลือ</label>
              {beforeFillImage ? (
                <div className="relative w-full h-48">
                  <Image
                    src={beforeFillImage}
                    alt="Before fill"
                    fill
                    className="object-cover rounded-xl cursor-pointer"
                    onClick={() => setViewingImage(beforeFillImage)}
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => setBeforeFillImage(null)}
                    className="absolute top-2 right-2 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors z-10"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCameraType("beforeFill");
                    setShowCamera(true);
                  }}
                  className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center gap-2 hover:border-karabao hover:bg-karabao/10 transition-colors"
                >
                  <Camera size={32} className="text-gray-400" />
                  <span className="text-sm font-black text-gray-600">ถ่ายรูปเลขไมล์ก่อนเติมให้เห็นเกจวัดระดับน้ำมัน</span>
                </button>
              )}
            </div>

            {/* Mileage - เลขไมล์ก่อนเติม */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="text-sm font-black text-gray-700 uppercase mb-3 block">เลขไมล์ก่อนเติม (กม.)</label>
              <input
                type="number"
                inputMode="numeric"
                value={mileage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d+$/.test(value)) {
                    setMileage(value);
                  }
                }}
                onBlur={(e) => {
                  const value = Number.parseInt(e.target.value, 10);
                  if (!isNaN(value) && value > 0) {
                    setMileage(value.toString());
                  }
                }}
                placeholder="0"
                step="1"
                min="0"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-karabao focus:outline-none text-lg font-bold text-gray-900"
              />
            </div>

            {/* Payment Type - ประเภทการเติม (เฉพาะ fuel) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="text-sm font-black text-gray-700 uppercase mb-4 block">ประเภทการเติม</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentType("card")}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 relative ${
                    paymentType === "card" ? "border-green-600 bg-green-100 shadow-sm" : "border-gray-200 bg-white"
                  }`}
                >
                  {paymentType === "card" && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  <CreditCard size={20} className={paymentType === "card" ? "text-green-700" : "text-gray-400"} />
                  <span className={`text-sm font-black ${paymentType === "card" ? "text-green-800" : "text-gray-600"}`}>บัตรน้ำมัน</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("cash")}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 relative ${
                    paymentType === "cash" ? "border-green-600 bg-green-100 shadow-sm" : "border-gray-200 bg-white"
                  }`}
                >
                  {paymentType === "cash" && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  <Banknote size={20} className={paymentType === "cash" ? "text-green-700" : "text-gray-400"} />
                  <span className={`text-sm font-black ${paymentType === "cash" ? "text-green-800" : "text-gray-600"}`}>เงินสด</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Amount - จำนวนเงิน */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="text-sm font-black text-gray-700 uppercase mb-3 block">จำนวนเงิน (บาท)</label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                setAmount(value);
              }
            }}
            onBlur={(e) => {
              const value = Number.parseFloat(e.target.value);
              if (!isNaN(value)) {
                setAmount(value.toFixed(2));
              }
            }}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg font-bold text-gray-900"
          />
        </div>

        {/* Liters - จำนวนลิตร (เฉพาะ fuel) */}
        {category === "fuel" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="text-sm font-black text-gray-700 uppercase mb-3 block">จำนวนลิตรที่เติม</label>
            <input
              type="number"
              inputMode="decimal"
              value={liters}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                  setLiters(value);
                }
              }}
              onBlur={(e) => {
                const value = Number.parseFloat(e.target.value);
                if (!isNaN(value) && value > 0) {
                  setLiters(value.toFixed(2));
                }
              }}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg font-bold text-gray-900"
            />
          </div>
        )}

        {/* Receipt Image - บิล/ใบเสร็จ (เฉพาะ fuel) */}
        {category === "fuel" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="text-sm font-black text-gray-700 uppercase mb-3 block">บิล/ใบเสร็จน้ำมัน</label>
            {receiptImage ? (
              <div className="relative w-full h-48">
                <Image
                  src={receiptImage}
                  alt="Receipt"
                  fill
                  className="object-cover rounded-xl cursor-pointer"
                  onClick={() => setViewingImage(receiptImage)}
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setReceiptImage(null)}
                  className="absolute top-2 right-2 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors z-10"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleReceiptClick}
                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center gap-2 hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <FileText size={32} className="text-gray-400" />
                <span className="text-sm font-black text-gray-600">เพิ่มบิล/ใบเสร็จน้ำมัน</span>
              </button>
            )}
          </div>
        )}

        {/* Receipt Images - บิล/ใบเสร็จ (maintenance - 4 images, at least 1 required) */}
        {category === "maintenance" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="text-sm font-black text-gray-700 uppercase mb-3 block">บิล/ใบเสร็จเช็คระยะ (อย่างน้อย 1 ภาพ)</label>
            <div className="grid grid-cols-2 gap-3">
              {maintenanceReceiptImages.map((image, index) => (
                <div key={index} className="relative">
                  {image ? (
                    <div className="relative w-full h-32">
                      <Image
                        src={image}
                        alt={`Receipt ${index + 1}`}
                        fill
                        className="object-cover rounded-xl cursor-pointer"
                        onClick={() => setViewingImage(image)}
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...maintenanceReceiptImages];
                          newImages[index] = null;
                          setMaintenanceReceiptImages(newImages);
                        }}
                        className="absolute top-1 right-1 p-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors z-10"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMaintenanceReceiptClick(index)}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-karabao hover:bg-karabao/10 transition-colors"
                    >
                      <FileText size={20} className="text-gray-400" />
                      <span className="text-xs font-black text-gray-600">รูป {index + 1}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Receipt Image - บิล/ใบเสร็จ (other - 1 image, optional) */}
        {category === "other" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="text-sm font-black text-gray-700 uppercase mb-3 block">บิล/ใบเสร็จ (ไม่บังคับ)</label>
            {otherReceiptImage ? (
              <div className="relative w-full h-48">
                <Image
                  src={otherReceiptImage}
                  alt="Receipt"
                  fill
                  className="object-cover rounded-xl cursor-pointer"
                  onClick={() => setViewingImage(otherReceiptImage)}
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setOtherReceiptImage(null)}
                  className="absolute top-2 right-2 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors z-10"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleReceiptClick}
                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center gap-2 hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <FileText size={32} className="text-gray-400" />
                <span className="text-sm font-black text-gray-600">เพิ่มบิล/ใบเสร็จ</span>
              </button>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="fixed bottom-24 left-4 right-4 z-40">
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`w-full font-black py-5 rounded-xl shadow-xl transition-all border-b-4 flex items-center justify-center gap-2 ${
              isFormValid()
                ? "bg-karabao text-white active:scale-95 border-karabao-dark"
                : "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400"
            }`}
          >
            <Plus size={24} />
            บันทึกค่าใช้จ่าย
          </button>
        </div>
      </form>

      {/* Receipt Options Modal */}
      {showReceiptOptions && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full space-y-3">
            <h3 className="text-sm font-black text-gray-800 uppercase text-center mb-4">เลือกวิธีเพิ่มบิล/ใบเสร็จ</h3>
            <button
              onClick={() => {
                if (category === "maintenance" && receiptImageIndex !== null) {
                  handleMaintenanceReceiptCamera();
                } else {
                  handleReceiptCamera();
                }
              }}
              className="w-full flex items-center justify-center gap-3 p-4 bg-green-600 text-white rounded-xl font-black uppercase active:scale-95 transition-all"
            >
              <Camera size={20} />
              ถ่ายรูป
            </button>
            <button
              onClick={() => {
                if (category === "maintenance" && receiptImageIndex !== null) {
                  handleMaintenanceReceiptGallery();
                } else {
                  handleReceiptGallery();
                }
              }}
              className="w-full flex items-center justify-center gap-3 p-4 bg-karabao text-white rounded-xl font-black uppercase active:scale-95 transition-all"
            >
              <ImageIcon size={20} />
              เลือกจากแกลเลอรี่
            </button>
            <button
              onClick={() => {
                setShowReceiptOptions(false);
                setReceiptImageIndex(null);
              }}
              className="w-full p-3 text-gray-600 rounded-xl font-black uppercase border-2 border-gray-200 active:scale-95 transition-all"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input type="file" ref={receiptFileInputRef} accept="image/*" onChange={handleReceiptFileSelect} className="hidden" />
      <input type="file" ref={otherReceiptFileInputRef} accept="image/*" onChange={handleReceiptFileSelect} className="hidden" />
      {maintenanceReceiptImages.map((_, index) => (
        <input
          key={index}
          type="file"
          ref={(el) => {
            maintenanceReceiptFileInputRefs.current[index] = el;
          }}
          accept="image/*"
          onChange={(e) => handleMaintenanceReceiptFileSelect(e, index)}
          className="hidden"
        />
      ))}

      {/* Camera Capture */}
      {showCamera && cameraType && (
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => {
            setShowCamera(false);
            setCameraType(null);
          }}
          label={
            cameraType === "beforeFill"
              ? "ถ่ายรูปถังน้ำมันก่อนเติม"
              : cameraType === "maintenanceReceipt"
                ? `ถ่ายรูปบิล/ใบเสร็จเช็คระยะ รูป ${(receiptImageIndex ?? 0) + 1}`
                : cameraType === "otherReceipt"
                  ? "ถ่ายรูปบิล/ใบเสร็จ"
                  : "ถ่ายรูปบิล/ใบเสร็จ"
          }
          currentAddress={locationState.currentAddress}
          timestamp={createTimestamp()}
        />
      )}

      {/* Image Viewer */}
      {viewingImage && <ImageViewer imageSrc={viewingImage} onClose={() => setViewingImage(null)} alt="Expense image" />}

      {/* Expense Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-karabao-light to-karabao p-6 text-white relative">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">ตรวจสอบข้อมูล</h2>
                  <p className="text-white/80 text-sm mt-1">กรุณาตรวจสอบข้อมูลก่อนบันทึก</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Category */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getCategoryIcon(category);
                    return (
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon size={24} className="text-white" />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-black">ประเภทค่าใช้จ่าย</p>
                    <p className="text-lg font-black text-gray-800">
                      {getCategoryLabel(category)}
                      {category === "other" && otherType && <span className="text-sm text-gray-600 ml-2">({otherType})</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-black mb-2">จำนวนเงิน</p>
                <p className="text-2xl font-black text-karabao">
                  ฿
                  {Number.parseFloat(amount || "0").toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Fuel-specific details */}
              {category === "fuel" && (
                <>
                  {mileage && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge size={16} className="text-green-500" />
                        <p className="text-xs text-gray-500 uppercase font-black">เลขไมล์ก่อนเติม</p>
                      </div>
                      <p className="text-lg font-black text-gray-800">{Number.parseInt(mileage, 10).toLocaleString("th-TH")} กม.</p>
                    </div>
                  )}

                  {liters && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Fuel size={16} className="text-green-500" />
                        <p className="text-xs text-gray-500 uppercase font-black">จำนวนลิตรที่เติม</p>
                      </div>
                      <p className="text-lg font-black text-gray-800">
                        {Number.parseFloat(liters).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ลิตร
                      </p>
                    </div>
                  )}

                  {paymentType && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-black mb-2">ประเภทการเติม</p>
                      <div className="flex items-center gap-2">
                        {paymentType === "card" ? (
                          <>
                            <CreditCard size={20} className="text-karabao" />
                            <p className="text-lg font-black text-gray-800">บัตรน้ำมัน</p>
                          </>
                        ) : (
                          <>
                            <Banknote size={20} className="text-karabao" />
                            <p className="text-lg font-black text-gray-800">เงินสด</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {(beforeFillImage || receiptImage) && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-black mb-3">รูปภาพ</p>
                      <div className="grid grid-cols-2 gap-3">
                        {beforeFillImage && (
                          <div className="relative w-full h-32">
                            <Image
                              src={beforeFillImage}
                              alt="Before fill"
                              fill
                              className="object-cover rounded-lg cursor-pointer"
                              onClick={() => setViewingImage(beforeFillImage)}
                              unoptimized
                            />
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-black">ถังน้ำมัน</div>
                          </div>
                        )}
                        {receiptImage && (
                          <div className="relative w-full h-32">
                            <Image
                              src={receiptImage}
                              alt="Receipt"
                              fill
                              className="object-cover rounded-lg cursor-pointer"
                              onClick={() => setViewingImage(receiptImage)}
                              unoptimized
                            />
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-black">บิล/ใบเสร็จ</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Maintenance receipt images */}
              {category === "maintenance" && maintenanceReceiptImages.some((img) => img !== null) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase font-black mb-3">รูปภาพใบเสร็จเช็คระยะ</p>
                  <div className="grid grid-cols-2 gap-3">
                    {maintenanceReceiptImages.map((image, index) =>
                      image ? (
                        <div key={index} className="relative w-full h-32">
                          <Image
                            src={image}
                            alt={`Receipt ${index + 1}`}
                            fill
                            className="object-cover rounded-lg cursor-pointer"
                            onClick={() => setViewingImage(image)}
                            unoptimized
                          />
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-black">
                            รูป {index + 1}
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Other receipt image */}
              {category === "other" && otherReceiptImage && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase font-black mb-3">รูปภาพใบเสร็จ</p>
                  <div className="relative w-full h-48">
                    <Image
                      src={otherReceiptImage}
                      alt="Receipt"
                      fill
                      className="object-cover rounded-lg cursor-pointer"
                      onClick={() => setViewingImage(otherReceiptImage)}
                      unoptimized
                    />
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-black">บิล/ใบเสร็จ</div>
                  </div>
                </div>
              )}

              {/* Location */}
              {locationState.currentAddress?.address.formatted && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase font-black mb-2">สถานที่</p>
                  <p className="text-sm font-bold text-gray-800">{locationState.currentAddress.address.formatted}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 space-y-3">
              <button
                onClick={handleConfirmSave}
                className="w-full bg-karabao text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all border-b-4 border-karabao-dark flex items-center justify-center gap-2"
              >
                <CheckCircle size={24} />
                ยืนยันบันทึก
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-full p-3 text-gray-600 rounded-xl font-black uppercase border-2 border-gray-200 active:scale-95 transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddExpensePage;
