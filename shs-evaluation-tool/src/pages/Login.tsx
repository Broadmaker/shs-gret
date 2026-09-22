import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, getAuthUser } from "../lib/auth";
import { GraduationCap, Mail, Lock } from "lucide-react";

export function LoginPage() {
  const nav = useNavigate();
  const existing = getAuthUser();
  const [email, setEmail] = useState(existing?.email ?? "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(existing?.name ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Password is mock — not validated for MVP (offline-first)
    login(email, name);
    nav("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon">S</div>
          <div className="brand-name">SHS <small style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: 13, marginLeft: 4 }}>Evaluation</small></div>
        </div>

        <div className="auth-title">Welcome back</div>
        <div className="auth-subtitle">Sign in to continue your DepEd SHS evaluation. Offline-first — no server required for MVP.</div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Display name</label>
            <div className="input-group">
              <GraduationCap className="input-icon" />
              <input id="name" className="form-control" placeholder="e.g., Juan Dela Cruz" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div className="input-group">
              <Mail className="input-icon" />
              <input id="email" type="email" className="form-control" placeholder="you@deped.gov.ph" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-group">
              <Lock className="input-icon" />
              <input id="password" type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>MVP mock — any password works. Stored locally only.</p>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", height: 38, marginTop: 4 }}>
            Sign in
          </button>
        </form>

        <div className="auth-actions">
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>
            <input type="checkbox" defaultChecked style={{ accentColor: "var(--primary)" }} /> Remember me
          </label>
          <Link to="/login" onClick={(e) => e.preventDefault()}>Forgot password?</Link>
        </div>

        <div className="auth-divider">or</div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { login("guest@local", "Guest"); nav("/"); }} className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }}>Continue as guest</button>
          <button onClick={() => { login(email || "guest@local", name || "Guest"); nav("/"); }} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
            Demo login
          </button>
        </div>

        <div className="auth-footer">
          DepEd SHS Government Recognition • <Link to="/">Back to evaluations</Link>
          <br />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Gentelella v4 • Teal #1ABB9C • Secure local session</span>
        </div>
      </div>
    </div>
  );
}
