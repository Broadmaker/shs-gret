import { useCallback, useEffect, useState } from "react";
import type { Evaluation, RatingValue, MovStatus } from "../types/evaluation";
import { getEvaluation, saveEvaluation } from "../lib/storage";

export function useEvaluation(id: string | undefined) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    if (!id) { setEvaluation(null); return; }
    const ev = getEvaluation(id);
    setEvaluation(ev ?? null);
  }, [id]);

  const persist = useCallback((updater: (prev: Evaluation) => Evaluation) => {
    setEvaluation((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveEvaluation(next);
      return next;
    });
  }, []);

  const setRating = useCallback((indicatorId: string, rating: RatingValue) => {
    persist((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [indicatorId]: {
          indicatorId,
          rating,
          remarks: prev.ratings[indicatorId]?.remarks ?? "",
          movStatus: prev.ratings[indicatorId]?.movStatus ?? "not-checked",
          movChecked: prev.ratings[indicatorId]?.movChecked ?? {},
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  }, [persist]);

  const setRemarks = useCallback((indicatorId: string, remarks: string) => {
    persist((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [indicatorId]: {
          indicatorId,
          rating: prev.ratings[indicatorId]?.rating ?? null,
          remarks,
          movStatus: prev.ratings[indicatorId]?.movStatus ?? "not-checked",
          movChecked: prev.ratings[indicatorId]?.movChecked ?? {},
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  }, [persist]);

  const setMovStatus = useCallback((indicatorId: string, movStatus: MovStatus) => {
    persist((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [indicatorId]: {
          indicatorId,
          rating: prev.ratings[indicatorId]?.rating ?? null,
          remarks: prev.ratings[indicatorId]?.remarks ?? "",
          movStatus,
          movChecked: prev.ratings[indicatorId]?.movChecked ?? {},
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  }, [persist]);

  const toggleMovChecked = useCallback((indicatorId: string, movKey: string, total?: number) => {
    persist((prev) => {
      const cur = prev.ratings[indicatorId];
      const nextChecked = { ...(cur?.movChecked ?? {}) };
      nextChecked[movKey] = !nextChecked[movKey];
      if (!nextChecked[movKey]) delete nextChecked[movKey];
      const checkedCount = Object.values(nextChecked).filter(Boolean).length;
      let derived: MovStatus = "not-checked";
      if (total != null) {
        if (checkedCount === 0) derived = "not-checked";
        else if (checkedCount === total) derived = "available";
        else derived = "partially-available";
      } else {
        derived = checkedCount === 0 ? "not-checked" : "partially-available";
      }
      return {
        ...prev,
        ratings: {
          ...prev.ratings,
          [indicatorId]: {
            indicatorId,
            rating: cur?.rating ?? null,
            remarks: cur?.remarks ?? "",
            movStatus: derived,
            movChecked: nextChecked,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, [persist]);

  const setMovCheckedBulk = useCallback((indicatorId: string, movKeys: string[], checked: boolean) => {
    persist((prev) => {
      const cur = prev.ratings[indicatorId];
      const nextChecked = { ...(cur?.movChecked ?? {}) };
      for (const k of movKeys) {
        if (checked) nextChecked[k] = true;
        else delete nextChecked[k];
      }
      const checkedCount = Object.values(nextChecked).filter(Boolean).length;
      let derived: MovStatus = "not-checked";
      if (checkedCount === 0) derived = "not-checked";
      else if (checkedCount === movKeys.length) derived = "available";
      else derived = "partially-available";
      return {
        ...prev,
        ratings: {
          ...prev.ratings,
          [indicatorId]: {
            indicatorId,
            rating: cur?.rating ?? null,
            remarks: cur?.remarks ?? "",
            movStatus: derived,
            movChecked: nextChecked,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, [persist]);

  const setDocumentStatus = useCallback((docId: string, status: MovStatus, remarks?: string) => {
    persist((prev) => ({
      ...prev,
      documentaryRequirements: prev.documentaryRequirements.map((d) => d.id === docId ? { ...d, status, remarks: remarks ?? d.remarks } : d),
    }));
  }, [persist]);

  const addEvaluator = useCallback((name: string, role: string) => {
    persist((prev) => ({
      ...prev,
      evaluators: [...prev.evaluators, { id: `eval-${Date.now().toString(36)}`, name, role, order: prev.evaluators.length + 1 }],
    }));
  }, [persist]);

  const removeEvaluator = useCallback((evaluatorId: string) => {
    persist((prev) => ({
      ...prev,
      evaluators: prev.evaluators.filter((e) => e.id !== evaluatorId).map((e, i) => ({ ...e, order: i + 1 })),
    }));
  }, [persist]);

  const updateEvaluator = useCallback((evaluatorId: string, patch: Partial<{ name: string; role: string }>) => {
    persist((prev) => ({
      ...prev,
      evaluators: prev.evaluators.map((e) => e.id === evaluatorId ? { ...e, ...patch } : e),
    }));
  }, [persist]);

  return { evaluation, setEvaluation: persist, setRating, setRemarks, setMovStatus, toggleMovChecked, setMovCheckedBulk, setDocumentStatus, addEvaluator, removeEvaluator, updateEvaluator };
}
