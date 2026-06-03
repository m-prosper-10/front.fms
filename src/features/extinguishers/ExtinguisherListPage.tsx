import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "../../components/button";
import { buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../components/ui/table";
import { sampleExtinguishers } from "./extinguisher.types";

export function ExtinguisherListPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredExtinguishers = useMemo(
    () =>
      sampleExtinguishers.filter((item) => {
        const matchesQuery =
          item.serialNumber.toLowerCase().includes(query.toLowerCase()) ||
          item.location.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesType = typeFilter ? item.type === typeFilter : true;

        return matchesQuery && matchesStatus && matchesType;
      }),
    [query, statusFilter, typeFilter]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fire Extinguishers"
        description="Track serial numbers, locations, expiry dates, and current status."
        action={
          <Link to="/extinguishers/new" className={buttonVariants()}>
            <Plus className="mr-2 h-4 w-4" />
            Add extinguisher
          </Link>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_0.8fr_0.8fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search serial number or location"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="maintenance">Maintenance</option>
              <option value="decommissioned">Decommissioned</option>
            </Select>
            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="">All types</option>
              <option value="Water">Water</option>
              <option value="CO2">CO2</option>
              <option value="Foam">Foam</option>
              <option value="Dry Chemical">Dry Chemical</option>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>
              Showing <span className="font-medium text-slate-900">{filteredExtinguishers.length}</span> records
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setStatusFilter("");
                setTypeFilter("");
              }}
            >
              Clear filters
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Serial number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry date</TableHead>
                  <TableHead>Last inspection</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExtinguishers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-slate-900">
                      {item.serialNumber}
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>{item.expiryDate}</TableCell>
                    <TableCell>{item.lastInspection}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/extinguishers/${item.id}`}
                          className={buttonVariants({ variant: "ghost", size: "sm" })}
                        >
                          View
                        </Link>
                        <Link
                          to={`/extinguishers/${item.id}/edit`}
                          className={buttonVariants({ variant: "ghost", size: "sm" })}
                        >
                          Edit
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
