import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useEvaluation } from "../hooks/useEvaluation";
import { evaluationAreas } from "../data/evaluationAreas";
import { calculateOverall } from "../lib/calculations";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Dropdown } from "../components/ui/Dropdown";
import { Trash2, Award, Download, ArrowLeft, ClipboardList, TableProperties, ChartColumn, Pencil, X, Plus, Lightbulb, FileSearch, MessageSquareText, Loader2 } from "lucide-react";

function pillTone(score: number | null): string {
  if (score == null) return "vp-neutral";
  if (score >= 3.25) return "vp-green";
  if (score >= 2.5) return "vp-blue";
  if (score >= 1.75) return "vp-amber";
  return "vp-red";
}

function shortDescriptor(avg: number | null): string {
  if (avg == null) return "Incomplete";
  if (avg >= 3.5) return "Meeting";
  if (avg >= 2.5) return "Nearly meeting";
  if (avg >= 1.5) return "Partially meeting";
  return "Not meeting";
}

function barColor(avg: number | null): string {
  if (avg == null) return "var(--border-color)";
  if (avg >= 3.5) return "var(--green)";
  if (avg >= 2.5) return "var(--primary)";
  if (avg >= 1.5) return "var(--yellow)";
  return "var(--red)";
}

function FindingComposer({
  areaId, setAreaId, finding, setFinding, recommendation, setRecommendation,
  areas, editingLabel, onClose, onSave,
}: {
  areaId: string; setAreaId: (v: string) => void;
  finding: string; setFinding: (v: string) => void;
  recommendation: string; setRecommendation: (v: string) => void;
  areas: { id: string; shortTitle: string }[];
  editingLabel: string | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.body.classList.add("modal-open");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    setTimeout(() => backdropRef.current?.querySelector<HTMLElement>(".dd-btn")?.focus(), 40);
    return () => { document.body.classList.remove("modal-open"); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div ref={backdropRef} className="modal-backdrop show" role="dialog" aria-modal="true" aria-label={editingLabel ?? "New finding"}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}>
      <div className="modal-dialog modal-dialog-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary-lt)", color: "var(--primary-dk)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {editingLabel ? <Pencil size={14} /> : <Plus size={14} />}
            </span>
            {editingLabel ?? "New Finding"}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <span className="form-label" id="finding-area-label">Evaluation area</span>
            <Dropdown label="Evaluation area" value={areaId} onChange={setAreaId}
              options={areas.map((a) => ({ value: a.id, label: `${a.id} — ${a.shortTitle}` }))} />
          </div>
          <div>
            <label className="form-label" htmlFor="finding-text">Finding — what was observed</label>
            <textarea id="finding-text" value={finding} onChange={(e) => setFinding(e.target.value)} rows={3}
              placeholder="e.g., Science laboratory lacks sufficient equipment for SHS competencies…"
              style={{ minHeight: 76, width: "100%", boxSizing: "border-box", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", padding: "9px 11px", fontSize: 13, lineHeight: 1.55, resize: "vertical", background: "var(--bg-surface)", color: "var(--text)" }} />
          </div>
          <div>
            <label className="form-label" htmlFor="finding-rec">Recommendation — what the school should do</label>
            <textarea id="finding-rec" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} rows={3}
              placeholder="e.g., Procure the lacking apparatus before the next monitoring visit…"
              style={{ minHeight: 76, width: "100%", boxSizing: "border-box", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", padding: "9px 11px", fontSize: 13, lineHeight: 1.55, resize: "vertical", background: "var(--bg-surface)", color: "var(--text)" }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!finding.trim()} onClick={onSave}>{editingLabel ? "Save changes" : "Add Finding"}</button>
        </div>
      </div>
    </div>
  );
}

export function SummaryPage() {  const { id } = useParams();
  const { evaluation, setEvaluation } = useEvaluation(id);
  const [finding, setFinding] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [areaId, setAreaId] = useState("A");
  const [deleteFindingId, setDeleteFindingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  if (!evaluation) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading…</p>;
  const overall = calculateOverall(evaluation);
  // Every per-indicator remark, grouped by area — so nothing written during
  // rating gets lost on the way to the report.
  const remarkGroups = evaluationAreas
    .map((area) => ({
      area,
      entries: area.indicators
        .filter((ind) => (evaluation.ratings[ind.id]?.remarks ?? "").trim() !== "")
        .map((ind) => ({ ind, rating: evaluation.ratings[ind.id]?.rating ?? null, remarks: evaluation.ratings[ind.id]?.remarks.trim() ?? "" })),
    }))
    .filter((g) => g.entries.length > 0);
  const remarkCount = remarkGroups.reduce((s, g) => s + g.entries.length, 0);
  const resetComposer = () => { setEditingId(null); setFinding(""); setRecommendation(""); setComposerOpen(false); };
  const openNew = () => { setEditingId(null); setFinding(""); setRecommendation(""); setComposerOpen(true); };
  const startEdit = (f: { id: string; areaId: string; finding: string; recommendation: string }) => {
    setEditingId(f.id); setAreaId(f.areaId); setFinding(f.finding); setRecommendation(f.recommendation); setComposerOpen(true);
  };
  const saveFinding = () => {
    if (!finding.trim()) return;
    if (editingId) {
      const target = editingId;
      setEvaluation((prev) => ({
        ...prev,
        findings: prev.findings.map((f) => f.id === target ? { ...f, areaId, finding: finding.trim(), recommendation: recommendation.trim() } : f),
      }));
    } else {
      setEvaluation((prev) => ({
        ...prev,
        findings: [...prev.findings, { id: `f-${Date.now().toString(36)}`, areaId, finding: finding.trim(), recommendation: recommendation.trim() }],
      }));
    }
    resetComposer();
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="page-header">
        <div className="page-pretitle">Results • Weighted Calculation • {evaluation.school.name || "Untitled School"}</div>
        <div className="page-header-row">
          <h1 className="page-title">Summary & Findings</h1>
          <div className="page-actions">
            <Link to={`/evaluations/${id}`} className="btn btn-outline"><ArrowLeft size={13} /> Dashboard</Link>
            <button
              onClick={() => {
                if (exporting) return;
                setExporting(true);
                void import("../lib/exportPdf")
                  .then(({ exportEvaluationPdf }) => exportEvaluationPdf(evaluation))
                  .finally(() => setExporting(false));
              }}
              disabled={exporting}
              className="btn btn-primary"
            >
              {exporting ? <><Loader2 size={13} className="animate-spin" /> Exporting…</> : <><Download size={13} /> Export PDF</>}
            </button>
          </div>
        </div>
      </div>

      {/* Official verdict — dark hero, deliberately distinct from rating cards */}
      <section className="verdict" aria-label="Overall compliance result">
        <span className="verdict-eyebrow"><Award size={13} /> Official Result • Annex I</span>
        <p className="verdict-score">{overall.overallScore != null ? overall.overallScore.toFixed(2) : "—"}</p>
        <div>
          <span className={`verdict-pill ${pillTone(overall.overallScore)}`}>
            {overall.complianceStatus ?? (overall.isComplete ? "—" : "Incomplete")}
          </span>
        </div>
        <p className="verdict-meta">
          {overall.isComplete
            ? `Weighted across 8 areas • ${evaluation.school.schoolYear || "—"}`
            : `${overall.totalRated}/${overall.totalIndicators} indicators rated — complete all areas for an official score`}
        </p>
        <div className="verdict-track" role="progressbar" aria-valuenow={overall.progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Evaluation progress">
          <div className="fill" style={{ width: `${overall.progressPct}%` }} />
        </div>
        {overall.overallScore != null && (
          <div className="verdict-band" role="img" aria-label={`Overall score ${overall.overallScore.toFixed(2)} on the 1 to 4 compliance scale`}>
            <span className="verdict-needle" style={{ left: `${((overall.overallScore - 1) / 3) * 100}%` }} />
          </div>
        )}
        <div className="verdict-band-labels"><span>1.0 Not Compliant</span><span>1.75</span><span>2.5 Substantial</span><span>3.25 Fully</span><span>4.0</span></div>
      </section>

      {/* Weighted ledger */}
      <section className="card report-card" style={{ overflow: "hidden" }} aria-label="Weighted area breakdown">
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><TableProperties size={14} style={{ color: "var(--primary)" }} /> Weighted Summary</div>
            <div className="card-subtitle">Area average × weight = partial product • Overall = Σ partial products</div>
          </div>
          <span className={`status ${overall.isComplete ? "status-green" : "status-yellow"}`}>{overall.isComplete ? "Final" : "Draft"}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Evaluation Area</th><th style={{ minWidth: 120 }}>Performance</th><th style={{ textAlign: "right" }}>Average</th><th style={{ textAlign: "right" }}>Weight</th><th style={{ textAlign: "right" }}>Partial</th></tr></thead>
            <tbody>
              {overall.areas.map((a) => (
                <tr key={a.areaId} style={!a.isComplete ? { background: "var(--yellow-lt)" } : undefined}>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="area-chip">{a.areaId}</span>
                      <span>{a.title} <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({a.ratedCount}/{a.totalIndicators})</span></span>
                    </span>
                  </td>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="perf-bar"><span className="fill" style={{ width: `${a.average != null ? (a.average / 4) * 100 : 0}%`, background: barColor(a.average) }} /></span>
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{a.average != null ? a.average.toFixed(2) : "—"}</td>
                  <td style={{ textAlign: "right" }}>{(a.weight * 100).toFixed(0)}%</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{a.partialProduct != null ? a.partialProduct.toFixed(3) : "—"}</td>
                </tr>
              ))}
              <tr className="report-ledger-overall">
                <td>Overall Compliance</td><td></td><td></td>
                <td style={{ textAlign: "right" }}>100%</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{overall.overallScore != null ? overall.overallScore.toFixed(3) : "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Area performance — blueprint §15 visual */}
      <section className="card" aria-label="Area performance">
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><ChartColumn size={14} style={{ color: "var(--primary)" }} /> Area Performance</div>
            <div className="card-subtitle">Average per area on the 1–4 scale • select a row to open the area</div>
          </div>
        </div>
        <div className="card-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
          {overall.areas.map((a) => (
            <Link key={a.areaId} to={`/evaluations/${id}/area/${a.areaId}`} className="perf-row" title={`Open Area ${a.areaId}`}>
              <span className="area-chip">{a.areaId}</span>
              <span className="perf-name">{a.title} <small>• {(a.weight * 100).toFixed(0)}%</small></span>
              <span className="perf-track"><span className="fill" style={{ width: `${a.average != null ? (a.average / 4) * 100 : 0}%`, background: barColor(a.average) }} /></span>
              <span className="perf-val">{a.average != null ? a.average.toFixed(2) : "—"}</span>
              <span className="perf-desc">{shortDescriptor(a.average)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Indicator remarks — everything written during rating, grouped by area */}
      {remarkCount > 0 && (
        <section className="card" aria-label="Indicator remarks">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><MessageSquareText size={14} style={{ color: "var(--primary)" }} /> Indicator Remarks</div>
              <div className="card-subtitle">Notes captured per indicator during rating • carried into the report</div>
            </div>
            <span className="status status-blue">{remarkCount} noted</span>
          </div>
          <div className="card-body">
            {remarkGroups.map(({ area, entries }) => (
              <div key={area.id} className="remark-group">
                <div className="remark-group-head">
                  <span className="area-chip">{area.id}</span> {area.title}
                  <Link to={`/evaluations/${id}/area/${area.id}`} style={{ marginInlineStart: "auto", fontSize: 11.5, fontWeight: 600, color: "var(--primary)" }}>Open area →</Link>
                </div>
                {entries.map(({ ind, rating, remarks }) => (
                  <div key={ind.id} className="remark-item">
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span className="remark-rate">{rating ?? "—"}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: "var(--text-muted)" }}>{ind.id}</span>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ind.title}</span>
                    </div>
                    <p>{remarks}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Findings */}
      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><ClipboardList size={14} style={{ color: "var(--primary)" }} /> Significant Findings & Recommendations</div>
            <div className="card-subtitle">Carried into the printed report</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span className="status status-blue">{evaluation.findings.length} recorded</span>
            <button onClick={openNew} className="btn btn-primary btn-sm"><Plus size={13} /> Add Finding</button>
          </div>
        </div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {evaluation.findings.length === 0 ? (
            <div className="empty-state" style={{ padding: "20px 12px" }}>
              <div className="empty-state-icon"><FileSearch size={20} /></div>
              <div className="empty-state-title">No findings yet</div>
              <p className="empty-state-text">Record gaps and recommendations per area — they print under the official result, numbered in order.</p>
            </div>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 8, listStyle: "none", padding: 0, margin: 0 }}>
              {evaluation.findings.map((f, i) => (
                <li key={f.id} className="finding-item" style={{ padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="finding-num">#{i + 1}</span>
                    <span className="finding-area">Area {f.areaId}</span>
                    <span style={{ marginInlineStart: "auto", display: "inline-flex", gap: 2 }}>
                      <button onClick={() => startEdit(f)} className="btn btn-ghost btn-sm" aria-label={`Edit finding ${i + 1}`}><Pencil size={14} /></button>
                      <button onClick={() => setDeleteFindingId(f.id)} className="btn btn-ghost btn-sm" aria-label={`Delete finding ${i + 1}`}><Trash2 size={14} /></button>
                    </span>
                  </div>
                  <p style={{ fontSize: 13, marginTop: 8, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{f.finding}</p>
                  {f.recommendation && (
                    <div className="finding-rec"><Lightbulb size={14} /><p><strong>Recommendation: </strong>{f.recommendation}</p></div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {composerOpen && (
        <FindingComposer
          areaId={areaId}
          setAreaId={setAreaId}
          finding={finding}
          setFinding={setFinding}
          recommendation={recommendation}
          setRecommendation={setRecommendation}
          areas={overall.areas.map((a) => ({ id: a.areaId, shortTitle: a.shortTitle }))}
          editingLabel={editingId ? `Editing finding #${evaluation.findings.findIndex((f) => f.id === editingId) + 1}` : null}
          onClose={resetComposer}
          onSave={saveFinding}
        />
      )}

      <ConfirmModal
        open={!!deleteFindingId}
        title="Delete finding?"
        message="This finding and recommendation will be permanently removed from the evaluation."
        confirmLabel="Delete"
        onClose={() => setDeleteFindingId(null)}
        onConfirm={() => {
          if (!deleteFindingId) return;
          const target = deleteFindingId;
          setDeleteFindingId(null);
          setEvaluation((prev) => ({ ...prev, findings: prev.findings.filter((f) => f.id !== target) }));
        }}
      />
    </div>
  );
}
