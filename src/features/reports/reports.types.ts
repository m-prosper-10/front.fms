export type ReportPeriod = "daily" | "monthly" | "yearly";
export type ExportFormat = "pdf" | "csv";

export interface DateRangeInput {
  from?: string;
  to?: string;
}

export interface ReportMetric {
  label: string;
  count: number;
}

export interface DashboardMaintenanceEntry {
  id: string;
  extinguisherId: string;
  inspectorId: string;
  actionTaken: string;
  maintenanceDate: string;
  issuesIdentified: string;
  notesAndRecommendations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardReport {
  totalExtinguishers: number;
  activeExtinguishers: number;
  expiredExtinguishers: number;
  underMaintenance: number;
  pendingInspections: number;
  completedInspections: number;
  overdueInspections: number;
  upcomingExpirations: number;
  recentMaintenance: DashboardMaintenanceEntry[];
}

export interface InventoryEntry {
  id: string;
  serialNumber: string;
  location: string;
  type: string;
  size: string;
  installationDate: string;
  expiryDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryReport {
  totalExtinguishers: number;
  byStatus: ReportMetric[];
  byType: ReportMetric[];
  byLocation: ReportMetric[];
  timeline: ReportMetric[];
}

export interface InventoryPeriodReport {
  totalExtinguishers: number;
  period: ReportPeriod;
  timeline: ReportMetric[];
}

export interface InspectionEntry {
  id: string;
  extinguisherId: string;
  assignedInspectorId: string;
  inspectionDate: string;
  inspectionTime: string;
  status: string;
  result: string | null;
  findings: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionReport {
  totalInspections: number;
  byStatus: ReportMetric[];
  byResult: ReportMetric[];
  recentInspections: InspectionEntry[];
}

export interface ComplianceReport {
  totalExtinguishers: number;
  expiredExtinguishers: number;
  expiringWithin30Days: number;
  compliantExtinguishers: number;
  overdueInspections: number;
  expiredExtinguishersList: InventoryEntry[];
  upcomingExpirations: InventoryEntry[];
}

export interface MaintenanceEntry {
  id: string;
  extinguisherId: string;
  inspectorId: string;
  actionTaken: string;
  maintenanceDate: string;
  issuesIdentified: string;
  notesAndRecommendations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceReport {
  totalMaintenanceLogs: number;
  byAction: ReportMetric[];
  frequencyByMonth: ReportMetric[];
  recentMaintenance: MaintenanceEntry[];
}

export interface ReportModuleMeta {
  module: string;
  status: string;
  endpoints: string[];
}

export interface ExportReport {
  format: ExportFormat;
  filename: string;
  generatedAt: string;
  sections: {
    dashboard: DashboardReport;
    inventory: InventoryReport;
    inspections: InspectionReport;
    compliance: ComplianceReport;
    maintenance: MaintenanceReport;
  };
  csv?: string;
}
