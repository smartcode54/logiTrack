import { useState, useEffect } from "react";
import { Expense, FuelExpenseData } from "@/types";
import { createTimestamp } from "@/utils/dateTime";

const STORAGE_KEY = "logitrack_expenses";

// Load expenses from localStorage
const loadExpensesFromStorage = (): Expense[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading expenses from storage:", error);
    return [];
  }
};

// Save expenses to localStorage
const saveExpensesToStorage = (expenses: Expense[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error("Error saving expenses to storage:", error);
  }
};

export const useExpenseState = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadExpensesFromStorage()
  );

  // Sync with localStorage whenever expenses change
  useEffect(() => {
    saveExpensesToStorage(expenses);
  }, [expenses]);

  // Listen for storage events to sync across tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const storedExpenses = loadExpensesFromStorage();
        setExpenses(storedExpenses);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event for same-tab updates
    const handleCustomStorageChange = () => {
      const storedExpenses = loadExpensesFromStorage();
      setExpenses(storedExpenses);
    };

    window.addEventListener("expensesUpdated", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("expensesUpdated", handleCustomStorageChange);
    };
  }, []);

  const addExpense = (
    category: Expense["category"],
    amount: number,
    description: string,
    otherType?: string,
    fuelData?: FuelExpenseData,
    receiptImages?: string[]
  ) => {
    const timestamp = createTimestamp();
    const newExpense: Expense = {
      id: `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      amount,
      description,
      date: timestamp.date,
      time: timestamp.time,
      timestamp: Date.now(),
      ...(otherType && { otherType }),
      ...(fuelData && { fuelData }),
      ...(receiptImages && receiptImages.length > 0 && { receiptImages }),
    };

    setExpenses((prev) => {
      const updated = [newExpense, ...prev];
      // Trigger custom event for same-tab sync
      window.dispatchEvent(new Event("expensesUpdated"));
      return updated;
    });
    return newExpense;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => {
      const updated = prev.filter((exp) => exp.id !== id);
      // Trigger custom event for same-tab sync
      window.dispatchEvent(new Event("expensesUpdated"));
      return updated;
    });
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, exp) => total + exp.amount, 0);
  };

  const getExpensesByCategory = (category: Expense["category"]) => {
    return expenses.filter((exp) => exp.category === category);
  };

  const getTotalByCategory = (category: Expense["category"]) => {
    return getExpensesByCategory(category).reduce(
      (total, exp) => total + exp.amount,
      0
    );
  };

  return {
    expenses,
    addExpense,
    deleteExpense,
    getTotalExpenses,
    getExpensesByCategory,
    getTotalByCategory,
  };
};
