import { Link } from "react-router-dom";
import { Progress } from "../ui/Progress";
import { Badge } from "../ui/Badge";
import type { AreaResult } from "../../lib/calculations";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

export function AreaCard({ result, evaluationId }: { result: AreaResult; evaluationId: string }) {
  const pct = result.totalIndicators ? Math.round((result.ratedCount / result.totalIndicators) * 100) : 0;
  return (
    <Link to={`/evaluations/${evaluationId}/area/${result.areaId}`} className="card area-card" style={{ display: "block", padding: 16, textDecoration: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="area-chip">{result.areaId}</span>
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--text-muted)" }}>Weight {(result.weight * 100).toFixed(0)}%</span>
          </p>
          <h3 style={{ fontSize: 13.5, fontWeight: 650, color: "var(--text)", marginTop: 6, letterSpacing: "-0.1px" }}>{result.title}</h3>
        </div>
        {result.isComplete ? <CheckCircle2 size={18} style={{ color: "var(--green)", flexShrink: 0 }} /> : <Circle size={18} style={{ color: "var(--text-disabled)", flexShrink: 0 }} />}
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 12, flexWrap: "wrap" }}>
        <span className={`status ${result.isComplete ? "status-green" : "status-yellow"}`}>{result.ratedCount}/{result.totalIndicators} rated</span>
        {result.average != null && <Badge tone={result.average >= 3.5 ? "green" : result.average >= 2.5 ? "blue" : result.average >= 1.5 ? "amber" : "red"}>{result.average.toFixed(2)} • {result.descriptor}</Badge>}
        <span className="area-open" style={{ marginInlineStart: "auto" }}>Open <ArrowRight size={12} /></span>
      </div>
      <Progress value={pct} className="mt-3" />
      {result.partialProduct != null && <p style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>Partial product: {result.partialProduct.toFixed(3)}</p>}
    </Link>
  );
}
