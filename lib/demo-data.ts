import type { Customer, Engineer, Profile } from "@/lib/types";

const today = new Date();
const isoAt = (hour: number, minute: number) => {
  const date = new Date(today);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const demoProfile: Profile = {
  id: "demo-manager",
  full_name: "Manager",
  role: "SUPER_ADMIN",
  username: "manager",
  isActive: true,
};

export const demoEngineers: Engineer[] = [
  {
    id: "eng-1",
    name: "حسام محمد",
    phone: "012-3575538",
    address: "حي السلام",
  },
  {
    id: "eng-2",
    name: "فهد باوزير",
    phone: "012-3539558",
    address: "حي الروضة",
  },
  {
    id: "eng-3",
    name: "سالم عبدالله",
    phone: "055-7812044",
    address: "حي النور",
  },
];

export const demoCustomers: Customer[] = [
  {
    id: "cust-1",
    customer_name: "عميل عمير",
    phone: "0501112233",
    car_type: "تويوتا كامري",
    car_year: 2020,
    engineer_id: "eng-1",
    engineer_name: "حسام محمد",
    work_notes: "فحص شامل للبطارية والدينمو وتغيير زيت المحرك.",
    required_amount: 950,
    paid_amount: 855,
    remaining_amount: 0,
    status: "مدفوع",
    currency: "SAR",
    payment_method: "Cash",
    transfer_type: null,
    is_not_worked_on: false,
    created_at: isoAt(10, 15),
  },
  {
    id: "cust-2",
    customer_name: "فيوم مخضب",
    phone: "0504447788",
    car_type: "هيونداي إلنترا",
    car_year: 2018,
    engineer_id: "eng-2",
    engineer_name: "فهد باوزير",
    work_notes: "إصلاح تهريب في نظام التبريد وفحص حرارة المحرك.",
    required_amount: 1200,
    paid_amount: 650,
    remaining_amount: 490,
    status: "قيد العمل",
    currency: "SAR",
    payment_method: "Cash",
    transfer_type: null,
    is_not_worked_on: false,
    created_at: isoAt(11, 35),
  },
  {
    id: "cust-3",
    customer_name: "عميل دنوز",
    phone: "0552221199",
    car_type: "نيسان باترول",
    car_year: 2022,
    engineer_id: "eng-3",
    engineer_name: "سالم عبدالله",
    work_notes: "برمجة حساس وميزان أذرعة أمامية.",
    required_amount: 700,
    paid_amount: 700,
    remaining_amount: 0,
    status: "مدفوع",
    currency: "SAR",
    payment_method: "Cash",
    transfer_type: null,
    is_not_worked_on: false,
    created_at: isoAt(13, 5),
  },
];
