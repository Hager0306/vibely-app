import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import { unwrapObject } from "../api/client";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Repair a user saved in a wrapped shape ({ user: {...} })
    return parsed?.user && typeof parsed.user === "object" ? parsed.user : parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(readStoredUser);
  // We already have the token + saved user, so render immediately and
  // refresh the profile in the background instead of blocking the page.
  const [loading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    authApi
      .getProfile()
      .then((res) => {
        const freshUser = unwrapObject(res, ["user"]);
        if (!cancelled && freshUser) {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      })
      .catch((err) => {
        // Only drop the session when the token is really rejected;
        // a slow or offline network shouldn't log the user out.
        if (!cancelled && err?.response?.status === 401) {
          setToken(null);
          setUser(null);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function login(newToken, newUser) {
    localStorage.setItem("token", newToken);
    if (newUser) localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser ?? null);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  function updateUser(newUser) {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      loading,
      login,
      logout,
      updateUser,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
