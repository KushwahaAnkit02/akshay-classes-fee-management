import { createActor } from "@/backend";
import * as svc from "@/services/backendService";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMyAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: async () => {
      if (!actor) return null;
      return svc.getAdminByProfile(actor);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAdmin() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      institute_name: string;
      institute_code: string;
      address?: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return svc.createAdmin(actor, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}
