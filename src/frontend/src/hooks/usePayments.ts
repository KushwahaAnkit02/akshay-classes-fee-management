import { createActor } from "@/backend";
import * as svc from "@/services/backendService";
import type { RecordPaymentForm, UpdatePaymentForm } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePaymentsByAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["payments", "admin"],
    queryFn: async () => {
      if (!actor) return [];
      return svc.getPaymentsByAdmin(actor);
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePaymentsByStudent() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["payments", "student"],
    queryFn: async () => {
      if (!actor) return [];
      return svc.getPaymentsByStudent(actor);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordPayment() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: RecordPaymentForm) => {
      if (!actor) throw new Error("No actor");
      return svc.recordPayment(actor, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useUpdatePayment() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      form,
    }: { id: string; form: UpdatePaymentForm }) => {
      if (!actor) throw new Error("No actor");
      return svc.updatePayment(actor, id, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useDeletePayment() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return svc.deletePayment(actor, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
