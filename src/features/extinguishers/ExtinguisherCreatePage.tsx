import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { ApiError } from "../../lib/api";
import { createExtinguisher } from "./extinguisher.api";
import { ExtinguisherForm } from "./ExtinguisherForm";
import type { ExtinguisherCreateInput } from "./extinguisher.types";

const initialValues: ExtinguisherCreateInput = {
  serialNumber: "",
  location: "",
  type: "CO2",
  size: "5 lb",
  installationDate: "",
  expiryDate: ""
};

function resolveCreatedId(record: { id?: string; _id?: string } | null | undefined) {
  if (record && typeof record.id === "string" && record.id.trim()) {
    return record.id;
  }

  if (record && typeof record._id === "string" && record._id.trim()) {
    return record._id;
  }

  return null;
}

export function ExtinguisherCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(values: ExtinguisherCreateInput) {
    setSubmitting(true);
    setError(null);

    try {
      const created = await createExtinguisher(values);
      const createdId = resolveCreatedId(created);

      if (!createdId) {
        setError("The backend created the record but did not return a usable id.");
        return;
      }

      navigate(`/extinguishers/${createdId}`, {
        replace: true,
        state: { record: created }
      });
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to create extinguisher."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add extinguisher"
        description="Create a new fire extinguisher record for the register."
        action={
          <Link to="/extinguishers" className={buttonVariants({ variant: "outline" })}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to list
          </Link>
        }
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <ExtinguisherForm
        mode="create"
        initialValues={initialValues}
        submitLabel="Create record"
        onSubmit={handleCreate}
        loading={submitting}
        onCancel={() => navigate("/extinguishers")}
      />
    </div>
  );
}
