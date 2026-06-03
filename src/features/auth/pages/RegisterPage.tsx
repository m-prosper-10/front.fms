import { useState, type FormEvent } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { Button, buttonVariants } from "../../../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { appConfig } from "../../../lib/config";
import { ApiError } from "../../../lib/api";
import { registerSchema, type RegisterValues } from "../auth.schemas";
import { useAuth } from "../auth.store";

type FieldErrors = Partial<Record<keyof RegisterValues, string>>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, status } = useAuth();
  const [values, setValues] = useState<RegisterValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = registerSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof RegisterValues | undefined;

        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }

      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      await register({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        password: parsed.data.password
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Unable to create account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Fire Safety Operations
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="text-sm text-slate-500">
            Register for internal access to the operations console.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              New accounts are created with the user role by default.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-slate-900">
                    First name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="firstName"
                      className="pl-9"
                      value={values.firstName}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          firstName: event.target.value
                        }))
                      }
                    />
                  </div>
                  {fieldErrors.firstName ? (
                    <p className="text-xs text-red-600">{fieldErrors.firstName}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-slate-900">
                    Last name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="lastName"
                      className="pl-9"
                      value={values.lastName}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          lastName: event.target.value
                        }))
                      }
                    />
                  </div>
                  {fieldErrors.lastName ? (
                    <p className="text-xs text-red-600">{fieldErrors.lastName}</p>
                  ) : null}
                </div>
              </div>

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

              <div className="grid gap-4 sm:grid-cols-2">
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
                        setValues((current) => ({
                          ...current,
                          password: event.target.value
                        }))
                      }
                    />
                  </div>
                  {fieldErrors.password ? (
                    <p className="text-xs text-red-600">{fieldErrors.password}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-900">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="pl-9"
                      value={values.confirmPassword}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          confirmPassword: event.target.value
                        }))
                      }
                    />
                  </div>
                  {fieldErrors.confirmPassword ? (
                    <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                  ) : null}
                </div>
              </div>

              {formError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Create account"}
                {!submitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <Link
            to="/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Back to sign in
          </Link>
          <span>Gateway: {appConfig.apiBaseUrl}</span>
        </div>
      </div>
    </main>
  );
}
