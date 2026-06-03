import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { PageHeader } from "./PageHeader";

type SectionPageProps = {
  title: string;
  description: string;
};

export function SectionPage({ title, description }: SectionPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Module scaffold</CardTitle>
          <CardDescription>
            This section is present in the navigation and ready for backend
            connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            The layout, navigation, and shared UI are in place. The next step is
            wiring the domain-specific data and forms to the relevant service.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="muted">Responsive</Badge>
            <Badge tone="muted">Role-aware</Badge>
            <Badge tone="muted">Operations-ready</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
