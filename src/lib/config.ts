export const appConfig = {
  appName: "Fire Safety Operations",
  description: "Internal operations console for extinguisher, inspection, and maintenance workflows.",
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000",
  authBaseUrl: import.meta.env.VITE_AUTH_URL || "http://localhost:4001",
  userServiceUrl: import.meta.env.VITE_USER_URL || "http://localhost:4002",
  extinguisherServiceUrl: import.meta.env.VITE_EXTINGUISHER_URL || "http://localhost:4003",
  authStorageKeys: {
    accessToken: "fms_access_token",
    refreshToken: "fms_refresh_token"
  }
} as const;
