import { Badge } from "../ui/badge";

type StatusBadgeProps = {
  status: string;
};

const tones: Record<string, "success" | "warning" | "danger" | "info" | "muted"> =
  {
  active: "success",
  inactive: "muted",
  expired: "danger",
  maintenance: "warning",
  decommissioned: "muted",
  pending: "warning",
  completed: "success",
  overdue: "danger",
  cancelled: "muted",
  suspended: "danger",
  healthy: "success",
  warning: "warning",
  offline: "danger",
    ok: "success"
  };

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = tones[status.toLowerCase()] || "muted";
  const label = status.replaceAll("_", " ");

  return <Badge tone={tone}>{label}</Badge>;
}
