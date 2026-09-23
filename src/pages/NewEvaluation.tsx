import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewEvaluation } from "../lib/storage";
import { Plus, ShieldCheck, WifiOff } from "lucide-react";

export function NewEvaluationPage() {
  const nav = useNavigate();
  const [creating, setCreating] = useState(false);
  const create = () => {
    if (creating) return;
    setCreating(true);
    const ev = createNewEvaluation();
    // prevent StrictMode double invoke in dev
    setTimeout(() => nav(`/evaluations/${ev.id}/profile`), 10);
  };
  return (
    <div style={{ maxWidth: 560, margin: "40px auto" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ height: 4, background: "var(--primary)" }} />
        <div className="card-body" style={{ textAlign: "center", padding: "32px 24px" }}>
          <div className="empty-state-icon" style={{ width: 56, height: 56, marginBottom: 16 }}><Plus size={24} /></div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>Create Evaluation</h1>
          <p style={{ marginTop: 6, fontSize: 13, color: "var(--text-muted)", maxWidth: 360, marginInline: "auto" }}>
            Start with school profile, then rate indicators A–H. Guided flow: <strong style={{ color: "var(--text)" }}>Profile → Documents → Areas → Review → Summary → Print</strong>.
          </p>
          <button onClick={create} disabled={creating} className="btn btn-primary" style={{ marginTop: 20, height: 38, padding: "0 20px", opacity: creating ? 0.6 : 1 }}>
            {creating ? "Creating…" : "Create & Enter School Profile"}
          </button>
          <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center", fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><ShieldCheck size={12} /> Offline-first</span>
            <span>•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><WifiOff size={12} /> Local storage</span>
            <span>•</span>
            <span>85 indicators</span>
          </div>
        </div>
      </div>
    </div>
  );
}
