import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const badgeStyles: Record<string, string> = {
  default: "border-slate-200 bg-slate-100 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  muted: "border-slate-200 bg-slate-50 text-slate-600"
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof badgeStyles;
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        badgeStyles[tone],
        className
      )}
      {...props}
    />
  );
}
