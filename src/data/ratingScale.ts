import type { RatingScaleItem } from "../types/indicator";

export const ratingScale: RatingScaleItem[] = [
  { value: 1, label: "Not Meeting the Standards", shortLabel: "NOT MEETING", description: "No evidence of compliance" },
  { value: 2, label: "Partially Meeting the Standards", shortLabel: "PARTIALLY", description: "Limited compliance" },
  { value: 3, label: "Nearly Meeting the Standards", shortLabel: "NEARLY", description: "Substantial compliance with minor gaps" },
  { value: 4, label: "Meeting the Standards", shortLabel: "MEETING", description: "Fully compliant" },
];

export function getRatingLabel(value: number | null): string {
  if (!value) return "Not Rated";
  return ratingScale.find((r) => r.value === value)?.label ?? "Unknown";
}

export function getRatingShortLabel(value: number | null): string {
  if (!value) return "—";
  return ratingScale.find((r) => r.value === value)?.shortLabel ?? "—";
}
