import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/auth.store";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      setSidebarOpen(false);
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      <div className="lg:pl-72">
        <Topbar onMenuToggle={() => setSidebarOpen((current) => !current)} />

        <main className="px-4 py-6 md:px-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
