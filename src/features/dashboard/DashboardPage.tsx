import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "../../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { LoadingState } from "../../components/shared/LoadingState";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { useAuth } from "../auth/auth.store";
import { ROLE_LABELS, canAccessAdminArea, canManageExtinguishers } from "../../lib/permissions";
import { loadDashboardSummary } from "./dashboard.api";

type DashboardSummary = Awaited<ReturnType<typeof loadDashboardSummary>>;

const stats = [
  { label: "Total Extinguishers", value: 128 },
  { label: "Active", value: 104 },
  { label: "Expired", value: 8 },
  { label: "Under Maintenance", value: 16 },
  { label: "Pending Inspections", value: 21 },
  { label: "Overdue Inspections", value: 5 }
];

const recentItems = [
  { label: "Inspection completed", detail: "EXT-1024 inspected in Block A" },
  { label: "Maintenance logged", detail: "EXT-0881 returned to service" },
  { label: "Inspection scheduled", detail: "EXT-1107 due next Tuesday" }
];

function formatUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const result = await loadDashboardSummary();
      setSummary(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load gateway status."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Operational overview for extinguisher inventory, inspections, and the API gateway."
        action={
          <Button variant="outline" onClick={() => void refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Role context</CardTitle>
            <CardDescription>
              Current permissions come from the backend-authenticated user session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3">
              <span className="text-slate-500">Signed-in role</span>
              <StatusBadge status={user?.role ?? "user"} />
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Scope</p>
              <p className="font-medium text-slate-900">
                {canAccessAdminArea(user?.role ?? "user")
                  ? "Admin access"
                  : canManageExtinguishers(user?.role ?? "user")
                    ? "Operational manager"
                    : "Read-only user"}
              </p>
            </div>
            <p className="text-slate-600">
              {user
                ? `Signed in as ${user.firstName} ${user.lastName} (${ROLE_LABELS[user.role]})`
                : "Session is loading."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role-based shortcuts</CardTitle>
            <CardDescription>
              These controls are driven by the authenticated user role.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Extinguishers</p>
              <p className="font-medium text-slate-900">
                {canManageExtinguishers(user?.role ?? "user")
                  ? "Create and edit enabled"
                  : "View only"}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Admin console</p>
              <p className="font-medium text-slate-900">
                {canAccessAdminArea(user?.role ?? "user")
                  ? "Users and settings enabled"
                  : "Hidden from this role"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? <LoadingState /> : null}

      {!loading && error ? (
        <Card>
          <CardHeader>
            <CardTitle>Gateway unavailable</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => void refresh()}>
              Retry connection
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!loading && summary ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>API gateway</CardTitle>
              <CardDescription>
                Live service information returned from the backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={summary.gateway.status} />
                <span className="text-sm text-slate-500">
                  {summary.gateway.service}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Stack</p>
                  <p className="text-sm font-medium text-slate-900">
                    {summary.gateway.stack}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">API style</p>
                  <p className="text-sm font-medium text-slate-900">
                    {summary.gateway.apiStyle}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Uptime</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatUptime(summary.health.uptime)}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Monitoring</p>
                  <p className="text-sm font-medium text-slate-900">
                    {summary.examples.service.monitoring}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service capability</CardTitle>
              <CardDescription>
                Useful backend details for the operations UI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Databases
                </p>
                <div className="flex flex-wrap gap-2">
                  {summary.examples.databases.map((database) => (
                    <StatusBadge key={database.key} status={database.name} />
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Security</p>
                <p className="text-sm font-medium text-slate-900">
                  {summary.examples.security}
                </p>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Monitoring</p>
                <p className="text-sm font-medium text-slate-900">
                  {summary.monitoring.status}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Operational events to keep the site team oriented.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentItems.map((item) => (
              <div key={item.label} className="rounded-md border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational notes</CardTitle>
            <CardDescription>
              Keep the frontend focused on task execution, not decoration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              The shell, navigation, and dashboard are now aligned with the
              backend gateway and the operations brief.
            </p>
            <p>
              Next step is to connect the list and form pages to the relevant
              domain service endpoints.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
