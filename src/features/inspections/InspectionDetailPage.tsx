import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ApiError } from "../../lib/api";
import {
  canCompleteInspections,
  canManageInspections,
  canViewInspectorDirectory
} from "../../lib/permissions";
import { useAuth } from "../auth/auth.store";
import { getExtinguisher } from "../extinguishers/extinguisher.api";
import type { FireExtinguisher } from "../extinguishers/extinguisher.types";
import { deleteInspection, getInspection, listMaintenanceByExtinguisher } from "./inspection.api";
import type { InspectionRecord, MaintenanceRecord } from "./inspection.types";
import { listInspectors } from "../users/users.api";
import type { UserRecord } from "../users/users.types";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function InspectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = canManageInspections(user?.role ?? "user");
  const canComplete = canCompleteInspections(user?.role ?? "user");
  const canViewInspectors = canViewInspectorDirectory(user?.role ?? "user");
  const [record, setRecord] = useState<InspectionRecord | null>(null);
  const [extinguisher, setExtinguisher] = useState<FireExtinguisher | null>(null);
  const [inspectors, setInspectors] = useState<UserRecord[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadRecord() {
    if (!id) {
      setError("Invalid inspection id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const inspection = await getInspection(id);
      setRecord(inspection);

      const related = await Promise.allSettled([
        getExtinguisher(inspection.extinguisherId),
        listMaintenanceByExtinguisher(inspection.extinguisherId),
        canViewInspectors ? listInspectors() : Promise.resolve([])
      ]);

      if (related[0].status === "fulfilled") {
        setExtinguisher(related[0].value);
      }
      if (related[1].status === "fulfilled") {
        setMaintenance(related[1].value);
      }
      if (related[2].status === "fulfilled") {
        setInspectors(related[2].value);
      }
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to load inspection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecord();
  }, [id]);

  const inspector = inspectors.find((item) => item.id === record?.assignedInspectorId);

  async function handleDelete() {
    if (!id || !record) return;

    const confirmed = window.confirm("Delete this inspection record?");

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      await deleteInspection(id);
      navigate("/inspections", { replace: true });
    } catch (requestError) {
      setMessage(
        requestError instanceof ApiError ? requestError.message : "Unable to delete inspection."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading inspection..." description="Fetching record from backend." />
        <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Inspection not found"
          description={error ?? "The requested record is not available."}
          action={
            <Link to="/inspections" className={buttonVariants({ variant: "outline" })}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to list
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Inspection ${record.id.slice(0, 8)}`}
        description="Inspection record backed by the backend inspection service."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/inspections" className={buttonVariants({ variant: "outline" })}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
            {canManage ? (
              <Link to={`/inspections/${record.id}/edit`} className={buttonVariants()}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            ) : null}
            {canComplete ? (
              <Link
                to={`/inspections/${record.id}/complete`}
                className={buttonVariants({ variant: "outline" })}
              >
                Complete
              </Link>
            ) : null}
            <Button variant="outline" onClick={() => void loadRecord()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {message ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inspection details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Extinguisher</p>
              <p className="text-sm font-medium text-slate-900">
                {extinguisher ? `${extinguisher.serialNumber} - ${extinguisher.location}` : record.extinguisherId}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Inspector</p>
              <p className="text-sm font-medium text-slate-900">
                {inspector ? `${inspector.firstName} ${inspector.lastName}` : record.assignedInspectorId}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Scheduled by</p>
              <p className="text-sm font-medium text-slate-900">{record.scheduledBy}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Scheduled for</p>
              <p className="text-sm font-medium text-slate-900">
                {formatDate(record.inspectionDate)} {record.inspectionTime}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <StatusBadge status={record.status} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Result</p>
              <StatusBadge status={record.result ?? "pending"} />
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Findings</p>
              <p className="text-sm font-medium text-slate-900">{record.findings ?? "N/A"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Notes</p>
              <p className="text-sm font-medium text-slate-900">{record.notes ?? "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Created</p>
              <p className="font-medium text-slate-900">{formatDate(record.createdAt)}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Updated</p>
              <p className="font-medium text-slate-900">{formatDate(record.updatedAt)}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Completed</p>
              <p className="font-medium text-slate-900">{formatDate(record.completedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Related maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {maintenance.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              No maintenance records found for this extinguisher.
            </div>
          ) : (
            <div className="space-y-3">
              {maintenance.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{item.actionTaken}</p>
                      <p className="text-xs text-slate-500">{formatDate(item.maintenanceDate)}</p>
                    </div>
                    <StatusBadge status="completed" />
                  </div>
                  <p className="mt-2 text-slate-600">{item.issuesIdentified}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to={`/maintenance/${item.id}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      View maintenance
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {canManage ? (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">Delete this inspection record from the backend service.</p>
            <Button
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => void handleDelete()}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete inspection
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
