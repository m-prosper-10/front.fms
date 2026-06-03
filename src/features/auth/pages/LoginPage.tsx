import { useState, type FormEvent } from "react";
import { Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Button, buttonVariants } from "../../../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { appConfig } from "../../../lib/config";
import { ApiError } from "../../../lib/api";
import { loginSchema, type LoginValues } from "../auth.schemas";
import { useAuth } from "../auth.store";

type FieldErrors = Partial<Record<keyof LoginValues, string>>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, status } = useAuth();
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: ""
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
    "/dashboard";

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Checking session...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={fromPath} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof LoginValues | undefined;

        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }

      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      await login(parsed.data);
      navigate(fromPath, { replace: true });
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Unable to sign in."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Fire Safety Operations
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Sign in to continue
          </h1>
          <p className="text-sm text-slate-500">
            Internal access for extinguisher and inspection workflows.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Use your account credentials to access the operations console.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-900">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-9"
                    value={values.email}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </div>
                {fieldErrors.email ? (
                  <p className="text-xs text-red-600">{fieldErrors.email}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-900">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-9"
                    value={values.password}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, password: event.target.value }))
                    }
                  />
                </div>
                {fieldErrors.password ? (
                  <p className="text-xs text-red-600">{fieldErrors.password}</p>
                ) : null}
              </div>

              {formError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign in"}
                {!submitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <Link
            to="/register"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Create account
          </Link>
          <span>Gateway: {appConfig.apiBaseUrl}</span>
        </div>
      </div>
    </main>
  );
}
