import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
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
import { canManageMaintenance } from "../../lib/permissions";
import { listExtinguishers } from "../extinguishers/extinguisher.api";
import type { FireExtinguisher } from "../extinguishers/extinguisher.types";
import { deleteMaintenance, listMaintenance } from "../inspections/inspection.api";
import type { MaintenanceRecord } from "../inspections/inspection.types";

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

export function MaintenanceListPage() {
  const { user } = useAuth();
  const canManage = canManageMaintenance(user?.role ?? "user");
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [extinguishers, setExtinguishers] = useState<FireExtinguisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [maintenanceResponse, extinguisherResponse] = await Promise.all([
        listMaintenance(),
        listExtinguishers()
      ]);
      setRecords(maintenanceResponse);
      setExtinguishers(extinguisherResponse);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to load maintenance logs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const extinguisherMap = useMemo(
    () => new Map(extinguishers.map((item) => [item.id, item])),
    [extinguishers]
  );

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        const normalizedQuery = query.toLowerCase();
        const extinguisher = extinguisherMap.get(item.extinguisherId);

        return (
          item.actionTaken.toLowerCase().includes(normalizedQuery) ||
          item.issuesIdentified.toLowerCase().includes(normalizedQuery) ||
          item.extinguisherId.toLowerCase().includes(normalizedQuery) ||
          (extinguisher?.serialNumber?.toLowerCase().includes(normalizedQuery) ?? false)
        );
      }),
    [extinguisherMap, query, records]
  );

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this maintenance log?");

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await deleteMaintenance(id);
      setRecords((current) => current.filter((item) => item.id !== id));
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to delete maintenance."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="Track maintenance work tied to inspection outcomes."
        action={
          <div className="flex flex-wrap gap-2">
            {canManage ? (
              <Link to="/maintenance/new" className={buttonVariants()}>
                <Plus className="mr-2 h-4 w-4" />
                Add maintenance
              </Link>
            ) : null}
            <Button variant="outline" onClick={() => void loadData()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search by action, issue, or extinguisher"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>
              Showing <span className="font-medium text-slate-900">{filteredRecords.length}</span>{" "}
              maintenance records
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
              }}
            >
              Clear filters
            </Button>
          </div>

          {loading ? (
            <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Loading maintenance logs...
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
                    <TableHead>Extinguisher</TableHead>
                    <TableHead>Action taken</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Maintenance date</TableHead>
                    <TableHead>Issues identified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((item) => {
                    const extinguisher = extinguisherMap.get(item.extinguisherId);

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-slate-900">
                          {extinguisher ? extinguisher.serialNumber : item.extinguisherId}
                        </TableCell>
                        <TableCell>{item.actionTaken}</TableCell>
                        <TableCell>{item.inspectorId}</TableCell>
                        <TableCell>{formatDate(item.maintenanceDate)}</TableCell>
                        <TableCell>{item.issuesIdentified}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/maintenance/${item.id}`}
                              className={buttonVariants({ variant: "ghost", size: "sm" })}
                            >
                              View
                            </Link>
                            {canManage ? (
                              <Link
                                to={`/maintenance/${item.id}/edit`}
                                className={buttonVariants({ variant: "ghost", size: "sm" })}
                              >
                                Edit
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
