import type { UserRole } from "../../lib/permissions";

export type AuthUserStatus = "active" | "inactive" | "suspended";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: AuthUserStatus;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthValidationResponse {
  valid: true;
  user: AuthUser;
}
