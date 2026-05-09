// Core domain types matching Motoko backend schema

export type Role = "admin" | "student";

export type PaymentMethod = "cash" | "online" | "cheque" | "card";

export type NotificationType =
  | "custom"
  | "payment_received"
  | "fee_due"
  | "overdue";

export interface Profile {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  created_at: bigint;
  updated_at: bigint;
}

export interface Admin {
  id: string;
  profile_id: string;
  institute_name: string;
  institute_code: string;
  address?: string;
  created_at: bigint;
}

export interface Student {
  id: string;
  profile_id?: string;
  admin_id: string;
  name: string;
  email: string;
  class_: string;
  course: string;
  monthly_fee: bigint;
  joined_date: bigint;
  fee_start_date: bigint;
  is_active: boolean;
  created_at: bigint;
  updated_at: bigint;
}

export interface MonthlyPayment {
  id: string;
  student_id: string;
  admin_id: string;
  month: string;
  amount_paid: bigint;
  payment_method: PaymentMethod;
  notes?: string;
  payment_date: bigint;
  created_at: bigint;
}

export interface Notification {
  id: string;
  admin_id: string;
  student_id?: string;
  title: string;
  message: string;
  type_: NotificationType;
  is_read: boolean;
  created_at: bigint;
}

// Form types

export interface CreateStudentForm {
  name: string;
  email: string;
  class_: string;
  course: string;
  monthly_fee: number;
  joined_date: string;
  fee_start_date: string;
}

export interface UpdateStudentForm {
  name?: string;
  email?: string;
  class_?: string;
  course?: string;
  monthly_fee?: number;
  is_active?: boolean;
}

export interface RecordPaymentForm {
  student_id: string;
  month: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  notes?: string;
  payment_date: string;
}

export interface UpdatePaymentForm {
  amount_paid?: number;
  payment_method?: PaymentMethod;
  notes?: string;
  payment_date?: string;
}

export interface UpdateProfileForm {
  name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface CreateNotificationForm {
  student_id?: string;
  title: string;
  message: string;
  type_: NotificationType;
}

export interface User {
  principal: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  admin: Admin | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
