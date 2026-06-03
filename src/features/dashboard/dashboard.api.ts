import { apiRequest } from "../../lib/api";

type GatewayInfo = {
  service: string;
  status: string;
  stack: string;
  apiStyle: string;
};

type HealthInfo = {
  service: string;
  status: string;
  uptime: number;
  timestamp: string;
};

type MonitoringInfo = {
  status: string;
};

type ExampleInfo = {
  service: {
    apiStyle: string;
    logging: string;
    monitoring: string;
  };
  databases: Array<{
    key: string;
    name: string;
  }>;
  security: string;
};

export async function loadDashboardSummary() {
  const [gateway, health, monitoring, examples] = await Promise.all([
    apiRequest<GatewayInfo>("/"),
    apiRequest<HealthInfo>("/api/health"),
    apiRequest<MonitoringInfo>("/api/monitoring"),
    apiRequest<ExampleInfo>("/api/v1/examples")
  ]);

  return {
    gateway,
    health,
    monitoring,
    examples
  };
}
