import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { HomePage } from "./features/home/HomePage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { ExtinguisherCreatePage } from "./features/extinguishers/ExtinguisherCreatePage";
import { ExtinguisherDetailPage } from "./features/extinguishers/ExtinguisherDetailPage";
import { ExtinguisherEditPage } from "./features/extinguishers/ExtinguisherEditPage";
import { ExtinguisherListPage } from "./features/extinguishers/ExtinguisherListPage";
import { InspectionCompletePage } from "./features/inspections/InspectionCompletePage";
import { InspectionDetailPage } from "./features/inspections/InspectionDetailPage";
import { InspectionEditPage } from "./features/inspections/InspectionEditPage";
import { InspectionListPage } from "./features/inspections/InspectionListPage";
import { InspectionSchedulePage } from "./features/inspections/InspectionSchedulePage";
import { MaintenanceCreatePage } from "./features/maintenance/MaintenanceCreatePage";
import { MaintenanceDetailPage } from "./features/maintenance/MaintenanceDetailPage";
import { MaintenanceEditPage } from "./features/maintenance/MaintenanceEditPage";
import { MaintenanceListPage } from "./features/maintenance/MaintenanceListPage";
import { NotificationsPage } from "./features/notifications/NotificationsPage";
import { ReportsPage } from "./features/reports/ReportsPage";
import { UserDetailPage } from "./features/users/UserDetailPage";
import { UserCreatePage } from "./features/users/UserCreatePage";
import { UsersPage } from "./features/users/UsersPage";
import { SectionPage } from "./components/shared/SectionPage";

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
        element: <InspectionListPage />
      },
      {
        path: "inspections/new",
        element: (
          <ProtectedRoute allowedRoles={["admin", "user"]}>
            <InspectionSchedulePage />
          </ProtectedRoute>
        )
      },
      {
        path: "inspections/:id",
        element: <InspectionDetailPage />
      },
      {
        path: "inspections/:id/edit",
        element: (
          <ProtectedRoute allowedRoles={["admin", "inspector"]}>
            <InspectionEditPage />
          </ProtectedRoute>
        )
      },
      {
        path: "inspections/:id/complete",
        element: (
          <ProtectedRoute allowedRoles={["admin", "inspector"]}>
            <InspectionCompletePage />
          </ProtectedRoute>
        )
      },
      {
        path: "maintenance",
        element: <MaintenanceListPage />
      },
      {
        path: "maintenance/new",
        element: (
          <ProtectedRoute allowedRoles={["admin", "inspector"]}>
            <MaintenanceCreatePage />
          </ProtectedRoute>
        )
      },
      {
        path: "maintenance/:id",
        element: <MaintenanceDetailPage />
      },
      {
        path: "maintenance/:id/edit",
        element: (
          <ProtectedRoute allowedRoles={["admin", "inspector"]}>
            <MaintenanceEditPage />
          </ProtectedRoute>
        )
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={["admin", "inspector"]}>
            <ReportsPage />
          </ProtectedRoute>
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
        element: <NotificationsPage />
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
