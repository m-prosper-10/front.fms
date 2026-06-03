export type ExtinguisherType = "Water" | "CO2" | "Foam" | "Dry Chemical";

export type ExtinguisherSize = "1.5 lb" | "5 lb" | "9 lb" | "12 lb";

export type ExtinguisherStatus =
  | "active"
  | "expired"
  | "maintenance"
  | "decommissioned";

export interface FireExtinguisher {
  id: string;
  serialNumber: string;
  location: string;
  type: ExtinguisherType;
  size: ExtinguisherSize;
  installationDate: string;
  expiryDate: string;
  status: ExtinguisherStatus;
  lastInspection: string;
}

export const sampleExtinguishers: FireExtinguisher[] = [
  {
    id: "1",
    serialNumber: "EXT-1001",
    location: "Block A - Floor 1",
    type: "CO2",
    size: "5 lb",
    installationDate: "2023-05-12",
    expiryDate: "2027-04-12",
    status: "active",
    lastInspection: "2025-05-20"
  },
  {
    id: "2",
    serialNumber: "EXT-1002",
    location: "Block B - Lab",
    type: "Dry Chemical",
    size: "9 lb",
    installationDate: "2023-08-21",
    expiryDate: "2026-10-01",
    status: "maintenance",
    lastInspection: "2025-05-28"
  },
  {
    id: "3",
    serialNumber: "EXT-1003",
    location: "Warehouse - East Bay",
    type: "Foam",
    size: "12 lb",
    installationDate: "2022-11-02",
    expiryDate: "2025-12-14",
    status: "expired",
    lastInspection: "2025-04-09"
  },
  {
    id: "4",
    serialNumber: "EXT-1004",
    location: "Admin Block - Lobby",
    type: "Water",
    size: "1.5 lb",
    installationDate: "2024-01-19",
    expiryDate: "2028-01-19",
    status: "active",
    lastInspection: "2025-06-01"
  },
  {
    id: "5",
    serialNumber: "EXT-1005",
    location: "Vehicle Bay",
    type: "CO2",
    size: "5 lb",
    installationDate: "2022-09-30",
    expiryDate: "2025-08-11",
    status: "decommissioned",
    lastInspection: "2025-01-04"
  }
];
