import { Card, CardContent, CardHeader } from "../ui/card";

export function LoadingState() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-3">
            <div className="h-4 w-40 rounded bg-slate-200" />
            <div className="h-3 w-64 rounded bg-slate-100" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-32 rounded-lg border border-dashed border-slate-200 bg-slate-50" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
