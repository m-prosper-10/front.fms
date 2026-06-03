import { requestJson } from "../../lib/api";
import { appConfig } from "../../lib/config";
import type {
  AuthSession,
  AuthValidationResponse,
  LoginInput,
  RegisterInput
} from "./auth.types";

const authBaseUrl = appConfig.authBaseUrl;

export function login(input: LoginInput) {
  return requestJson<AuthSession>(authBaseUrl, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function register(input: RegisterInput) {
  return requestJson<AuthSession>(authBaseUrl, "/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function validateToken(accessToken: string) {
  return requestJson<AuthValidationResponse>(authBaseUrl, "/api/auth/validate-token", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function refreshToken(refreshToken: string) {
  return requestJson<AuthSession>(authBaseUrl, "/api/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });
}

export function logout(refreshToken: string) {
  return requestJson<{ message: string }>(authBaseUrl, "/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });
}
