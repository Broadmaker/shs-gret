import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useEvaluation } from "../hooks/useEvaluation";
import { getEvaluation, saveEvaluation } from "../lib/storage";
import { calculateOverall } from "../lib/calculations";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Trash2 } from "lucide-react";

export function SummaryPage() {
  const { id } = useParams();
  const { evaluation } = useEvaluation(id);
  const [finding, setFinding] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [areaId, setAreaId] = useState("A");
  const [deleteFindingId, setDeleteFindingId] = useState<string | null>(null);
  if (!evaluation) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading…</p>;
  const overall = calculateOverall(evaluation);
  const addFinding = () => {
    if (!finding.trim()) return;
    const ev = getEvaluation(id!);
    if (!ev) return;
    saveEvaluation({ ...ev, findings: [...ev.findings, { id: `f-${Date.now()}`, areaId, finding, recommendation }] });
    setFinding(""); setRecommendation(""); location.reload();
  };
  const complianceBg = overall.overallScore == null ? { background: "var(--yellow-lt)", borderColor: "rgba(245,159,0,0.22)" } :
    overall.overallScore >= 3.25 ? { background: "var(--green-lt)", borderColor: "rgba(47,179,68,0.2)" } :
    overall.overallScore >= 2.5 ? { background: "var(--blue-lt)", borderColor: "rgba(6,111,209,0.22)" } :
    overall.overallScore >= 1.75 ? { background: "var(--yellow-lt)", borderColor: "rgba(245,159,0,0.22)" } :
    { background: "var(--red-lt)", borderColor: "rgba(214,57,57,0.22)" };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="page-header">
        <div className="page-pretitle">Results • Weighted Calculation</div>
        <h1 className="page-title">Summary & Findings</h1>
      </div>

      <div className="card" style={{ padding: 24, textAlign: "center", ...complianceBg, borderWidth: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--text-muted)" }}>Overall Compliance</p>
        <p style={{ marginTop: 4, fontSize: 36, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{overall.overallScore!=null ? overall.overallScore.toFixed(2) : "—"}</p>
        <p style={{ marginTop: 2, fontSize: 13, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>{overall.complianceStatus ?? (overall.isComplete ? "—" : "INCOMPLETE")}</p>
        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{overall.totalRated}/{overall.totalIndicators} indicators rated</p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header"><div><div className="card-title">Weighted Summary</div><div className="card-subtitle">Per Annex I weights</div></div></div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Evaluation Area</th><th style={{ textAlign: "right" }}>Average</th><th style={{ textAlign: "right" }}>Weight</th><th style={{ textAlign: "right" }}>Partial</th></tr></thead>
            <tbody>
              {overall.areas.map((a) => (
                <tr key={a.areaId} style={!a.isComplete ? { background: "var(--yellow-lt)" } : undefined}>
                  <td><span style={{ fontWeight: 600 }}>{a.areaId}.</span> {a.title} <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({a.ratedCount}/{a.totalIndicators})</span></td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{a.average!=null ? a.average.toFixed(2) : "—"}</td>
                  <td style={{ textAlign: "right" }}>{(a.weight*100).toFixed(0)}%</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{a.partialProduct!=null ? a.partialProduct.toFixed(3) : "—"}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 600, background: "var(--bg-surface-secondary)" }}><td>Overall</td><td></td><td style={{ textAlign: "right" }}>100%</td><td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{overall.overallScore!=null ? overall.overallScore.toFixed(3) : "—"}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Significant Findings & Recommendations</div></div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {evaluation.findings.length===0 ? <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No findings yet.</p> : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 8, listStyle: "none", padding: 0 }}>
              {evaluation.findings.map((f) => (
                <li key={f.id} style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius)", padding: 12, display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>Area {f.areaId}</p>
                    <p style={{ fontSize: 13 }}><strong>Finding:</strong> {f.finding}</p>
                    {f.recommendation && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}><strong>Recommendation:</strong> {f.recommendation}</p>}
                  </div>
                  <button onClick={() => setDeleteFindingId(f.id)} className="btn btn-ghost btn-sm" aria-label="Delete finding"><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          )}
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "120px 1fr" }}>
            <select value={areaId} onChange={(e)=> setAreaId(e.target.value)} style={{ height: 34, border: "1px solid var(--border-color)", borderRadius: "var(--radius)", padding: "0 8px", fontSize: 13 }}>
              {overall.areas.map((a)=> <option key={a.areaId} value={a.areaId}>{a.areaId} — {a.shortTitle}</option>)}
            </select>
            <input value={finding} onChange={(e)=> setFinding(e.target.value)} placeholder="Finding..." style={{ height: 34, border: "1px solid var(--border-color)", borderRadius: "var(--radius)", padding: "0 10px", fontSize: 13 }} />
            <span />
            <input value={recommendation} onChange={(e)=> setRecommendation(e.target.value)} placeholder="Recommendation..." style={{ height: 34, border: "1px solid var(--border-color)", borderRadius: "var(--radius)", padding: "0 10px", fontSize: 13 }} />
          </div>
          <div><button onClick={addFinding} className="btn btn-primary">+ Add Finding</button></div>
        </div>
      </div>

      <div className="page-actions">
        <Link to={`/evaluations/${id}`} className="btn btn-outline">Back to Dashboard</Link>
        <Link to={`/evaluations/${id}/print`} className="btn btn-primary">Print Preview</Link>
      </div>
      <ConfirmModal
        open={!!deleteFindingId}
        title="Delete finding?"
        message="This finding and recommendation will be permanently removed from the evaluation."
        confirmLabel="Delete"
        onClose={() => setDeleteFindingId(null)}
        onConfirm={() => {
          if (!deleteFindingId || !id) return;
          const ev = getEvaluation(id);
          if (!ev) return;
          saveEvaluation({ ...ev, findings: ev.findings.filter((f) => f.id !== deleteFindingId) });
          location.reload();
        }}
      />
    </div>
  );
}
