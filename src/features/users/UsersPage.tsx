import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../components/ui/table";
import { useAuth } from "../auth/auth.store";
import { ROLE_LABELS } from "../../lib/permissions";
import { ApiError } from "../../lib/api";
import { getMe, listUsers } from "./users.api";
import type { UserRecord } from "./users.types";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(value));
}

export function UsersPage() {
  const { user: sessionUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [me, setMe] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [usersResponse, meResponse] = await Promise.all([listUsers(), getMe()]);
      setUsers(usersResponse);
      setMe(meResponse);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter((item) => {
        const normalizedQuery = query.toLowerCase();
        const matchesQuery =
          item.firstName.toLowerCase().includes(normalizedQuery) ||
          item.lastName.toLowerCase().includes(normalizedQuery) ||
          item.email.toLowerCase().includes(normalizedQuery);
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesRole = roleFilter ? item.role === roleFilter : true;

        return matchesQuery && matchesStatus && matchesRole;
      }),
    [query, roleFilter, statusFilter, users]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage access, role assignments, and account status from the backend user service."
        action={
          <Button variant="outline" onClick={() => void loadData()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Current session</CardDescription>
            <CardTitle>
              {sessionUser ? `${sessionUser.firstName} ${sessionUser.lastName}` : "Unknown"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>{sessionUser?.email}</p>
            <div className="flex items-center gap-2">
              <StatusBadge status={sessionUser?.status ?? "active"} />
              <span>{ROLE_LABELS[sessionUser?.role ?? "user"]}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardDescription>Current profile loaded from /api/users/me</CardDescription>
            <CardTitle>
              {me ? `${me.firstName} ${me.lastName}` : "Loading profile"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium text-slate-900">{me?.email ?? "—"}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Role</p>
              <p className="font-medium text-slate-900">{me ? ROLE_LABELS[me.role] : "—"}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Status</p>
              <StatusBadge status={me?.status ?? "active"} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_0.7fr_0.7fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search name or email"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </Select>
            <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="inspector">Inspector</option>
              <option value="user">User</option>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>
              Showing <span className="font-medium text-slate-900">{filteredUsers.length}</span> users
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setStatusFilter("");
                setRoleFilter("");
              }}
            >
              Clear filters
            </Button>
          </div>

          {loading ? (
            <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Loading users...
            </div>
          ) : error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-slate-900">
                        {item.firstName} {item.lastName}
                      </TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{ROLE_LABELS[item.role]}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>{formatDate(item.lastLoginAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/users/${item.id}`}
                            className={buttonVariants({ variant: "ghost", size: "sm" })}
                          >
                            View
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
