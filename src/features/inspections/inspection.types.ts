export type InspectionStatus = "pending" | "completed" | "overdue" | "cancelled";
export type InspectionResult = "passed" | "failed" | "requires_maintenance";

export interface InspectionRecord {
  id: string;
  extinguisherId: string;
  scheduledBy: string;
  assignedInspectorId: string;
  inspectionDate: string;
  inspectionTime: string;
  status: InspectionStatus;
  result: InspectionResult | null;
  findings: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
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

export interface ScheduleInspectionInput {
  extinguisherId: string;
  inspectionDate: string;
  inspectionTime: string;
  assignedInspectorId: string;
  notes?: string;
}

export interface UpdateInspectionInput {
  extinguisherId?: string;
  inspectionDate?: string;
  inspectionTime?: string;
  assignedInspectorId?: string;
  status?: InspectionStatus;
  result?: InspectionResult;
  findings?: string;
  notes?: string;
}

export interface CompleteInspectionInput {
  result: InspectionResult;
  findings?: string;
  notes?: string;
}

export interface CreateMaintenanceInput {
  extinguisherId: string;
  actionTaken: string;
  maintenanceDate: string;
  issuesIdentified: string;
  notesAndRecommendations?: string;
}

export interface UpdateMaintenanceInput {
  extinguisherId?: string;
  actionTaken?: string;
  maintenanceDate?: string;
  issuesIdentified?: string;
  notesAndRecommendations?: string;
}
