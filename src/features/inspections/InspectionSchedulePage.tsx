import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { ApiError } from "../../lib/api";
import { canScheduleInspections } from "../../lib/permissions";
import { useAuth } from "../auth/auth.store";
import { listExtinguishers } from "../extinguishers/extinguisher.api";
import type { FireExtinguisher } from "../extinguishers/extinguisher.types";
import { listUsers } from "../users/users.api";
import type { UserRecord } from "../users/users.types";
import { scheduleInspection } from "./inspection.api";

type FormValues = {
  extinguisherId: string;
  inspectionDate: string;
  inspectionTime: string;
  assignedInspectorId: string;
  notes: string;
};

const initialValues: FormValues = {
  extinguisherId: "",
  inspectionDate: "",
  inspectionTime: "",
  assignedInspectorId: "",
  notes: ""
};

export function InspectionSchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [extinguishers, setExtinguishers] = useState<FireExtinguisher[]>([]);
  const [inspectors, setInspectors] = useState<UserRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const canSchedule = canScheduleInspections(user?.role ?? "user");

  useEffect(() => {
    if (!canSchedule) {
      setLoading(false);
      return;
    }

    async function loadOptions() {
      setLoading(true);

      try {
        const response = await listExtinguishers();
        setExtinguishers(response);

        if (user?.role === "admin") {
          const users = await listUsers();
          setInspectors(users.filter((item) => item.role === "inspector"));
        }
      } catch (requestError) {
        setError(
          requestError instanceof ApiError ? requestError.message : "Unable to load form options."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadOptions();
  }, [canSchedule, user?.role]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const created = await scheduleInspection({
        extinguisherId: values.extinguisherId,
        inspectionDate: values.inspectionDate,
        inspectionTime: values.inspectionTime,
        assignedInspectorId: values.assignedInspectorId,
        notes: values.notes || undefined
      });

      navigate(`/inspections/${created.id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to schedule inspection."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading schedule form..." description="Preparing inspection options." />
        <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule inspection"
        description="Create an inspection record backed by the inspection service."
        action={
          <Link to="/inspections" className={buttonVariants({ variant: "outline" })}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to list
          </Link>
        }
      />

      {!canSchedule ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Your role cannot create inspection schedules.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Inspection details</CardTitle>
          <CardDescription>
            Choose the extinguisher, date, time, and assigned inspector.
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
                <label htmlFor="inspectionDate" className="text-sm font-medium text-slate-900">
                  Inspection date
                </label>
                <Input
                  id="inspectionDate"
                  type="date"
                  value={values.inspectionDate}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, inspectionDate: event.target.value }))
                  }
                  required
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
                    setValues((current) => ({ ...current, inspectionTime: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="assignedInspectorId" className="text-sm font-medium text-slate-900">
                  Assigned inspector
                </label>
                {user?.role === "admin" && inspectors.length > 0 ? (
                  <Select
                    id="assignedInspectorId"
                    value={values.assignedInspectorId}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        assignedInspectorId: event.target.value
                      }))
                    }
                    required
                  >
                    <option value="">Select an inspector</option>
                    {inspectors.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.firstName} {item.lastName} ({item.email})
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id="assignedInspectorId"
                    placeholder="Inspector user id"
                    value={values.assignedInspectorId}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        assignedInspectorId: event.target.value
                      }))
                    }
                    required
                  />
                )}
                <p className="text-xs text-slate-500">
                  {user?.role === "admin"
                    ? "Admins can choose from inspector accounts."
                    : "Non-admin users must supply the assigned inspector id."}
                </p>
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

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={submitting || !canSchedule}>
                {submitting ? "Scheduling..." : "Schedule inspection"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/inspections")}
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
