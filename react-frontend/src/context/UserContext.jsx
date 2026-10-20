//src/context/UseContext.jsx

import { createContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || "Request failed.");
    return body;
  };

  const refreshSession = async () => {
    try { const data = await request("/api/auth/me"); setUser(data.user); } catch { setUser(null); } finally { setLoading(false); }
  };
  // Session verification is an intentional request-time state update on initial mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { refreshSession(); }, []);
  const login = async (identifier, password) => { const data = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) }); setUser(data.user); };
  const logout = async () => { await request("/api/auth/logout", { method: "POST" }); setUser(null); };
  return <UserContext.Provider value={{ user, loading, request, login, logout, refreshSession }}>{children}</UserContext.Provider>;
}
