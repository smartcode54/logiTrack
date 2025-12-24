"use client";

import { useState } from "react";
import { Plus, Fuel, Wrench, MoreHorizontal, X } from "lucide-react";
import { ExpenseCategory } from "@/types";

interface ExpenseFormProps {
  isOpen: boolean;
  onAddExpense: (
    category: ExpenseCategory,
    amount: number,
    description: string,
    otherType?: string
  ) => void;
  onClose?: () => void;
}

const OTHER_TYPES = ["ยาง", "ล้างรถ", "อื่นๆ"];

export const ExpenseForm = ({
  isOpen,
  onAddExpense,
  onClose,
}: ExpenseFormProps) => {
  const [category, setCategory] = useState<ExpenseCategory>("fuel");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [otherType, setOtherType] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }

    if (!description.trim()) {
      alert("กรุณากรอกรายละเอียด");
      return;
    }

    if (category === "other" && !otherType) {
      alert("กรุณาเลือกประเภทค่าใช้จ่ายอื่นๆ");
      return;
    }

    onAddExpense(
      category,
      amountNum,
      description.trim(),
      category === "other" ? otherType : undefined
    );

    // Reset form
    setAmount("");
    setDescription("");
    setOtherType("");
    if (onClose) onClose();
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
        return "ซ่อมบำรุง";
      case "other":
        return "อื่นๆ";
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-6 space-y-6 animate-slideUp">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800">เพิ่มค่าใช้จ่าย</h2>
          <button
            onClick={() => {
              if (onClose) onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Selection */}
          <div>
            <label className="text-sm font-black text-gray-700 uppercase mb-3 block">
              ประเภทค่าใช้จ่าย
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["fuel", "maintenance", "other"] as ExpenseCategory[]).map(
                (cat) => {
                  const Icon = getCategoryIcon(cat);
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                        if (cat !== "other") setOtherType("");
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-karabao bg-karabao/10"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <Icon
                        size={24}
                        className={`mb-2 mx-auto ${
                          isSelected ? "text-karabao" : "text-gray-400"
                        }`}
                      />
                      <p
                        className={`text-xs font-black uppercase ${
                          isSelected ? "text-karabao" : "text-gray-500"
                        }`}
                      >
                        {getCategoryLabel(cat)}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Other Type Selection */}
          {category === "other" && (
            <div>
              <label className="text-sm font-black text-gray-700 uppercase mb-3 block">
                เลือกประเภท
              </label>
              <div className="grid grid-cols-3 gap-2">
                {OTHER_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOtherType(type)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-black ${
                      otherType === type
                        ? "border-karabao bg-karabao/10 text-karabao"
                        : "border-gray-200 bg-white text-gray-600"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {otherType === "อื่นๆ" && (
                <input
                  type="text"
                  value={otherType}
                  onChange={(e) => setOtherType(e.target.value)}
                  placeholder="ระบุประเภท"
                  className="mt-3 w-full p-3 border-2 border-gray-200 rounded-lg focus:border-karabao focus:outline-none text-sm"
                />
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="text-sm font-black text-gray-700 uppercase mb-2 block">
              จำนวนเงิน (บาท)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-karabao focus:outline-none text-lg font-bold"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-black text-gray-700 uppercase mb-2 block">
              รายละเอียด
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุรายละเอียดค่าใช้จ่าย..."
              rows={3}
              required
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-karabao focus:outline-none resize-none text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-karabao text-white font-black py-4 rounded-xl shadow-xl active:scale-95 transition-all border-b-4 border-karabao-dark flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            บันทึกค่าใช้จ่าย
          </button>
        </form>
      </div>
    </div>
  );
};

