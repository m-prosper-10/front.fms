import { requestJson } from "../../lib/api";
import { appConfig } from "../../lib/config";
import type {
  CompleteInspectionInput,
  CreateMaintenanceInput,
  InspectionRecord,
  InspectionStatus,
  MaintenanceRecord,
  ScheduleInspectionInput,
  UpdateInspectionInput,
  UpdateMaintenanceInput
} from "./inspection.types";

const baseUrl = appConfig.apiBaseUrl;

export function listInspections() {
  return requestJson<InspectionRecord[]>(baseUrl, "/api/inspections");
}

export function getInspection(id: string) {
  return requestJson<InspectionRecord>(baseUrl, `/api/inspections/${id}`);
}

export function scheduleInspection(input: ScheduleInspectionInput) {
  return requestJson<InspectionRecord>(baseUrl, "/api/inspections", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateInspection(id: string, input: UpdateInspectionInput) {
  return requestJson<InspectionRecord>(baseUrl, `/api/inspections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function completeInspection(id: string, input: CompleteInspectionInput) {
  return requestJson<InspectionRecord>(baseUrl, `/api/inspections/${id}/complete`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteInspection(id: string) {
  return requestJson<InspectionRecord>(baseUrl, `/api/inspections/${id}`, {
    method: "DELETE"
  });
}

export function filterInspectionsByStatus(status: InspectionStatus) {
  return requestJson<InspectionRecord[]>(baseUrl, `/api/inspections/status/${status}`);
}

export function listOverdueInspections() {
  return requestJson<InspectionRecord[]>(baseUrl, "/api/inspections/overdue");
}

export function listInspectionsByExtinguisher(extinguisherId: string) {
  return requestJson<InspectionRecord[]>(baseUrl, `/api/inspections/extinguisher/${extinguisherId}`);
}

export function listMaintenance() {
  return requestJson<MaintenanceRecord[]>(baseUrl, "/api/maintenance");
}

export function getMaintenance(id: string) {
  return requestJson<MaintenanceRecord>(baseUrl, `/api/maintenance/${id}`);
}

export function createMaintenance(input: CreateMaintenanceInput) {
  return requestJson<MaintenanceRecord>(baseUrl, "/api/maintenance", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateMaintenance(id: string, input: UpdateMaintenanceInput) {
  return requestJson<MaintenanceRecord>(baseUrl, `/api/maintenance/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteMaintenance(id: string) {
  return requestJson<MaintenanceRecord>(baseUrl, `/api/maintenance/${id}`, {
    method: "DELETE"
  });
}

export function listMaintenanceByExtinguisher(extinguisherId: string) {
  return requestJson<MaintenanceRecord[]>(
    baseUrl,
    `/api/maintenance/extinguisher/${extinguisherId}`
  );
}

