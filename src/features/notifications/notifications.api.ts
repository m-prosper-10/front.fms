import { requestJson } from "../../lib/api";
import { appConfig } from "../../lib/config";
import type { NotificationModuleMeta, NotificationType, PublicNotification } from "./notifications.types";

export function getNotificationModuleMeta() {
  return requestJson<NotificationModuleMeta>(appConfig.apiBaseUrl, "/api/notifications/meta");
}

export function listNotifications() {
  return requestJson<PublicNotification[]>(appConfig.apiBaseUrl, "/api/notifications");
}

export function listNotificationsByType(type: NotificationType) {
  return requestJson<PublicNotification[]>(appConfig.apiBaseUrl, `/api/notifications/type/${type}`);
}

export function markNotificationAsRead(id: string) {
  return requestJson<PublicNotification>(appConfig.apiBaseUrl, `/api/notifications/${id}/read`, {
    method: "PATCH"
  });
}
