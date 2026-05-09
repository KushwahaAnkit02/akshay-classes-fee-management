import { createActor } from "@/backend";
import * as svc from "@/services/backendService";
import type { CreateNotificationForm } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotificationsByAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["notifications", "admin"],
    queryFn: async () => {
      if (!actor) return [];
      return svc.getNotificationsByAdmin(actor);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useNotificationsByStudent() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["notifications", "student"],
    queryFn: async () => {
      if (!actor) return [];
      return svc.getNotificationsByStudent(actor);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useCreateNotification() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: CreateNotificationForm) => {
      if (!actor) throw new Error("No actor");
      return svc.createNotification(actor, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return svc.markNotificationRead(actor, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return svc.markAllNotificationsRead(actor);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
