import React, { useCallback, useEffect, useRef, useState } from "react";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";
import { getBrowserSupabase } from "@/lib/supabaseClient";

type AuthState = "checking" | "anon" | "auth";

/* /admin gate.

   Flow:
   1. On mount, call /api/admin/me. If the cookie verifies → dashboard.
   2. If not, look for an active Supabase Google session (set by the
      OAuth callback). If present, POST its access_token to
      /api/admin/login to exchange it for our own __Host-kr_admin cookie
      after the email allow-list check.
   3. Both fail → render the login screen.

   Robustness rules:
   - Run only ONE check at a time — StrictMode + Supabase auth events
     would otherwise fan out into multiple parallel exchanges.
   - On 401/403 from /api/admin/login, sign out the Supabase session
     immediately so onAuthStateChange doesn't loop us back. */
export const Admin: React.FC = () => {
  const [state, setState] = useState<AuthState>("checking");
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const runningRef = useRef(false);
  const triedExchangeRef = useRef(false);

  const checkCookie = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/me", { credentials: "same-origin" });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const exchangeSupabaseSession = useCallback(async () => {
    if (triedExchangeRef.current) return false;
    triedExchangeRef.current = true;

    const sb = getBrowserSupabase();
    if (!sb) return false;
    let accessToken: string | undefined;
    try {
      const { data } = await sb.auth.getSession();
      accessToken = data.session?.access_token;
    } catch {
      return false;
    }
    if (!accessToken) return false;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      if (res.ok) return true;

      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 403) {
        setExchangeError(body.error || "Signed-in email is not on the allow-list.");
      } else if (res.status === 401) {
        setExchangeError("Google session expired. Sign in again.");
      } else if (res.status === 429) {
        setExchangeError("Too many requests. Wait a moment, then retry.");
      } else {
        setExchangeError(body.error || `Login failed (${res.status})`);
      }
      /* Clear the Supabase session so onAuthStateChange doesn't
         re-fire SIGNED_IN with the same dead token over and over. */
      await sb.auth.signOut().catch(() => {});
    } catch {
      /* network — leave the session in place, user can retry. */
    }
    return false;
  }, []);

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      if (await checkCookie()) {
        setState("auth");
        return;
      }
      if (await exchangeSupabaseSession()) {
        setState("auth");
        return;
      }
      setState("anon");
    } finally {
      runningRef.current = false;
    }
  }, [checkCookie, exchangeSupabaseSession]);

  useEffect(() => {
    run();
    /* Supabase fires SIGNED_IN once after detectSessionInUrl finishes
       parsing the callback hash. Re-run so we exchange the brand-new
       session immediately. Anything else (TOKEN_REFRESHED, INITIAL_SESSION)
       is harmless because runningRef serializes the work. */
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        /* Reset the exchange guard — this is a real new sign-in. */
        triedExchangeRef.current = false;
        run();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [run]);

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
    return (
      <>
        {exchangeError && (
          <div
            style={{
              position: "fixed",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--ink)",
              color: "var(--bg)",
              padding: "8px 14px",
              borderRadius: 6,
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: ".06em",
              zIndex: 999,
            }}
          >
            {exchangeError}
          </div>
        )}
        <AdminLogin onSuccess={() => setState("auth")} />
      </>
    );
  }

  return (
    <AdminDashboard
      onLogout={async () => {
        const sb = getBrowserSupabase();
        if (sb) {
          /* Only call signOut when a session actually exists — calling
             it on an empty store hits POST /auth/v1/logout and Supabase
             returns 403 (no-op), which shows up as a scary console error
             for no real reason. */
          try {
            const { data } = await sb.auth.getSession();
            if (data.session) await sb.auth.signOut().catch(() => {});
          } catch {
            /* swallow */
          }
        }
        /* Clear our cookie too so /api/admin/me starts returning 401. */
        await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "same-origin",
        }).catch(() => {});
        triedExchangeRef.current = false;
        setState("anon");
      }}
    />
  );
};

export default Admin;
