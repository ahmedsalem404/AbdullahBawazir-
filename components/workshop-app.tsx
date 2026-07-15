"use client";

import { useAuth } from "@/hooks/useAuth";
import { useWorkshop } from "@/hooks/useWorkshop";
import { todayInputValue } from "./workshop/constants";
import { FinancialBreakdownCards } from "./workshop/ui-elements";
import { LoginScreen } from "./workshop/login-screen";
import { AppHeader } from "./workshop/app-header";
import { DashboardToolbar } from "./workshop/dashboard-toolbar";
import { CustomersGrid } from "./workshop/customers-grid";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import type { Company, CompanyCar, CompanyInvoice, Engineer } from "@/types/workshop";

// هيكل الانتظار لوحة Apple-style Skeleton Loader
function PanelSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse select-none" dir="rtl">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
        <div className="h-9 w-64 bg-slate-200 rounded-xl" />
        <div className="h-4 w-96 bg-slate-100 rounded-lg mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="col-span-2 h-72 bg-slate-100 rounded-[2rem] border border-slate-200/50" />
        <div className="h-72 bg-slate-100 rounded-[2rem] border border-slate-200/50" />
      </div>
      <div className="space-y-4 pt-4">
        <div className="h-14 w-full bg-slate-100 rounded-2xl" />
        <div className="h-14 w-full bg-slate-100 rounded-2xl" />
        <div className="h-14 w-full bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}

// تحميل ديناميكي للوحات مع شاشة الانتظار
const EngineersPanel = dynamic(
  () => import("./workshop/engineers-panel").then((mod) => mod.EngineersPanel),
  { loading: () => <PanelSkeleton /> }
);

const UsersPanel = dynamic(
  () => import("./workshop/users-panel").then((mod) => mod.UsersPanel),
  { loading: () => <PanelSkeleton /> }
);

const SystemPanel = dynamic(
  () => import("./workshop/system-panel").then((mod) => mod.SystemPanel),
  { loading: () => <PanelSkeleton /> }
);

const DashboardPanel = dynamic(
  () => import("./workshop/dashboard-panel").then((mod) => mod.DashboardPanel),
  { loading: () => <PanelSkeleton /> }
);

const CompaniesPanel = dynamic(
  () => import("./workshop/companies-panel").then((mod) => mod.CompaniesPanel),
  { loading: () => <PanelSkeleton /> }
);

const DebtorsPanel = dynamic(
  () => import("./workshop/debtors-panel").then((mod) => mod.DebtorsPanel),
  { loading: () => <PanelSkeleton /> }
);

// تحميل ديناميكي للنوافذ المنبثقة لتوفير حجم الحزمة الأولي
const CustomerModal = dynamic(
  () => import("./workshop/modals").then((mod) => mod.CustomerModal)
);
const EngineerModal = dynamic(
  () => import("./workshop/modals").then((mod) => mod.EngineerModal)
);
const InvoiceModal = dynamic(
  () => import("./workshop/modals").then((mod) => mod.InvoiceModal)
);
const ConfirmModal = dynamic(
  () => import("./workshop/modals").then((mod) => mod.ConfirmModal)
);
const DailyReportModal = dynamic(
  () => import("./workshop/modals").then((mod) => mod.DailyReportModal)
);
const MonthlyReportModal = dynamic(
  () => import("./workshop/modals").then((mod) => mod.MonthlyReportModal)
);
const AttendanceModal = dynamic(
  () => import("./workshop/attendance-modal").then((mod) => mod.AttendanceModal)
);
const CompanyInvoiceModal = dynamic(
  () => import("./workshop/company-invoice-modal").then((mod) => mod.CompanyInvoiceModal),
  { ssr: false }
);
const BuySellReportModal = dynamic(
  () => import("./workshop/BuySellReportModal").then((mod) => mod.BuySellReportModal),
  { ssr: false }
);
const RegularReportModal = dynamic(
  () => import("./workshop/RegularReportModal").then((mod) => mod.RegularReportModal),
  { ssr: false }
);
const BackupReminderModal = dynamic(
  () => import("./workshop/BackupReminderModal").then((mod) => mod.BackupReminderModal),
  { ssr: false }
);

/**
 * @component WorkshopApp
 * @description المكون الرئيسي لإدارة تطبيق الورشة (Main Orchestrator Component).
 * تم تبسيطه ليكون مكوناً نقياً يعتمد على الخطافات المخصصة (Hooks) لإدارة الحالات والتواصل مع الخدمات.
 */
export function WorkshopApp() {
  const { profile, authError, login, logout, checkSession } = useAuth();

  const {
    customers,
    engineers,
    totalRows,
    financialBreakdown,
    activeView,
    dateFilter,
    search,
    page,
    isFormOpen,
    isEngineerFormOpen,
    editingCustomer,
    invoiceCustomer,
    deleteTarget,
    deleteTargetEngineer,
    isPending,
    isManager,
    isSuperAdmin,
    setActiveView,
    setIsFormOpen,
    setIsEngineerFormOpen,
    setEditingCustomer,
    setInvoiceCustomer,
    setDeleteTarget,
    setDeleteTargetEngineer,
    saveCustomer,
    confirmDeleteCustomer,
    saveEngineer,
    deleteEngineer,
    handlePageChange,
    handleDateChange,
    handleSearchChange,
    toast,
    isMonthlyReportOpen,
    setIsMonthlyReportOpen,
    monthlyReportData,
    setMonthlyReportData,
    isMonthlyReportPending,
    fetchDailyReportCustomers,
    loadMonthlyReport,
    onlyUnderWork,
    handleOnlyUnderWorkToggle,
  } = useWorkshop({ profile, onLogout: logout });

  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isBuySellReportOpen, setIsBuySellReportOpen] = useState(false);
  const [isRegularReportOpen, setIsRegularReportOpen] = useState(false);
  const [editingEngineer, setEditingEngineer] = useState<Engineer | null>(null);
  const [b2bInvoiceToPreview, setB2bInvoiceToPreview] = useState<{
    invoice: CompanyInvoice;
    company: Company;
    car: CompanyCar;
  } | null>(null);

  // Backup Reminder Alert state for SUPER_ADMIN
  const [hasSkippedBackup, setHasSkippedBackup] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("backup_reminder_skipped") === "true";
    }
    return false;
  });

  const shouldShowBackupReminder = useMemo(() => {
    if (!profile || profile.role !== "SUPER_ADMIN" || hasSkippedBackup) return false;
    if (!profile.last_backup_date) return true; // Never backed up
    const lastBackupTime = new Date(profile.last_backup_date).getTime();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    return (Date.now() - lastBackupTime) > ninetyDaysMs;
  }, [profile, hasSkippedBackup]);

  if (!profile) {
    return <LoginScreen authError={authError} onLogin={async (username, password, branch) => { await login(username, password, branch); }} />;
  }

  return (
    <main className="min-h-screen">
      <AppHeader
        profile={profile}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={logout}
        onAttendance={() => setIsAttendanceOpen(true)}
        onOpenBuySellReport={() => setIsBuySellReportOpen(true)}
        onOpenRegularReport={() => setIsRegularReportOpen(true)}
      />
      <section className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        {activeView === "users" && isSuperAdmin ? (
          <UsersPanel currentUserId={profile.id} />
        ) : activeView === "system" && isManager ? (
          <SystemPanel
            isSuperAdmin={isSuperAdmin}
            onDailyReport={() => setIsDailyReportOpen(true)}
            onMonthlyReport={() => setIsMonthlyReportOpen(true)}
            onUsersManagement={() => setActiveView("users")}
            onBackupCompleted={checkSession}
          />
        ) : activeView === "analytics" && isSuperAdmin ? (
          <DashboardPanel />
        ) : activeView === "engineers" && isManager ? (
          <EngineersPanel
            engineers={engineers}
            onAdd={() => {
              setEditingEngineer(null);
              setIsEngineerFormOpen(true);
            }}
            onEdit={(eng) => {
              setEditingEngineer(eng);
              setIsEngineerFormOpen(true);
            }}
            onDelete={(id) => {
              const eng = engineers.find((e) => e.id === id);
              if (eng) setDeleteTargetEngineer(eng);
            }}
          />
        ) : activeView === "companies" && isSuperAdmin ? (
          <CompaniesPanel
            onPreviewInvoice={(invoice, company, car) => {
              setB2bInvoiceToPreview({ invoice, company, car });
            }}
          />
        ) : activeView === "debts" && isSuperAdmin ? (
          <DebtorsPanel />
        ) : (
          <>
            <DashboardToolbar
              dateFilter={dateFilter}
              search={search}
              onAdd={() => {
                setEditingCustomer(null);
                setIsFormOpen(true);
              }}
              onDateChange={handleDateChange}
              onSearchChange={handleSearchChange}
              onlyUnderWork={onlyUnderWork}
              onOnlyUnderWorkToggle={handleOnlyUnderWorkToggle}
            />
            <CustomersGrid
              customers={customers}
              totalRows={totalRows}
              page={page}
              isPending={isPending}
              isManager={isManager}
              onPageChange={handlePageChange}
              onEdit={(customer) => {
                setEditingCustomer(customer);
                setIsFormOpen(true);
              }}
              onDelete={setDeleteTarget}
              onInvoice={setInvoiceCustomer}
            />
            {isManager ? (
              <div className="mt-4">
                <h2 className="text-xl font-bold text-slate-800 mb-4 text-right">إجمالي إيرادات الفرع لليوم 📊</h2>
                <FinancialBreakdownCards breakdown={financialBreakdown} />
              </div>
            ) : null}
          </>
        )}
      </section>

      {isEngineerFormOpen ? (
        <EngineerModal
          engineer={editingEngineer}
          onClose={() => {
            setIsEngineerFormOpen(false);
            setEditingEngineer(null);
          }}
          onSave={async (values) => {
            await saveEngineer(values, editingEngineer?.id);
          }}
        />
      ) : null}
      {isFormOpen ? (
        <CustomerModal
          engineers={engineers}
          initialData={editingCustomer || undefined}
          onClose={() => setIsFormOpen(false)}
          onSave={async (values, id) => { await saveCustomer(values, id); }}
        />
      ) : null}
      {invoiceCustomer ? (
        <InvoiceModal
          customer={invoiceCustomer}
          onClose={() => setInvoiceCustomer(null)}
        />
      ) : null}
      {deleteTarget ? (
        <ConfirmModal
          title="حذف سجل العميل"
          body={`هل تريد حذف سجل ${deleteTarget.customer_name}؟ لا يمكن التراجع عن هذه العملية.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteCustomer}
        />
      ) : null}
      {deleteTargetEngineer ? (
        <ConfirmModal
          title="حذف المهندس"
          body={`هل أنت متأكد من حذف المهندس ${deleteTargetEngineer.name}؟ لا يمكن التراجع عن هذه العملية.`}
          onCancel={() => setDeleteTargetEngineer(null)}
          onConfirm={() => {
            deleteEngineer(deleteTargetEngineer.id ?? "");
          }}
        />
      ) : null}

      {/* التنبيهات المنبثقة التفاعلية (Floating Toast Alert) */}
      {toast ? (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 w-max max-w-[90vw] px-4 transition-all duration-300">
          <div className={`flex items-center justify-center gap-3 rounded-2xl border px-6 py-4 shadow-soft backdrop-blur-md text-sm sm:text-base font-extrabold text-center transition-all duration-300 ${
            toast.type === "success"
              ? "border-emerald-200 bg-white/90 text-emerald-800 shadow-[0_10px_35px_-5px_rgba(16,185,129,0.15)]"
              : "border-red-200 bg-white/90 text-red-800 shadow-[0_10px_35px_-5px_rgba(239,68,68,0.15)]"
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      ) : null}

      {/* نوافذ معاينة التقارير A4 */}
      {isDailyReportOpen ? (
        <DailyReportModal
          onClose={() => setIsDailyReportOpen(false)}
          dateFilter={dateFilter}
          fetchCustomers={fetchDailyReportCustomers}
          financialBreakdown={financialBreakdown}
          branch={profile?.branch}
        />
      ) : null}

      {isMonthlyReportOpen ? (
        <MonthlyReportModal
          onClose={() => {
            setIsMonthlyReportOpen(false);
            setMonthlyReportData(null);
          }}
          onLoadReport={loadMonthlyReport}
          reportData={monthlyReportData}
          loading={isMonthlyReportPending}
          branch={profile?.branch}
        />
      ) : null}

      {isAttendanceOpen ? (
        <AttendanceModal
          onClose={() => setIsAttendanceOpen(false)}
          isManager={isManager}
        />
      ) : null}
      {b2bInvoiceToPreview ? (
        <CompanyInvoiceModal
          invoice={b2bInvoiceToPreview.invoice}
          company={b2bInvoiceToPreview.company}
          car={b2bInvoiceToPreview.car}
          onClose={() => setB2bInvoiceToPreview(null)}
        />
      ) : null}
      {isBuySellReportOpen ? (
        <BuySellReportModal
          onClose={() => setIsBuySellReportOpen(false)}
          branch={profile?.branch}
        />
      ) : null}
      {isRegularReportOpen ? (
        <RegularReportModal
          onClose={() => setIsRegularReportOpen(false)}
          branch={profile?.branch}
        />
      ) : null}

      {shouldShowBackupReminder ? (
        <BackupReminderModal
          onClose={() => {
            sessionStorage.setItem("backup_reminder_skipped", "true");
            setHasSkippedBackup(true);
          }}
          onGoToBackup={() => {
            sessionStorage.setItem("backup_reminder_skipped", "true");
            setHasSkippedBackup(true);
            setActiveView("system");
          }}
        />
      ) : null}
    </main>
  );
}
