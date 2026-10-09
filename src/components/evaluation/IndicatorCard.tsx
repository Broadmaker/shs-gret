import { useEffect, useState } from "react";
import { CheckCheck, Trash2, FileText, MessageSquare, Star, CircleDashed } from "lucide-react";
import type { Indicator } from "../../types/indicator";
import type { MovStatus, RatingValue } from "../../types/evaluation";
import { RatingSelector } from "./RatingSelector";
import { Card } from "../ui/Card";

export function IndicatorCard({
  indicator,
  areaCode,
  index,
  total,
  rating,
  remarks,
  movStatus,
  movChecked = {},
  onRate,
  onRemarks,
  onToggleMov,
  onBulkMov,
}: {
  indicator: Indicator;
  areaCode: string;
  index: number;
  total: number;
  rating: RatingValue | null;
  remarks: string;
  movStatus: MovStatus;
  movChecked?: Record<string, boolean>;
  onRate: (v: RatingValue) => void;
  onRemarks: (v: string) => void;
  onToggleMov: (movKey: string, total: number) => void;
  onBulkMov: (checked: boolean) => void;
}) {
  const [localRemarks, setLocalRemarks] = useState(remarks);
  useEffect(() => { setLocalRemarks(remarks); }, [remarks, indicator.id]);
  const checkedCount = Object.values(movChecked).filter(Boolean).length;
  const hasRating = rating != null;

  return (
    <Card className={`indicator-card${hasRating ? " done" : ""}`}>
      <div className="ind-topbar" aria-hidden="true" />

      {/* Sheet header */}
      <div className="card-header" style={{ minHeight: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <span className="ind-numeral" aria-label={`Indicator ${index} of ${total}`}><span className="n">{String(index).padStart(2, "0")}</span><span className="t">/{total}</span></span>
          <span style={{ width: 1, alignSelf: "stretch", background: "var(--border-color)", flexShrink: 0 }} aria-hidden="true" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--text-muted)" }}>
              Area {areaCode} • {indicator.id}
            </div>
            <div style={{ marginTop: 3, fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px", color: "var(--text)", lineHeight: 1.35 }}>{indicator.title}</div>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          {hasRating
            ? <span className="status status-green" style={{ fontSize: 11.5, fontWeight: 700, border: "1px solid rgba(47,179,68,0.3)", background: "var(--green-lt)", borderRadius: 999, padding: "3px 10px" }}><Star size={11} fill="currentColor" /> {rating} Rated</span>
            : <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)", border: "1px dashed var(--border-color)", borderRadius: 999, padding: "3px 10px" }}><CircleDashed size={12} /> Not rated</span>}
        </div>
      </div>

      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18, padding: 18 }}>
        {/* 01 Criterion */}
        <section aria-label="Criterion">
          <p className="ind-step"><span className="ind-step-num">01</span> Criterion</p>
          <div className="ind-criterion"><p>{indicator.description}</p></div>
        </section>

        {/* 02 Evidence */}
        <section aria-label="Means of verification">
          <p className="ind-step">
            <span className="ind-step-num">02</span> Evidence
            <span style={{ marginInlineStart: "auto", fontSize: 10.5, fontWeight: 600, letterSpacing: 0, textTransform: "none", color: checkedCount ? "var(--primary-dk)" : "var(--text-muted)", background: checkedCount ? "var(--primary-lt)" : "var(--bg-surface-secondary)", border: "1px solid var(--border-color-light)", borderRadius: 999, padding: "2px 9px" }}>{checkedCount}/{indicator.movs.length} verified</span>
          </p>
          <div className="ind-evidence">
            {indicator.movs.map((m, i) => {
              const key = `${i}:${m.slice(0, 24)}`;
              const checked = !!movChecked[key];
              return (
                <label key={key} className={`mov-check mov-row${checked ? " checked" : ""}`} style={{ background: checked ? "var(--primary-lt)" : undefined, borderBottom: i === indicator.movs.length - 1 ? "none" : "1px solid var(--border-color-light)" }}>
                  <span className="mov-box" style={{ marginTop: 1, width: 18, height: 18, borderRadius: 4, border: checked ? "1px solid var(--primary)" : "1.5px solid var(--border-color)", background: checked ? "var(--primary)" : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {checked && <CheckCheck size={10} color="#fff" />}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => onToggleMov(key, indicator.movs.length)} aria-label={m} style={{ position: "absolute", width: 1, height: 1, opacity: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }} />
                  <span style={{ fontSize: 12.5, color: checked ? "var(--text)" : "var(--text-secondary)", lineHeight: 1.5, fontWeight: checked ? 500 : 400 }}>{m}</span>
                </label>
              );
            })}
          </div>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
              <FileText size={11} /> Overall (auto):
              <span className={`status ${movStatus === "available" ? "status-green" : movStatus === "partially-available" ? "status-yellow" : movStatus === "not-available" ? "status-red" : ""}`} style={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize", border: "1px solid var(--border-color)", borderRadius: 999, padding: "2px 8px", background: "var(--bg-surface)" }}>
                {movStatus.replace("-", " ")}
              </span>
            </span>
            <span style={{ display: "inline-flex", gap: 6 }}>
              <button onClick={() => onBulkMov(true)} className="btn btn-primary btn-sm"><CheckCheck size={12} /> Check all</button>
              <button onClick={() => onBulkMov(false)} className="btn btn-outline btn-sm" style={{ borderColor: "rgba(214,57,57,0.25)", color: "var(--red)", background: "var(--red-lt)" }}><Trash2 size={12} /> Clear</button>
            </span>
          </div>
        </section>

        {/* 03 Rating — the decision zone */}
        <section className="ind-decision" aria-label="Rating">
          <p className="ind-step">
            <span className="ind-step-num">03</span> Your Rating
            {hasRating && <span className="ind-rated-pill">{rating} • {rating===4 ? "Meeting" : rating===3 ? "Nearly" : rating===2 ? "Partially" : "Not Meeting"}</span>}
          </p>
          <RatingSelector value={rating} onSelect={onRate} />
          <p className="ind-hint">Keys 1–4 rate instantly • 1 Not Meeting • 2 Partially • 3 Nearly • 4 Meeting Standards</p>
        </section>

        {/* 04 Remarks */}
        <section aria-label="Remarks">
          <label className="ind-step" htmlFor={`remarks-${indicator.id}`}>
            <span className="ind-step-num">04</span> Remarks / Findings
            {localRemarks && <span style={{ marginInlineStart: "auto", letterSpacing: 0, textTransform: "none", fontWeight: 400 }}>{localRemarks.length} chars</span>}
          </label>
          <textarea
            id={`remarks-${indicator.id}`}
            value={localRemarks}
            onChange={(e) => setLocalRemarks(e.target.value)}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.boxShadow = "none"; if (localRemarks !== remarks) onRemarks(localRemarks); }}
            placeholder="Findings, gaps, or recommendations for this indicator… (R to focus)"
            rows={3}
            style={{ width: "100%", border: "1px solid var(--border-color)", borderRadius: 10, background: "var(--bg-surface)", padding: "10px 12px", fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.55, display: "block" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-lt)"; }}
          />
          <p style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--text-muted)", margin: "6px 0 0" }}><MessageSquare size={11} /> Saved on blur • kept offline on this device</p>
        </section>
      </div>
    </Card>
  );
}
