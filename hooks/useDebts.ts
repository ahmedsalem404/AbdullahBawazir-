import { useState, useEffect, useMemo, useCallback } from "react";
import { Debtor, DebtTransaction, DebtCurrency, DebtTxType } from "@/types/workshop";
import {
  getDebtorsService,
  saveDebtorService,
  deleteDebtorService,
  getDebtTransactionsService,
  saveDebtTransactionService,
} from "@/services/debts";

export function useDebts() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [transactions, setTransactions] = useState<DebtTransaction[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<DebtCurrency>("SAR");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [isDebtorModalOpen, setIsDebtorModalOpen] = useState(false);
  const [editingDebtor, setEditingDebtor] = useState<Debtor | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<DebtTxType>("LEH");

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch Debtors
  const loadDebtors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDebtorsService();
      setDebtors(data);
    } catch (err: any) {
      setError(err.message || "فشل جلب قائمة المديونين");
      showToast(err.message || "فشل جلب قائمة المديونين", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Fetch Transactions for selected debtor
  const loadTransactions = useCallback(async (debtorId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDebtTransactionsService(debtorId);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || "فشل جلب كشف حساب المديون");
      showToast(err.message || "فشل جلب كشف حساب المديون", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Load debtors on init
  useEffect(() => {
    loadDebtors();
  }, [loadDebtors]);

  // Reload transactions when selectedDebtor changes
  useEffect(() => {
    if (selectedDebtor) {
      loadTransactions(selectedDebtor.id);
    } else {
      setTransactions([]);
    }
  }, [selectedDebtor, loadTransactions]);

  // Add/Edit Debtor
  const handleSaveDebtor = async (values: { name: string; phone?: string | null; address?: string | null }) => {
    setIsSaving(true);
    try {
      const saved = await saveDebtorService(values, editingDebtor?.id);
      showToast(editingDebtor ? "تم تعديل المديون بنجاح" : "تم إضافة المديون بنجاح", "success");
      setIsDebtorModalOpen(false);
      setEditingDebtor(null);
      await loadDebtors();
      if (selectedDebtor && selectedDebtor.id === saved.id) {
        setSelectedDebtor(saved);
      }
    } catch (err: any) {
      showToast(err.message || "فشل حفظ المديون", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Debtor
  const handleDeleteDebtor = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteDebtorService(id);
      showToast("تم حذف المديون بنجاح", "success");
      if (selectedDebtor?.id === id) {
        setSelectedDebtor(null);
      }
      await loadDebtors();
    } catch (err: any) {
      showToast(err.message || "فشل حذف المديون", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Add Transaction
  const handleAddTransaction = async (amount: number, details: string | null) => {
    if (!selectedDebtor) return;
    setIsSaving(true);
    try {
      await saveDebtTransactionService({
        debtor_id: selectedDebtor.id,
        type: txModalType,
        amount,
        currency: selectedCurrency,
        details,
      });
      showToast("تم تسجيل الحركة المالية بنجاح", "success");
      setIsTxModalOpen(false);
      await loadTransactions(selectedDebtor.id);
    } catch (err: any) {
      showToast(err.message || "فشل تسجيل الحركة المالية", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered transactions for the active currency
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => t.currency === selectedCurrency);
  }, [transactions, selectedCurrency]);

  // Math calculator (العقل الحسابي)
  const netBalance = useMemo(() => {
    let lehSum = 0;
    let alayhSum = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === "LEH") {
        lehSum += t.amount;
      } else if (t.type === "ALAYH") {
        alayhSum += t.amount;
      }
    });
    return lehSum - alayhSum;
  }, [filteredTransactions]);

  // Balance status message
  const balanceStatus = useMemo(() => {
    const currencyLabel = selectedCurrency === "YER" ? "يمني" : selectedCurrency === "SAR" ? "سعودي" : "دولار";
    if (netBalance > 0) {
      return `له: ${netBalance.toLocaleString("ar-SA")} ${currencyLabel}`;
    } else if (netBalance < 0) {
      return `عليه مديونية: ${Math.abs(netBalance).toLocaleString("ar-SA")} ${currencyLabel}`;
    }
    return `الحساب متزن (0) ${currencyLabel}`;
  }, [netBalance, selectedCurrency]);

  return {
    debtors,
    selectedDebtor,
    setSelectedDebtor,
    transactions: filteredTransactions,
    selectedCurrency,
    setSelectedCurrency,
    isLoading,
    isSaving,
    error,
    toast,
    isDebtorModalOpen,
    setIsDebtorModalOpen,
    editingDebtor,
    setEditingDebtor,
    isTxModalOpen,
    setIsTxModalOpen,
    txModalType,
    setTxModalType,
    handleSaveDebtor,
    handleDeleteDebtor,
    handleAddTransaction,
    netBalance,
    balanceStatus,
  };
}
