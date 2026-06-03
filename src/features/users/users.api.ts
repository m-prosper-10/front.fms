import { requestJson } from "../../lib/api";
import { appConfig } from "../../lib/config";
import type { CreateUserInput, UserRecord } from "./users.types";

const baseUrl = appConfig.userServiceUrl;

export function createUser(input: CreateUserInput) {
  return requestJson<UserRecord>(baseUrl, "/api/users", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function listUsers() {
  return requestJson<UserRecord[]>(baseUrl, "/api/users");
}

export function listInspectors() {
  return requestJson<UserRecord[]>(baseUrl, "/api/users/inspectors");
}

export function getUser(id: string) {
  return requestJson<UserRecord>(baseUrl, `/api/users/${id}`);
}

export function getMe() {
  return requestJson<UserRecord>(baseUrl, "/api/users/me");
}

export function updateUser(id: string, payload: { firstName?: string; lastName?: string }) {
  return requestJson<UserRecord>(baseUrl, `/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function updateUserRole(id: string, role: UserRecord["role"]) {
  return requestJson<UserRecord>(baseUrl, `/api/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role })
  });
}

export function updateUserStatus(id: string, status: UserRecord["status"]) {
  return requestJson<UserRecord>(baseUrl, `/api/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function deleteUser(id: string) {
  return requestJson<UserRecord>(baseUrl, `/api/users/${id}`, {
    method: "DELETE"
  });
}
