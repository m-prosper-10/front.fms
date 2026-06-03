import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { SectionPage } from "./components/shared/SectionPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { ExtinguisherCreatePage } from "./features/extinguishers/ExtinguisherCreatePage";
import { ExtinguisherDetailPage } from "./features/extinguishers/ExtinguisherDetailPage";
import { ExtinguisherEditPage } from "./features/extinguishers/ExtinguisherEditPage";
import { ExtinguisherListPage } from "./features/extinguishers/ExtinguisherListPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
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
            <SectionPage
              title="Users"
              description="Role management and access control views are reserved for admin workflows."
            />
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
  }
]);
