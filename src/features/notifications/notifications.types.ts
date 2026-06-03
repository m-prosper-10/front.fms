export type NotificationType = "inspection" | "maintenance" | "expiry" | "system";

export interface NotificationModuleMeta {
  module: string;
  status: string;
  endpoints: string[];
}

export interface PublicNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}
