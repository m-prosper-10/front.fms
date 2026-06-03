import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "../../components/button";
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
          <Button variant="outline" asChild={undefined as never}>
            <Link to="/extinguishers">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to list
            </Link>
          </Button>
        }
      />

      <ExtinguisherForm initialValues={initialValues} submitLabel="Create record" />
    </div>
  );
}
