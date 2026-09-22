import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadEvaluations, deleteEvaluation } from "../lib/storage";
import { calculateOverall } from "../lib/calculations";
import type { Evaluation } from "../types/evaluation";
import { AreaCard } from "../components/evaluation/AreaCard";
import { Progress } from "../components/ui/Progress";
import { Trash2, Building2, Plus } from "lucide-react";
import { ConfirmModal } from "../components/ui/ConfirmModal";

export function Dashboard({ evaluation }: { evaluation?: Evaluation }) {
  const nav = useNavigate();
  const [list, setList] = useState<Evaluation[]>(() => loadEvaluations());
  const [deleteTarget, setDeleteTarget] = useState<Evaluation | null>(null);
  useEffect(() => setList(loadEvaluations()), [evaluation]);

  if (evaluation) {
    const overall = calculateOverall(evaluation);
    return (
      <div>
        <div className="page-header">
          <div className="page-pretitle">Senior High School • Government Recognition • SY {evaluation.school.schoolYear}</div>
          <div className="page-header-row">
            <h1 className="page-title flex items-center gap-2"><Building2 size={18} style={{ color: "var(--primary)" }} /> {evaluation.school.name || "Untitled School"}</h1>
            <div className="page-actions">
              <Link to={`/evaluations/${evaluation.id}/profile`} className="btn btn-outline">Edit Profile</Link>
              <Link to={`/evaluations/${evaluation.id}/documents`} className="btn btn-outline">Documents & Team</Link>
              <Link to={`/evaluations/${evaluation.id}/summary`} className="btn btn-primary">Summary</Link>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{evaluation.school.address || "No address"} • ID: {evaluation.school.schoolId || "—"} • {evaluation.school.division} {evaluation.school.region}</p>
        </div>

        {/* Top stats — gentelella stat cards */}
        <div className="row col-3" style={{ marginBottom: 0 }}>
          <div className="card" style={{ borderInlineStart: "4px solid var(--primary)" }}>
            <div className="stat">
              <div className="stat-icon teal">
                <Building2 size={18} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Overall Compliance</div>
                <div className="stat-value-row">
                  <span className="stat-value" style={{ color: overall.overallScore != null && overall.overallScore >= 3.25 ? "var(--green)" : "var(--text)" }}>{overall.overallScore != null ? overall.overallScore.toFixed(2) : "—"}</span>
                  <span className={`status ${overall.isComplete ? "status-green" : "status-yellow"}`} style={{ fontSize: 11 }}>{overall.complianceStatus ?? "Incomplete"}</span>
                </div>
                <div className="stat-subtext">{overall.isComplete ? "Weighted sum of 8 areas" : "Complete all 85 indicators"}</div>
              </div>
            </div>
          </div>
          <div className="card" style={{ borderInlineStart: "4px solid var(--primary)" }}>
            <div className="stat">
              <div className="stat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={18} height={18}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Progress</div>
                <div className="stat-value-row">
                  <span className="stat-value">{overall.progressPct}<span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)" }}>%</span></span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{overall.totalRated}/{overall.totalIndicators}</span>
                </div>
                <div className="stat-subtext">{overall.areas.filter(a=>a.isComplete).length}/8 areas complete</div>
              </div>
              <div className="stat-spark">
                {overall.areas.map(a=> <div key={a.areaId} className="bar" style={{ height: `${30 + (a.ratedCount/a.totalIndicators)*60}%`, background: a.isComplete ? "var(--primary)" : "var(--border-color)" }} />)}
              </div>
            </div>
            <div style={{ padding: "0 16px 12px" }}><Progress value={overall.progressPct} /></div>
          </div>
          <div className="card" style={{ borderInlineStart: "4px solid var(--primary)" }}>
            <div className="stat">
              <div className="stat-icon yellow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={18} height={18}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Findings</div>
                <div className="stat-value-row">
                  <span className="stat-value">{evaluation.findings.length}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>records</span>
                </div>
                <div className="stat-subtext">{evaluation.evaluators.length} evaluator(s) • {evaluation.documentaryRequirements.filter(d=>d.status==="available").length}/10 docs</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row col-3" style={{ marginTop: 16 }}>
          {overall.areas.map((a) => <AreaCard key={a.areaId} result={a} evaluationId={evaluation.id} />)}
        </div>

        <div className="page-actions" style={{ marginTop: 16 }}>
          <Link to={`/evaluations/${evaluation.id}/documents`} className="btn btn-outline">Documents</Link>
          <Link to={`/evaluations/${evaluation.id}/review`} className="btn btn-outline">Review</Link>
          <Link to={`/evaluations/${evaluation.id}/summary`} className="btn btn-outline">Summary & Findings</Link>
          <Link to={`/evaluations/${evaluation.id}/print`} className="btn btn-primary">Print Preview</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-pretitle">DepEd SHS Evaluation</div>
        <div className="page-header-row">
          <h1 className="page-title">Evaluations</h1>
          <button onClick={() => nav("/evaluations/new")} className="btn btn-primary"><Plus size={14} /> New Evaluation</button>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No evaluations yet.</p>
            <button onClick={() => nav("/evaluations/new")} className="btn btn-primary" style={{ marginTop: 12 }}>Create first evaluation</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((ev) => {
            const ov = calculateOverall(ev);
            const created = new Date(ev.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
            const updated = new Date(ev.updatedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
            return (
              <div key={ev.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderInlineStart: "4px solid var(--primary)" }}>
                <Link to={`/evaluations/${ev.id}`} style={{ minWidth: 0, flex: 1, textDecoration: "none" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.school.name || "Untitled School"} <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>• {ev.school.schoolId}</span></p>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>SY {ev.school.schoolYear} • {ov.totalRated}/{ov.totalIndicators} • {ov.progressPct}% {ov.overallScore!=null? `• ${ov.overallScore.toFixed(2)} ${ov.complianceStatus}`: "• Incomplete"}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, display: "flex", gap: 8 }}>
                    <span>Created {created}</span><span>•</span><span>Updated {updated}</span><span>•</span><span style={{ color: ov.isComplete ? "var(--green)" : "var(--yellow)", fontWeight: 500 }}>{ov.isComplete ? "Complete" : "In progress"}</span>
                  </p>
                </Link>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Link to={`/evaluations/${ev.id}`} className="btn btn-outline btn-sm">Open</Link>
                  <button onClick={() => setDeleteTarget(ev)} className="btn btn-ghost btn-sm" aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete evaluation?"
        message={`Delete “${deleteTarget?.school.name || "Untitled School"}"? All ratings, remarks and findings for this evaluation will be permanently removed.`}
        confirmLabel="Delete evaluation"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) { deleteEvaluation(deleteTarget.id); setList(loadEvaluations()); } }}
      />
    </div>
  );
}
