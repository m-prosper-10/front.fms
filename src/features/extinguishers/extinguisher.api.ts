import { requestJson } from "../../lib/api";
import { appConfig } from "../../lib/config";
import type {
  ExtinguisherCreateInput,
  ExtinguisherStatus,
  ExtinguisherUpdateInput,
  FireExtinguisher
} from "./extinguisher.types";

const baseUrl = appConfig.extinguisherServiceUrl;

export function listExtinguishers() {
  return requestJson<FireExtinguisher[]>(baseUrl, "/api/extinguishers");
}

export function getExtinguisher(id: string) {
  return requestJson<FireExtinguisher>(baseUrl, `/api/extinguishers/${id}`);
}

export function createExtinguisher(input: ExtinguisherCreateInput) {
  return requestJson<FireExtinguisher>(baseUrl, "/api/extinguishers", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateExtinguisher(id: string, input: ExtinguisherUpdateInput) {
  return requestJson<FireExtinguisher>(baseUrl, `/api/extinguishers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteExtinguisher(id: string) {
  return requestJson<FireExtinguisher>(baseUrl, `/api/extinguishers/${id}`, {
    method: "DELETE"
  });
}

export function filterExtinguishersByStatus(status: ExtinguisherStatus) {
  return requestJson<FireExtinguisher[]>(baseUrl, `/api/extinguishers/status/${status}`);
}

export function filterExtinguishersByLocation(location: string) {
  return requestJson<FireExtinguisher[]>(baseUrl, `/api/extinguishers/location/${location}`);
}

export function getExtinguisherMeta() {
  return requestJson<{
    module: string;
    status: string;
    endpoints: string[];
  }>(baseUrl, "/api/extinguishers/meta");
}
