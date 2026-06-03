import { BarChart3, Bell, ClipboardCheck, Flame, LayoutDashboard, Settings, Users, Wrench } from "lucide-react";

export type UserRole = "admin" | "inspector" | "user";

export const ROLE_OPTIONS: UserRole[] = ["admin", "inspector", "user"];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  inspector: "Inspector",
  user: "User"
};

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "inspector", "user"] as UserRole[]
  },
  {
    label: "Fire Extinguishers",
    path: "/extinguishers",
    icon: Flame,
    roles: ["admin", "inspector", "user"] as UserRole[]
  },
  {
    label: "Inspections",
    path: "/inspections",
    icon: ClipboardCheck,
    roles: ["admin", "inspector", "user"] as UserRole[]
  },
  {
    label: "Maintenance",
    path: "/maintenance",
    icon: Wrench,
    roles: ["admin", "inspector"] as UserRole[]
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    roles: ["admin", "inspector"] as UserRole[]
  },
  {
    label: "Users",
    path: "/users",
    icon: Users,
    roles: ["admin"] as UserRole[]
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
    roles: ["admin", "inspector", "user"] as UserRole[]
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
    roles: ["admin"] as UserRole[]
  }
] as const;

export function isRoleVisible(role: UserRole, allowedRoles: readonly UserRole[]) {
  return allowedRoles.includes(role);
}

export function canManageExtinguishers(role: UserRole) {
  return role === "admin" || role === "inspector";
}

export function canDeleteExtinguishers(role: UserRole) {
  return role === "admin";
}

export function canAccessAdminArea(role: UserRole) {
  return role === "admin";
}

export function canScheduleInspections(role: UserRole) {
  return role === "admin" || role === "user";
}

export function canManageInspections(role: UserRole) {
  return role === "admin" || role === "inspector";
}

export function canCompleteInspections(role: UserRole) {
  return role === "admin" || role === "inspector";
}

export function canManageMaintenance(role: UserRole) {
  return role === "admin" || role === "inspector";
}
