import { createActor } from "@/backend";
import * as svc from "@/services/backendService";
import type { CreateStudentForm, UpdateStudentForm } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useStudentsByAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["students", "admin"],
    queryFn: async () => {
      if (!actor) return [];
      return svc.getStudentsByAdmin(actor);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyStudentProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["students", "me"],
    queryFn: async () => {
      if (!actor) return null;
      return svc.getStudentByProfile(actor);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStudent() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: CreateStudentForm) => {
      if (!actor) throw new Error("No actor");
      return svc.createStudent(actor, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      form,
    }: { id: string; form: UpdateStudentForm }) => {
      if (!actor) throw new Error("No actor");
      return svc.updateStudent(actor, id, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
