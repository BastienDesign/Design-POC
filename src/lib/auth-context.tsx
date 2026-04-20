"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string | null;
  initials: string | null;
  subtitle: string | null;
  avatarUrl: string | null;
}

interface AuthOrganization {
  id: string;
  name: string;
  logo: string | null;
}

interface SubOrganization {
  id: string;
  name: string;
  count: number | null;
}

interface AuthState {
  user: AuthUser | null;
  organization: AuthOrganization | null;
  subOrganizations: SubOrganization[];
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<AuthOrganization | null>(null);
  const [subOrganizations, setSubOrganizations] = useState<SubOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("auth");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setUser(data.user);
        setOrganization(data.organization);
        setSubOrganizations(data.subOrganizations ?? []);
      } catch {
        // ignore corrupt storage
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string): Promise<boolean> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return false;

    const data = await res.json();
    setUser(data.user);
    setOrganization(data.organization);
    setSubOrganizations(data.subOrganizations ?? []);
    sessionStorage.setItem("auth", JSON.stringify(data));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setOrganization(null);
    setSubOrganizations([]);
    sessionStorage.removeItem("auth");
  }, []);

  return (
    <AuthContext.Provider value={{ user, organization, subOrganizations, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
