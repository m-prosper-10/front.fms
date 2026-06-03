import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Card, CardContent } from "../../components/ui/card";
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
import { ApiError } from "../../lib/api";
import {
  ROLE_LABELS,
  canCompleteInspections,
  canManageInspections,
  canScheduleInspections,
  canViewInspectorDirectory
} from "../../lib/permissions";
import { deleteInspection, listInspections } from "./inspection.api";
import type { InspectionRecord, InspectionStatus } from "./inspection.types";
import { listExtinguishers } from "../extinguishers/extinguisher.api";
import type { FireExtinguisher } from "../extinguishers/extinguisher.types";
import { listInspectors } from "../users/users.api";
import type { UserRecord } from "../users/users.types";

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

function formatDateTime(date: string | null | undefined, time: string | null | undefined) {
  if (!date) return "N/A";
  return `${formatDate(date)}${time ? ` ${time}` : ""}`;
}

export function InspectionListPage() {
  const { user } = useAuth();
  const canSchedule = canScheduleInspections(user?.role ?? "user");
  const canManage = canManageInspections(user?.role ?? "user");
  const canComplete = canCompleteInspections(user?.role ?? "user");
  const canViewInspectors = canViewInspectorDirectory(user?.role ?? "user");
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [extinguishers, setExtinguishers] = useState<FireExtinguisher[]>([]);
  const [inspectors, setInspectors] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [inspectionsResponse, extinguishersResponse, inspectorsResponse] = await Promise.all([
        listInspections(),
        listExtinguishers(),
        canViewInspectors ? listInspectors() : Promise.resolve([] as UserRecord[])
      ]);
      setRecords(inspectionsResponse as InspectionRecord[]);
      setExtinguishers(extinguishersResponse as FireExtinguisher[]);
      setInspectors(inspectorsResponse);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to load inspections."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [user?.role]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, user?.role]);

  const extinguisherMap = useMemo(
    () => new Map(extinguishers.map((item) => [item.id, item])),
    [extinguishers]
  );

  const inspectorMap = useMemo(
    () => new Map(inspectors.map((item) => [item.id, item])),
    [inspectors]
  );

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        if (user?.role === "user" && item.scheduledBy !== user.id) {
          return false;
        }

        const normalizedQuery = query.toLowerCase();
        const extinguisher = extinguisherMap.get(item.extinguisherId);
        const assignedInspector = inspectorMap.get(item.assignedInspectorId);
        const matchesQuery =
          item.id.toLowerCase().includes(normalizedQuery) ||
          item.extinguisherId.toLowerCase().includes(normalizedQuery) ||
          item.assignedInspectorId.toLowerCase().includes(normalizedQuery) ||
          (extinguisher?.serialNumber?.toLowerCase().includes(normalizedQuery) ?? false) ||
          (assignedInspector?.firstName?.toLowerCase().includes(normalizedQuery) ?? false) ||
          (assignedInspector?.lastName?.toLowerCase().includes(normalizedQuery) ?? false);
        const matchesStatus = statusFilter ? item.status === statusFilter : true;

        return matchesQuery && matchesStatus;
      }),
    [extinguisherMap, inspectorMap, query, records, statusFilter, user?.id, user?.role]
  );

  const totalPages = Math.max(Math.ceil(filteredRecords.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = useMemo(
    () => filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredRecords]
  );

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this inspection record?");

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      await deleteInspection(id);
      setRecords((current) => current.filter((item) => item.id !== id));
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to delete inspection."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspections"
        description="Schedule, track, and complete inspection work against the backend inspection service."
        action={
          <div className="flex flex-wrap gap-2">
            {canSchedule ? (
              <Link to="/inspections/new" className={buttonVariants()}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule inspection
              </Link>
            ) : null}
            <Button variant="outline" onClick={() => void loadData()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-4 md:p-6 text-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Session role</p>
            <p className="font-medium text-slate-900">{ROLE_LABELS[user?.role ?? "user"]}</p>
            <p className="text-slate-500">
              {canSchedule
                ? user?.role === "user"
                  ? "Can schedule inspections and view only personal inspection records."
                  : "Can schedule inspections."
                : canManage
                  ? "Can manage and complete inspections."
                  : "View-only access to inspections."}
            </p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="space-y-2 p-4 md:p-6 text-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Service note</p>
            <p className="font-medium text-slate-900">Inspections and maintenance are backed by the inspection service.</p>
            <p className="text-slate-500">
              Filters and actions are gated by frontend role checks and the backend will enforce them again.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_0.7fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search inspection id, extinguisher, or inspector"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>
              Showing <span className="font-medium text-slate-900">{filteredRecords.length}</span>{" "}
              inspections
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setStatusFilter("");
              }}
            >
              Clear filters
            </Button>
          </div>

          {loading ? (
            <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Loading inspections...
            </div>
          ) : error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Inspection</TableHead>
                      <TableHead>Extinguisher</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedRecords.map((item) => {
                      const extinguisher = extinguisherMap.get(item.extinguisherId);
                      const inspector = inspectorMap.get(item.assignedInspectorId);

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-slate-900">
                            {item.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            {extinguisher ? extinguisher.serialNumber : item.extinguisherId}
                          </TableCell>
                          <TableCell>
                            {inspector
                              ? `${inspector.firstName} ${inspector.lastName}`
                              : item.assignedInspectorId}
                          </TableCell>
                          <TableCell>{formatDateTime(item.inspectionDate, item.inspectionTime)}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={item.result ?? "pending"} />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Link
                                to={`/inspections/${item.id}`}
                                className={buttonVariants({ variant: "ghost", size: "sm" })}
                              >
                                View
                              </Link>
                              {canManage ? (
                                <Link
                                  to={`/inspections/${item.id}/edit`}
                                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                                >
                                  Edit
                                </Link>
                              ) : null}
                              {canComplete ? (
                                <Link
                                  to={`/inspections/${item.id}/complete`}
                                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                                >
                                  Complete
                                </Link>
                              ) : null}
                              {canManage ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => void handleDelete(item.id)}
                                  disabled={deletingId === item.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500">
                <p>
                  Showing <span className="font-medium text-slate-900">{pagedRecords.length}</span> of{" "}
                  <span className="font-medium text-slate-900">{filteredRecords.length}</span> inspections
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
