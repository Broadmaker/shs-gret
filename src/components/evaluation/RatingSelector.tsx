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
            className={`rounded-lg border-2 p-3 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1 ${
              active
                ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow"
                : "border-[var(--border-color)] bg-white hover:border-[var(--text-muted)] hover:bg-[var(--bg-surface-secondary)]"
            }`}
          >
            <span className="block text-2xl font-bold leading-none">{r.value}</span>
            <span className={`mt-1 block text-[11px] font-semibold tracking-wide ${active ? "text-white/90" : "text-[var(--text-secondary)]"}`}>{r.shortLabel}</span>
            <span className={`hidden sm:block text-[11px] leading-tight ${active ? "text-white/70" : "text-[var(--text-muted)]"}`}>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
