import type { SchoolProfile } from "../types/evaluation";

export function validateSchoolProfile(s: SchoolProfile): string[] {
  const errs: string[] = [];
  if (!s.name.trim()) errs.push("School name is required");
  if (!s.schoolId.trim()) errs.push("School ID is required");
  if (!s.schoolYear.trim()) errs.push("School year is required");
  return errs;
}
