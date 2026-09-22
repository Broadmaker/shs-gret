export interface Indicator {
  id: string;
  number: number;
  title: string;
  description: string;
  movs: string[];
}

export interface EvaluationArea {
  id: string; // A-H
  code: string;
  title: string;
  shortTitle: string;
  weight: number; // 0.20 etc
  indicators: Indicator[];
}

export interface RatingScaleItem {
  value: 1 | 2 | 3 | 4;
  label: string;
  shortLabel: string;
  description: string;
}
