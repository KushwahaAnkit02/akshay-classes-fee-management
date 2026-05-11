export type NotificationType = "alert" | "reminder" | "update";

export interface Notification {
  id: string;
  adminId: string;
  studentId?: string;
  title: string;
  message: string;
  type_: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationForm {
  studentId?: string;
  title: string;
  message: string;
  type_: NotificationType;
}
