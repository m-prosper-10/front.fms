import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { ExtinguisherForm } from "./ExtinguisherForm";
import { sampleExtinguishers } from "./extinguisher.types";

export function ExtinguisherEditPage() {
  const { id } = useParams();
  const extinguisher = sampleExtinguishers.find((item) => item.id === id);

  if (!extinguisher) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Extinguisher not found"
          description="The requested record is not available in the local sample set."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${extinguisher.serialNumber}`}
        description="Update the record details and keep the register current."
        action={
          <Link
            to={`/extinguishers/${extinguisher.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to details
          </Link>
        }
      />

      <ExtinguisherForm
        initialValues={{
          serialNumber: extinguisher.serialNumber,
          location: extinguisher.location,
          type: extinguisher.type,
          size: extinguisher.size,
          installationDate: extinguisher.installationDate,
          expiryDate: extinguisher.expiryDate,
          status: extinguisher.status
        }}
        submitLabel="Save changes"
      />
    </div>
  );
}
