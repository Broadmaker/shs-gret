import { Link, useParams } from "react-router-dom";
import { useEvaluation } from "../hooks/useEvaluation";
import { evaluationAreas } from "../data/evaluationAreas";
import { calculateOverall } from "../lib/calculations";
import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";

export function ReviewPage() {
  const { id } = useParams();
  const { evaluation } = useEvaluation(id);
  if (!evaluation) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading…</p>;
  const overall = calculateOverall(evaluation);
  const missing = evaluationAreas.flatMap((area) =>
    area.indicators.filter((ind) => evaluation.ratings[ind.id]?.rating == null).map((ind) => ({ areaId: area.id, indicator: ind }))
  );

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="page-header">
        <div className="page-pretitle">Checkpoint • Before Summary</div>
        <div className="page-header-row">
          <h1 className="page-title">Review Evaluation</h1>
          <div className="page-actions">
            <Link to={`/evaluations/${id}`} className="btn btn-outline">Dashboard</Link>
            <Link to={`/evaluations/${id}/summary`} className="btn btn-primary">Summary</Link>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, display: "flex", gap: 12, background: overall.isComplete ? "var(--green-lt)" : "var(--yellow-lt)", borderColor: overall.isComplete ? "rgba(47,179,68,0.2)" : "rgba(245,159,0,0.22)" }}>
        {overall.isComplete ? <CheckCircle2 size={18} style={{ color: "var(--green)", marginTop: 2 }} /> : <AlertTriangle size={18} style={{ color: "var(--yellow)", marginTop: 2 }} />}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: overall.isComplete ? "var(--green)" : "#7a4a00" }}>
            {overall.isComplete ? "Complete — ready for summary & print" : `Incomplete — ${missing.length} indicator(s) still require a 1–4 rating`}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{overall.totalRated}/{overall.totalIndicators} rated • {overall.progressPct}%</p>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header"><div><div className="card-title">Area Completion</div><div className="card-subtitle">Click an incomplete indicator to jump directly to it.</div></div></div>
        <div>
          {evaluationAreas.map((area) => {
            const res = overall.areas.find((a) => a.areaId === area.id)!;
            return (
              <div key={area.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color-light)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                    {res.isComplete ? <CheckCircle2 size={14} style={{ color: "var(--green)" }} /> : <Circle size={14} style={{ color: "var(--text-disabled)" }} />}
                    {area.id}. {area.title}
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>({res.ratedCount}/{res.totalIndicators}) • {res.average != null ? `${res.average.toFixed(2)} • ${res.descriptor}` : "INCOMPLETE"}</span>
                  </h3>
                  <Link to={`/evaluations/${id}/area/${area.id}`} style={{ fontSize: 12, color: "var(--primary)" }}>Open {area.id}</Link>
                </div>
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {area.indicators.map((ind) => {
                    const r = evaluation.ratings[ind.id]?.rating;
                    const done = r != null;
                    return (
                      <Link key={ind.id} to={`/evaluations/${id}/area/${area.id}`} className={done ? "btn btn-outline btn-sm" : "btn btn-ghost btn-sm"} style={done ? { background: "var(--green-lt)", borderColor: "rgba(47,179,68,0.2)", color: "var(--green)" } : { background: "var(--red-lt)", borderColor: "rgba(214,57,57,0.2)", color: "var(--red)" }}>{ind.id} • {done ? r : "—"}</Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!overall.isComplete && (
        <div className="card" style={{ padding: 16, background: "var(--yellow-lt)", borderColor: "rgba(245,159,0,0.22)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#7a4a00" }}>Remaining to Rate</h3>
          <ul style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4, listStyle: "none", padding: 0 }}>
            {missing.slice(0, 30).map((m) => (
              <li key={m.indicator.id} style={{ fontSize: 12.5, color: "#7a4a00" }}><Link to={`/evaluations/${id}/area/${m.areaId}`} style={{ color: "var(--primary)", fontWeight: 600 }}>{m.indicator.id}</Link> — {m.indicator.title.slice(0, 90)}...</li>
            ))}
            {missing.length > 30 && <li style={{ fontSize: 11, color: "var(--text-muted)" }}>+ {missing.length - 30} more…</li>}
          </ul>
        </div>
      )}

      <div className="page-actions">
        <Link to={`/evaluations/${id}/documents`} className="btn btn-outline">Documents & Team</Link>
        <Link to={`/evaluations/${id}/summary`} className="btn btn-primary">Continue to Summary</Link>
      </div>
    </div>
  );
}
