import { Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../button";
import { Badge } from "../ui/badge";
import { useAuth } from "../../features/auth/auth.store";

type TopbarProps = {
  onMenuToggle: () => void;
};

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? "U"}${lastName?.[0] ?? ""}`.toUpperCase();
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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
          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-right">
              <p className="text-xs text-slate-500">Signed in as</p>
              <p className="text-sm font-medium text-slate-900">
                {user ? `${user.firstName} ${user.lastName}` : "User"}
              </p>
            </div>

            <Badge tone="muted">{user?.role ?? "user"}</Badge>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 sm:hidden">
            {getInitials(user?.firstName, user?.lastName)}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
