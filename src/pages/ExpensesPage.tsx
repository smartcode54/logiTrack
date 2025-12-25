"use client";

import { ExpenseCard, ExpenseSummary } from "@/components/expenses";
import { useExpenseState } from "@/hooks/useExpenseState";
import { Receipt } from "lucide-react";
import { useEffect } from "react";

interface ExpensesPageProps {
  onAddExpense: () => void;
}

export const ExpensesPage = ({ onAddExpense }: ExpensesPageProps) => {
  const { expenses, deleteExpense, getTotalExpenses, getTotalByCategory } = useExpenseState();

  // Force reload when component becomes visible (when navigating back to this page)
  useEffect(() => {
    // Trigger reload by dispatching custom event
    window.dispatchEvent(new Event("expensesUpdated"));
  }, []);

  const totalFuel = getTotalByCategory("fuel");
  const totalMaintenance = getTotalByCategory("maintenance");
  const totalOther = getTotalByCategory("other");
  const totalAll = getTotalExpenses();

  // Group expenses by date
  const groupedExpenses = expenses.reduce(
    (acc, expense) => {
      const date = expense.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(expense);
      return acc;
    },
    {} as Record<string, typeof expenses>
  );

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => {
    // Parse dates for sorting (format: day/month/year)
    const [dayA, monthA, yearA] = a.split("/").map(Number);
    const [dayB, monthB, yearB] = b.split("/").map(Number);
    const dateA = new Date(yearA - 543, monthA - 1, dayA); // Convert from พ.ศ. to ค.ศ.
    const dateB = new Date(yearB - 543, monthB - 1, dayB);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="min-h-screen animate-fadeIn p-4 space-y-6 pb-40 bg-[#ccfff2]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-white tracking-tight">บันทึกค่าใช้จ่าย</h2>
        {expenses.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Receipt size={18} />
            <span className="font-bold">{expenses.length} รายการ</span>
          </div>
        )}
      </div>

      {/* Summary */}
      {expenses.length > 0 && (
        <ExpenseSummary totalFuel={totalFuel} totalMaintenance={totalMaintenance} totalOther={totalOther} totalAll={totalAll} />
      )}

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
          <Receipt size={48} className="text-gray-300" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">ยังไม่มีรายการค่าใช้จ่าย</p>
          <p className="text-xs text-gray-400">กดปุ่ม + เพื่อเพิ่มค่าใช้จ่าย</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-gray-200"></div>
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{date}</span>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>
              <div className="space-y-3">
                {groupedExpenses[date].map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} onDelete={deleteExpense} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={onAddExpense}
        className="fixed bottom-24 right-4 z-50 w-16 h-16 bg-karabao text-white rounded-full shadow-xl flex items-center justify-center hover:bg-karabao-dark active:scale-95 transition-all border-b-4 border-karabao-dark"
      >
        <Receipt size={24} />
      </button>
    </div>
  );
};

export default ExpensesPage;
