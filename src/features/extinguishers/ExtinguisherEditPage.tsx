import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { ApiError } from "../../lib/api";
import { getExtinguisher, updateExtinguisher } from "./extinguisher.api";
import { ExtinguisherForm } from "./ExtinguisherForm";
import type { ExtinguisherUpdateInput, FireExtinguisher } from "./extinguisher.types";

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export function ExtinguisherEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<FireExtinguisher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSave(values: ExtinguisherUpdateInput) {
    if (!id) return;

    setSubmitting(true);
    setError(null);

    try {
      const updated = await updateExtinguisher(id, values);
      navigate(`/extinguishers/${updated.id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to update extinguisher."
      );
    } finally {
      setSubmitting(false);
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
        title={`Edit ${record.serialNumber}`}
        description="Update the record details and keep the register current."
        action={
          <Link to={`/extinguishers/${record.id}`} className={buttonVariants({ variant: "outline" })}>
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

      <ExtinguisherForm
        mode="edit"
        initialValues={{
          serialNumber: record.serialNumber,
          location: record.location,
          type: record.type,
          size: record.size,
          installationDate: toDateInputValue(record.installationDate),
          expiryDate: toDateInputValue(record.expiryDate),
          status: record.status
        }}
        submitLabel="Save changes"
        onSubmit={handleSave}
        loading={submitting}
        onCancel={() => navigate(`/extinguishers/${record.id}`)}
      />
    </div>
  );
}
