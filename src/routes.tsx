import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { SectionPage } from "./components/shared/SectionPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { ExtinguisherCreatePage } from "./features/extinguishers/ExtinguisherCreatePage";
import { ExtinguisherDetailPage } from "./features/extinguishers/ExtinguisherDetailPage";
import { ExtinguisherEditPage } from "./features/extinguishers/ExtinguisherEditPage";
import { ExtinguisherListPage } from "./features/extinguishers/ExtinguisherListPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
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
        element: <ExtinguisherCreatePage />
      },
      {
        path: "extinguishers/:id",
        element: <ExtinguisherDetailPage />
      },
      {
        path: "extinguishers/:id/edit",
        element: <ExtinguisherEditPage />
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
          <SectionPage
            title="Maintenance"
            description="Maintenance logging and work order tracking will be added here."
          />
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
          <SectionPage
            title="Users"
            description="Role management and access control views are reserved for admin workflows."
          />
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
          <SectionPage
            title="Settings"
            description="Application and role settings are available to admin users."
          />
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
