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
  createdBy: string;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExtinguisherCreateInput {
  serialNumber: string;
  location: string;
  type: ExtinguisherType;
  size: ExtinguisherSize;
  installationDate: string;
  expiryDate: string;
}

export interface ExtinguisherUpdateInput extends ExtinguisherCreateInput {
  status: ExtinguisherStatus;
}
