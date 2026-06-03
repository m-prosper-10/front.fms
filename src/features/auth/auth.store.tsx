import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { appConfig } from "../../lib/config";
import type { UserRole } from "../../lib/permissions";
import { login as loginRequest, logout as logoutRequest, refreshToken as refreshTokenRequest, register as registerRequest, validateToken as validateTokenRequest } from "./auth.api";
import type { AuthSession, AuthUser, LoginInput, RegisterInput } from "./auth.types";

const ACCESS_TOKEN_KEY = appConfig.authStorageKeys.accessToken;
const REFRESH_TOKEN_KEY = appConfig.authStorageKeys.refreshToken;

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (input: LoginInput) => Promise<AuthSession>;
  register: (input: RegisterInput) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthSession | null>;
  hasRole: (roles: UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!accessToken && !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken
  };
}

function persistSession(session: AuthSession) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
}

function clearStoredSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  function applySession(session: AuthSession) {
    persistSession(session);
    setUser(session.user);
    setAccessToken(session.accessToken);
    setRefreshToken(session.refreshToken);
    setStatus("authenticated");
  }

  function resetSession() {
    clearStoredSession();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setStatus("unauthenticated");
  }

  async function refreshSession() {
    const storedRefreshToken = refreshToken ?? readStoredSession()?.refreshToken;

    if (!storedRefreshToken) {
      resetSession();
      return null;
    }

    try {
      const session = await refreshTokenRequest(storedRefreshToken);
      applySession(session);
      return session;
    } catch {
      resetSession();
      return null;
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const storedSession = readStoredSession();

      if (!storedSession?.accessToken && !storedSession?.refreshToken) {
        if (isMounted) {
          setStatus("unauthenticated");
        }
        return;
      }

      try {
        if (storedSession?.accessToken) {
          const validation = await validateTokenRequest();

          if (isMounted) {
            setUser(validation.user);
            setAccessToken(storedSession.accessToken);
            setRefreshToken(storedSession.refreshToken || null);
            setStatus("authenticated");
          }
          return;
        }

        if (storedSession?.refreshToken) {
          const session = await refreshTokenRequest(storedSession.refreshToken);

          if (isMounted) {
            applySession(session);
          }
          return;
        }
      } catch {
        if (storedSession?.refreshToken) {
          try {
            const session = await refreshTokenRequest(storedSession.refreshToken);

            if (isMounted) {
              applySession(session);
            }
            return;
          } catch {
            // fall through to reset
          }
        }
      }

      if (isMounted) {
        resetSession();
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(input: LoginInput) {
    const session = await loginRequest(input);
    applySession(session);
    return session;
  }

  async function register(input: RegisterInput) {
    const session = await registerRequest(input);
    applySession(session);
    return session;
  }

  async function logout() {
    const storedRefreshToken = refreshToken ?? readStoredSession()?.refreshToken;

    try {
      if (storedRefreshToken) {
        await logoutRequest(storedRefreshToken);
      }
    } catch {
      // best-effort logout; local session is cleared below either way
    } finally {
      resetSession();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        isAuthenticated: status === "authenticated",
        user,
        accessToken,
        refreshToken,
        login,
        register,
        logout,
        refreshSession,
        hasRole: (roles) => Boolean(user && roles.includes(user.role))
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
