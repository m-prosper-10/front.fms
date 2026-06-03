import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { ApiError } from "../../lib/api";
import { canManageMaintenance } from "../../lib/permissions";
import { useAuth } from "../auth/auth.store";
import { listExtinguishers } from "../extinguishers/extinguisher.api";
import type { FireExtinguisher } from "../extinguishers/extinguisher.types";
import { createMaintenance } from "../inspections/inspection.api";

type FormValues = {
  extinguisherId: string;
  actionTaken: string;
  maintenanceDate: string;
  issuesIdentified: string;
  notesAndRecommendations: string;
};

const initialValues: FormValues = {
  extinguisherId: "",
  actionTaken: "",
  maintenanceDate: "",
  issuesIdentified: "",
  notesAndRecommendations: ""
};

export function MaintenanceCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const canManage = canManageMaintenance(user?.role ?? "user");
  const [values, setValues] = useState<FormValues>({
    ...initialValues,
    extinguisherId: searchParams.get("extinguisherId") ?? ""
  });
  const [extinguishers, setExtinguishers] = useState<FireExtinguisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        setExtinguishers(await listExtinguishers());
      } catch (requestError) {
        setError(
          requestError instanceof ApiError ? requestError.message : "Unable to load extinguishers."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const created = await createMaintenance({
        extinguisherId: values.extinguisherId,
        actionTaken: values.actionTaken,
        maintenanceDate: values.maintenanceDate,
        issuesIdentified: values.issuesIdentified,
        notesAndRecommendations: values.notesAndRecommendations || undefined
      });

      navigate(`/maintenance/${created.id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to create maintenance."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading maintenance form..." description="Preparing extinguisher options." />
        <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add maintenance"
        description="Create a backend maintenance record."
        action={
          <Link to="/maintenance" className={buttonVariants({ variant: "outline" })}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to list
          </Link>
        }
      />

      {!canManage ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Your role cannot create maintenance records.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Maintenance details</CardTitle>
          <CardDescription>
            Log the work performed and the issue that was addressed.
          </CardDescription>
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
                    setValues((current) => ({ ...current, extinguisherId: event.target.value }))
                  }
                  required
                >
                  <option value="">Select an extinguisher</option>
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
                    setValues((current) => ({ ...current, actionTaken: event.target.value }))
                  }
                  required
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
                    setValues((current) => ({ ...current, maintenanceDate: event.target.value }))
                  }
                  required
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
                    setValues((current) => ({ ...current, issuesIdentified: event.target.value }))
                  }
                  required
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
                    setValues((current) => ({
                      ...current,
                      notesAndRecommendations: event.target.value
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={submitting || !canManage}>
                {submitting ? "Saving..." : "Create maintenance"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/maintenance")}
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
