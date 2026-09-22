import { useEffect, useState } from "react";
import { CheckCheck, Trash2, FileText, MessageSquare, Star } from "lucide-react";
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
    <Card style={{ overflow: "hidden", borderInlineStart: hasRating ? "4px solid var(--primary)" : "4px solid var(--border-color)" }}>
      <div className="card-header" style={{ background: hasRating ? "var(--primary-lt)" : "var(--bg-surface)", borderBottom: hasRating ? "1px solid rgba(26,187,156,0.15)" : "1px solid var(--border-color-light)", minHeight: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={{ width: 36, height: 36, borderRadius: "var(--radius)", background: hasRating ? "var(--primary)" : "var(--bg-surface-secondary)", border: hasRating ? "1px solid var(--primary-dk)" : "1px solid var(--border-color)", color: hasRating ? "#fff" : "var(--text-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {String(index).padStart(2, "0")}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: hasRating ? "var(--primary)" : "var(--text-muted)" }}>{areaCode} • {indicator.id}</span>
              <span style={{ fontSize: 10, color: "var(--text-disabled)" }}>•</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{index} of {total}</span>
              {hasRating && <span className="status status-green" style={{ marginLeft: 4, fontSize: 11, border: "1px solid rgba(47,179,68,0.2)", borderRadius: 999, padding: "1px 6px", background: "#fff" }}>{rating} • Rated</span>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 420 }}>{indicator.title}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {hasRating ? <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--green)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Star size={14} fill="white" /></span> : <span style={{ fontSize: 11, color: "var(--text-muted)", border: "1px dashed var(--border-color)", borderRadius: 999, padding: "2px 8px" }}>Not rated</span>}
        </div>
      </div>

      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 20, padding: 20 }}>
        <div style={{ borderLeft: "3px solid var(--primary)", paddingLeft: 12, background: "var(--bg-surface-secondary)", borderRadius: "0 var(--radius) var(--radius) 0", padding: "10px 12px" }}>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--text)", margin: 0 }}>{indicator.description}</p>
        </div>

        <div style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius)", background: "var(--bg-surface-secondary)", padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--text)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
              <FileText size={12} style={{ color: "var(--primary)" }} /> Means of Verification
              <span style={{ fontSize: 10, fontWeight: 500, color: checkedCount ? "var(--primary)" : "var(--text-muted)", background: checkedCount ? "var(--primary-lt)" : "var(--bg-surface-secondary)", border: "1px solid var(--border-color-light)", borderRadius: 999, padding: "1px 6px" }}>{checkedCount}/{indicator.movs.length}</span>
            </p>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 8px" }}>Tick what is present — Overall updates automatically.</p>
          <div style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            {indicator.movs.map((m, i) => {
              const key = `${i}:${m.slice(0,24)}`;
              const checked = !!movChecked[key];
              return (
                <label key={key} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: checked ? "var(--primary-lt)" : "var(--bg-surface)", borderBottom: i === indicator.movs.length - 1 ? "none" : "1px solid var(--border-color-light)", cursor: "pointer" }}>
                  <span style={{ marginTop: 1, width: 18, height: 18, borderRadius: 4, border: checked ? "1px solid var(--primary)" : "1.5px solid var(--border-color)", background: checked ? "var(--primary)" : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {checked && <CheckCheck size={10} color="#fff" />}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => onToggleMov(key, indicator.movs.length)} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
                  <span style={{ fontSize: 12.5, color: checked ? "var(--text)" : "var(--text-secondary)", lineHeight: 1.5, fontWeight: checked ? 500 : 400 }}>{m}</span>
                </label>
              );
            })}
          </div>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
              Overall (auto):
              <span className={`status ${movStatus==="available" ? "status-green" : movStatus==="partially-available" ? "status-yellow" : movStatus==="not-available" ? "status-red" : ""}`} style={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize", border: "1px solid var(--border-color)", borderRadius: 999, padding: "2px 8px", background: "var(--bg-surface)" }}>
                {movStatus.replace("-", " ")}
              </span>
            </span>
            <span style={{ display: "inline-flex", gap: 6 }}>
              <button onClick={() => onBulkMov(true)} className="btn btn-primary btn-sm" style={{ height: 28, gap: 4 }}><CheckCheck size={12} /> Check all</button>
              <button onClick={() => onBulkMov(false)} className="btn btn-outline btn-sm" style={{ height: 28, gap: 4, borderColor: "rgba(214,57,57,0.25)", color: "var(--red)", background: "var(--red-lt)" }}><Trash2 size={12} /> Clear</button>
            </span>
          </div>
        </div>

        <div style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius)", padding: 14, background: "var(--bg-surface)" }}>
          <p style={{ marginBottom: 10, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
            <Star size={12} style={{ color: hasRating ? "var(--yellow)" : "var(--text-muted)" }} /> Select Rating
            {hasRating && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "var(--primary)", background: "var(--primary-lt)", border: "1px solid rgba(26,187,156,0.2)", borderRadius: 999, padding: "2px 8px" }}>{rating} • {rating===4 ? "Meeting" : rating===3 ? "Nearly" : rating===2 ? "Partially" : "Not Meeting"}</span>}
          </p>
          <RatingSelector value={rating} onSelect={onRate} />
          <p style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>1 Not Meeting • 2 Partially • 3 Nearly • 4 Meeting Standards</p>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
            <MessageSquare size={12} style={{ color: "var(--text-muted)" }} /> Remarks / Findings
            {localRemarks && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)", fontWeight: 400 }}>{localRemarks.length} chars</span>}
          </label>
          <textarea
            value={localRemarks}
            onChange={(e) => setLocalRemarks(e.target.value)}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.boxShadow = "none"; if (localRemarks !== remarks) onRemarks(localRemarks); }}
            placeholder="Add findings, gaps, or recommendations for this indicator..."
            rows={3}
            style={{ marginTop: 6, width: "100%", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", background: "var(--bg-surface)", padding: "10px 12px", fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.5 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-lt)"; }}
          />
          <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>Saved on blur • Offline persisted</p>
        </div>
      </div>
    </Card>
  );
}
