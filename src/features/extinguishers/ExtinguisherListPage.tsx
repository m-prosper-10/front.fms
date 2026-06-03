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
import { canDeleteExtinguishers, canManageExtinguishers } from "../../lib/permissions";
import { deleteExtinguisher, listExtinguishers } from "./extinguisher.api";
import type { FireExtinguisher } from "./extinguisher.types";

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

export function ExtinguisherListPage() {
  const { user } = useAuth();
  const canManage = canManageExtinguishers(user?.role ?? "user");
  const canDelete = canDeleteExtinguishers(user?.role ?? "user");
  const [records, setRecords] = useState<FireExtinguisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadRecords() {
    setLoading(true);
    setError(null);

    try {
      const response = await listExtinguishers();
      setRecords(response);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to load extinguisher records."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        const matchesQuery =
          item.serialNumber.toLowerCase().includes(query.toLowerCase()) ||
          item.location.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesType = typeFilter ? item.type === typeFilter : true;

        return matchesQuery && matchesStatus && matchesType;
      }),
    [query, records, statusFilter, typeFilter]
  );

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this extinguisher record?");

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      await deleteExtinguisher(id);
      setRecords((current) => current.filter((item) => item.id !== id));
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to delete extinguisher."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fire Extinguishers"
        description="Track serial numbers, locations, expiry dates, and current status from the extinguisher service."
        action={
          canManage ? (
            <Link to="/extinguishers/new" className={buttonVariants()}>
              <Plus className="mr-2 h-4 w-4" />
              Add extinguisher
            </Link>
          ) : (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              View-only access
            </div>
          )
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-500">
              {canManage
                ? "Admin and inspector roles can create and edit records."
                : "Your current role can only view extinguisher records."}
            </div>
            <Button variant="outline" size="sm" onClick={() => void loadRecords()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.5fr_0.8fr_0.8fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search serial number or location"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="maintenance">Maintenance</option>
              <option value="decommissioned">Decommissioned</option>
            </Select>
            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="">All types</option>
              <option value="Water">Water</option>
              <option value="CO2">CO2</option>
              <option value="Foam">Foam</option>
              <option value="Dry Chemical">Dry Chemical</option>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>
              Showing <span className="font-medium text-slate-900">{filteredRecords.length}</span>{" "}
              records
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setStatusFilter("");
                setTypeFilter("");
              }}
            >
              Clear filters
            </Button>
          </div>

          {loading ? (
            <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Loading extinguisher records...
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
                    <TableHead>Serial number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry date</TableHead>
                    <TableHead>Last updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-slate-900">
                        {item.serialNumber}
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>{formatDate(item.expiryDate)}</TableCell>
                      <TableCell>{formatDate(item.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/extinguishers/${item.id}`}
                            className={buttonVariants({ variant: "ghost", size: "sm" })}
                          >
                            View
                          </Link>
                          {canManage ? (
                            <Link
                              to={`/extinguishers/${item.id}/edit`}
                              className={buttonVariants({ variant: "ghost", size: "sm" })}
                            >
                              Edit
                            </Link>
                          ) : null}
                          {canDelete ? (
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
