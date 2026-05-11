export type PaymentMethod = "cash" | "online" | "cheque" | "card";

export type PaymentStatus = "paid" | "pending" | "overdue";

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  adminId: string;
  month: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  paymentDate: string;
  createdAt: string;
}

export interface RecordPaymentForm {
  studentId: string;
  month: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  paymentDate: string;
}

export interface UpdatePaymentForm {
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  paymentDate?: string;
}
