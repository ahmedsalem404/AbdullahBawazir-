import { useState, useEffect } from "react";
import {
  Company,
  CompanyFormValues,
  CompanyCar,
  CompanyCarFormValues,
  CompanyInvoice,
  CompanyInvoiceFormValues,
} from "@/types/workshop";
import {
  getCompaniesService,
  saveCompanyService,
  deleteCompanyService,
  getCompanyCarsService,
  saveCompanyCarService,
  deleteCompanyCarService,
  getCompanyInvoicesService,
  saveCompanyInvoiceService,
  deleteCompanyInvoiceService,
} from "@/services/companies";
import { playSuccessSound, playErrorSound } from "@/components/workshop/constants";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [cars, setCars] = useState<CompanyCar[]>([]);
  const [selectedCar, setSelectedCar] = useState<CompanyCar | null>(null);
  const [invoices, setInvoices] = useState<CompanyInvoice[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CompanyCar | null>(null);
  const [deleteTargetCar, setDeleteTargetCar] = useState<CompanyCar | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<CompanyInvoice | null>(null);
  const [deleteTargetInvoice, setDeleteTargetInvoice] = useState<CompanyInvoice | null>(null);
  const [deleteTargetCompany, setDeleteTargetCompany] = useState<Company | null>(null);

  // Current sub-view: "companies" | "cars" | "invoices"
  const [currentSubView, setCurrentSubView] = useState<"companies" | "cars" | "invoices">("companies");

  // Filters state for invoices
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedAccounted, setSelectedAccounted] = useState<string>("all");
  const [selectedSent, setSelectedSent] = useState<string>("all");

  // Show Toast helper
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Companies
  const loadCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCompaniesService();
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || "فشل جلب قائمة الشركات");
      showToast(err.message || "فشل جلب قائمة الشركات", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Cars
  const loadCars = async (companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCompanyCarsService(companyId);
      setCars(data);
    } catch (err: any) {
      setError(err.message || "فشل جلب سيارات الشركة");
      showToast(err.message || "فشل جلب سيارات الشركة", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Invoices
  const loadInvoices = async (
    carId: string,
    month: string = "all",
    year: string = "all",
    accounted: string = "all",
    sent: string = "all"
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCompanyInvoicesService(carId, month, year, accounted, sent);
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || "فشل جلب فواتير صيانة السيارة");
      showToast(err.message || "فشل جلب فواتير صيانة السيارة", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Save Company
  const saveCompany = async (values: CompanyFormValues) => {
    setIsSaving(true);
    try {
      await saveCompanyService(values, editingCompany?.id);
      showToast(editingCompany ? "تم تحديث بيانات الشركة بنجاح" : "تم إضافة الشركة بنجاح", "success");
      playSuccessSound();
      setIsCompanyModalOpen(false);
      setEditingCompany(null);
      loadCompanies();
    } catch (err: any) {
      showToast(err.message || "فشل حفظ بيانات الشركة", "error");
      playErrorSound();
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Company
  const deleteCompany = async (id: string) => {
    try {
      await deleteCompanyService(id);
      showToast("تم حذف الشركة بنجاح", "success");
      playSuccessSound();
      setDeleteTargetCompany(null);
      loadCompanies();
    } catch (err: any) {
      showToast(err.message || "فشل حذف الشركة", "error");
      playErrorSound();
    }
  };

  // Save Car
  const saveCar = async (values: Omit<CompanyCarFormValues, "company_id">) => {
    if (!selectedCompany) return;
    setIsSaving(true);
    try {
      await saveCompanyCarService(
        {
          ...values,
          company_id: selectedCompany.id,
        },
        editingCar?.id
      );
      showToast(editingCar ? "تم تحديث بيانات السيارة بنجاح" : "تم إضافة السيارة بنجاح", "success");
      playSuccessSound();
      setIsCarModalOpen(false);
      setEditingCar(null);
      loadCars(selectedCompany.id);
    } catch (err: any) {
      showToast(err.message || "فشل حفظ السيارة", "error");
      playErrorSound();
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Car
  const deleteCar = async (id: string) => {
    if (!selectedCompany) return;
    try {
      await deleteCompanyCarService(id);
      showToast("تم حذف السيارة بنجاح", "success");
      playSuccessSound();
      setDeleteTargetCar(null);
      loadCars(selectedCompany.id);
    } catch (err: any) {
      showToast(err.message || "فشل حذف السيارة", "error");
      playErrorSound();
    }
  };

  // Save Invoice
  const saveInvoice = async (values: CompanyInvoiceFormValues) => {
    if (!selectedCar) return;
    setIsSaving(true);
    try {
      await saveCompanyInvoiceService(
        {
          ...values,
          car_id: selectedCar.id,
        },
        editingInvoice?.id
      );
      showToast(editingInvoice ? "تم تحديث الفاتورة بنجاح" : "تم تسجيل الفاتورة بنجاح", "success");
      playSuccessSound();
      setIsInvoiceModalOpen(false);
      setEditingInvoice(null);
      loadInvoices(selectedCar.id, selectedMonth, selectedYear, selectedAccounted, selectedSent);
    } catch (err: any) {
      showToast(err.message || "فشل حفظ الفاتورة", "error");
      playErrorSound();
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Invoice
  const deleteInvoice = async (id: string) => {
    if (!selectedCar) return;
    try {
      await deleteCompanyInvoiceService(id);
      showToast("تم حذف الفاتورة بنجاح", "success");
      playSuccessSound();
      setDeleteTargetInvoice(null);
      loadInvoices(selectedCar.id, selectedMonth, selectedYear, selectedAccounted, selectedSent);
    } catch (err: any) {
      showToast(err.message || "فشل حذف الفاتورة", "error");
      playErrorSound();
    }
  };

  // Load companies list on initial hook use
  useEffect(() => {
    loadCompanies();
  }, []);

  // Re-fetch invoices when car or any of the filters change
  useEffect(() => {
    if (selectedCar) {
      loadInvoices(selectedCar.id, selectedMonth, selectedYear, selectedAccounted, selectedSent);
    }
  }, [selectedCar?.id, selectedMonth, selectedYear, selectedAccounted, selectedSent]);

  // Handle drilling down to company details
  const viewCompanyCars = (company: Company) => {
    setSelectedCompany(company);
    loadCars(company.id);
    setCurrentSubView("cars");
  };

  // Handle drilling down to car invoices
  const viewCarInvoices = (car: CompanyCar) => {
    setSelectedCar(car);
    setSelectedMonth("all");
    setSelectedYear("all");
    setSelectedAccounted("all");
    setSelectedSent("all");
    setCurrentSubView("invoices");
  };

  // Handle navigation back
  const navigateBack = () => {
    if (currentSubView === "invoices" && selectedCompany) {
      setSelectedCar(null);
      setCurrentSubView("cars");
    } else if (currentSubView === "cars") {
      setSelectedCompany(null);
      setCurrentSubView("companies");
    }
  };

  return {
    companies,
    selectedCompany,
    cars,
    selectedCar,
    invoices,
    isLoading,
    isSaving,
    error,
    toast,
    currentSubView,
    isCompanyModalOpen,
    editingCompany,
    isCarModalOpen,
    editingCar,
    deleteTargetCar,
    isInvoiceModalOpen,
    editingInvoice,
    deleteTargetInvoice,
    deleteTargetCompany,
    setIsCompanyModalOpen,
    setEditingCompany,
    setIsCarModalOpen,
    setEditingCar,
    setDeleteTargetCar,
    setIsInvoiceModalOpen,
    setEditingInvoice,
    setDeleteTargetInvoice,
    setDeleteTargetCompany,
    loadCompanies,
    saveCompany,
    deleteCompany,
    saveCar,
    deleteCar,
    saveInvoice,
    deleteInvoice,
    viewCompanyCars,
    viewCarInvoices,
    navigateBack,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedAccounted,
    setSelectedAccounted,
    selectedSent,
    setSelectedSent,
  };
}
