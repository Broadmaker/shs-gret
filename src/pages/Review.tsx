import { Link, useParams } from "react-router-dom";
import { useEvaluation } from "../hooks/useEvaluation";
import { evaluationAreas } from "../data/evaluationAreas";
import { calculateOverall } from "../lib/calculations";
import { AlertTriangle, CheckCircle2, ArrowRight, LayoutDashboard, ClipboardCheck, ListTodo } from "lucide-react";

export function ReviewPage() {
  const { id } = useParams();
  const { evaluation } = useEvaluation(id);
  if (!evaluation) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading…</p>;
  const overall = calculateOverall(evaluation);
  const missing = evaluationAreas.flatMap((area) =>
    area.indicators.filter((ind) => evaluation.ratings[ind.id]?.rating == null).map((ind) => ({ areaId: area.id, indicator: ind }))
  );
  const nextArea = overall.areas.find((a) => !a.isComplete);
  const areasDone = overall.areas.filter((a) => a.isComplete).length;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Checkpoint banner */}
      <section className="result-banner area-banner" aria-label="Review checkpoint">
        <div className="rb-main">
          <span className="rb-eyebrow"><ClipboardCheck size={12} /> Review Checkpoint • {evaluation.school.name || "Untitled School"}</span>
          <h1 className="rb-school">{overall.isComplete ? "Ready for Summary" : `${missing.length} indicator${missing.length === 1 ? "" : "s"} left to rate`}</h1>
          <p className="rb-meta">
            {overall.isComplete
              ? `All 85 indicators rated across 8 areas • ${evaluation.school.schoolYear || "—"}`
              : `${areasDone}/8 areas complete • select any highlighted chip to jump straight to it`}
          </p>
          <div className="rb-progress-row">
            <div className="rb-progress-labels">
              <span>{overall.totalRated}/{overall.totalIndicators} rated</span>
              <span>{overall.progressPct}%</span>
            </div>
            <div className="rb-track" role="progressbar" aria-valuenow={overall.progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Evaluation progress">
              <div className="fill" style={{ width: `${overall.progressPct}%` }} />
            </div>
          </div>
        </div>
        <div className="rb-divider" aria-hidden="true" />
        <div className="rb-score">
          <div>
            <div className="rb-score-value">{overall.progressPct}<span style={{ fontSize: 20, fontWeight: 600 }}>%</span></div>
            <div className="rb-score-label">Complete</div>
          </div>
        </div>
        <div className="rb-actions">
          {nextArea ? (
            <Link to={`/evaluations/${id}/area/${nextArea.areaId}`} className="rb-btn-primary">Rate Area {nextArea.areaId} <ArrowRight size={14} /></Link>
          ) : (
            <Link to={`/evaluations/${id}/summary`} className="rb-btn-primary">Open Summary <ArrowRight size={14} /></Link>
          )}
          <Link to={`/evaluations/${id}`} className="rb-btn-ghost"><LayoutDashboard size={13} /> Dashboard</Link>
        </div>
      </section>

      {/* Area completion */}
      <section className="card" style={{ overflow: "hidden" }} aria-label="Area completion">
        <div className="card-header">
          <div>
            <div className="card-title">Area Completion</div>
            <div className="card-subtitle">Green chips are rated • red chips still need a 1–4 rating — select one to jump to it</div>
          </div>
          <span className={`status ${overall.isComplete ? "status-green" : "status-yellow"}`}>{areasDone}/8 areas</span>
        </div>
        <div>
          {evaluationAreas.map((area) => {
            const res = overall.areas.find((a) => a.areaId === area.id)!;
            const pct = res.totalIndicators ? Math.round((res.ratedCount / res.totalIndicators) * 100) : 0;
            return (
              <div key={area.id} style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-color-light)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    {res.isComplete
                      ? <CheckCircle2 size={15} style={{ color: "var(--green)", flexShrink: 0 }} />
                      : <span style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid var(--yellow)", flexShrink: 0 }} />}
                    <span className="area-chip">{area.id}</span>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{area.title}</span>
                  </h3>
                  <span style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }} className="tnum">
                      {res.ratedCount}/{res.totalIndicators}{res.average != null ? ` • ${res.average.toFixed(2)}` : ""}
                    </span>
                    <Link to={`/evaluations/${id}/area/${area.id}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>Open →</Link>
                  </span>
                </div>
                <div className="perf-bar" style={{ marginTop: 8, height: 6 }}>
                  <div className="fill" style={{ width: `${pct}%`, background: res.isComplete ? "var(--green)" : "var(--primary)" }} />
                </div>
                <div className="nav-pills" style={{ marginTop: 10 }}>
                  {area.indicators.map((ind) => {
                    const r = evaluation.ratings[ind.id]?.rating;
                    const done = r != null;
                    return (
                      <Link
                        key={ind.id}
                        to={`/evaluations/${id}/area/${area.id}`}
                        className={`nav-pill${done ? " rated" : ""}`}
                        style={!done ? { borderColor: "rgba(214,57,57,0.3)", background: "var(--red-lt)", color: "var(--red)" } : undefined}
                        title={done ? `Rated ${r} — ${ind.id}` : `${ind.id} — needs rating`}
                      >
                        {ind.id} • {done ? r : "—"}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {!overall.isComplete && (
        <section className="card" style={{ borderColor: "rgba(245,159,0,0.3)" }} aria-label="Still to rate">
          <div className="card-header">
            <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--yellow-lt)", color: "#b45309", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {overall.isComplete ? <CheckCircle2 size={14} /> : <ListTodo size={14} />}
              </span>
              Still to rate
            </div>
            <span className="status status-yellow">{missing.length} left</span>
          </div>
          <div className="card-body" style={{ paddingTop: 10 }}>
            <ul style={{ margin: 0, display: "flex", flexDirection: "column", listStyle: "none", padding: 0 }}>
              {missing.slice(0, 12).map((m) => (
                <li key={m.indicator.id} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "7px 0", borderBottom: "1px solid var(--border-color-light)", fontSize: 12.5 }}>
                  <AlertTriangle size={12} style={{ color: "var(--yellow)", flexShrink: 0, alignSelf: "center" }} />
                  <Link to={`/evaluations/${id}/area/${m.areaId}`} style={{ fontWeight: 700, color: "var(--primary)", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>{m.indicator.id}</Link>
                  <span style={{ color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.indicator.title}</span>
                </li>
              ))}
            </ul>
            {missing.length > 12 && (
              <p style={{ marginTop: 8, fontSize: 11.5, color: "var(--text-muted)" }}>+ {missing.length - 12} more — see the red chips above.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
