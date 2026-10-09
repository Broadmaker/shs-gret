import type { Evaluation } from "../types/evaluation";
import { getEvaluation, loadEvaluations, saveEvaluation } from "./storage";

// Offline-first cloud sync (blueprint Phase 2).
// Local storage stays the source of truth on-device; these helpers push to
// and pull from the Worker + D1 API with a last-write-wins guard (409).

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const TOKEN = (import.meta.env.VITE_API_TOKEN as string | undefined) ?? "";

function headers(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

async function req(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, { ...init, headers: { ...headers(), ...(init?.headers ?? {}) } });
  if (res.status === 401) throw new Error("unauthorized — check VITE_API_TOKEN");
  return res;
}

export type PushResult = { status: "pushed" } | { status: "conflict"; serverUpdatedAt: string };

export async function pushEvaluation(ev: Evaluation): Promise<PushResult> {
  const res = await req(`/evaluations/${encodeURIComponent(ev.id)}`, {
    method: "PUT",
    body: JSON.stringify(ev),
  });
  if (res.status === 409) {
    const body = (await res.json()) as { serverUpdatedAt?: string };
    return { status: "conflict", serverUpdatedAt: body.serverUpdatedAt ?? "" };
  }
  if (!res.ok) throw new Error(`push failed: ${res.status}`);
  markSynced(ev.id);
  return { status: "pushed" };
}

export async function pullEvaluation(id: string): Promise<Evaluation> {
  const res = await req(`/evaluations/${encodeURIComponent(id)}`);
  if (res.status === 404) throw new Error("not found on server");
  if (!res.ok) throw new Error(`pull failed: ${res.status}`);
  const { evaluation } = (await res.json()) as { evaluation: Evaluation };
  // Server doesn't store doc titles — keep local titles, take remote status.
  const local = getEvaluation(id);
  if (local) {
    const byId = new Map(evaluation.documentaryRequirements.map((d) => [d.id, d]));
    evaluation.documentaryRequirements = local.documentaryRequirements.map((d) =>
      byId.has(d.id) ? { ...d, status: byId.get(d.id)!.status, remarks: byId.get(d.id)!.remarks } : d
    );
  }
  saveEvaluation(evaluation);
  markSynced(id);
  return evaluation;
}

export interface RemoteMeta {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  school_name: string | null;
  school_id: string | null;
  school_year: string | null;
  division: string | null;
  rated_count: number;
  finding_count: number;
}

export async function listRemote(): Promise<RemoteMeta[]> {
  const res = await req("/evaluations");
  if (!res.ok) throw new Error(`list failed: ${res.status}`);
  const { evaluations } = (await res.json()) as { evaluations: RemoteMeta[] };
  return evaluations;
}

export async function deleteRemote(id: string): Promise<void> {
  const res = await req(`/evaluations/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`delete failed: ${res.status}`);
  unmarkSynced(id);
}

export async function health(): Promise<boolean> {
  try {
    const res = await req("/health");
    return res.ok;
  } catch {
    return false;
  }
}

// --- Sync bookkeeping (local) ---

const SYNC_KEY = "shs-synced-at";

function readSyncMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SYNC_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function markSynced(id: string) {
  const m = readSyncMap();
  m[id] = new Date().toISOString();
  try { localStorage.setItem(SYNC_KEY, JSON.stringify(m)); } catch { /* ignore */ }
}

export function unmarkSynced(id: string) {
  const m = readSyncMap();
  delete m[id];
  try { localStorage.setItem(SYNC_KEY, JSON.stringify(m)); } catch { /* ignore */ }
}

export function lastSyncedAt(id: string): string | null {
  return readSyncMap()[id] ?? null;
}

/** Push every local evaluation; returns per-record outcomes. */
export async function pushAll(): Promise<{ id: string; result: PushResult | { status: "error"; message: string } }[]> {
  const out: { id: string; result: PushResult | { status: "error"; message: string } }[] = [];
  for (const ev of loadEvaluations()) {
    try {
      out.push({ id: ev.id, result: await pushEvaluation(ev) });
    } catch (e) {
      out.push({ id: ev.id, result: { status: "error", message: e instanceof Error ? e.message : String(e) } });
    }
  }
  return out;
}
