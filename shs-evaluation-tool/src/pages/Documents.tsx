import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useEvaluation } from "../hooks/useEvaluation";
import type { MovStatus } from "../types/evaluation";
import { FileCheck, Users, Plus, Trash2 } from "lucide-react";
import { ConfirmModal } from "../components/ui/ConfirmModal";

const docStatuses: { value: MovStatus; label: string }[] = [
  { value: "not-checked", label: "Not Checked" },
  { value: "available", label: "Available" },
  { value: "partially-available", label: "Partially Available" },
  { value: "not-available", label: "Not Available" },
];

export function DocumentsPage() {
  const { id } = useParams();
  const { evaluation, setDocumentStatus, addEvaluator, removeEvaluator, updateEvaluator } = useEvaluation(id);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (!evaluation) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Evaluation not found.</p>;
  const availableCount = evaluation.documentaryRequirements.filter((d) => d.status === "available").length;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div className="page-pretitle">Part II • Documentary Evidence</div>
        <div className="page-header-row">
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><FileCheck size={18} style={{ color: "var(--primary)" }} /> Documentary Requirements & Evaluation Team</h1>
          <Link to={`/evaluations/${id}`} className="btn btn-outline">Back to Dashboard</Link>
        </div>
      </div>

      <section className="card" style={{ overflow: "hidden" }}>
        <div className="card-header">
          <div>
            <div className="card-title">Part II — Documentary Requirements</div>
            <div className="card-subtitle">Check availability before ocular. Status is separate from 1–4 ratings per blueprint 10.</div>
          </div>
          <span className="status status-blue">{availableCount}/{evaluation.documentaryRequirements.length} Available</span>
        </div>
        <div style={{ borderTop: "1px solid var(--border-color-light)" }}>
          {evaluation.documentaryRequirements.map((doc) => (
            <div key={doc.id} style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, borderBottom: "1px solid var(--border-color-light)" }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{doc.title}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{doc.id}</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {docStatuses.map((s) => (
                  <button key={s.value} onClick={() => setDocumentStatus(doc.id, s.value)} className={doc.status === s.value ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}><Users size={14} /> Evaluation Team (MEIT)</div>
            <div className="card-subtitle">Per blueprint 18 — 4 evaluator slots + RO QAD Chief / RD as signatories in Print.</div>
          </div>
        </div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {evaluation.evaluators.length === 0 ? (
            <div style={{ border: "1px dashed var(--border-color)", borderRadius: "var(--radius)", padding: 16, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>No evaluators added yet.</div>
          ) : (
            evaluation.evaluators.map((ev) => (
              <div key={ev.id} style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", padding: 8 }}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", width: 20 }}>{ev.order}.</span>
                <input defaultValue={ev.name} onBlur={(e) => { if (e.target.value !== ev.name) updateEvaluator(ev.id, { name: e.target.value }); }} placeholder="Name" style={{ flex: 1, height: 30, border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0 8px", fontSize: 13 }} />
                <input defaultValue={ev.role} onBlur={(e) => { if (e.target.value !== ev.role) updateEvaluator(ev.id, { role: e.target.value }); }} placeholder="Role (e.g., MEIT Lead)" style={{ flex: 1, height: 30, border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0 8px", fontSize: 13 }} />
                <button onClick={() => setPendingDeleteId(ev.id)} className="btn btn-ghost btn-sm" aria-label="Remove"><Trash2 size={14} /></button>
              </div>
            ))
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Evaluator name" style={{ flex: 1, height: 34, border: "1px solid var(--border-color)", borderRadius: "var(--radius)", padding: "0 10px", fontSize: 13 }} />
            <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Role" style={{ flex: 1, height: 34, border: "1px solid var(--border-color)", borderRadius: "var(--radius)", padding: "0 10px", fontSize: 13 }} />
            <button onClick={() => { if (!newName.trim()) return; addEvaluator(newName.trim(), newRole.trim() || "Evaluator"); setNewName(""); setNewRole(""); }} className="btn btn-primary"><Plus size={14} /> Add</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Link to={`/evaluations/${id}/review`} className="btn btn-outline">Review</Link>
            <Link to={`/evaluations/${id}/summary`} className="btn btn-primary">Continue to Summary</Link>
          </div>
        </div>
      </section>
      <ConfirmModal
        open={!!pendingDeleteId}
        title="Remove evaluator?"
        message={`Remove ${evaluation.evaluators.find(e=>e.id===pendingDeleteId)?.name || "this evaluator"} from the MEIT team?`}
        confirmLabel="Remove"
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => { if (pendingDeleteId) removeEvaluator(pendingDeleteId); }}
      />
    </div>
  );
}
