import { STORAGE_KEYS } from "@/config/constants";
import type {
  Payment,
  RecordPaymentForm,
  UpdatePaymentForm,
} from "@/types/payment";
import type { Student } from "@/types/student";
import { getCurrentMonthKey, getMonthKey } from "@/utils/formatters";
import { generateId } from "@/utils/generateId";
import { getData, setData } from "@/utils/storage";

export function getPayments(): Payment[] {
  return getData<Payment[]>(STORAGE_KEYS.AKSHAY_PAYMENTS) ?? [];
}

export function getPaymentsByStudent(studentId: string): Payment[] {
  return getPayments().filter((p) => p.studentId === studentId);
}

export function addPayment(data: RecordPaymentForm): Payment {
  const payments = getPayments();
  const students = getData<Student[]>(STORAGE_KEYS.AKSHAY_STUDENTS) ?? [];
  const student = students.find((s) => s.id === data.studentId);
  const now = new Date().toISOString();
  const payment: Payment = {
    id: generateId(),
    studentId: data.studentId,
    studentName: student?.name ?? "Unknown",
    adminId: "admin-001",
    month: data.month,
    amountPaid: data.amountPaid,
    paymentMethod: data.paymentMethod,
    notes: data.notes,
    paymentDate: data.paymentDate,
    createdAt: now,
  };
  setData(STORAGE_KEYS.AKSHAY_PAYMENTS, [...payments, payment]);
  return payment;
}

export function updatePayment(id: string, data: UpdatePaymentForm): Payment {
  const payments = getPayments();
  const idx = payments.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Payment ${id} not found`);
  const updated: Payment = { ...payments[idx], ...data };
  payments[idx] = updated;
  setData(STORAGE_KEYS.AKSHAY_PAYMENTS, payments);
  return updated;
}

export function deletePayment(id: string): void {
  setData(
    STORAGE_KEYS.AKSHAY_PAYMENTS,
    getPayments().filter((p) => p.id !== id),
  );
}

export interface PaymentStats {
  totalPaid: number;
  totalPending: number;
  totalStudents: number;
  paidThisMonth: number;
  monthlyRevenue: Record<string, number>;
}

export function getPaymentStats(): PaymentStats {
  const payments = getPayments();
  const students = getData<Student[]>(STORAGE_KEYS.AKSHAY_STUDENTS) ?? [];
  const currentMonth = getCurrentMonthKey();

  const activeStudents = students.filter((s) => s.isActive);
  const totalPotential = activeStudents.reduce(
    (sum, s) => sum + s.monthlyFee,
    0,
  );
  const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const paidThisMonth = payments
    .filter((p) => getMonthKey(p.paymentDate) === currentMonth)
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const monthlyRevenue: Record<string, number> = {};
  for (const p of payments) {
    const key = getMonthKey(p.paymentDate);
    monthlyRevenue[key] = (monthlyRevenue[key] ?? 0) + p.amountPaid;
  }

  return {
    totalPaid,
    totalPending: Math.max(0, totalPotential - paidThisMonth),
    totalStudents: students.length,
    paidThisMonth,
    monthlyRevenue,
  };
}
