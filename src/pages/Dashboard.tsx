import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadEvaluations, deleteEvaluation } from "../lib/storage";
import { calculateOverall } from "../lib/calculations";
import type { Evaluation } from "../types/evaluation";
import { AreaCard } from "../components/evaluation/AreaCard";
import { Trash2, Building2, Plus, Search, ArrowRight, Download, ClipboardList, Check, Gauge, FileWarning, Users, Loader2, Cloud, CloudOff, RefreshCw, TriangleAlert } from "lucide-react";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Dropdown } from "../components/ui/Dropdown";
import { health, pushAll, pullEvaluation, lastSyncedAt } from "../lib/sync";

function bannerPill(score: number | null): string {
  if (score == null) return "vp-neutral";
  if (score >= 3.25) return "vp-green";
  if (score >= 2.5) return "vp-blue";
  if (score >= 1.75) return "vp-amber";
  return "vp-red";
}

function WfSep({ lit }: { lit?: boolean }) {
  return <span className={`wf-sep${lit ? " lit" : ""}`} aria-hidden="true" />;
}

function WorkflowStep({ to, label, state, doneLabel }: { to: string; label: string; state: "done" | "current" | "todo"; doneLabel: string }) {
  return (
    <Link to={to} className={`wf-step wf-${state}`} aria-current={state === "current" ? "step" : undefined} title={state === "done" ? doneLabel : state === "current" ? "Current step" : "Upcoming"}>
      <span className="wf-dot" aria-hidden="true">{state === "done" ? <Check size={11} strokeWidth={3} /> : state === "current" ? <ArrowRight size={11} strokeWidth={2.5} /> : null}</span>
      {label}
    </Link>
  );
}

export function Dashboard({ evaluation }: { evaluation?: Evaluation }) {
  const nav = useNavigate();
  const [list, setList] = useState<Evaluation[]>(() => loadEvaluations());
  const [deleteTarget, setDeleteTarget] = useState<Evaluation | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "progress" | "complete">("all");
  const [sort, setSort] = useState<"updated" | "name" | "progress">("updated");
  const [exporting, setExporting] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [pullTarget, setPullTarget] = useState<Evaluation | null>(null);
  useEffect(() => setList(loadEvaluations()), [evaluation]);
  useEffect(() => { health().then(setOnline).catch(() => setOnline(false)); }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    // One weighted pass per evaluation — reused by filter, sort, and rows.
    const overalls = new Map(list.map((ev) => [ev.id, calculateOverall(ev)] as const));
    const ov = (ev: Evaluation) => overalls.get(ev.id) ?? calculateOverall(ev);
    const rows = list.filter((ev) => {
      if (statusFilter === "complete" && !ov(ev).isComplete) return false;
      if (statusFilter === "progress" && ov(ev).isComplete) return false;
      if (!needle) return true;
      return (
        (ev.school.name || "").toLowerCase().includes(needle) ||
        (ev.school.schoolId || "").toLowerCase().includes(needle) ||
        (ev.school.division || "").toLowerCase().includes(needle) ||
        (ev.school.schoolYear || "").toLowerCase().includes(needle)
      );
    });
    const sorted = [...rows].sort((a, b) => {
      if (sort === "name") return (a.school.name || "").localeCompare(b.school.name || "");
      if (sort === "progress") return ov(b).progressPct - ov(a).progressPct;
      return +new Date(b.updatedAt) - +new Date(a.updatedAt);
    });
    return { rows: sorted, overalls };
  }, [list, q, statusFilter, sort]);

  if (evaluation) {
    const overall = calculateOverall(evaluation);
    const nextArea = overall.areas.find((a) => !a.isComplete);
    const areasDone = overall.areas.filter((a) => a.isComplete).length;
    const docsReady = evaluation.documentaryRequirements.filter((d) => d.status === "available").length;
    const stProfile = evaluation.school.name.trim() ? "done" : "current";
    const stDocs = evaluation.documentaryRequirements.every((d) => d.status !== "not-checked") ? "done" : evaluation.school.name.trim() ? "current" : "todo";
    const stAreas = areasDone === 8 ? "done" : "current";
    const stReview: "current" | "todo" = overall.isComplete ? "current" : "todo";
    return (
      <div>
        {/* Result banner — the single emphasized element; stats below stay subordinate */}
        <section className="result-banner" aria-label="Evaluation result">
          <div className="rb-main">
            <span className="rb-eyebrow"><Building2 size={12} /> SHS Government Recognition • SY {evaluation.school.schoolYear || "—"}</span>
            <h1 className="rb-school">{evaluation.school.name || "Untitled School"}</h1>
            <p className="rb-meta">{evaluation.school.address || "No address"} • ID: {evaluation.school.schoolId || "—"} • {[evaluation.school.division, evaluation.school.region].filter(Boolean).join(" / ") || "—"}</p>
            <div style={{ marginTop: 8 }}>
              <span className={`verdict-pill ${bannerPill(overall.overallScore)}`} style={{ marginTop: 0 }}>
                {overall.complianceStatus ?? "In Progress"}
              </span>
            </div>
            <div className="rb-progress-row">
              <div className="rb-progress-labels">
                <span>{overall.totalRated}/{overall.totalIndicators} indicators • {areasDone}/8 areas</span>
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
              <div className="rb-score-value">{overall.overallScore != null ? overall.overallScore.toFixed(2) : "—"}</div>
              <div className="rb-score-label">Overall Score</div>
            </div>
          </div>
          <div className="rb-actions">
            {nextArea ? (
              <Link to={`/evaluations/${evaluation.id}/area/${nextArea.areaId}`} className="rb-btn-primary">Continue Area {nextArea.areaId} <ArrowRight size={14} /></Link>
            ) : (
              <Link to={`/evaluations/${evaluation.id}/summary`} className="rb-btn-primary">View Official Result <ArrowRight size={14} /></Link>
            )}
            <Link to={`/evaluations/${evaluation.id}/summary`} className="rb-btn-ghost"><ClipboardList size={13} /> Summary</Link>
            <button
              onClick={() => {
                if (exporting) return;
                setExporting(true);
                // PDF engine + seal assets load on demand, keeping the main bundle lean.
                void import("../lib/exportPdf")
                  .then(({ exportEvaluationPdf }) => exportEvaluationPdf(evaluation))
                  .finally(() => setExporting(false));
              }}
              disabled={exporting}
              className="rb-btn-ghost"
              style={exporting ? { opacity: 0.75 } : undefined}
            >
              {exporting ? <><Loader2 size={13} className="animate-spin" /> Exporting…</> : <><Download size={13} /> Export PDF</>}
            </button>
          </div>
        </section>

        {/* Subordinate mini stats */}
        <div className="mini-stats">
          <div className="mini-stat">
            <span className="mini-stat-icon mi-teal"><Gauge size={24} /></span>
            <div className="mini-stat-body">
              <div className="mini-stat-label">Progress</div>
              <div className="mini-stat-value">{overall.progressPct}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>%</span></div>
              <div className="mini-stat-sub">{areasDone}/8 areas complete</div>
            </div>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-icon mi-amber"><FileWarning size={24} /></span>
            <div className="mini-stat-body">
              <div className="mini-stat-label">Findings</div>
              <div className="mini-stat-value">{evaluation.findings.length}</div>
              <div className="mini-stat-sub">{evaluation.findings.length === 1 ? "record" : "records"} for the report</div>
            </div>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-icon mi-blue"><Users size={24} /></span>
            <div className="mini-stat-body">
              <div className="mini-stat-label">Team & Docs</div>
              <div className="mini-stat-value">{evaluation.evaluators.length}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}> eval • {docsReady} docs</span></div>
              <div className="mini-stat-sub"><Link to={`/evaluations/${evaluation.id}/documents`} style={{ color: "var(--primary)", fontWeight: 600 }}>Manage →</Link></div>
            </div>
          </div>
        </div>

        {/* Workflow — directly under the banner so the next step is always visible */}
        <nav className="workflow" aria-label="Evaluation workflow" style={{ marginTop: 12 }}>
          <span className="wf-label">Workflow</span>
          <div className="wf-steps">
            <WorkflowStep to={`/evaluations/${evaluation.id}/profile`} label="Profile" state={stProfile} doneLabel="Name set" />
            <WfSep lit={stProfile === "done"} />
            <WorkflowStep to={`/evaluations/${evaluation.id}/documents`} label="Documents" state={stDocs} doneLabel="All checked" />
            <WfSep lit={stDocs === "done"} />
            <WorkflowStep to={nextArea ? `/evaluations/${evaluation.id}/area/${nextArea.areaId}` : `/evaluations/${evaluation.id}`} label={`Areas ${areasDone}/8`} state={stAreas} doneLabel="Complete" />
            <WfSep lit={stAreas === "done"} />
            <WorkflowStep to={`/evaluations/${evaluation.id}/review`} label="Review" state={stReview} doneLabel="Ready" />
            <WfSep lit={false} />
            <WorkflowStep to={`/evaluations/${evaluation.id}/summary`} label="Summary" state={stReview} doneLabel="Ready" />
          </div>
        </nav>

        <div className="row col-3" style={{ marginTop: 16 }}>
          {overall.areas.map((a) => <AreaCard key={a.areaId} result={a} evaluationId={evaluation.id} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-pretitle">DepEd SHS Evaluation • {list.length} record{list.length === 1 ? "" : "s"}</div>
        <div className="page-header-row">
          <h1 className="page-title">Evaluations</h1>
          <button onClick={() => nav("/evaluations/new")} className="btn btn-primary"><Plus size={14} /> New Evaluation</button>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>Government recognition evaluations across the division. Select a record to continue rating.</p>
      </div>
      <div className="card" style={{ padding: "10px 12px", marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search school, ID, division…"
            aria-label="Search evaluations"
            style={{ width: "100%", height: 34, padding: "0 10px 0 32px", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", fontSize: 13, background: "var(--bg-surface)", color: "var(--text)", outline: "none" }}
          />
        </div>
        <div role="tablist" aria-label="Status filter" style={{ display: "flex", gap: 4, background: "var(--bg-surface-secondary)", border: "1px solid var(--border-color-light)", borderRadius: "var(--radius)", padding: 3 }}>
          {(["all", "progress", "complete"] as const).map((s) => (
            <button key={s} role="tab" aria-selected={statusFilter === s} onClick={() => setStatusFilter(s)} className="btn btn-sm" style={{ height: 28, background: statusFilter === s ? "var(--bg-surface)" : "transparent", border: statusFilter === s ? "1px solid var(--border-color)" : "1px solid transparent", boxShadow: statusFilter === s ? "var(--shadow)" : "none", color: statusFilter === s ? "var(--text)" : "var(--text-muted)", fontWeight: statusFilter === s ? 600 : 500 }}>
              {s === "all" ? "All" : s === "progress" ? "In progress" : "Complete"}
            </button>
          ))}
        </div>
        <div style={{ width: 170, flexShrink: 0 }}>
          <Dropdown label="Sort evaluations" value={sort} onChange={(v) => setSort(v as typeof sort)}
            options={[
              { value: "updated", label: "Recently updated" },
              { value: "name", label: "School name" },
              { value: "progress", label: "Progress" },
            ]} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginInlineStart: "auto" }}>
          <span className={`status ${online == null ? "" : online ? "status-green" : "status-red"}`} title={online == null ? "Checking cloud…" : online ? "Cloud reachable" : "Cloud unreachable — working offline"}>
            {online == null ? "…" : online ? <><Cloud size={12} /> Cloud</> : <><CloudOff size={12} /> Offline</>}
          </span>
          <button
            onClick={() => {
              if (syncing) return;
              setSyncing(true); setSyncMsg(""); setConflicts([]);
              void pushAll()
                .then((out) => {
                  const pushed = out.filter((o) => o.result.status === "pushed").length;
                  const conf = out.filter((o) => o.result.status === "conflict").map((o) => o.id);
                  const errs = out.filter((o) => o.result.status === "error");
                  setConflicts(conf);
                  setList(loadEvaluations());
                  setOnline(true);
                  setSyncMsg(
                    errs.length > 0 ? `Sync failed — ${errs[0].result.status === "error" ? errs[0].result.message : "network error"}` :
                    conf.length > 0 ? `${pushed} pushed • ${conf.length} conflict${conf.length === 1 ? "" : "s"} (server is newer)` :
                    out.length === 0 ? "Nothing to sync" : `${pushed} pushed ✓`
                  );
                })
                .catch((e: unknown) => { setOnline(false); setSyncMsg(e instanceof Error ? e.message : "Sync failed — offline?"); })
                .finally(() => setSyncing(false));
            }}
            disabled={syncing}
            className="btn btn-outline btn-sm"
            title="Push all local evaluations to D1"
          >
            {syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {syncing ? "Syncing…" : "Sync all"}
          </button>
        </div>
      </div>
      {syncMsg && (
        <p role="status" style={{ fontSize: 12, color: syncMsg.startsWith("Sync failed") ? "var(--red)" : "var(--text-secondary)", margin: "0 0 12px" }}>{syncMsg}</p>
      )}
      {list.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Building2 size={20} /></div>
            <div className="empty-state-title">No evaluations yet</div>
            <p className="empty-state-text">Create your first SHS government recognition evaluation — add the school profile, then rate areas A–H.</p>
            <button onClick={() => nav("/evaluations/new")} className="btn btn-primary" style={{ marginTop: 12 }}>Create first evaluation</button>
          </div>
        </div>
      ) : filtered.rows.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Search size={20} /></div>
            <div className="empty-state-title">No matches</div>
            <p className="empty-state-text">No evaluations match “{q}”{statusFilter !== "all" ? ` with status “${statusFilter}”` : ""}. Try a different search.</p>
            <button onClick={() => { setQ(""); setStatusFilter("all"); }} className="btn btn-outline" style={{ marginTop: 12 }}>Clear filters</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.rows.map((ev) => {
            const ov = filtered.overalls.get(ev.id) ?? calculateOverall(ev);
            const created = new Date(ev.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
            const updated = new Date(ev.updatedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
            const syncedAt = lastSyncedAt(ev.id);
            const conflicted = conflicts.includes(ev.id);
            return (
              <div key={ev.id} className="card record-row" style={{ borderInlineStart: ov.isComplete ? "4px solid var(--green)" : "4px solid var(--primary)" }}>
                <Link to={`/evaluations/${ev.id}`} className="record-main" style={{ minWidth: 0, flex: 1, textDecoration: "none" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.school.name || "Untitled School"} <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>• {ev.school.schoolId}</span></span>
                    {conflicted ? (
                      <span title="Server copy is newer — edit locally and sync again to overwrite" style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 700, color: "#b45309", background: "var(--yellow-lt)", border: "1px solid rgba(245,159,0,0.35)", borderRadius: 999, padding: "1px 7px", flexShrink: 0 }}><TriangleAlert size={11} /> Conflict</span>
                    ) : syncedAt ? (
                      <span title={`Synced ${new Date(syncedAt).toLocaleString("en-PH")}`} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 600, color: "var(--primary-dk)", background: "var(--primary-lt)", border: "1px solid rgba(26,187,156,0.3)", borderRadius: 999, padding: "1px 7px", flexShrink: 0 }}><Cloud size={11} /> Synced</span>
                    ) : null}
                  </p>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>SY {ev.school.schoolYear} • {ov.totalRated}/{ov.totalIndicators} • {ov.progressPct}% {ov.overallScore!=null? `• ${ov.overallScore.toFixed(2)} ${ov.complianceStatus}`: "• Incomplete"}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, display: "flex", gap: 8 }}>
                    <span>Created {created}</span><span>•</span><span>Updated {updated}</span><span>•</span><span style={{ color: ov.isComplete ? "var(--green)" : "var(--yellow)", fontWeight: 500 }}>{ov.isComplete ? "Complete" : "In progress"}</span>
                  </p>
                </Link>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Link to={`/evaluations/${ev.id}`} className="btn btn-outline btn-sm">Open</Link>
                  <button onClick={() => setPullTarget(ev)} className="btn btn-ghost btn-sm" title="Pull server copy (overwrites local)" aria-label={`Pull server copy of ${ev.school.name || "evaluation"}`}><Download size={14} /></button>
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
      <ConfirmModal
        open={!!pullTarget}
        title="Pull server copy?"
        message={`Replace your local “${pullTarget?.school.name || "Untitled School"}" with the cloud version? Unsaved local changes will be lost.`}
        confirmLabel="Pull from cloud"
        variant="primary"
        onClose={() => setPullTarget(null)}
        onConfirm={() => {
          if (!pullTarget) return;
          const target = pullTarget;
          setPullTarget(null);
          setSyncMsg("");
          pullEvaluation(target.id)
            .then(() => { setList(loadEvaluations()); setSyncMsg(`Pulled “${target.school.name || "Untitled School"}" from cloud ✓`); })
            .catch((e: unknown) => setSyncMsg(e instanceof Error ? e.message : "Pull failed — offline?"));
        }}
      />
    </div>
  );
}
