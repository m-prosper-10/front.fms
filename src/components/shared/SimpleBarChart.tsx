import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";

export interface SimpleBarDatum {
  label: string;
  value: number;
}

type SimpleBarChartProps = {
  title: string;
  description?: string;
  data: SimpleBarDatum[];
  emptyLabel?: string;
  valueSuffix?: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function SimpleBarChart({
  title,
  description,
  data,
  emptyLabel = "No data available.",
  valueSuffix = ""
}: SimpleBarChartProps) {
  const max = Math.max(...data.map((item) => item.value), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length > 0 ? (
          data.map((item) => {
            const width = max > 0 ? Math.max((item.value / max) * 100, item.value > 0 ? 8 : 0) : 0;

            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">
                    {formatNumber(item.value)}
                    {valueSuffix}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-slate-900 transition-[width] duration-300"
                    style={{ width: `${width}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            {emptyLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
