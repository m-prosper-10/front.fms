import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "../../components/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { useAuth } from "../auth/auth.store";
import { ApiError } from "../../lib/api";
import { ROLE_LABELS } from "../../lib/permissions";
import { deleteUser, getUser, updateUser, updateUserRole, updateUserStatus } from "./users.api";
import type { UserRecord } from "./users.types";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: sessionUser } = useAuth();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileValues, setProfileValues] = useState({ firstName: "", lastName: "" });
  const [roleValue, setRoleValue] = useState<UserRecord["role"]>("user");
  const [statusValue, setStatusValue] = useState<UserRecord["status"]>("active");

  async function loadUser() {
    if (!id) {
      setError("Invalid user id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getUser(id);
      setUser(response);
      setProfileValues({ firstName: response.firstName, lastName: response.lastName });
      setRoleValue(response.role);
      setStatusValue(response.status);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Unable to load user."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUser();
  }, [id]);

  async function handleProfileSave() {
    if (!id) return;

    setSaving(true);
    setMessage(null);

    try {
      const updated = await updateUser(id, profileValues);
      setUser(updated);
      setMessage("Profile updated successfully.");
    } catch (requestError) {
      setMessage(
        requestError instanceof ApiError ? requestError.message : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleSave() {
    if (!id) return;

    setSaving(true);
    setMessage(null);

    try {
      const updated = await updateUserRole(id, roleValue);
      setUser(updated);
      setMessage("Role updated successfully.");
    } catch (requestError) {
      setMessage(
        requestError instanceof ApiError ? requestError.message : "Unable to update role."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusSave() {
    if (!id) return;

    setSaving(true);
    setMessage(null);

    try {
      const updated = await updateUserStatus(id, statusValue);
      setUser(updated);
      setMessage("Status updated successfully.");
    } catch (requestError) {
      setMessage(
        requestError instanceof ApiError ? requestError.message : "Unable to update status."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !user) return;

    if (sessionUser?.id === user.id) {
      setMessage("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(`Delete ${user.firstName} ${user.lastName}?`);

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await deleteUser(id);
      navigate("/users", { replace: true });
    } catch (requestError) {
      setMessage(
        requestError instanceof ApiError ? requestError.message : "Unable to delete user."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading user..." description="Fetching record from the backend." />
        <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="User not found"
          description={error ?? "The requested record is not available."}
          action={
            <Link to="/users" className={buttonVariants({ variant: "outline" })}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to list
            </Link>
          }
        />
      </div>
    );
  }

  const isSelf = sessionUser?.id === user.id;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        description="Admin user management view backed by the user service."
        action={
          <Link to="/users" className={buttonVariants({ variant: "outline" })}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to list
          </Link>
        }
      />

      {message ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-slate-900">
                  First name
                </label>
                <Input
                  id="firstName"
                  value={profileValues.firstName}
                  onChange={(event) =>
                    setProfileValues((current) => ({
                      ...current,
                      firstName: event.target.value
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-slate-900">
                  Last name
                </label>
                <Input
                  id="lastName"
                  value={profileValues.lastName}
                  onChange={(event) =>
                    setProfileValues((current) => ({
                      ...current,
                      lastName: event.target.value
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Created</p>
                <p className="font-medium text-slate-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            <Button onClick={() => void handleProfileSave()} disabled={saving}>
              Save profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-slate-900">
                Role
              </label>
              <Select
                id="role"
                value={roleValue}
                onChange={(event) => setRoleValue(event.target.value as UserRecord["role"])}
              >
                <option value="admin">Admin</option>
                <option value="inspector">Inspector</option>
                <option value="user">User</option>
              </Select>
            </div>

            <Button onClick={() => void handleRoleSave()} disabled={saving}>
              Update role
            </Button>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-slate-900">
                Status
              </label>
              <Select
                id="status"
                value={statusValue}
                onChange={(event) => setStatusValue(event.target.value as UserRecord["status"])}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </Select>
            </div>

            <Button onClick={() => void handleStatusSave()} disabled={saving}>
              Update status
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            {isSelf
              ? "You cannot delete your own account."
              : "Deleting a user removes the record from the backend service."}
          </p>
          <Button
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={() => void handleDelete()}
            disabled={saving || isSelf}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete user
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
