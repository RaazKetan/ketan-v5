import React, { useCallback, useEffect, useState } from "react";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

type AuthState = "checking" | "anon" | "auth";

/* /admin gate. Calls /api/admin/me on mount; if 200, render dashboard,
   else render login form. Login + logout flip the state without a page
   reload — feels instant. */
export const Admin: React.FC = () => {
  const [state, setState] = useState<AuthState>("checking");

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/me", { credentials: "same-origin" });
      setState(res.ok ? "auth" : "anon");
    } catch {
      setState("anon");
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  if (state === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--mono)",
          fontSize: 12,
          color: "var(--muted)",
          letterSpacing: ".14em",
          textTransform: "uppercase",
        }}
      >
        Checking…
      </div>
    );
  }

  if (state === "anon") {
    return <AdminLogin onSuccess={() => setState("auth")} />;
  }

  return <AdminDashboard onLogout={() => setState("anon")} />;
};

export default Admin;
