"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { authApi } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("geras_token");
    if (!token) { setLoading(false); return; }
    authApi.me().then((d) => setUser(d.user)).catch(() => localStorage.removeItem("geras_token")).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem("geras_token", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    localStorage.setItem("geras_token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => { localStorage.removeItem("geras_token"); setUser(null); window.location.href = "/auth/login"; };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
