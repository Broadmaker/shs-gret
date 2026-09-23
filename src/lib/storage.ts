import type { Evaluation } from "../types/evaluation";
import { documentaryRequirements as docSeed } from "../data/documentaryRequirements";

const KEY = "shs-evaluations";
const ACTIVE_KEY = "shs-active-id";

export function loadEvaluations(): Evaluation[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Evaluation[]) : [];
  } catch { return []; }
}

export function saveEvaluations(list: Evaluation[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getEvaluation(id: string): Evaluation | undefined {
  return loadEvaluations().find((e) => e.id === id);
}

export function saveEvaluation(ev: Evaluation) {
  const list = loadEvaluations();
  const idx = list.findIndex((e) => e.id === ev.id);
  const updated = { ...ev, updatedAt: new Date().toISOString() };
  if (idx >= 0) list[idx] = updated;
  else list.push(updated);
  saveEvaluations(list);
  return updated;
}

export function deleteEvaluation(id: string) {
  saveEvaluations(loadEvaluations().filter((e) => e.id !== id));
}

export function getActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}
export function setActiveId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function createNewEvaluation(): Evaluation {
  const now = new Date().toISOString();
  const id = `ev-${Date.now().toString(36)}`;
  const ev: Evaluation = {
    id,
    school: {
      name: "",
      schoolId: "",
      shsCurriculum: "",
      address: "",
      division: "",
      region: "",
      administratorName: "",
      contactNumber: "",
      officialEmail: "",
      schoolYear: "2026-2027",
      recognitionAppliedFor: "",
      ocularInspectionDate: "",
    },
    evaluators: [],
    documentaryRequirements: docSeed.map((d) => ({ id: d.id, title: d.title, status: "not-checked" as const })),
    ratings: {},
    findings: [],
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  saveEvaluation(ev);
  setActiveId(id);
  return ev;
}
