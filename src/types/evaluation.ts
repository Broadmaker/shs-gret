export type RatingValue = 1 | 2 | 3 | 4;

export type EvaluationStatus = "draft" | "completed" | "finalized";

export type MovStatus = "not-checked" | "available" | "partially-available" | "not-available";

export interface IndicatorRating {
  indicatorId: string;
  rating: RatingValue | null;
  remarks: string;
  movStatus: MovStatus;
  movChecked?: Record<string, boolean>;
  updatedAt: string;
}

export interface Finding {
  id: string;
  areaId: string;
  indicatorId?: string;
  finding: string;
  recommendation: string;
}

export interface Evaluator {
  id: string;
  name: string;
  role: string;
  order: number;
}

export interface DocumentaryRequirement {
  id: string;
  title: string;
  status: MovStatus;
  remarks?: string;
}

export interface Evaluation {
  id: string;
  school: SchoolProfile;
  evaluators: Evaluator[];
  documentaryRequirements: DocumentaryRequirement[];
  ratings: Record<string, IndicatorRating>;
  findings: Finding[];
  status: EvaluationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolProfile {
  name: string;
  schoolId: string;
  shsCurriculum: string;
  address: string;
  division: string;
  region: string;
  administratorName: string;
  contactNumber: string;
  officialEmail: string;
  schoolYear: string;
  recognitionAppliedFor: string;
  ocularInspectionDate?: string;
  submissionDateSDO?: string;
  submissionDateRO?: string;
}
