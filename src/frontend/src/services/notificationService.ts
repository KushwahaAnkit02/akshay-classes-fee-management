import { STORAGE_KEYS } from "@/config/constants";
import type {
  CreateNotificationForm,
  Notification,
} from "@/types/notification";
import { generateId } from "@/utils/generateId";
import { getData, setData } from "@/utils/storage";

export function getNotifications(): Notification[] {
  return getData<Notification[]>(STORAGE_KEYS.AKSHAY_NOTIFICATIONS) ?? [];
}

export function addNotification(data: CreateNotificationForm): Notification {
  const notifications = getNotifications();
  const notification: Notification = {
    id: generateId(),
    adminId: "admin-001",
    studentId: data.studentId,
    title: data.title,
    message: data.message,
    type_: data.type_,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  setData(STORAGE_KEYS.AKSHAY_NOTIFICATIONS, [notification, ...notifications]);
  return notification;
}

export function markAsRead(id: string): void {
  const notifications = getNotifications().map((n) =>
    n.id === id ? { ...n, isRead: true } : n,
  );
  setData(STORAGE_KEYS.AKSHAY_NOTIFICATIONS, notifications);
}

export function markAllAsRead(): void {
  const notifications = getNotifications().map((n) => ({ ...n, isRead: true }));
  setData(STORAGE_KEYS.AKSHAY_NOTIFICATIONS, notifications);
}

export function deleteNotification(id: string): void {
  setData(
    STORAGE_KEYS.AKSHAY_NOTIFICATIONS,
    getNotifications().filter((n) => n.id !== id),
  );
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.isRead).length;
}

export function getNotificationsForStudent(studentId: string): Notification[] {
  return getNotifications().filter(
    (n) => !n.studentId || n.studentId === studentId,
  );
}
