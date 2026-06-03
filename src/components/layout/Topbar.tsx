import { Menu } from "lucide-react";
import type { UserRole } from "../../lib/permissions";
import { ROLE_LABELS, ROLE_OPTIONS } from "../../lib/permissions";
import { Button } from "../button";
import { Select } from "../ui/select";

type TopbarProps = {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  onMenuToggle: () => void;
};

export function Topbar({ role, onRoleChange, onMenuToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={onMenuToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div>
            <p className="text-sm font-medium text-slate-900">
              Fire Safety Operations
            </p>
            <p className="text-xs text-slate-500">
              Internal operations system
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <label className="sr-only" htmlFor="role-switcher">
              Demo role
            </label>
            <Select
              id="role-switcher"
              value={role}
              onChange={(event) => onRoleChange(event.target.value as UserRole)}
              className="w-40"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {ROLE_LABELS[option]}
                </option>
              ))}
            </Select>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-right">
            <p className="text-xs text-slate-500">Current role</p>
            <p className="text-sm font-medium text-slate-900">
              {ROLE_LABELS[role]}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
