import * as notifSvc from "@/services/notificationService";
import type {
  CreateNotificationForm,
  Notification,
} from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => Promise.resolve(notifSvc.getNotifications()),
    staleTime: 0,
  });
}

export function useStudentNotifications(studentId: string) {
  return useQuery<Notification[]>({
    queryKey: ["notifications", "student", studentId],
    queryFn: () =>
      Promise.resolve(notifSvc.getNotificationsForStudent(studentId)),
    staleTime: 0,
    enabled: !!studentId,
  });
}

export function useAddNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CreateNotificationForm) =>
      Promise.resolve(notifSvc.addNotification(form)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => Promise.resolve(notifSvc.markAsRead(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => Promise.resolve(notifSvc.markAllAsRead()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      Promise.resolve(notifSvc.deleteNotification(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
