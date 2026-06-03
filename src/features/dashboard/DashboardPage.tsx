import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "../../components/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { LoadingState } from "../../components/shared/LoadingState";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { ApiError } from "../../lib/api";
import { ROLE_LABELS, canAccessReporting, canManageExtinguishers } from "../../lib/permissions";
import { useAuth } from "../auth/auth.store";
import type { DashboardReport, ReportModuleMeta } from "../reports/reports.types";
import type { NotificationModuleMeta, PublicNotification } from "../notifications/notifications.types";
import {
  loadNotifications,
  loadNotificationMeta,
  loadReportingDashboard
} from "./dashboard.api";

type DashboardData = {
  reportMeta: ReportModuleMeta | null;
  report: DashboardReport | null;
  notificationMeta: NotificationModuleMeta | null;
  notifications: PublicNotification[];
};

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function MetricCard({
  title,
  value,
  description
}: {
  title: string;
  value: number | string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {description ? (
        <CardContent className="pt-0 text-sm text-slate-500">{description}</CardContent>
      ) : null}
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    reportMeta: null,
    report: null,
    notificationMeta: null,
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const canViewReporting = canAccessReporting(user?.role ?? "user");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setError(null);

        if (canViewReporting) {
          const [reporting, notificationMeta, notifications] = await Promise.all([
            loadReportingDashboard(),
            loadNotificationMeta(),
            loadNotifications()
          ]);

          if (!mounted) {
            return;
          }

          setData({
            reportMeta: reporting.reportMeta,
            report: reporting.dashboard,
            notificationMeta,
            notifications
          });
        } else {
          const notifications = await loadNotifications();

          if (!mounted) {
            return;
          }

          setData({
            reportMeta: null,
            report: null,
            notificationMeta: null,
            notifications
          });
        }
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        const message =
          requestError instanceof ApiError ? requestError.message : "Unable to load dashboard.";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, [canViewReporting, reloadToken]);

  const unreadNotifications = useMemo(
    () => data.notifications.filter((item) => !item.isRead).length,
    [data.notifications]
  );

  function refresh() {
    setRefreshing(true);
    setReloadToken((current) => current + 1);
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Role-aware operations overview backed by the reporting and notification services."
        action={
          <Button variant="outline" onClick={refresh} disabled={refreshing}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        }
      />

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Unable to load dashboard</CardTitle>
            <CardDescription className="text-red-700">{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Role" value={ROLE_LABELS[user?.role ?? "user"]} />
        <MetricCard title="Unread notifications" value={formatNumber(unreadNotifications)} />
        <MetricCard title="Notifications total" value={formatNumber(data.notifications.length)} />
        <MetricCard
          title="Reporting access"
          value={canViewReporting ? "Enabled" : "Limited"}
          description={
            canViewReporting
              ? "Reporting service is available to this role."
              : "User role sees the notification-backed dashboard only."
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Role context</CardTitle>
            <CardDescription>
              Session state and workflow visibility are derived from the backend-authenticated user.
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
                {canAccessReporting(user?.role ?? "user")
                  ? "Reporting and notifications"
                  : canManageExtinguishers(user?.role ?? "user")
                    ? "Operational and notifications"
                    : "Notifications only"}
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
            <CardTitle>Backend modules</CardTitle>
            <CardDescription>
              Current service status reported by the reporting and notification modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={data.reportMeta?.status || "unknown"} />
              <Badge tone="muted">Reports</Badge>
              <StatusBadge status={data.notificationMeta?.status || "unknown"} />
              <Badge tone="muted">Notifications</Badge>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Reporting module</p>
                <p className="font-medium text-slate-900">
                  {data.reportMeta?.module || "reports"} at {data.reportMeta?.status || "unknown"}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Notification module</p>
                <p className="font-medium text-slate-900">
                  {data.notificationMeta?.module || "notifications"} at{" "}
                  {data.notificationMeta?.status || "unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {canViewReporting ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Operational dashboard</h2>
            <p className="text-sm text-slate-500">
              Snapshot pulled from the reporting-service dashboard endpoint.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Total extinguishers" value={formatNumber(data.report?.totalExtinguishers ?? 0)} />
            <MetricCard title="Active" value={formatNumber(data.report?.activeExtinguishers ?? 0)} />
            <MetricCard title="Expired" value={formatNumber(data.report?.expiredExtinguishers ?? 0)} />
            <MetricCard title="Under maintenance" value={formatNumber(data.report?.underMaintenance ?? 0)} />
            <MetricCard title="Pending inspections" value={formatNumber(data.report?.pendingInspections ?? 0)} />
            <MetricCard title="Completed inspections" value={formatNumber(data.report?.completedInspections ?? 0)} />
            <MetricCard title="Overdue inspections" value={formatNumber(data.report?.overdueInspections ?? 0)} />
            <MetricCard title="Upcoming expirations" value={formatNumber(data.report?.upcomingExpirations ?? 0)} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent maintenance</CardTitle>
              <CardDescription>Latest maintenance records returned by the reporting service.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="px-6 py-3 font-medium">Extinguisher</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.report?.recentMaintenance || []).map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-6 py-4 text-slate-700">{item.extinguisherId}</td>
                      <td className="px-6 py-4 text-slate-700">{item.actionTaken}</td>
                      <td className="px-6 py-4 text-slate-700">{formatDateTime(item.maintenanceDate)}</td>
                      <td className="px-6 py-4 text-slate-700">{item.issuesIdentified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard access</CardTitle>
            <CardDescription>
              Reporting metrics are reserved for admin and inspector roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            This role still receives notification and workflow updates from the backend.
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500">Latest items from the notification service.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Latest notifications</CardTitle>
            <CardDescription>Read and unread items returned by the backend notification service.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data.notifications.slice(0, 5) || []).map((item) => (
              <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.type} />
                    <Badge tone={item.isRead ? "muted" : "warning"}>
                      {item.isRead ? "Read" : "Unread"}
                    </Badge>
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
              </div>
            ))}
            {data.notifications.length === 0 ? (
              <p className="text-sm text-slate-500">No notifications available for this session.</p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
