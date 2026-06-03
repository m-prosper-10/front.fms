import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ApiError } from "../../lib/api";
import { canManageMaintenance } from "../../lib/permissions";
import { useAuth } from "../auth/auth.store";
import { getExtinguisher } from "../extinguishers/extinguisher.api";
import type { FireExtinguisher } from "../extinguishers/extinguisher.types";
import { deleteMaintenance, getMaintenance } from "../inspections/inspection.api";
import type { MaintenanceRecord } from "../inspections/inspection.types";

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

export function MaintenanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = canManageMaintenance(user?.role ?? "user");
  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [extinguisher, setExtinguisher] = useState<FireExtinguisher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadRecord() {
    if (!id) {
      setError("Invalid maintenance id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const maintenance = await getMaintenance(id);
      setRecord(maintenance);
      setExtinguisher(await getExtinguisher(maintenance.extinguisherId));
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to load maintenance."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecord();
  }, [id]);

  async function handleDelete() {
    if (!id || !record) return;

    const confirmed = window.confirm("Delete this maintenance record?");

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      await deleteMaintenance(id);
      navigate("/maintenance", { replace: true });
    } catch (requestError) {
      setMessage(
        requestError instanceof ApiError ? requestError.message : "Unable to delete maintenance."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading maintenance..." description="Fetching record from backend." />
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
          title="Maintenance not found"
          description={error ?? "The requested record is not available."}
          action={
            <Link to="/maintenance" className={buttonVariants({ variant: "outline" })}>
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
        title={`Maintenance ${record.id.slice(0, 8)}`}
        description="Maintenance record backed by the backend inspection service."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/maintenance" className={buttonVariants({ variant: "outline" })}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
            {canManage ? (
              <Link to={`/maintenance/${record.id}/edit`} className={buttonVariants()}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
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
            <CardTitle>Maintenance details</CardTitle>
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
              <p className="text-sm font-medium text-slate-900">{record.inspectorId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Action taken</p>
              <p className="text-sm font-medium text-slate-900">{record.actionTaken}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Maintenance date</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(record.maintenanceDate)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Issues identified</p>
              <p className="text-sm font-medium text-slate-900">{record.issuesIdentified}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Notes and recommendations</p>
              <p className="text-sm font-medium text-slate-900">
                {record.notesAndRecommendations ?? "N/A"}
              </p>
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
          </CardContent>
        </Card>
      </div>

      {canManage ? (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">Delete this maintenance record from the backend service.</p>
            <Button
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => void handleDelete()}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete maintenance
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
