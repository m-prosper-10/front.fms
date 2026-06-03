import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil, Trash2, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { useAuth } from "../auth/auth.store";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ApiError } from "../../lib/api";
import { canDeleteExtinguishers, canManageExtinguishers } from "../../lib/permissions";
import { deleteExtinguisher, getExtinguisher } from "./extinguisher.api";
import type { FireExtinguisher } from "./extinguisher.types";

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

export function ExtinguisherDetailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [record, setRecord] = useState<FireExtinguisher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManage = canManageExtinguishers(user?.role ?? "user");
  const canDelete = canDeleteExtinguishers(user?.role ?? "user");

  async function loadRecord() {
    if (!id) {
      setError("Invalid extinguisher id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getExtinguisher(id);
      setRecord(response);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to load extinguisher."
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

    const confirmed = window.confirm("Delete this extinguisher record?");

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      await deleteExtinguisher(id);
      navigate("/extinguishers", { replace: true });
    } catch (requestError) {
      setMessage(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to delete extinguisher."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading extinguisher..." description="Fetching record from backend." />
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
          title="Extinguisher not found"
          description={error ?? "The requested record is not available."}
          action={
            <Link to="/extinguishers" className={buttonVariants({ variant: "outline" })}>
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
        title={record.serialNumber}
        description="Detailed record view backed by the extinguisher service."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/extinguishers" className={buttonVariants({ variant: "outline" })}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
            {canManage ? (
              <Link to={`/extinguishers/${record.id}/edit`} className={buttonVariants()}>
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
            <CardTitle>Record summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
              <p className="text-sm font-medium text-slate-900">{record.location}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Type</p>
              <p className="text-sm font-medium text-slate-900">{record.type}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Size</p>
              <p className="text-sm font-medium text-slate-900">{record.size}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <StatusBadge status={record.status} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Installation date</p>
              <p className="text-sm font-medium text-slate-900">
                {formatDate(record.installationDate)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Expiry date</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(record.expiryDate)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Record metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Created by</p>
              <p className="font-medium text-slate-900">{record.createdBy}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Updated by</p>
              <p className="font-medium text-slate-900">{record.updatedBy ?? "N/A"}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Created at</p>
              <p className="font-medium text-slate-900">{formatDate(record.createdAt)}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Updated at</p>
              <p className="font-medium text-slate-900">{formatDate(record.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {canDelete ? (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              Delete this extinguisher record from the backend service.
            </p>
            <Button
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => void handleDelete()}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete extinguisher
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
