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
  }, { auth: false });
}

export function register(input: RegisterInput) {
  return requestJson<AuthSession>(authBaseUrl, "/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  }, { auth: false });
}

export function validateToken() {
  return requestJson<AuthValidationResponse>(
    authBaseUrl,
    "/api/auth/validate-token",
    {
      method: "GET"
    },
    { auth: true }
  );
}

export function refreshToken(refreshToken: string) {
  return requestJson<AuthSession>(authBaseUrl, "/api/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  }, { auth: false });
}

export function logout(refreshToken: string) {
  return requestJson<{ message: string }>(authBaseUrl, "/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  }, { auth: false });
}
