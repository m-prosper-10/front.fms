import { FormEvent, useState } from "react";
import { Button } from "../../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import type {
  ExtinguisherCreateInput,
  ExtinguisherSize,
  ExtinguisherStatus,
  ExtinguisherType,
  ExtinguisherUpdateInput
} from "./extinguisher.types";

type BaseValues = ExtinguisherCreateInput & {
  status?: ExtinguisherStatus;
};

const typeOptions: ExtinguisherType[] = ["Water", "CO2", "Foam", "Dry Chemical"];
const sizeOptions: ExtinguisherSize[] = ["1.5 lb", "5 lb", "9 lb", "12 lb"];
const statusOptions: ExtinguisherStatus[] = [
  "active",
  "expired",
  "maintenance",
  "decommissioned"
];

type ExtinguisherFormProps = {
  initialValues: BaseValues;
  submitLabel: string;
  mode: "create" | "edit";
  onSubmit: (values: ExtinguisherCreateInput | ExtinguisherUpdateInput) => Promise<void> | void;
  onCancel?: () => void;
  loading?: boolean;
};

export function ExtinguisherForm({
  initialValues,
  submitLabel,
  mode,
  onSubmit,
  onCancel,
  loading = false
}: ExtinguisherFormProps) {
  const [formValues, setFormValues] = useState<BaseValues>(initialValues);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "create") {
      void onSubmit({
        serialNumber: formValues.serialNumber,
        location: formValues.location,
        type: formValues.type,
        size: formValues.size,
        installationDate: formValues.installationDate,
        expiryDate: formValues.expiryDate
      });
      return;
    }

    void onSubmit({
      serialNumber: formValues.serialNumber,
      location: formValues.location,
      type: formValues.type,
      size: formValues.size,
      installationDate: formValues.installationDate,
      expiryDate: formValues.expiryDate,
      status: formValues.status ?? "active"
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fire extinguisher details</CardTitle>
        <CardDescription>
          Create or update a record backed by the extinguisher service.
        </CardDescription>
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

            {mode === "edit" ? (
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="status" className="text-sm font-medium text-slate-900">
                  Status
                </label>
                <Select
                  id="status"
                  value={formValues.status ?? "active"}
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
            ) : (
              <div className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                Status is derived by the backend when the record is created.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {submitLabel}
            </Button>
            <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
