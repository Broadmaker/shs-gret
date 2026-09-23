import { evaluationAreas } from "../data/evaluationAreas";
import type { Evaluation, RatingValue } from "../types/evaluation";

// Indicator / Area rating descriptor (1-4)
export function getRatingDescriptor(value: number): string {
  if (value >= 3.5) return "Meeting the Standards";
  if (value >= 2.5) return "Nearly Meeting the Standards";
  if (value >= 1.5) return "Partially Meeting the Standards";
  return "Not Meeting the Standards";
}

export function getRatingDescriptorForValue(rating: RatingValue): string {
  switch (rating) {
    case 4: return "Meeting the Standards";
    case 3: return "Nearly Meeting the Standards";
    case 2: return "Partially Meeting the Standards";
    case 1: return "Not Meeting the Standards";
  }
}

// Overall compliance (weighted sum) — distinct from area rating
export function getComplianceStatus(overall: number): string {
  if (overall >= 3.25) return "Fully Compliant";
  if (overall >= 2.50) return "Substantially Compliant";
  if (overall >= 1.75) return "Partially Compliant";
  return "Not Compliant";
}

export function getComplianceColor(overall: number): string {
  if (overall >= 3.25) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (overall >= 2.50) return "text-blue-700 bg-blue-50 border-blue-200";
  if (overall >= 1.75) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

export interface AreaResult {
  areaId: string;
  title: string;
  shortTitle: string;
  weight: number;
  totalIndicators: number;
  ratedCount: number;
  totalScore: number;
  average: number | null; // null if incomplete
  partialProduct: number | null;
  isComplete: boolean;
  descriptor: string | null;
}

export interface OverallResult {
  areas: AreaResult[];
  overallScore: number | null;
  complianceStatus: string | null;
  isComplete: boolean;
  totalRated: number;
  totalIndicators: number;
  progressPct: number;
}

export function calculateAreaResult(
  areaId: string,
  ratings: Record<string, { rating: number | null }>
): AreaResult {
  const area = evaluationAreas.find((a) => a.id === areaId);
  if (!area) throw new Error(`Area ${areaId} not found`);

  let totalScore = 0;
  let ratedCount = 0;
  for (const ind of area.indicators) {
    const r = ratings[ind.id]?.rating;
    if (r != null && r >= 1 && r <= 4) {
      totalScore += r;
      ratedCount++;
    }
  }
  const isComplete = ratedCount === area.indicators.length;
  const average = isComplete ? totalScore / area.indicators.length : null;
  const partialProduct = average != null ? average * area.weight : null;

  return {
    areaId: area.id,
    title: area.title,
    shortTitle: area.shortTitle,
    weight: area.weight,
    totalIndicators: area.indicators.length,
    ratedCount,
    totalScore,
    average,
    partialProduct,
    isComplete,
    descriptor: average != null ? getRatingDescriptor(average) : null,
  };
}

export function calculateOverall(evaluation: Evaluation): OverallResult {
  const areas: AreaResult[] = evaluationAreas.map((a) => calculateAreaResult(a.id, evaluation.ratings));
  const totalIndicators = areas.reduce((s, a) => s + a.totalIndicators, 0);
  const totalRated = areas.reduce((s, a) => s + a.ratedCount, 0);
  const isComplete = areas.every((a) => a.isComplete);
  const overallScore = isComplete ? areas.reduce((s, a) => s + (a.partialProduct ?? 0), 0) : null;
  const progressPct = totalIndicators === 0 ? 0 : Math.round((totalRated / totalIndicators) * 100);

  return {
    areas,
    overallScore,
    complianceStatus: overallScore != null ? getComplianceStatus(overallScore) : null,
    isComplete,
    totalRated,
    totalIndicators,
    progressPct,
  };
}

// Strict validation — NEVER treat missing as 0
export function isValidRating(v: unknown): v is RatingValue {
  return v === 1 || v === 2 || v === 3 || v === 4;
}
