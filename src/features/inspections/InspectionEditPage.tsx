import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { ApiError } from "../../lib/api";
import { listExtinguishers } from "../extinguishers/extinguisher.api";
import type { FireExtinguisher } from "../extinguishers/extinguisher.types";
import { useAuth } from "../auth/auth.store";
import { getInspection, updateInspection } from "./inspection.api";
import type { InspectionRecord, InspectionStatus, InspectionResult } from "./inspection.types";

const statusOptions: InspectionStatus[] = ["pending", "completed", "overdue", "cancelled"];
const resultOptions: InspectionResult[] = ["passed", "failed", "requires_maintenance"];

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

type FormValues = {
  extinguisherId: string;
  inspectionDate: string;
  inspectionTime: string;
  assignedInspectorId: string;
  status: InspectionStatus;
  result: InspectionResult | "";
  findings: string;
  notes: string;
};

export function InspectionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [record, setRecord] = useState<InspectionRecord | null>(null);
  const [extinguishers, setExtinguishers] = useState<FireExtinguisher[]>([]);
  const [values, setValues] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setError("Invalid inspection id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [inspection, extinguisherResponse] = await Promise.all([
          getInspection(id),
          listExtinguishers()
        ]);

        setRecord(inspection);
        setExtinguishers(extinguisherResponse);
        setValues({
          extinguisherId: inspection.extinguisherId,
          inspectionDate: toDateInputValue(inspection.inspectionDate),
          inspectionTime: inspection.inspectionTime,
          assignedInspectorId: inspection.assignedInspectorId,
          status: inspection.status,
          result: inspection.result ?? "",
          findings: inspection.findings ?? "",
          notes: inspection.notes ?? ""
        });
      } catch (requestError) {
        setError(
          requestError instanceof ApiError ? requestError.message : "Unable to load inspection."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id, user?.role]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id || !values) return;

    setSubmitting(true);
    setError(null);

    try {
      const updated = await updateInspection(id, {
        extinguisherId: values.extinguisherId,
        inspectionDate: values.inspectionDate,
        inspectionTime: values.inspectionTime,
        assignedInspectorId: values.assignedInspectorId,
        status: values.status,
        result: values.result || undefined,
        findings: values.findings || undefined,
        notes: values.notes || undefined
      });

      navigate(`/inspections/${updated.id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to update inspection."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !values) {
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
        title="Edit inspection"
        description="Update schedule, assignment, and status."
        action={
          <Link to={`/inspections/${record.id}`} className={buttonVariants({ variant: "outline" })}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to details
          </Link>
        }
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Inspection record</CardTitle>
          <CardDescription>Admin and inspector roles can update this record.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="extinguisherId" className="text-sm font-medium text-slate-900">
                  Fire extinguisher
                </label>
                <Select
                  id="extinguisherId"
                  value={values.extinguisherId}
                  onChange={(event) =>
                    setValues((current) => current ? { ...current, extinguisherId: event.target.value } : current)
                  }
                >
                  {extinguishers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.serialNumber} - {item.location}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="inspectionDate" className="text-sm font-medium text-slate-900">
                  Inspection date
                </label>
                <Input
                  id="inspectionDate"
                  type="date"
                  value={values.inspectionDate}
                  onChange={(event) =>
                    setValues((current) => current ? { ...current, inspectionDate: event.target.value } : current)
                  }
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="inspectionTime" className="text-sm font-medium text-slate-900">
                  Inspection time
                </label>
                <Input
                  id="inspectionTime"
                  type="time"
                  value={values.inspectionTime}
                  onChange={(event) =>
                    setValues((current) => current ? { ...current, inspectionTime: event.target.value } : current)
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="assignedInspectorId" className="text-sm font-medium text-slate-900">
                  Assigned inspector
                </label>
                <Input
                  id="assignedInspectorId"
                  value={values.assignedInspectorId}
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, assignedInspectorId: event.target.value } : current
                    )
                  }
                />
                <p className="text-xs text-slate-500">
                  Admin users can enter any inspector id. Inspectors can keep the current id or replace it manually.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-slate-900">
                  Status
                </label>
                <Select
                  id="status"
                  value={values.status}
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, status: event.target.value as InspectionStatus } : current
                    )
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="result" className="text-sm font-medium text-slate-900">
                  Result
                </label>
                <Select
                  id="result"
                  value={values.result}
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, result: event.target.value as InspectionResult | "" } : current
                    )
                  }
                >
                  <option value="">No result yet</option>
                  {resultOptions.map((result) => (
                    <option key={result} value={result}>
                      {result}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="findings" className="text-sm font-medium text-slate-900">
                  Findings
                </label>
                <Input
                  id="findings"
                  value={values.findings}
                  onChange={(event) =>
                    setValues((current) => current ? { ...current, findings: event.target.value } : current)
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="notes" className="text-sm font-medium text-slate-900">
                  Notes
                </label>
                <Input
                  id="notes"
                  value={values.notes}
                  onChange={(event) =>
                    setValues((current) => current ? { ...current, notes: event.target.value } : current)
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save changes"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(`/inspections/${record.id}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
