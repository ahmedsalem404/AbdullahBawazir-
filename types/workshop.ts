/**
 * @typedef AppRole
 * @description نوع صلاحية المستخدم في النظام (SUPER_ADMIN, ADMIN, WORKER).
 */
export type AppRole = "SUPER_ADMIN" | "ADMIN" | "WORKER";

/**
 * @typedef PaymentStatus
 * @description حالة دفع المستحقات المالية للعميل.
 */
export type PaymentStatus = "مدفوع" | "قيد العمل" | "لم يتم العمل";

/**
 * @typedef Engineer
 * @description يمثل بيانات المهندس في النظام.
 */
export type Engineer = {
  id: string; // المعرف الفريد للمهندس
  name: string; // اسم المهندس الثنائي أو الكامل
  phone: string | null; // رقم هاتف المهندس
  address: string | null; // عنوان سكن المهندس الحالي
  branch?: string; // الفرع التابع له المهندس
  isDeleted?: boolean; // هل تم حذف المهندس (حذف ناعم)
  createdAt?: Date; // تاريخ تسجيل المهندس في النظام
};

/**
 * @typedef EngineerFormValues
 * @description الحقول المطلوبة لملء نموذج إضافة أو تعديل مهندس (بدون المعرفات التلقائية).
 */
export type EngineerFormValues = Omit<Engineer, "id" | "createdAt" | "isDeleted">;

/**
 * @typedef Customer
 * @description يمثل بيانات عميل مسجل ولديه سيارة تحت الصيانة أو تم الانتهاء منها.
 */
export type Customer = {
  id: string; // المعرف الفريد للعميل/سجل الصيانة
  customer_name: string; // اسم العميل الكامل
  phone: string; // رقم هاتف العميل للتواصل
  car_type: string; // نوع السيارة وموديلها (مثال: Toyota Camry)
  car_year: number; // سنة تصنيع السيارة
  engineer_id: string | null; // معرف المهندس المسؤول عن السيارة
  engineer_name?: string | null; // اسم المهندس المسؤول (حقل محسوب من العرض)
  engineer?: Engineer | null; // كائن المهندس المسؤول
  work_notes: string; // الملاحظات الفنية ووصف الأعطال/الأعمال المنجزة
  required_amount: number; // المبلغ الكلي المطلوب مقابل الصيانة
  paid_amount: number; // المبلغ الفعلي الذي تم دفعه من قبل العميل
  injectors_amount?: number; // مبلغ تنظيف البخاخات (اختياري)
  currency: "YER" | "SAR" | "USD"; // نوع العملة
  payment_method: "Cash" | "Transfer" | "Manager_Hand"; // طريقة الدفع
  transfer_type?: "بنك القطيبي" | "بنك الكريمي" | "الشبكة الموحدة" | null; // نوع الحوالة
  is_not_worked_on: boolean; // حالة "لم يتم العمل"
  branch?: string; // الفرع التابع له العميل
  remaining_amount: number; // المبلغ المتبقي المستحق على العميل (حقل محسوب)
  status: PaymentStatus; // حالة الفاتورة
  createdBy?: string | null; // معرف الموظف الذي قام بإنشاء السجل
  createdAt?: Date; // تاريخ إدخال السجل للنظام
  created_at: string | Date; // تاريخ إدخال السجل للنظام (بصيغة نصية أو كائن تاريخ للواجهة الأمامية)
};

/**
 * @typedef Profile
 * @description يمثل حساب المستخدم الفعال المسجل في النظام.
 */
export type Profile = {
  id: string; // المعرف الفريد للمستخدم
  username: string; // اسم المستخدم للدخول
  password?: string; // كلمة المرور المشفرة
  full_name: string; // الاسم الكامل للمستخدم
  role: AppRole; // الصلاحية الحالية (SUPER_ADMIN, ADMIN, WORKER)
  branch?: string; // الفرع المختار النشط
  isActive: boolean; // حالة الحساب
  createdAt?: Date | string; // تاريخ إنشاء الحساب
  last_backup_date?: string | null; // تاريخ آخر نسخة احتياطية
};

/**
 * @typedef UserFormValues
 * @description الحقول المطلوبة لملء نموذج إضافة أو تعديل مستخدم.
 */
export type UserFormValues = {
  username: string;
  password?: string; // اختياري في التعديل
  full_name: string;
  role: AppRole;
  branch: string;
};

/**
 * @typedef CustomerFormValues
 * @description القيم المطلوبة لنموذج إضافة عميل جديد أو تحديث بياناته.
 */
export type CustomerFormValues = {
  customer_name: string; // اسم العميل
  phone: string; // رقم الهاتف
  car_type: string; // نوع السيارة
  car_year: number; // سنة الصنع
  engineer_id: string; // معرف المهندس المسؤول
  work_notes: string; // ملاحظات العمل المنجز
  required_amount: number; // المبلغ المطلوب الكلي
  paid_amount: number; // المبلغ المدفوع
  injectors_amount?: number; // مبلغ تنظيف البخاخات (اختياري)
  currency: "YER" | "SAR" | "USD"; // نوع العملة
  payment_method: "Cash" | "Transfer" | "Manager_Hand"; // طريقة الدفع
  transfer_type?: "بنك القطيبي" | "بنك الكريمي" | "الشبكة الموحدة" | null; // نوع الحوالة
  is_not_worked_on: boolean; // حالة "لم يتم العمل"
};

export type FinancialBreakdown = {
  Cash: { YER: number; SAR: number; USD: number };
  Transfer: { YER: number; SAR: number; USD: number };
  Manager_Hand: { YER: number; SAR: number; USD: number };
};

/**
 * @typedef Attendance
 * @description يمثل سجل تحضير مهندس في تاريخ معين.
 */
export type Attendance = {
  id: string; // المعرف الفريد للتحضير
  engineer_id: string; // معرف المهندس
  engineer?: Engineer; // كائن المهندس المرتبط (اختياري)
  engineer_name?: string; // اسم المهندس المساعد للواجهة
  branch: string; // الفرع (الحسوة / الدرين)
  date: string; // تاريخ التحضير باليوم (YYYY-MM-DD)
  time: string; // وقت التحضير الدقيق (HH:MM)
  createdAt?: Date | string; // تاريخ التسجيل
};

/**
 * @typedef Company
 * @description يمثل شركة متعاقدة مع المركز.
 */
export type Company = {
  id: string;
  name: string;
  location: string | null;
  contact_number: string | null;
  branch: string;
  created_at: Date | string;
};

/**
 * @typedef CompanyFormValues
 */
export type CompanyFormValues = Omit<Company, "id" | "branch" | "created_at">;

/**
 * @typedef CompanyCar
 * @description يمثل سيارة تابعة لشركة متعاقدة.
 */
export type CompanyCar = {
  id: string;
  company_id: string;
  name: string;
  year: number;
  color: string | null;
  plate_or_chassis: string;
  created_at: Date | string;
};

/**
 * @typedef CompanyCarFormValues
 */
export type CompanyCarFormValues = Omit<CompanyCar, "id" | "created_at">;

/**
 * @typedef CompanyInvoice
 * @description يمثل فاتورة صيانة لسيارة تابعة لشركة.
 */
export type CompanyInvoice = {
  id: string;
  car_id: string;
  work_details: string;
  parts_details: string | null;
  parts_total: number;
  labor_total: number;
  grand_total: number;
  currency: "YER" | "SAR" | "USD";
  is_accounted: boolean;
  is_sent: boolean;
  branch: string;
  created_at: Date | string;
};

/**
 * @typedef CompanyInvoiceFormValues
 */
export type CompanyInvoiceFormValues = Omit<CompanyInvoice, "id" | "grand_total" | "branch" | "created_at">;
