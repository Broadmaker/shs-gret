import { Link } from "react-router-dom";
import { Progress } from "../ui/Progress";
import { Badge } from "../ui/Badge";
import type { AreaResult } from "../../lib/calculations";
import { CheckCircle2, Circle } from "lucide-react";

export function AreaCard({ result, evaluationId }: { result: AreaResult; evaluationId: string }) {
  const pct = result.totalIndicators ? Math.round((result.ratedCount / result.totalIndicators) * 100) : 0;
  return (
    <Link to={`/evaluations/${evaluationId}/area/${result.areaId}`} className="card" style={{ display: "block", padding: 16, textDecoration: "none", transition: "box-shadow 150ms", borderInlineStart: "4px solid var(--primary)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--text-muted)" }}>{result.areaId} • {(result.weight*100).toFixed(0)}%</p>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{result.title}</h3>
        </div>
        {result.isComplete ? <CheckCircle2 size={18} style={{ color: "var(--green)" }} /> : <Circle size={18} style={{ color: "var(--text-disabled)" }} />}
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
        <span className={`status ${result.isComplete ? "status-green" : "status-yellow"}`}>{result.ratedCount}/{result.totalIndicators} rated</span>
        {result.average != null && <Badge tone={result.average>=3.5?"green":result.average>=2.5?"blue":result.average>=1.5?"amber":"red"}>{result.average.toFixed(2)} • {result.descriptor}</Badge>}
      </div>
      <Progress value={pct} className="mt-3" />
      {result.partialProduct != null && <p style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}>Partial: {result.partialProduct.toFixed(3)}</p>}
    </Link>
  );
}
