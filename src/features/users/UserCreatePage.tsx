import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { ApiError } from "../../lib/api";
import { createUser } from "./users.api";
import type { CreateUserInput, UserRole, UserStatus } from "./users.types";

const roleOptions: UserRole[] = ["admin", "inspector", "user"];
const statusOptions: UserStatus[] = ["active", "inactive", "suspended"];

const initialValues: CreateUserInput = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "user",
  status: "active"
};

export function UserCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<CreateUserInput>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const created = await createUser(values);
      navigate(`/users/${created.id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to create user."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create user"
        description="Create a backend user account with the requested role and status."
        action={
          <Link to="/users" className={buttonVariants({ variant: "outline" })}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to list
          </Link>
        }
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>New user</CardTitle>
          <CardDescription>
            Public signup remains user-only. This form is for admin provisioning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-slate-900">
                  First name
                </label>
                <Input
                  id="firstName"
                  value={values.firstName}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, firstName: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-slate-900">
                  Last name
                </label>
                <Input
                  id="lastName"
                  value={values.lastName}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, lastName: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-900">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-900">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={values.password}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-slate-900">
                  Role
                </label>
                <Select
                  id="role"
                  value={values.role}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      role: event.target.value as UserRole
                    }))
                  }
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="status" className="text-sm font-medium text-slate-900">
                  Status
                </label>
                <Select
                  id="status"
                  value={values.status}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      status: event.target.value as UserStatus
                    }))
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create user"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/users")}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
