import { FormEvent, useState } from "react";
import { Button } from "../../components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import type {
  ExtinguisherSize,
  ExtinguisherStatus,
  ExtinguisherType,
  FireExtinguisher
} from "./extinguisher.types";

type ExtinguisherFormValues = Omit<FireExtinguisher, "id" | "lastInspection">;

const typeOptions: ExtinguisherType[] = ["Water", "CO2", "Foam", "Dry Chemical"];
const sizeOptions: ExtinguisherSize[] = ["1.5 lb", "5 lb", "9 lb", "12 lb"];
const statusOptions: ExtinguisherStatus[] = [
  "active",
  "expired",
  "maintenance",
  "decommissioned"
];

type ExtinguisherFormProps = {
  initialValues: ExtinguisherFormValues;
  submitLabel: string;
};

export function ExtinguisherForm({
  initialValues,
  submitLabel
}: ExtinguisherFormProps) {
  const [formValues, setFormValues] = useState<ExtinguisherFormValues>(
    initialValues
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fire extinguisher details</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="serialNumber" className="text-sm font-medium text-slate-900">
                Serial number
              </label>
              <Input
                id="serialNumber"
                value={formValues.serialNumber}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    serialNumber: event.target.value
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-slate-900">
                Location
              </label>
              <Input
                id="location"
                value={formValues.location}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    location: event.target.value
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-slate-900">
                Type
              </label>
              <Select
                id="type"
                value={formValues.type}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    type: event.target.value as ExtinguisherType
                  }))
                }
              >
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="size" className="text-sm font-medium text-slate-900">
                Size
              </label>
              <Select
                id="size"
                value={formValues.size}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    size: event.target.value as ExtinguisherSize
                  }))
                }
              >
                {sizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="installationDate" className="text-sm font-medium text-slate-900">
                Installation date
              </label>
              <Input
                id="installationDate"
                type="date"
                value={formValues.installationDate}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    installationDate: event.target.value
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="expiryDate" className="text-sm font-medium text-slate-900">
                Expiry date
              </label>
              <Input
                id="expiryDate"
                type="date"
                value={formValues.expiryDate}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    expiryDate: event.target.value
                  }))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="status" className="text-sm font-medium text-slate-900">
                Status
              </label>
              <Select
                id="status"
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    status: event.target.value as ExtinguisherStatus
                  }))
                }
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit">{submitLabel}</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
