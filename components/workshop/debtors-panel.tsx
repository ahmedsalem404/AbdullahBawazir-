"use client";

import React, { useState } from "react";
import { useDebts } from "@/hooks/useDebts";
import { Debtor, DebtTransaction, DebtCurrency, DebtTxType } from "@/types/workshop";
import {
  Users,
  UserPlus,
  Scale,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit,
  DollarSign,
  Search,
  MapPin,
  Phone,
  FileText,
  X,
  Sparkles,
  Calendar
} from "lucide-react";
import { formatDate } from "./constants";

export function DebtorsPanel() {
  const {
    debtors,
    selectedDebtor,
    setSelectedDebtor,
    transactions,
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
  } = useDebts();

  // Search query state
  const [searchQuery, setSearchQuery] = useState("");

  // Debtor form fields
  const [debtorForm, setDebtorForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Transaction form fields
  const [txForm, setTxForm] = useState({
    amount: "",
    details: "",
  });

  // Filtered debtor list
  const filteredDebtors = debtors.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.phone && d.phone.includes(searchQuery)) ||
    (d.address && d.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openAddDebtorModal = () => {
    setEditingDebtor(null);
    setDebtorForm({ name: "", phone: "", address: "" });
    setIsDebtorModalOpen(true);
  };

  const openEditDebtorModal = (debtor: Debtor, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDebtor(debtor);
    setDebtorForm({
      name: debtor.name,
      phone: debtor.phone || "",
      address: debtor.address || "",
    });
    setIsDebtorModalOpen(true);
  };

  const submitDebtorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtorForm.name.trim()) return;
    handleSaveDebtor({
      name: debtorForm.name,
      phone: debtorForm.phone || null,
      address: debtorForm.address || null,
    });
  };

  const openTxModal = (type: DebtTxType) => {
    setTxModalType(type);
    setTxForm({ amount: "", details: "" });
    setIsTxModalOpen(true);
  };

  const submitTxForm = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    handleAddTransaction(amountNum, txForm.details || null);
  };

  return (
    <div className="w-full space-y-6 text-right animate-fadeInUp" dir="rtl">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Toast Notifications */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[100] flex items-center gap-3 rounded-2xl px-5 py-4 text-white shadow-2xl transition-all duration-300 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <span className="font-extrabold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Main Header / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          {selectedDebtor ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDebtor(null)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                <ArrowRight size={16} />
                <span>العودة للمديونين</span>
              </button>
              <span className="text-slate-300">/</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Scale className="text-rose-500" size={24} />
                <span>كشف حساب: {selectedDebtor.name}</span>
              </h1>
            </div>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <Scale className="text-rose-600" size={28} />
              <span>نظام المديونيات والحسابات الخارجية</span>
            </h1>
          )}
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {selectedDebtor
              ? "متابعة الحركات المالية، الدائن والمدين وتحديث تفاصيل الحساب."
              : "إدارة حسابات الدائنين والمدينين وفصل العملات وإدخال الحركات."}
          </p>
        </div>

        {!selectedDebtor && (
          <button
            onClick={openAddDebtorModal}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg transition-all duration-300 hover:bg-emerald-700 hover:shadow-emerald-600/10 active:scale-95 cursor-pointer"
          >
            <UserPlus size={18} />
            <span>إضافة اسم مديون جديد</span>
          </button>
        )}
      </div>

      {/* VIEW 1: Debtors List */}
      {!selectedDebtor ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 pointer-events-none">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="ابحث باسم المديون، رقم الهاتف أو العنوان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/80 bg-white py-3 pl-4 pr-11 text-sm font-bold text-slate-800 placeholder-slate-400 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all text-right"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-36 rounded-3xl bg-slate-50 border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredDebtors.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Users className="text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-700">لا يوجد مديونين مسجلين</h3>
              <p className="text-slate-400 text-xs mt-1">يمكنك البدء بإضافة أول اسم باستخدام الزر بالأعلى.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDebtors.map((debtor) => (
                <div
                  key={debtor.id}
                  onClick={() => setSelectedDebtor(debtor)}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:border-rose-200 hover:shadow-md hover:shadow-rose-500/5 active:scale-98 cursor-pointer overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
                        <Users size={20} />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => openEditDebtorModal(debtor, e)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                          title="تعديل"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`هل أنت متأكد من حذف حساب ${debtor.name} وجميع عملياته بشكل نهائي؟`)) {
                              handleDeleteDebtor(debtor.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-rose-600 transition-colors">
                        {debtor.name}
                      </h3>
                      <div className="flex flex-col gap-1 mt-2 text-xs font-semibold text-slate-500">
                        {debtor.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-400" />
                            <span dir="ltr">{debtor.phone}</span>
                          </div>
                        )}
                        {debtor.address && (
                          <div className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-slate-400" />
                            <span>{debtor.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1 text-rose-600 font-extrabold">
                      عرض كشف الحساب
                      <span className="transition-transform group-hover:translate-x-[-4px]">←</span>
                    </span>
                    <span>مسجل في: {formatDate(debtor.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: Ledger Detail View */
        <div className="space-y-6">
          {/* Top Bar Actions / Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-sm">
            {/* Currency Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl w-fit">
              {(["YER", "SAR", "USD"] as DebtCurrency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setSelectedCurrency(cur)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    selectedCurrency === cur
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {cur === "YER" ? "ريال يمني" : cur === "SAR" ? "ريال سعودي" : "دولار أمريكي"}
                </button>
              ))}
            </div>

            {/* LEH / ALAYH Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => openTxModal("LEH")}
                className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <TrendingUp size={16} />
                <span>له (مستحق)</span>
              </button>
              <button
                onClick={() => openTxModal("ALAYH")}
                className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <TrendingDown size={16} />
                <span>عليه (مديونية)</span>
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full border-collapse text-right text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold">
                    <th className="px-6 py-4">له (دائن)</th>
                    <th className="px-6 py-4">عليه (مدين)</th>
                    <th className="px-6 py-4">التفاصيل / البيان</th>
                    <th className="px-6 py-4">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        جاري تحميل العمليات...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        لا توجد عمليات مسجلة بالعملة المحددة حالياً.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* له */}
                        <td className="px-6 py-4">
                          {tx.type === "LEH" ? (
                            <span className="text-emerald-600 font-black">
                              {tx.amount.toLocaleString()} {tx.currency === "YER" ? "ر.ي" : tx.currency === "SAR" ? "ر.س" : "$"}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        {/* عليه */}
                        <td className="px-6 py-4">
                          {tx.type === "ALAYH" ? (
                            <span className="text-rose-600 font-black">
                              {tx.amount.toLocaleString()} {tx.currency === "YER" ? "ر.ي" : tx.currency === "SAR" ? "ر.س" : "$"}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        {/* التفاصيل */}
                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={tx.details || ""}>
                          {tx.details || <span className="text-slate-300">بدون تفاصيل</span>}
                        </td>
                        {/* التاريخ */}
                        <td className="px-6 py-4 text-slate-400 font-semibold text-xs flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-300" />
                          <span>{formatDate(tx.created_at)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Balance Calculator Box (المربع السفلي المحسوب) */}
          <div className="flex items-center justify-between gap-4 p-5 rounded-3xl border shadow-sm transition-all duration-300 bg-white border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner ${
                  netBalance > 0
                    ? "bg-emerald-50 text-emerald-600"
                    : netBalance < 0
                    ? "bg-rose-50 text-rose-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-extrabold">الحسبة الصافية الدقيقة للمديونية</p>
                <h4
                  className={`text-lg sm:text-xl font-black mt-0.5 ${
                    netBalance > 0 ? "text-emerald-600" : netBalance < 0 ? "text-rose-600" : "text-slate-600"
                  }`}
                >
                  {balanceStatus}
                </h4>
              </div>
            </div>
            <div className="text-slate-400 text-xs font-semibold hidden sm:block">
              * الصافي = إجمالي المبالغ المستحقة (له) ناقص إجمالي المديونيات (عليه) بالعملة المختارة.
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Add/Edit Debtor Modal */}
      {isDebtorModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDebtorModalOpen(false);
          }}
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 py-6 backdrop-blur-md cursor-pointer"
        >
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 text-right animate-scale-in cursor-default space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-800">
                {editingDebtor ? "تعديل بيانات مديون" : "تسجيل مديون جديد"}
              </h3>
              <button
                onClick={() => setIsDebtorModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitDebtorForm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 block">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف أحمد الصالح"
                  value={debtorForm.name}
                  onChange={(e) => setDebtorForm({ ...debtorForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 block">رقم الهاتف (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: 777123456"
                  value={debtorForm.phone}
                  onChange={(e) => setDebtorForm({ ...debtorForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all text-right"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 block">عنوان السكن / المنطقة (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: المنصورة، خلف البريد"
                  value={debtorForm.address}
                  onChange={(e) => setDebtorForm({ ...debtorForm, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all text-right"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3 font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? "جاري الحفظ..." : "حفظ البيانات"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Transaction Modal */}
      {isTxModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTxModalOpen(false);
          }}
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 py-6 backdrop-blur-md cursor-pointer"
        >
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 text-right animate-scale-in cursor-default space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                {txModalType === "LEH" ? (
                  <TrendingUp className="text-emerald-600" size={20} />
                ) : (
                  <TrendingDown className="text-rose-600" size={20} />
                )}
                <span>تسجيل حركة: {txModalType === "LEH" ? "مستحق (له)" : "مديونية (عليه)"}</span>
              </h3>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitTxForm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 block">العملة الحالية</label>
                <div className="bg-slate-50 border border-slate-150 px-4 py-3 rounded-xl font-black text-slate-700 text-sm">
                  {selectedCurrency === "YER" ? "ريال يمني" : selectedCurrency === "SAR" ? "ريال سعودي" : "دولار أمريكي"}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 block">المبلغ المطلوب *</label>
                <input
                  type="number"
                  required
                  step="any"
                  min="0.01"
                  placeholder="أدخل قيمة المبلغ..."
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 block">تفاصيل الحركة (البيان)</label>
                <textarea
                  placeholder="أدخل سبب أو تفاصيل هذه العملية المالية..."
                  value={txForm.details}
                  onChange={(e) => setTxForm({ ...txForm, details: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all text-right"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className={`w-full text-white rounded-2xl py-3 font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
                  txModalType === "LEH" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isSaving ? "جاري التسجيل..." : "تسجيل الحركة المالية"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
