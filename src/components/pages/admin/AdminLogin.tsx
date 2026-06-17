import React, { useState } from "react";
import { DesignLayout, GridBg, Word } from "@/components/design";
import { RouteSEO } from "@/components/seo/RouteSEO";

type Props = {
  onSuccess: () => void;
};

export const AdminLogin: React.FC<Props> = ({ onSuccess }) => {
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? "Wrong token." : `Login failed (${res.status})`);
        setSubmitting(false);
        return;
      }
      onSuccess();
    } catch {
      setError("Network error.");
      setSubmitting(false);
    }
  };

  return (
    <DesignLayout>
      <RouteSEO title="Admin · login" noIndex />
      <section className="al-hero">
        <div className="al-bg" aria-hidden>
          <GridBg count={2} />
        </div>

        <div className="al-eyebrow">Admin / restricted</div>
        <h1 className="al-h1">
          <Word>Show</Word> <Word em>your</Word> <Word>token.</Word>
        </h1>
        <p className="al-sub">
          Only the project owner. Token is the ADMIN_TOKEN env var on
          Vercel; paste it here and you're in for 14 days on this device.
        </p>

        <form className="al-form" onSubmit={submit}>
          <label className="al-label">Token</label>
          <input
            type="password"
            className="al-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="paste ADMIN_TOKEN"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            required
          />
          {error && <div className="al-error">{error}</div>}
          <button
            type="submit"
            className="al-submit"
            disabled={!token || submitting}
          >
            <span>{submitting ? "Checking…" : "Enter"}</span>
            <span>↗</span>
          </button>
        </form>
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
        .al-form {
          position: relative;
          margin-top: 18px;
          display: flex; flex-direction: column; gap: 12px;
          max-width: 480px;
        }
        .al-label {
          font-family: var(--mono); font-size: 10px;
          text-transform: uppercase; letter-spacing: .16em;
          color: var(--muted);
        }
        .al-input {
          background: transparent;
          border: 0; border-bottom: 1px solid var(--line);
          padding: 12px 0;
          font-family: var(--mono); font-size: 14px;
          color: var(--ink); outline: none;
          transition: border-color .3s;
        }
        .al-input:focus { border-color: var(--accent); }
        .al-input::placeholder { color: var(--muted); }
        .al-error {
          font-family: var(--mono); font-size: 11px;
          color: #d23a3a; letter-spacing: .04em;
        }
        .al-submit {
          margin-top: 8px;
          display: inline-flex; justify-content: space-between;
          padding: 16px 24px;
          background: var(--ink); color: var(--bg);
          border: 0; border-radius: 6px;
          font-family: var(--mono); font-size: 11px;
          letter-spacing: .14em; text-transform: uppercase;
          cursor: pointer;
          transition: opacity .25s;
        }
        .al-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 700px) {
          .al-hero { padding: 120px 24px 60px; }
        }
      `}</style>
    </DesignLayout>
  );
};

export default AdminLogin;
