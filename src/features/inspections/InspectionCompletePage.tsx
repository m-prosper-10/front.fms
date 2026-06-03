import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { ApiError } from "../../lib/api";
import { canCompleteInspections } from "../../lib/permissions";
import { useAuth } from "../auth/auth.store";
import { getInspection, completeInspection } from "./inspection.api";
import type { InspectionRecord, InspectionResult } from "./inspection.types";

const resultOptions: InspectionResult[] = ["passed", "failed", "requires_maintenance"];

type FormValues = {
  result: InspectionResult;
  findings: string;
  notes: string;
};

export function InspectionCompletePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canComplete = canCompleteInspections(user?.role ?? "user");
  const [record, setRecord] = useState<InspectionRecord | null>(null);
  const [values, setValues] = useState<FormValues>({
    result: "passed",
    findings: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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
        setValues({
          result: inspection.result ?? "passed",
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

    void loadRecord();
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id || !record) return;

    setSubmitting(true);
    setError(null);

    try {
      const updated = await completeInspection(id, {
        result: values.result,
        findings: values.findings || undefined,
        notes: values.notes || undefined
      });

      navigate(`/inspections/${updated.id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to complete inspection."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading completion form..." description="Fetching inspection record." />
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

  const needsMaintenance = values.result === "requires_maintenance";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complete inspection"
        description="Record the outcome and findings."
        action={
          <Link to={`/inspections/${record.id}`} className={buttonVariants({ variant: "outline" })}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to details
          </Link>
        }
      />

      {!canComplete ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Your role cannot complete inspections.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Completion details</CardTitle>
          <CardDescription>
            Completing an inspection marks it as completed on the backend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="result" className="text-sm font-medium text-slate-900">
                  Result
                </label>
                <Select
                  id="result"
                  value={values.result}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      result: event.target.value as InspectionResult
                    }))
                  }
                >
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
                    setValues((current) => ({ ...current, findings: event.target.value }))
                  }
                  placeholder="Optional findings"
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
                    setValues((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="Optional notes"
                />
              </div>
            </div>

            {needsMaintenance ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                This outcome requires maintenance. After saving, you can create a maintenance log for this extinguisher.
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={submitting || !canComplete}>
                {submitting ? "Completing..." : "Complete inspection"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(`/inspections/${record.id}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              {needsMaintenance ? (
                <Link
                  to={`/maintenance/new?extinguisherId=${record.extinguisherId}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Create maintenance
                </Link>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
