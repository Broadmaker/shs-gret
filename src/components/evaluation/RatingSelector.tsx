import type { RatingValue } from "../../types/evaluation";
import { ratingScale } from "../../data/ratingScale";

export function RatingSelector({
  value,
  onSelect,
}: {
  value: RatingValue | null;
  onSelect: (v: RatingValue) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Rating 1 to 4">
      {ratingScale.map((r) => {
        const active = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${r.value} — ${r.label}`}
            title={`${r.value}: ${r.label} — press ${r.value}`}
            onClick={() => onSelect(r.value)}
            className="rounded-lg border-2 p-3 text-center transition-all focus:outline-none"
            style={
              active
                ? { borderColor: "var(--primary)", background: "var(--primary)", color: "#fff", boxShadow: "0 2px 8px rgba(26,187,156,0.35)" }
                : { borderColor: "var(--border-color)", background: "var(--bg-surface)", color: "var(--text)" }
            }
            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "var(--text-muted)"; e.currentTarget.style.background = "var(--bg-surface-secondary)"; } }}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.background = "var(--bg-surface)"; } }}
          >
            <span className="block text-2xl font-bold leading-none">{r.value}</span>
            <span className="mt-1 block text-[11px] font-semibold tracking-wide" style={{ color: active ? "rgba(255,255,255,0.92)" : "var(--text-secondary)" }}>{r.shortLabel}</span>
            <span className="hidden sm:block text-[11px] leading-tight" style={{ color: active ? "rgba(255,255,255,0.72)" : "var(--text-muted)" }}>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
