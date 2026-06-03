import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "../../components/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { LoadingState } from "../../components/shared/LoadingState";
import { PageHeader } from "../../components/shared/PageHeader";
import { SimpleBarChart } from "../../components/shared/SimpleBarChart";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { ApiError } from "../../lib/api";
import { useAuth } from "../auth/auth.store";
import type { NotificationType, PublicNotification } from "./notifications.types";
import { listNotifications, listNotificationsByType, markNotificationAsRead } from "./notifications.api";

const notificationTypes: NotificationType[] = ["inspection", "maintenance", "expiry", "system"];

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

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PublicNotification[]>([]);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      try {
        setError(null);
        const items =
          typeFilter === "all" ? await listNotifications() : await listNotificationsByType(typeFilter);

        if (!mounted) {
          return;
        }

        setNotifications(items);
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        const message =
          requestError instanceof ApiError
            ? requestError.message
            : "Unable to load notifications.";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      mounted = false;
    };
  }, [reloadToken, typeFilter, user?.role]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, search]);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return notifications;
    }

    return notifications.filter((item) => {
      const haystack = [item.title, item.message, item.type, item.userId].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [notifications, search]);

  const unreadCount = useMemo(
    () => filteredNotifications.filter((item) => !item.isRead).length,
    [filteredNotifications]
  );

  const typeChart = useMemo(
    () =>
      notificationTypes.map((type) => ({
        label: type,
        value: filteredNotifications.filter((item) => item.type === type).length
      })),
    [filteredNotifications]
  );

  const statusChart = useMemo(
    () => [
      { label: "Unread", value: unreadCount },
      { label: "Read", value: Math.max(filteredNotifications.length - unreadCount, 0) }
    ],
    [filteredNotifications.length, unreadCount]
  );

  const pageSize = 10;
  const totalPages = Math.max(Math.ceil(filteredNotifications.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const pagedNotifications = useMemo(
    () => filteredNotifications.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredNotifications]
  );

  async function refresh() {
    setRefreshing(true);
    setReloadToken((current) => current + 1);
  }

  async function handleMarkRead(id: string) {
    try {
      setSavingId(id);
      await markNotificationAsRead(id);
      setReloadToken((current) => current + 1);
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Notifications inbox with search, filters, and pagination."
        action={
          <Button variant="outline" onClick={() => void refresh()} disabled={refreshing}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        }
      />

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Unable to load notifications</CardTitle>
            <CardDescription className="text-red-700">{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Notification overview</CardTitle>
          <CardDescription>Current notification activity.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge tone="muted">{filteredNotifications.length} total</Badge>
          <Badge tone="muted">{unreadCount} unread</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleBarChart
          title="Notification types"
          description="Filtered notification mix for the current inbox view."
          data={typeChart}
        />
        <SimpleBarChart
          title="Read status"
          description="Read versus unread notifications in the current view."
          data={statusChart}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and narrow the notification feed.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="notification-search" className="text-sm font-medium text-slate-700">
              Search
            </label>
            <Input
              id="notification-search"
              placeholder="Title, message, type, or user id"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="notification-type" className="text-sm font-medium text-slate-700">
              Type
            </label>
            <Select
              id="notification-type"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as NotificationType | "all")}
            >
              <option value="all">All types</option>
              {notificationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full md:w-auto" variant="outline" onClick={() => setSearch("")}>
              Clear search
            </Button>
          </div>
        </CardContent>
      </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Notifications for the current session.</CardDescription>
          </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedNotifications.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 max-w-2xl text-slate-500">{item.message}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.type} />
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={item.isRead ? "muted" : "warning"}>
                      {item.isRead ? "Read" : "Unread"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{formatDateTime(item.createdAt)}</td>
                  <td className="px-6 py-4">
                    {!item.isRead ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleMarkRead(item.id)}
                        disabled={savingId === item.id}
                      >
                        {savingId === item.id ? "Saving..." : "Mark read"}
                      </Button>
                    ) : (
                      <span className="text-slate-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredNotifications.length === 0 ? (
            <div className="border-t border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
              No notifications matched your filters.
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
              <p>
                Showing <span className="font-medium text-slate-900">{pagedNotifications.length}</span>{" "}
                of <span className="font-medium text-slate-900">{filteredNotifications.length}</span>{" "}
                notifications
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
