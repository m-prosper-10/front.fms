import { requestJson } from "../../lib/api";
import { appConfig } from "../../lib/config";
import type { DashboardReport, ReportModuleMeta } from "../reports/reports.types";
import type { NotificationModuleMeta, PublicNotification } from "../notifications/notifications.types";

export async function loadReportingDashboard() {
  const [reportMeta, dashboard] = await Promise.all([
    requestJson<ReportModuleMeta>(appConfig.apiBaseUrl, "/api/reports/meta"),
    requestJson<DashboardReport>(appConfig.apiBaseUrl, "/api/reports/dashboard")
  ]);

  return {
    reportMeta,
    dashboard
  };
}

export function loadNotificationMeta() {
  return requestJson<NotificationModuleMeta>(appConfig.apiBaseUrl, "/api/notifications/meta");
}

export function loadNotifications() {
  return requestJson<PublicNotification[]>(appConfig.apiBaseUrl, "/api/notifications");
}

export async function loadNotificationSummary() {
  const [notificationMeta, notifications] = await Promise.all([
    loadNotificationMeta(),
    loadNotifications()
  ]);

  return {
    notificationMeta,
    notifications
  };
}
