import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { SectionPage } from "./components/shared/SectionPage";
import { HomePage } from "./features/home/HomePage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { ExtinguisherCreatePage } from "./features/extinguishers/ExtinguisherCreatePage";
import { ExtinguisherDetailPage } from "./features/extinguishers/ExtinguisherDetailPage";
import { ExtinguisherEditPage } from "./features/extinguishers/ExtinguisherEditPage";
import { ExtinguisherListPage } from "./features/extinguishers/ExtinguisherListPage";
import { UserDetailPage } from "./features/users/UserDetailPage";
import { UserCreatePage } from "./features/users/UserCreatePage";
import { UsersPage } from "./features/users/UsersPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />
      },
      {
        path: "extinguishers",
        element: <ExtinguisherListPage />
      },
      {
        path: "extinguishers/new",
        element: (
          <ProtectedRoute allowedRoles={["admin", "inspector"]}>
            <ExtinguisherCreatePage />
          </ProtectedRoute>
        )
      },
      {
        path: "extinguishers/:id",
        element: <ExtinguisherDetailPage />
      },
      {
        path: "extinguishers/:id/edit",
        element: (
          <ProtectedRoute allowedRoles={["admin", "inspector"]}>
            <ExtinguisherEditPage />
          </ProtectedRoute>
        )
      },
      {
        path: "inspections",
        element: (
          <SectionPage
            title="Inspections"
            description="Inspection scheduling, completion, and follow-up workflows will live here."
          />
        )
      },
      {
        path: "maintenance",
        element: (
          <ProtectedRoute allowedRoles={["admin", "inspector"]}>
            <SectionPage
              title="Maintenance"
              description="Maintenance logging and work order tracking will be added here."
            />
          </ProtectedRoute>
        )
      },
      {
        path: "reports",
        element: (
          <SectionPage
            title="Reports"
            description="Inventory, inspection, compliance, and maintenance reports will be surfaced here."
          />
        )
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <UsersPage />
          </ProtectedRoute>
        )
      },
      {
        path: "users/new",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserCreatePage />
          </ProtectedRoute>
        )
      },
      {
        path: "users/:id",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserDetailPage />
          </ProtectedRoute>
        )
      },
      {
        path: "notifications",
        element: (
          <SectionPage
            title="Notifications"
            description="Operational alerts and reminders will be presented here."
          />
        )
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <SectionPage
              title="Settings"
              description="Application and role settings are available to admin users."
            />
          </ProtectedRoute>
        )
      },
      {
        path: "*",
        element: (
          <SectionPage
            title="Page not found"
            description="The requested route does not exist in this workspace."
          />
        )
      }
    ]
  },
  {
    path: "/register",
    element: <RegisterPage />
  }
]);
