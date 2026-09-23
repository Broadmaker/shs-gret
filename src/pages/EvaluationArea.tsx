import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { evaluationAreas } from "../data/evaluationAreas";
import { useEvaluation } from "../hooks/useEvaluation";
import { IndicatorCard } from "../components/evaluation/IndicatorCard";
import { Progress } from "../components/ui/Progress";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { calculateAreaResult } from "../lib/calculations";

export function EvaluationAreaPage() {
  const { id, areaId } = useParams();
  const { evaluation, setRating, setRemarks, toggleMovChecked, setMovCheckedBulk } = useEvaluation(id);
  const area = evaluationAreas.find((a) => a.id === areaId);
  const [idx, setIdx] = useState(0);

  useEffect(() => { setIdx(0); }, [areaId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!area) return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) return;
      if (e.key >= "1" && e.key <= "4") {
        const v = Number(e.key) as 1|2|3|4;
        setRating(area.indicators[idx].id, v);
      } else if (e.key.toLowerCase() === "n") setIdx((i) => Math.min(area.indicators.length - 1, i + 1));
      else if (e.key.toLowerCase() === "p") setIdx((i) => Math.max(0, i - 1));
      else if (e.key.toLowerCase() === "r") {
        const el = document.getElementById(`remarks-${area.indicators[idx].id}`) as HTMLTextAreaElement | null;
        if (el) { e.preventDefault(); el.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [area, idx, setRating]);

  if (!evaluation) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading…</p>;
  if (!area) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Area not found.</p>;

  const ind = area.indicators[idx];
  const rec = evaluation.ratings[ind.id];
  const areaResult = calculateAreaResult(area.id, evaluation.ratings);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Area header — gentelella page-header + progress */}
      <div className="card" style={{ overflow: "hidden", borderInlineStart: areaResult.isComplete ? "4px solid var(--green)" : "4px solid var(--primary)" }}>
        <div className="card-header" style={{ background: areaResult.isComplete ? "var(--green-lt)" : "var(--bg-surface)" }}>
          <div>
            <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {areaResult.isComplete && <CheckCircle2 size={14} style={{ color: "var(--green)" }} />} {area.id}. {area.title}
              <span className={`status ${areaResult.isComplete ? "status-green" : "status-yellow"}`} style={{ marginLeft: 6, fontSize: 11 }}>{areaResult.ratedCount}/{areaResult.totalIndicators} • {(area.weight*100).toFixed(0)}%</span>
            </div>
            <div className="card-subtitle">{areaResult.descriptor ?? "Rate each indicator 1–4 • N/P or click pills to navigate"}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Link to={`/evaluations/${id}`} className="btn btn-outline btn-sm">Dashboard</Link>
            <Link to={`/evaluations/${id}/summary`} className="btn btn-primary btn-sm">Summary</Link>
          </div>
        </div>
        <div style={{ padding: "10px 16px" }}><Progress value={(areaResult.ratedCount/areaResult.totalIndicators)*100} /></div>
      </div>

      {/* Top pills — gentelella tabs-pill + stepper hybrid */}
      <div className="card" style={{ padding: 12, borderInlineStart: areaResult.isComplete ? "4px solid var(--green)" : "4px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: areaResult.isComplete ? "var(--green)" : "var(--primary)", display: "inline-block" }} /> Indicators
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, color: areaResult.isComplete ? "var(--green)" : "var(--text-muted)", background: areaResult.isComplete ? "var(--green-lt)" : "var(--bg-surface-secondary)", border: `1px solid ${areaResult.isComplete ? "rgba(47,179,68,0.2)" : "var(--border-color-light)"}`, borderRadius: 999, padding: "2px 8px" }}>
            {String(idx+1).padStart(2,"0")} / {String(area.indicators.length).padStart(2,"0")}{areaResult.isComplete ? " • Complete" : ""}
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {area.indicators.map((it, i) => {
            const rated = evaluation.ratings[it.id]?.rating != null;
            const active = i === idx;
            const r = evaluation.ratings[it.id]?.rating;
            return (
              <button
                key={it.id}
                onClick={() => setIdx(i)}
                style={{
                  minWidth: 42, height: 30, padding: "0 8px", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: active ? 700 : rated ? 600 : 500,
                  border: active ? "1px solid var(--primary)" : rated ? "1px solid rgba(47,179,68,0.25)" : "1px solid var(--border-color-light)",
                  background: active ? "var(--primary)" : rated ? "var(--green-lt)" : "var(--bg-surface)",
                  color: active ? "#fff" : rated ? "var(--green)" : "var(--text-muted)",
                  boxShadow: active ? "0 2px 6px rgba(26,187,156,0.25)" : "none",
                  cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, transition: "all 120ms",
                }}
                title={rated ? `Rated ${r} — ${it.id}` : `${it.id} — Not yet rated`}
              >
                {String(i+1).padStart(2,"0")}{rated ? ` ✓` : ""}
              </button>
            );
          })}
        </div>
      </div>

      <IndicatorCard
        indicator={ind}
        areaCode={area.id}
        index={idx + 1}
        total={area.indicators.length}
        rating={rec?.rating ?? null}
        remarks={rec?.remarks ?? ""}
        movStatus={rec?.movStatus ?? "not-checked"}
        movChecked={rec?.movChecked ?? {}}
        onRate={(v: 1|2|3|4) => { setRating(ind.id, v); setTimeout(()=> setIdx((i)=> Math.min(area.indicators.length-1, i+1)), 180); }}
        onRemarks={(v: string) => setRemarks(ind.id, v)}
        onToggleMov={(k, total) => toggleMovChecked(ind.id, k, total)}
        onBulkMov={(checked) => {
          const keys = ind.movs.map((m, i) => `${i}:${m.slice(0,24)}`);
          setMovCheckedBulk(ind.id, keys, checked);
        }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <button disabled={idx===0} onClick={() => setIdx((i)=> i-1)} className="btn btn-outline btn-sm"><ChevronLeft size={14}/> Previous (P)</button>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{idx+1} / {area.indicators.length} • Keys 1-4 to rate, N/P to navigate</span>
        <button disabled={idx===area.indicators.length-1} onClick={() => setIdx((i)=> i+1)} className="btn btn-outline btn-sm">Next (N) <ChevronRight size={14}/></button>
      </div>
    </div>
  );
}
