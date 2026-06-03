import type { UserRole } from "../../lib/permissions";

export type UserStatus = "active" | "inactive" | "suspended";

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface UserMeRecord extends UserRecord {}
