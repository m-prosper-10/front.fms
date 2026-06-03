const gatewayBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const appConfig = {
  appName: "Fire Safety Operations",
  description: "Internal operations console for extinguisher, inspection, and maintenance workflows.",
  apiBaseUrl: gatewayBaseUrl,
  authBaseUrl: gatewayBaseUrl,
  userServiceUrl: gatewayBaseUrl,
  extinguisherServiceUrl: gatewayBaseUrl,
  authStorageKeys: {
    accessToken: "fms_access_token",
    refreshToken: "fms_refresh_token"
  }
} as const;
