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
import { getMaintenance, updateMaintenance } from "../inspections/inspection.api";
import type { MaintenanceRecord } from "../inspections/inspection.types";

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

type FormValues = {
  extinguisherId: string;
  actionTaken: string;
  maintenanceDate: string;
  issuesIdentified: string;
  notesAndRecommendations: string;
};

export function MaintenanceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [extinguishers, setExtinguishers] = useState<FireExtinguisher[]>([]);
  const [values, setValues] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setError("Invalid maintenance id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [maintenance, extinguisherResponse] = await Promise.all([
          getMaintenance(id),
          listExtinguishers()
        ]);

        setRecord(maintenance);
        setExtinguishers(extinguisherResponse);
        setValues({
          extinguisherId: maintenance.extinguisherId,
          actionTaken: maintenance.actionTaken,
          maintenanceDate: toDateInputValue(maintenance.maintenanceDate),
          issuesIdentified: maintenance.issuesIdentified,
          notesAndRecommendations: maintenance.notesAndRecommendations ?? ""
        });
      } catch (requestError) {
        setError(
          requestError instanceof ApiError ? requestError.message : "Unable to load maintenance."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id || !values) return;

    setSubmitting(true);
    setError(null);

    try {
      const updated = await updateMaintenance(id, {
        extinguisherId: values.extinguisherId,
        actionTaken: values.actionTaken,
        maintenanceDate: values.maintenanceDate,
        issuesIdentified: values.issuesIdentified,
        notesAndRecommendations: values.notesAndRecommendations || undefined
      });

      navigate(`/maintenance/${updated.id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to update maintenance."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !values) {
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
        title="Edit maintenance"
        description="Update the backend maintenance log."
        action={
          <Link to={`/maintenance/${record.id}`} className={buttonVariants({ variant: "outline" })}>
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
          <CardTitle>Maintenance record</CardTitle>
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
                <label htmlFor="actionTaken" className="text-sm font-medium text-slate-900">
                  Action taken
                </label>
                <Input
                  id="actionTaken"
                  value={values.actionTaken}
                  onChange={(event) =>
                    setValues((current) => current ? { ...current, actionTaken: event.target.value } : current)
                  }
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="maintenanceDate" className="text-sm font-medium text-slate-900">
                  Maintenance date
                </label>
                <Input
                  id="maintenanceDate"
                  type="date"
                  value={values.maintenanceDate}
                  onChange={(event) =>
                    setValues((current) => current ? { ...current, maintenanceDate: event.target.value } : current)
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="issuesIdentified" className="text-sm font-medium text-slate-900">
                  Issues identified
                </label>
                <Input
                  id="issuesIdentified"
                  value={values.issuesIdentified}
                  onChange={(event) =>
                    setValues((current) => current ? { ...current, issuesIdentified: event.target.value } : current)
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="notesAndRecommendations" className="text-sm font-medium text-slate-900">
                  Notes and recommendations
                </label>
                <Input
                  id="notesAndRecommendations"
                  value={values.notesAndRecommendations}
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, notesAndRecommendations: event.target.value } : current
                    )
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
                onClick={() => navigate(`/maintenance/${record.id}`)}
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
