import * as paymentSvc from "@/services/paymentService";
import type {
  Payment,
  RecordPaymentForm,
  UpdatePaymentForm,
} from "@/types/payment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePayments() {
  return useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: () => Promise.resolve(paymentSvc.getPayments()),
    staleTime: 0,
  });
}

export function usePaymentsByStudent(studentId: string) {
  return useQuery<Payment[]>({
    queryKey: ["payments", "student", studentId],
    queryFn: () => Promise.resolve(paymentSvc.getPaymentsByStudent(studentId)),
    staleTime: 0,
    enabled: !!studentId,
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: RecordPaymentForm) =>
      Promise.resolve(paymentSvc.addPayment(form)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function useUpdatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentForm }) =>
      Promise.resolve(paymentSvc.updatePayment(id, data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => Promise.resolve(paymentSvc.deletePayment(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function usePaymentStats() {
  return useQuery({
    queryKey: ["payments", "stats"],
    queryFn: () => Promise.resolve(paymentSvc.getPaymentStats()),
    staleTime: 0,
  });
}
