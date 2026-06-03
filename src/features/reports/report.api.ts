import { requestJson } from "../../lib/api";
import { appConfig } from "../../lib/config";
import type {
  ComplianceReport,
  DashboardReport,
  DateRangeInput,
  ExportReport,
  InspectionReport,
  InventoryPeriodReport,
  InventoryReport,
  MaintenanceEntry,
  MaintenanceReport,
  ReportModuleMeta,
  ReportMetric,
  ReportPeriod
} from "./reports.types";

function buildReportQuery(range?: DateRangeInput) {
  if (!range?.from && !range?.to) {
    return "";
  }

  const params = new URLSearchParams();
  if (range.from) {
    params.set("from", range.from);
  }
  if (range.to) {
    params.set("to", range.to);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function reportsPath(path: string, range?: DateRangeInput) {
  return `/api/reports${path}${buildReportQuery(range)}`;
}

export function getReportModuleMeta() {
  return requestJson<ReportModuleMeta>(appConfig.apiBaseUrl, "/api/reports/meta");
}

export function getDashboardReport() {
  return requestJson<DashboardReport>(appConfig.apiBaseUrl, "/api/reports/dashboard");
}

export function getInventoryReport(range?: DateRangeInput) {
  return requestJson<InventoryReport>(appConfig.apiBaseUrl, reportsPath("/inventory", range));
}

export function getInventoryPeriodReport(
  period: ReportPeriod,
  range?: DateRangeInput
) {
  return requestJson<InventoryPeriodReport>(
    appConfig.apiBaseUrl,
    reportsPath(`/inventory/${period}`, range)
  );
}

export function getInspectionReport(range?: DateRangeInput) {
  return requestJson<InspectionReport>(appConfig.apiBaseUrl, reportsPath("/inspections", range));
}

export function getPendingInspectionReport(range?: DateRangeInput) {
  return requestJson<InspectionReport>(
    appConfig.apiBaseUrl,
    reportsPath("/inspections/pending", range)
  );
}

export function getCompletedInspectionReport(range?: DateRangeInput) {
  return requestJson<InspectionReport>(
    appConfig.apiBaseUrl,
    reportsPath("/inspections/completed", range)
  );
}

export function getOverdueInspectionReport(range?: DateRangeInput) {
  return requestJson<InspectionReport>(
    appConfig.apiBaseUrl,
    reportsPath("/inspections/overdue", range)
  );
}

export function getComplianceReport() {
  return requestJson<ComplianceReport>(appConfig.apiBaseUrl, "/api/reports/compliance");
}

export function getExpiredComplianceReport() {
  return requestJson<ComplianceReport>(appConfig.apiBaseUrl, "/api/reports/compliance/expired");
}

export function getUpcomingExpirationsReport() {
  return requestJson<ComplianceReport>(
    appConfig.apiBaseUrl,
    "/api/reports/compliance/upcoming-expirations"
  );
}

export function getMaintenanceReport(range?: DateRangeInput) {
  return requestJson<MaintenanceReport>(appConfig.apiBaseUrl, reportsPath("/maintenance", range));
}

export function getMaintenanceHistoryReport(range?: DateRangeInput) {
  return requestJson<MaintenanceEntry[]>(
    appConfig.apiBaseUrl,
    reportsPath("/maintenance/history", range)
  );
}

export function getMaintenanceFrequencyReport(range?: DateRangeInput) {
  return requestJson<ReportMetric[]>(
    appConfig.apiBaseUrl,
    reportsPath("/maintenance/frequency", range)
  );
}

export function getMaintenanceRecentReport(range?: DateRangeInput) {
  return requestJson<MaintenanceEntry[]>(
    appConfig.apiBaseUrl,
    reportsPath("/maintenance/recent", range)
  );
}

export function exportPdfReport() {
  return requestJson<ExportReport>(appConfig.apiBaseUrl, "/api/reports/export/pdf");
}

export function exportCsvReport() {
  return requestJson<ExportReport>(appConfig.apiBaseUrl, "/api/reports/export/csv");
}
