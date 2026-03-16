import { useAuthStore } from "@/src/features/auth/authStore";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "./transactionsService";
import { CreateTransactionInput, Transaction } from "./types";

export const useTransactions = () => {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const items = await listTransactions(userId);
      setTransactions(items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load transactions.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addTransaction = useCallback(
    async (payload: CreateTransactionInput) => {
      if (!userId) {
        throw new Error("Please log in again.");
      }

      setSaving(true);
      try {
        const created = await createTransaction(userId, payload);
        setTransactions((prev) => [created, ...prev]);
        return created;
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const editTransaction = useCallback(async (transactionId: string, payload: Partial<CreateTransactionInput>) => {
    setSaving(true);
    try {
      const updated = await updateTransaction(transactionId, payload);
      setTransactions((prev) => prev.map((item) => (item.id === transactionId ? updated : item)));
      return updated;
    } finally {
      setSaving(false);
    }
  }, []);

  const removeTransaction = useCallback(async (transactionId: string) => {
    setSaving(true);
    try {
      await deleteTransaction(transactionId);
      setTransactions((prev) => prev.filter((item) => item.id !== transactionId));
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
    };
  }, [transactions]);

  return {
    transactions,
    loading,
    saving,
    error,
    summary,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  };
};
