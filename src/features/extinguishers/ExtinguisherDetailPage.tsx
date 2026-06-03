import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Pencil } from "lucide-react";
import { buttonVariants } from "../../components/button";
import { useAuth } from "../auth/auth.store";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { canManageExtinguishers } from "../../lib/permissions";
import { sampleExtinguishers } from "./extinguisher.types";

export function ExtinguisherDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const extinguisher = sampleExtinguishers.find((item) => item.id === id);
  const canManage = canManageExtinguishers(user?.role ?? "user");

  if (!extinguisher) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Extinguisher not found"
          description="The requested record is not available in the local sample set."
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
        title={extinguisher.serialNumber}
        description="Detailed record view for the selected extinguisher."
        action={
          <div className="flex gap-2">
            <Link to="/extinguishers" className={buttonVariants({ variant: "outline" })}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
            {canManage ? (
              <Link
                to={`/extinguishers/${extinguisher.id}/edit`}
                className={buttonVariants()}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Record summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
              <p className="text-sm font-medium text-slate-900">{extinguisher.location}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Type</p>
              <p className="text-sm font-medium text-slate-900">{extinguisher.type}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Size</p>
              <p className="text-sm font-medium text-slate-900">{extinguisher.size}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <StatusBadge status={extinguisher.status} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Installation date</p>
              <p className="text-sm font-medium text-slate-900">{extinguisher.installationDate}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Expiry date</p>
              <p className="text-sm font-medium text-slate-900">{extinguisher.expiryDate}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inspection status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Last inspection</p>
              <p className="font-medium text-slate-900">{extinguisher.lastInspection}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Workflow</p>
              <p className="font-medium text-slate-900">Ready for review</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
