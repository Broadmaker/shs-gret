import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { evaluationAreas } from "../data/evaluationAreas";
import { useEvaluation } from "../hooks/useEvaluation";
import { IndicatorCard } from "../components/evaluation/IndicatorCard";
import { ChevronLeft, ChevronRight, LayoutDashboard, BarChart3 } from "lucide-react";
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
  const areaPct = areaResult.totalIndicators ? Math.round((areaResult.ratedCount / areaResult.totalIndicators) * 100) : 0;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Area banner */}
      <section className="result-banner area-banner" aria-label={`Area ${area.id} progress`}>
        <div className="rb-main">
          <span className="rb-eyebrow">Area {area.id} • Weight {(area.weight * 100).toFixed(0)}% • {evaluation.school.name || "Untitled School"}</span>
          <h1 className="rb-school">{area.title}</h1>
          <p className="rb-meta">
            {areaResult.isComplete ? areaResult.descriptor ?? "Complete" : "Rate each indicator 1–4 • keys 1-4, N/P to move"}
            {" • Autosaved "}{new Date(evaluation.updatedAt).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}
          </p>
          <div className="rb-progress-row">
            <div className="rb-progress-labels">
              <span>{areaResult.ratedCount}/{areaResult.totalIndicators} indicators rated</span>
              <span>{areaPct}%</span>
            </div>
            <div className="rb-track" role="progressbar" aria-valuenow={areaPct} aria-valuemin={0} aria-valuemax={100} aria-label="Area progress">
              <div className="fill" style={{ width: `${areaPct}%` }} />
            </div>
          </div>
        </div>
        <div className="rb-divider" aria-hidden="true" />
        <div className="rb-score">
          <div>
            <div className="rb-score-value">{areaResult.average != null ? areaResult.average.toFixed(2) : "—"}</div>
            <div className="rb-score-label">Area Average</div>
            {areaResult.partialProduct != null && (
              <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.6)", fontVariantNumeric: "tabular-nums" }}>Partial {areaResult.partialProduct.toFixed(3)}</div>
            )}
          </div>
        </div>
        <div className="rb-actions">
          <Link to={`/evaluations/${id}`} className="rb-btn-ghost"><LayoutDashboard size={13} /> Dashboard</Link>
          <Link to={`/evaluations/${id}/summary`} className="rb-btn-primary"><BarChart3 size={13} /> Summary</Link>
        </div>
      </section>

      {/* Indicator navigator — unboxed strip */}
      <section aria-label="Indicator navigator" style={{ padding: "2px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: areaResult.isComplete ? "var(--green)" : "var(--primary)", display: "inline-block" }} /> Indicators
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: areaResult.isComplete ? "var(--green)" : "var(--text-muted)", background: areaResult.isComplete ? "var(--green-lt)" : "var(--bg-surface)", border: `1px solid ${areaResult.isComplete ? "rgba(47,179,68,0.25)" : "var(--border-color)"}`, borderRadius: 999, padding: "3px 10px" }} className="tnum">
            {String(idx + 1).padStart(2, "0")} / {String(area.indicators.length).padStart(2, "0")}{areaResult.isComplete ? " • Complete" : ""}
          </span>
        </div>
        <div className="nav-pills">
          {area.indicators.map((it, i) => {
            const rated = evaluation.ratings[it.id]?.rating != null;
            const active = i === idx;
            const r = evaluation.ratings[it.id]?.rating;
            return (
              <button
                key={it.id}
                onClick={() => setIdx(i)}
                className={`nav-pill${rated ? " rated" : ""}${active ? " active" : ""}`}
                aria-current={active ? "true" : undefined}
                title={rated ? `Rated ${r} — ${it.id}` : `${it.id} — Not yet rated`}
              >
                {String(i + 1).padStart(2, "0")}{rated ? ` ✓` : ""}
              </button>
            );
          })}
        </div>
      </section>

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
      <div className="pager-wrap">
        <div className="pager" role="navigation" aria-label="Indicator pagination">
          <button disabled={idx === 0} onClick={() => setIdx((i) => i - 1)} className="pager-btn" aria-label="Previous indicator"><ChevronLeft size={15} /> Prev</button>
          <span className="pager-count">{String(idx + 1).padStart(2, "0")} / {String(area.indicators.length).padStart(2, "0")}</span>
          <button disabled={idx === area.indicators.length - 1} onClick={() => setIdx((i) => i + 1)} className="pager-btn primary" aria-label="Next indicator">Next <ChevronRight size={15} /></button>
        </div>
      </div>
    </div>
  );
}
