import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "../../components/button";
import { SimpleBarChart } from "../../components/shared/SimpleBarChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { LoadingState } from "../../components/shared/LoadingState";
import { ApiError } from "../../lib/api";
import { canExportReports } from "../../lib/permissions";
import { useAuth } from "../auth/auth.store";
import { listInspectors } from "../users/users.api";
import type { UserRecord } from "../users/users.types";
import type {
  ComplianceReport,
  DashboardReport,
  InspectionReport,
  InventoryPeriodReport,
  InventoryReport,
  MaintenanceReport,
  MaintenanceEntry,
  ReportPeriod
} from "./reports.types";
import {
  exportCsvReport,
  exportPdfReport,
  getComplianceReport,
  getCompletedInspectionReport,
  getDashboardReport,
  getExpiredComplianceReport,
  getInspectionReport,
  getInventoryPeriodReport,
  getInventoryReport,
  getMaintenanceHistoryReport,
  getMaintenanceRecentReport,
  getMaintenanceReport,
  getOverdueInspectionReport,
  getPendingInspectionReport,
  getUpcomingExpirationsReport
} from "./report.api";

type RangeState = {
  from: string;
  to: string;
};

type ReportsState = {
  dashboard: DashboardReport | null;
  inventory: InventoryReport | null;
  inventoryPeriod: InventoryPeriodReport | null;
  inspections: InspectionReport | null;
  pendingInspections: InspectionReport | null;
  completedInspections: InspectionReport | null;
  overdueInspections: InspectionReport | null;
  compliance: ComplianceReport | null;
  expiredCompliance: ComplianceReport | null;
  upcomingCompliance: ComplianceReport | null;
  maintenance: MaintenanceReport | null;
  maintenanceHistory: MaintenanceEntry[] | null;
  maintenanceRecent: MaintenanceEntry[] | null;
  inspectors: UserRecord[];
};

const initialRange: RangeState = {
  from: "",
  to: ""
};

const periods: ReportPeriod[] = ["daily", "monthly", "yearly"];

function toRangeInput(range: RangeState) {
  const input: { from?: string; to?: string } = {};
  if (range.from) {
    input.from = range.from;
  }
  if (range.to) {
    input.to = range.to;
  }
  return input;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadJsonFile(filename: string, data: unknown) {
  downloadTextFile(filename, JSON.stringify(data, null, 2), "application/json");
}

function metricValue(metrics: { count: number }[] | null | undefined, label: string) {
  return metrics?.find((item) => item.label.toLowerCase() === label.toLowerCase())?.count ?? 0;
}

function MetricCard({
  title,
  value,
  description
}: {
  title: string;
  value: number | string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {description ? (
        <CardContent className="pt-0 text-sm text-slate-500">{description}</CardContent>
      ) : null}
    </Card>
  );
}

function SectionTable({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="overflow-x-auto">{children}</CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const { user } = useAuth();
  const [rangeDraft, setRangeDraft] = useState<RangeState>(initialRange);
  const [range, setRange] = useState<RangeState>(initialRange);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("monthly");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "csv" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ReportsState>({
    dashboard: null,
    inventory: null,
    inventoryPeriod: null,
    inspections: null,
    pendingInspections: null,
    completedInspections: null,
    overdueInspections: null,
    compliance: null,
    expiredCompliance: null,
    upcomingCompliance: null,
    maintenance: null,
    maintenanceHistory: null,
    maintenanceRecent: null,
    inspectors: []
  });
  const [reloadToken, setReloadToken] = useState(0);

  const rangeInput = useMemo(() => toRangeInput(range), [range]);
  const canExport = canExportReports(user?.role ?? "user");

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      try {
        setError(null);
        const [
          dashboard,
          inventory,
          inventoryPeriod,
          inspections,
          pendingInspections,
          completedInspections,
          overdueInspections,
          compliance,
          expiredCompliance,
          upcomingCompliance,
          maintenance,
          maintenanceHistory,
          maintenanceRecent,
        ] = await Promise.all([
          getDashboardReport(),
          getInventoryReport(rangeInput),
          getInventoryPeriodReport(selectedPeriod, rangeInput),
          getInspectionReport(rangeInput),
          getPendingInspectionReport(rangeInput),
          getCompletedInspectionReport(rangeInput),
          getOverdueInspectionReport(rangeInput),
          getComplianceReport(),
          getExpiredComplianceReport(),
          getUpcomingExpirationsReport(),
          getMaintenanceReport(rangeInput),
          getMaintenanceHistoryReport(rangeInput),
          getMaintenanceRecentReport(rangeInput),
          listInspectors()
        ]);

        if (!mounted) {
          return;
        }

        setState({
          dashboard,
          inventory,
          inventoryPeriod,
          inspections,
          pendingInspections,
          completedInspections,
          overdueInspections,
          compliance,
          expiredCompliance,
          upcomingCompliance,
          maintenance,
          maintenanceHistory,
          maintenanceRecent,
          inspectors
        });
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        const message =
          loadError instanceof ApiError ? loadError.message : "Failed to load reporting data";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadReports();

    return () => {
      mounted = false;
    };
  }, [reloadToken, rangeInput, selectedPeriod]);

  function applyFilters() {
    setRange(rangeDraft);
    setRefreshing(true);
    setReloadToken((current) => current + 1);
  }

  function refreshReports() {
    setRefreshing(true);
    setReloadToken((current) => current + 1);
  }

  async function handleExport(format: "pdf" | "csv") {
    try {
      setExporting(format);
      const exportPayload = format === "pdf" ? await exportPdfReport() : await exportCsvReport();

      if (format === "csv" && exportPayload.csv) {
        downloadTextFile(exportPayload.filename, exportPayload.csv, "text/csv;charset=utf-8");
        return;
      }

      downloadJsonFile(exportPayload.filename.replace(/\.pdf$/i, ".json"), exportPayload);
    } finally {
      setExporting(null);
    }
  }

  const dashboard = state.dashboard;
  const inventory = state.inventory;
  const inventoryPeriod = state.inventoryPeriod;
  const inspections = state.inspections;
  const compliance = state.compliance;
  const maintenance = state.maintenance;
  const inspectorMap = useMemo(
    () => new Map(state.inspectors.map((item) => [item.id, item])),
    [state.inspectors]
  );

  function resolveInspector(id: string) {
    const inspector = inspectorMap.get(id);

    if (!inspector) {
      return id;
    }

    return `${inspector.firstName} ${inspector.lastName}`;
  }

  const reportCharts = useMemo(() => {
    const inventoryStatus = (inventory?.byStatus || []).map((item) => ({
      label: item.label,
      value: item.count
    }));
    const inspectionStatus = (inspections?.byStatus || []).map((item) => ({
      label: item.label,
      value: item.count
    }));
    const maintenanceActions = (maintenance?.byAction || []).map((item) => ({
      label: item.label,
      value: item.count
    }));
    const complianceSummary = compliance
      ? [
          { label: "Expired", value: compliance.expiredExtinguishers },
          { label: "Expiring", value: compliance.expiringWithin30Days },
          { label: "Compliant", value: compliance.compliantExtinguishers },
          { label: "Overdue inspections", value: compliance.overdueInspections }
        ]
      : [];

    if (user?.role === "user") {
      return [
        {
          title: "Inventory snapshot",
          description: "Read-only inventory status.",
          data: inventoryStatus
        },
        {
          title: "Inspection snapshot",
          description: "User-visible inspection state summary.",
          data: inspectionStatus
        },
        {
          title: "Compliance snapshot",
          description: "Public compliance indicators available to the user role.",
          data: complianceSummary
        }
      ];
    }

    if (user?.role === "inspector") {
      return [
        {
          title: "Inspection snapshot",
          description: "Inspection workflow state for operational users.",
          data: inspectionStatus
        },
        {
          title: "Maintenance actions",
          description: "Logged maintenance actions for the active period.",
          data: maintenanceActions
        },
        {
          title: "Compliance snapshot",
          description: "Compliance signals relevant to inspection work.",
          data: complianceSummary
        }
      ];
    }

    return [
      {
        title: "Inventory snapshot",
        description: "Extinguisher status distribution.",
        data: inventoryStatus
      },
      {
        title: "Inspection snapshot",
        description: "Inspection workflow distribution.",
        data: inspectionStatus
      },
      {
        title: "Maintenance actions",
        description: "Maintenance actions grouped by type.",
        data: maintenanceActions
      }
    ];
  }, [compliance, inspections?.byStatus, inventory?.byStatus, maintenance?.byAction, user?.role]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Operational reports and summaries."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={refreshReports} disabled={refreshing}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
            {canExport ? (
              <>
                <Button variant="outline" onClick={() => void handleExport("csv")} disabled={exporting !== null}>
                  <Download className="mr-2 h-4 w-4" />
                  {exporting === "csv" ? "Exporting CSV" : "Export CSV"}
                </Button>
                <Button onClick={() => void handleExport("pdf")} disabled={exporting !== null}>
                  <Download className="mr-2 h-4 w-4" />
                  {exporting === "pdf" ? "Exporting bundle" : "Export PDF bundle"}
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Unable to load reports</CardTitle>
            <CardDescription className="text-red-700">{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Report filters</CardTitle>
          <CardDescription>
            Filter date-bound reports and timeline views.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="report-from">
              From
            </label>
            <Input
              id="report-from"
              type="date"
              value={rangeDraft.from}
              onChange={(event) =>
                setRangeDraft((current) => ({ ...current, from: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="report-to">
              To
            </label>
            <Input
              id="report-to"
              type="date"
              value={rangeDraft.to}
              onChange={(event) =>
                setRangeDraft((current) => ({ ...current, to: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="inventory-period">
              Inventory timeline
            </label>
            <Select
              id="inventory-period"
              value={selectedPeriod}
              onChange={(event) => {
                setRefreshing(true);
                setSelectedPeriod(event.target.value as ReportPeriod);
              }}
            >
              {periods.map((period) => (
                <option key={period} value={period}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full md:w-auto" onClick={applyFilters}>
              Apply filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Visual snapshot</h2>
          <p className="text-sm text-slate-500">
            Summary charts for stock, inspections, and maintenance.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total extinguishers" value={formatNumber(dashboard?.totalExtinguishers ?? 0)} />
          <MetricCard title="Active" value={formatNumber(dashboard?.activeExtinguishers ?? 0)} />
          <MetricCard title="Expired" value={formatNumber(dashboard?.expiredExtinguishers ?? 0)} />
          <MetricCard title="Under maintenance" value={formatNumber(dashboard?.underMaintenance ?? 0)} />
          <MetricCard title="Pending inspections" value={formatNumber(dashboard?.pendingInspections ?? 0)} />
          <MetricCard title="Completed inspections" value={formatNumber(dashboard?.completedInspections ?? 0)} />
          <MetricCard title="Overdue inspections" value={formatNumber(dashboard?.overdueInspections ?? 0)} />
          <MetricCard title="Upcoming expirations" value={formatNumber(dashboard?.upcomingExpirations ?? 0)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {reportCharts.map((chart) => (
            <SimpleBarChart
              key={chart.title}
              title={chart.title}
              description={chart.description}
              data={chart.data}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Inventory report</h2>
          <p className="text-sm text-slate-500">
            Inventory snapshots and timeline use the selected date range and period.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionTable title="Status breakdown" description="Counts grouped by extinguisher status.">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {(inventory?.byStatus || []).map((item) => (
                  <tr key={item.label} className="border-b last:border-0">
                    <td className="py-3">
                      <StatusBadge status={item.label} />
                    </td>
                    <td className="py-3 font-medium text-slate-900">{formatNumber(item.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionTable>

          <SectionTable title="Type breakdown" description="Counts grouped by extinguisher type.">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {(inventory?.byType || []).map((item) => (
                  <tr key={item.label} className="border-b last:border-0">
                    <td className="py-3 text-slate-700">{item.label}</td>
                    <td className="py-3 font-medium text-slate-900">{formatNumber(item.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionTable>
        </div>

        <SectionTable title="Location breakdown" description="Counts grouped by location.">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {(inventory?.byLocation || []).map((item) => (
                <tr key={item.label} className="border-b last:border-0">
                  <td className="py-3 text-slate-700">{item.label}</td>
                  <td className="py-3 font-medium text-slate-900">{formatNumber(item.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionTable>

        <SectionTable
          title={`Inventory timeline (${selectedPeriod})`}
          description={`Timeline for the selected period.`}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 font-medium">Label</th>
                <th className="pb-3 font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {(inventoryPeriod?.timeline || []).map((item) => (
                <tr key={item.label} className="border-b last:border-0">
                  <td className="py-3 text-slate-700">{item.label}</td>
                  <td className="py-3 font-medium text-slate-900">{formatNumber(item.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionTable>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Inspection report</h2>
          <p className="text-sm text-slate-500">
            Inspection summary with status and result breakdowns.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard title="Total inspections" value={formatNumber(inspections?.totalInspections ?? 0)} />
          <MetricCard title="Pending" value={formatNumber(metricValue(inspections?.byStatus, "pending"))} />
          <MetricCard title="Completed" value={formatNumber(metricValue(inspections?.byStatus, "completed"))} />
          <MetricCard title="Overdue" value={formatNumber(metricValue(inspections?.byStatus, "overdue"))} />
          <MetricCard title="Passed" value={formatNumber(metricValue(inspections?.byResult, "passed"))} />
          <MetricCard title="Failed" value={formatNumber(metricValue(inspections?.byResult, "failed"))} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionTable title="Inspection status" description="Counts grouped by current status.">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {(inspections?.byStatus || []).map((item) => (
                  <tr key={item.label} className="border-b last:border-0">
                    <td className="py-3">
                      <StatusBadge status={item.label} />
                    </td>
                    <td className="py-3 font-medium text-slate-900">{formatNumber(item.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionTable>

          <SectionTable title="Inspection results" description="Counts grouped by result.">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Result</th>
                  <th className="pb-3 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {(inspections?.byResult || []).map((item) => (
                  <tr key={item.label} className="border-b last:border-0">
                    <td className="py-3">
                      <StatusBadge status={item.label} />
                    </td>
                    <td className="py-3 font-medium text-slate-900">{formatNumber(item.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionTable>
        </div>

        <SectionTable title="Recent inspections" description="Latest inspection records in the selected window.">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 font-medium">Extinguisher</th>
                <th className="pb-3 font-medium">Assigned inspector</th>
                <th className="pb-3 font-medium">Inspection date</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
                  {(inspections?.recentInspections || []).map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 text-slate-700">{item.extinguisherId}</td>
                      <td className="py-3 text-slate-700">{resolveInspector(item.assignedInspectorId)}</td>
                      <td className="py-3 text-slate-700">
                        {formatDate(item.inspectionDate)} {item.inspectionTime}
                      </td>
                  <td className="py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3">
                    {item.result ? <StatusBadge status={item.result} /> : <span className="text-slate-500">N/A</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionTable>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Pending slice"
            value={formatNumber(state.pendingInspections?.totalInspections ?? 0)}
            description="Filtered through /inspections/pending"
          />
          <MetricCard
            title="Completed slice"
            value={formatNumber(state.completedInspections?.totalInspections ?? 0)}
            description="Filtered through /inspections/completed"
          />
          <MetricCard
            title="Overdue slice"
            value={formatNumber(state.overdueInspections?.totalInspections ?? 0)}
            description="Filtered through /inspections/overdue"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Compliance report</h2>
          <p className="text-sm text-slate-500">
            Compliance snapshot for inventory and overdue checks.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard title="Total extinguishers" value={formatNumber(compliance?.totalExtinguishers ?? 0)} />
          <MetricCard title="Expired" value={formatNumber(compliance?.expiredExtinguishers ?? 0)} />
          <MetricCard title="Expiring in 30 days" value={formatNumber(compliance?.expiringWithin30Days ?? 0)} />
          <MetricCard title="Compliant" value={formatNumber(compliance?.compliantExtinguishers ?? 0)} />
          <MetricCard title="Overdue inspections" value={formatNumber(compliance?.overdueInspections ?? 0)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionTable
            title="Expired extinguishers"
            description="Expired extinguishers in the current view."
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Serial number</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Expiry date</th>
                </tr>
              </thead>
              <tbody>
                {(state.expiredCompliance?.expiredExtinguishersList || []).map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 text-slate-700">{item.serialNumber}</td>
                    <td className="py-3 text-slate-700">{item.location}</td>
                    <td className="py-3 text-slate-700">{formatDate(item.expiryDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionTable>

          <SectionTable
            title="Upcoming expirations"
            description="Extinguishers nearing expiry in the current view."
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Serial number</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Expiry date</th>
                </tr>
              </thead>
              <tbody>
                {(state.upcomingCompliance?.upcomingExpirations || []).map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 text-slate-700">{item.serialNumber}</td>
                    <td className="py-3 text-slate-700">{item.location}</td>
                    <td className="py-3 text-slate-700">{formatDate(item.expiryDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionTable>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Maintenance report</h2>
          <p className="text-sm text-slate-500">
            Maintenance logs and frequency summaries.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard title="Total maintenance logs" value={formatNumber(maintenance?.totalMaintenanceLogs ?? 0)} />
          <MetricCard title="Recent logs" value={formatNumber(state.maintenanceRecent?.length ?? 0)} />
          <MetricCard title="History rows" value={formatNumber(state.maintenanceHistory?.length ?? 0)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionTable title="Action breakdown" description="Counts grouped by maintenance action.">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {(maintenance?.byAction || []).map((item) => (
                  <tr key={item.label} className="border-b last:border-0">
                    <td className="py-3 text-slate-700">{item.label}</td>
                    <td className="py-3 font-medium text-slate-900">{formatNumber(item.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionTable>

          <SectionTable title="Monthly frequency" description="Counts grouped by maintenance date bucket.">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Month</th>
                  <th className="pb-3 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {(maintenance?.frequencyByMonth || []).map((item) => (
                  <tr key={item.label} className="border-b last:border-0">
                    <td className="py-3 text-slate-700">{item.label}</td>
                    <td className="py-3 font-medium text-slate-900">{formatNumber(item.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionTable>
        </div>

        <SectionTable title="Recent maintenance" description="Latest records from the maintenance summary endpoint.">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 font-medium">Extinguisher</th>
                <th className="pb-3 font-medium">Inspector</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Issues</th>
              </tr>
            </thead>
            <tbody>
              {(maintenance?.recentMaintenance || []).map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 text-slate-700">{item.extinguisherId}</td>
                    <td className="py-3 text-slate-700">{resolveInspector(item.inspectorId)}</td>
                    <td className="py-3 text-slate-700">{formatDate(item.maintenanceDate)}</td>
                    <td className="py-3 text-slate-700">{item.actionTaken}</td>
                    <td className="py-3 text-slate-700">{item.issuesIdentified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionTable>

        <SectionTable title="Maintenance history" description="Date-filtered maintenance log list from the history endpoint.">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 font-medium">Extinguisher</th>
                <th className="pb-3 font-medium">Inspector</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {(state.maintenanceHistory || []).map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-3 text-slate-700">{item.extinguisherId}</td>
                  <td className="py-3 text-slate-700">{resolveInspector(item.inspectorId)}</td>
                  <td className="py-3 text-slate-700">{formatDate(item.maintenanceDate)}</td>
                  <td className="py-3 text-slate-700">{item.actionTaken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionTable>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Report exports</CardTitle>
          <CardDescription>Download the current report bundle as CSV or JSON.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Use the export actions above to download the current reporting bundle.
        </CardContent>
      </Card>
    </div>
  );
}
