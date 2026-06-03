import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { appConfig } from "../../lib/config";
import type { UserRole } from "../../lib/permissions";
import { ROLE_OPTIONS } from "../../lib/permissions";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

function readStoredRole(): UserRole {
  if (typeof window === "undefined") {
    return "admin";
  }

  const storedRole = window.localStorage.getItem(appConfig.roleStorageKey);

  if (storedRole && ROLE_OPTIONS.includes(storedRole as UserRole)) {
    return storedRole as UserRole;
  }

  return "admin";
}

export function AppLayout() {
  const [role, setRole] = useState<UserRole>(() => readStoredRole());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(appConfig.roleStorageKey, role);
  }, [role]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [role]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        role={role}
        open={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <Topbar
          role={role}
          onRoleChange={setRole}
          onMenuToggle={() => setSidebarOpen((current) => !current)}
        />

        <main className="px-4 py-6 md:px-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
