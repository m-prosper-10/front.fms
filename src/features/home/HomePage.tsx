import { Navigate, Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, ClipboardList, Users } from "lucide-react";
import { buttonVariants } from "../../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuth } from "../auth/auth.store";

const highlights = [
  {
    title: "Inventory control",
    description: "Track extinguisher status, expiry, and location across facilities.",
    icon: ClipboardList
  },
  {
    title: "Access control",
    description: "Role-based navigation and action gating tied to the authenticated user.",
    icon: Users
  },
  {
    title: "Service-backed",
    description: "Direct integration with auth, user, and extinguisher backend services.",
    icon: ShieldCheck
  }
];

export function HomePage() {
  const { isAuthenticated, status } = useAuth();

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Loading session...
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 md:px-6">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                Fire Safety Operations
              </p>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
                Internal operations UI for extinguishers, inspections, and user access.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Clean, role-aware frontend built for authenticated workflow access. Sign in to manage records, review user access, and work against the backend services directly.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/login" className={buttonVariants()}>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                Register
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System overview</CardTitle>
              <CardDescription>
                Available to unauthenticated users as a clean entry point into the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white">
                      <Icon className="h-4 w-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
