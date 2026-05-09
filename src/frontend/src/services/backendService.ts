/**
 * Backend service - typed wrappers around the actor calls.
 */

import type { Backend } from "@/backend";
import type {
  Admin,
  CreateNotificationForm,
  CreateStudentForm,
  MonthlyPayment,
  Notification,
  Profile,
  RecordPaymentForm,
  Student,
  UpdatePaymentForm,
  UpdateProfileForm,
  UpdateStudentForm,
} from "@/types";

function unwrapOption<T>(opt: T | null | undefined | [T] | []): T | undefined {
  if (opt === null || opt === undefined) return undefined;
  if (Array.isArray(opt)) return opt[0] as T | undefined;
  return opt as T;
}

// Profile API

export async function getMyProfile(actor: Backend): Promise<Profile | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).getMyProfile?.();
    if (!result) return null;
    return result as Profile;
  } catch {
    return null;
  }
}

export async function createProfile(
  actor: Backend,
  data: { role: string; name: string; email: string; phone?: string },
): Promise<Profile | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).createProfile?.(data);
    return (result as Profile) ?? null;
  } catch {
    return null;
  }
}

export async function updateProfile(
  actor: Backend,
  form: UpdateProfileForm,
): Promise<Profile | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).updateProfile?.(form);
    return (result as Profile) ?? null;
  } catch {
    return null;
  }
}

// Admin API

export async function getAdminByProfile(actor: Backend): Promise<Admin | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).getAdminByProfile?.();
    if (!result) return null;
    const unwrapped = unwrapOption(result);
    return (unwrapped as Admin) ?? null;
  } catch {
    return null;
  }
}

export async function createAdmin(
  actor: Backend,
  data: { institute_name: string; institute_code: string; address?: string },
): Promise<Admin | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).createAdmin?.(data);
    return (result as Admin) ?? null;
  } catch {
    return null;
  }
}

// Student API

export async function getStudentsByAdmin(actor: Backend): Promise<Student[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).getStudentsByAdmin?.();
    return (result as Student[]) ?? [];
  } catch {
    return [];
  }
}

export async function getStudentByProfile(
  actor: Backend,
): Promise<Student | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).getStudentByProfile?.();
    if (!result) return null;
    const unwrapped = unwrapOption(result);
    return (unwrapped as Student) ?? null;
  } catch {
    return null;
  }
}

export async function createStudent(
  actor: Backend,
  form: CreateStudentForm,
): Promise<Student | null> {
  try {
    const payload = {
      ...form,
      monthly_fee: BigInt(form.monthly_fee),
      joined_date: BigInt(new Date(form.joined_date).getTime() * 1_000_000),
      fee_start_date: BigInt(
        new Date(form.fee_start_date).getTime() * 1_000_000,
      ),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).createStudent?.(payload);
    return (result as Student) ?? null;
  } catch {
    return null;
  }
}

export async function updateStudent(
  actor: Backend,
  id: string,
  form: UpdateStudentForm,
): Promise<Student | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).updateStudent?.(id, form);
    return (result as Student) ?? null;
  } catch {
    return null;
  }
}

// Payment API

export async function getPaymentsByAdmin(
  actor: Backend,
): Promise<MonthlyPayment[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).getPaymentsByAdmin?.();
    return (result as MonthlyPayment[]) ?? [];
  } catch {
    return [];
  }
}

export async function getPaymentsByStudent(
  actor: Backend,
): Promise<MonthlyPayment[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).getPaymentsByStudent?.();
    return (result as MonthlyPayment[]) ?? [];
  } catch {
    return [];
  }
}

export async function recordPayment(
  actor: Backend,
  form: RecordPaymentForm,
): Promise<MonthlyPayment | null> {
  try {
    const payload = {
      ...form,
      amount_paid: BigInt(form.amount_paid),
      payment_date: BigInt(new Date(form.payment_date).getTime() * 1_000_000),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).recordPayment?.(payload);
    return (result as MonthlyPayment) ?? null;
  } catch {
    return null;
  }
}

export async function updatePayment(
  actor: Backend,
  id: string,
  form: UpdatePaymentForm,
): Promise<MonthlyPayment | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).updatePayment?.(id, form);
    return (result as MonthlyPayment) ?? null;
  } catch {
    return null;
  }
}

export async function deletePayment(
  actor: Backend,
  id: string,
): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (actor as any).deletePayment?.(id);
    return true;
  } catch {
    return false;
  }
}

// Notification API

export async function getNotificationsByAdmin(
  actor: Backend,
): Promise<Notification[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).getNotificationsByAdmin?.();
    return (result as Notification[]) ?? [];
  } catch {
    return [];
  }
}

export async function getNotificationsByStudent(
  actor: Backend,
): Promise<Notification[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).getNotificationsByStudent?.();
    return (result as Notification[]) ?? [];
  } catch {
    return [];
  }
}

export async function createNotification(
  actor: Backend,
  form: CreateNotificationForm,
): Promise<Notification | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (actor as any).createNotification?.(form);
    return (result as Notification) ?? null;
  } catch {
    return null;
  }
}

export async function markNotificationRead(
  actor: Backend,
  id: string,
): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (actor as any).markNotificationRead?.(id);
    return true;
  } catch {
    return false;
  }
}

export async function markAllNotificationsRead(
  actor: Backend,
): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (actor as any).markAllNotificationsRead?.();
    return true;
  } catch {
    return false;
  }
}
