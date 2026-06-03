import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { ExtinguisherForm } from "./ExtinguisherForm";

const initialValues = {
  serialNumber: "",
  location: "",
  type: "CO2" as const,
  size: "5 lb" as const,
  installationDate: "",
  expiryDate: "",
  status: "active" as const
};

export function ExtinguisherCreatePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add extinguisher"
        description="Create a new fire extinguisher record for the operations register."
        action={
          <Link to="/extinguishers" className={buttonVariants({ variant: "outline" })}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to list
          </Link>
        }
      />

      <ExtinguisherForm initialValues={initialValues} submitLabel="Create record" />
    </div>
  );
}
