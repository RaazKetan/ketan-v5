import React, { useState } from "react";
import { DesignLayout, GridBg, Word } from "@/components/design";
import { RouteSEO } from "@/components/seo/RouteSEO";
import { getBrowserSupabase, supabaseClientConfigured } from "@/lib/supabaseClient";

type Props = {
  onSuccess: () => void;
};

/* Single sign-in path: Google OAuth via Supabase. No username / password
   form. The server checks the resulting Google email against ADMIN_EMAIL
   before issuing a cookie, so even if anyone else signs in with Google
   they get a clean 403 from /api/admin/login. */
export const AdminLogin: React.FC<Props> = ({ onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const sb = getBrowserSupabase();
    if (!sb) {
      setError("Auth client not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars.");
      setSubmitting(false);
      return;
    }
    try {
      const { error: oauthErr } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (oauthErr) {
        setError(oauthErr.message);
        setSubmitting(false);
        return;
      }
      /* Browser redirects to Google now; onSuccess is invoked later by
         Admin.tsx after Supabase processes the callback. */
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
    /* Mark onSuccess as referenced so React doesn't complain. */
    void onSuccess;
  };

  const configured = supabaseClientConfigured();

  return (
    <DesignLayout>
      <RouteSEO title="Admin · sign in" noIndex />
      <section className="al-hero">
        <div className="al-bg" aria-hidden>
          <GridBg count={2} />
        </div>

        <div className="al-eyebrow">Admin / restricted</div>
        <h1 className="al-h1">
          <Word>Sign in to</Word> <Word em>continue.</Word>
        </h1>
        <p className="al-sub">
          Only the project owner.
        </p>

        <div className="al-actions">
          <button
            type="button"
            className="al-google"
            onClick={signIn}
            disabled={!configured || submitting}
          >
            <GoogleGlyph />
            <span>{submitting ? "Redirecting to Google…" : "Sign in with Google"}</span>
          </button>
          {!configured && (
            <div className="al-warn">
              Auth not configured. Set <code>VITE_SUPABASE_URL</code> and{" "}
              <code>VITE_SUPABASE_ANON_KEY</code> in your env, then rebuild.
            </div>
          )}
          {error && <div className="al-error">{error}</div>}
        </div>
      </section>

      <style>{`
        .al-hero {
          position: relative;
          min-height: calc(100vh - 200px);
          padding: 160px 56px 80px;
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 18px;
          overflow: hidden;
        }
        .al-bg { position: absolute; inset: 0; opacity: .35; pointer-events: none; }
        .al-eyebrow {
          position: relative;
          font-family: var(--mono); font-size: 11px;
          letter-spacing: .18em; text-transform: uppercase;
          color: var(--muted);
        }
        .al-h1 {
          position: relative;
          font-family: var(--serif); font-weight: 400;
          font-size: clamp(48px, 8vw, 96px);
          line-height: 0.98; letter-spacing: -0.025em; margin: 0;
        }
        .al-h1 em { font-style: italic; color: var(--accent); }
        .al-sub {
          position: relative;
          font-size: 15px; line-height: 1.6; color: var(--ink-2);
          max-width: 50ch; margin: 0;
        }
        .al-actions {
          position: relative;
          margin-top: 22px;
          display: flex; flex-direction: column; gap: 12px;
          max-width: 360px;
        }
        .al-google {
          display: inline-flex; align-items: center; gap: 12px;
          padding: 14px 22px;
          background: var(--ink); color: var(--bg);
          border: 0; border-radius: 8px;
          font-family: var(--mono); font-size: 12px;
          letter-spacing: .12em; text-transform: uppercase;
          cursor: pointer;
          transition: opacity .25s, transform .25s var(--ease);
        }
        .al-google:hover:not(:disabled) { transform: translateY(-2px); }
        .al-google:disabled { opacity: 0.45; cursor: not-allowed; }
        .al-google svg { flex-shrink: 0; }
        .al-warn {
          font-family: var(--mono); font-size: 11px;
          color: #f0a000; letter-spacing: .04em; line-height: 1.5;
        }
        .al-warn code {
          font-size: 11px;
          background: var(--bg-deep); padding: 1px 5px; border-radius: 4px;
          color: var(--ink);
        }
        .al-error {
          font-family: var(--mono); font-size: 11px;
          color: #d23a3a; letter-spacing: .04em;
        }
        @media (max-width: 700px) {
          .al-hero { padding: 120px 24px 60px; }
        }
      `}</style>
    </DesignLayout>
  );
};

/* Google "G" mark — official 4-color render, no third-party asset. */
const GoogleGlyph: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

export default AdminLogin;
