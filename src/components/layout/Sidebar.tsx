import { NavLink } from "react-router-dom";
import type { UserRole } from "../../lib/permissions";
import { NAV_ITEMS, ROLE_LABELS, isRoleVisible } from "../../lib/permissions";
import { cn } from "../../lib/utils";

type SidebarProps = {
  role: UserRole;
  open: boolean;
  onNavigate: () => void;
};

export function Sidebar({ role, open, onNavigate }: SidebarProps) {
  const items = NAV_ITEMS.filter((item) => isRoleVisible(role, item.roles));

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              Fire Safety Operations
            </p>
            <p className="text-xs text-slate-500">
              Role: {ROLE_LABELS[role]}
            </p>
          </div>
        </div>

        <nav className="space-y-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            Connected to the gateway configured in VITE_API_URL or the local fallback.
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onNavigate}
          className="fixed inset-0 z-20 bg-slate-950/20 lg:hidden"
        />
      ) : null}
    </>
  );
}
