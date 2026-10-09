import type { Evaluation, RatingValue, MovStatus } from "../src/types/evaluation";

export interface Env {
  DB: D1Database;
  /** Optional shared secret. When set, every /api call needs `Authorization: Bearer <token>`. */
  API_TOKEN?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function authorized(req: Request, env: Env): boolean {
  if (!env.API_TOKEN) return true;
  const h = req.headers.get("Authorization") ?? "";
  return h === `Bearer ${env.API_TOKEN}`;
}

async function getEvaluation(env: Env, id: string): Promise<Evaluation | null> {
  const meta = await env.DB.prepare("SELECT * FROM evaluations WHERE id = ?").bind(id).first();
  if (!meta) return null;
  const [school, evaluators, ratings, docs, findings] = await Promise.all([
    env.DB.prepare("SELECT * FROM schools WHERE evaluation_id = ?").bind(id).first(),
    env.DB.prepare("SELECT * FROM evaluators WHERE evaluation_id = ? ORDER BY sort_order").bind(id).all(),
    env.DB.prepare("SELECT * FROM ratings WHERE evaluation_id = ?").bind(id).all(),
    env.DB.prepare("SELECT * FROM doc_requirements WHERE evaluation_id = ?").bind(id).all(),
    env.DB.prepare("SELECT * FROM findings WHERE evaluation_id = ?").bind(id).all(),
  ]);
  const s = (school ?? {}) as Record<string, string | null>;
  return {
    id: id,
    school: {
      name: s.name ?? "",
      schoolId: s.school_id ?? "",
      shsCurriculum: s.shs_curriculum ?? "",
      address: s.address ?? "",
      division: s.division ?? "",
      region: s.region ?? "",
      administratorName: s.administrator_name ?? "",
      contactNumber: s.contact_number ?? "",
      officialEmail: s.official_email ?? "",
      schoolYear: s.school_year ?? "",
      recognitionAppliedFor: s.recognition_applied_for ?? "",
      ocularInspectionDate: s.ocular_inspection_date ?? undefined,
      submissionDateSDO: s.submission_date_sdo ?? undefined,
      submissionDateRO: s.submission_date_ro ?? undefined,
    },
    evaluators: ((evaluators.results ?? []) as Record<string, string | number>[]).map((e, i) => ({
      id: String(e.id),
      name: String(e.name ?? ""),
      role: String(e.role ?? ""),
      order: Number(e.sort_order ?? i + 1),
    })),
    documentaryRequirements: ((docs.results ?? []) as Record<string, string | null>[]).map((d) => ({
      id: String(d.doc_id),
      title: String(d.doc_id),
      status: ((d.status as MovStatus | null) ?? "not-checked") as MovStatus,
      remarks: (d.remarks as string | undefined) ?? undefined,
    })),
    ratings: Object.fromEntries(
      ((ratings.results ?? []) as Record<string, string | number | null>[]).map((r) => [
        String(r.indicator_id),
        {
          indicatorId: String(r.indicator_id),
          rating: (r.rating == null ? null : Number(r.rating)) as RatingValue | null,
          remarks: String(r.remarks ?? ""),
          movStatus: ((r.mov_status as MovStatus | null) ?? "not-checked") as MovStatus,
          movChecked: JSON.parse(String(r.mov_checked ?? "{}")) as Record<string, boolean>,
          updatedAt: String(r.updated_at),
        },
      ])
    ),
    findings: ((findings.results ?? []) as Record<string, string | null>[]).map((f) => ({
      id: String(f.id),
      areaId: String(f.area_id ?? ""),
      indicatorId: (f.indicator_id as string | undefined) ?? undefined,
      finding: String(f.finding ?? ""),
      recommendation: String(f.recommendation ?? ""),
    })),
    status: ((meta.status as Evaluation["status"] | null) ?? "draft") as Evaluation["status"],
    createdAt: String(meta.created_at),
    updatedAt: String(meta.updated_at),
  };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (!url.pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    if (!authorized(req, env)) return json({ error: "unauthorized" }, 401);

    // GET /api/health
    if (req.method === "GET" && url.pathname === "/api/health") {
      return json({ ok: true, time: new Date().toISOString() });
    }

    // GET /api/evaluations — meta list with school names
    if (req.method === "GET" && url.pathname === "/api/evaluations") {
      const { results } = await env.DB.prepare(
        `SELECT e.id, e.status, e.created_at, e.updated_at,
                s.name AS school_name, s.school_id, s.school_year, s.division,
                (SELECT COUNT(*) FROM ratings r WHERE r.evaluation_id = e.id AND r.rating IS NOT NULL) AS rated_count,
                (SELECT COUNT(*) FROM findings f WHERE f.evaluation_id = e.id) AS finding_count
         FROM evaluations e LEFT JOIN schools s ON s.evaluation_id = e.id
         ORDER BY e.updated_at DESC`
      ).all();
      return json({ evaluations: results });
    }

    const m = url.pathname.match(/^\/api\/evaluations\/([^/]+)$/);
    if (m) {
      const id = decodeURIComponent(m[1]);

      if (req.method === "GET") {
        const doc = await getEvaluation(env, id);
        if (!doc) return json({ error: "not found" }, 404);
        return json({ evaluation: doc });
      }

      if (req.method === "DELETE") {
        await env.DB.batch([
          env.DB.prepare("DELETE FROM findings WHERE evaluation_id = ?").bind(id),
          env.DB.prepare("DELETE FROM doc_requirements WHERE evaluation_id = ?").bind(id),
          env.DB.prepare("DELETE FROM ratings WHERE evaluation_id = ?").bind(id),
          env.DB.prepare("DELETE FROM evaluators WHERE evaluation_id = ?").bind(id),
          env.DB.prepare("DELETE FROM schools WHERE evaluation_id = ?").bind(id),
          env.DB.prepare("DELETE FROM evaluations WHERE id = ?").bind(id),
        ]);
        return json({ ok: true });
      }

      if (req.method === "PUT") {
        let body: Evaluation;
        try {
          body = (await req.json()) as Evaluation;
        } catch {
          return json({ error: "invalid JSON body" }, 400);
        }
        if (!body || body.id !== id || !body.school) {
          return json({ error: "body.id must match URL and include school profile" }, 400);
        }
        // Last-write-wins guard: reject stale pushes so offline edits never
        // silently overwrite newer server state.
        const existing = await env.DB.prepare("SELECT updated_at FROM evaluations WHERE id = ?").bind(id).first<{ updated_at: string }>();
        if (existing && existing.updated_at > (body.updatedAt ?? "")) {
          return json({ error: "stale", serverUpdatedAt: existing.updated_at }, 409);
        }
        const now = new Date().toISOString();
        const stmts: D1PreparedStatement[] = [
          env.DB.prepare(
            "INSERT INTO evaluations (id, status, created_at, updated_at) VALUES (?, ?, ?, ?) " +
            "ON CONFLICT(id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at"
          ).bind(body.id, body.status ?? "draft", body.createdAt ?? now, body.updatedAt ?? now),
          env.DB.prepare(
            "INSERT INTO schools (evaluation_id, name, school_id, shs_curriculum, address, division, region, administrator_name, contact_number, official_email, school_year, recognition_applied_for, ocular_inspection_date, submission_date_sdo, submission_date_ro) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
            "ON CONFLICT(evaluation_id) DO UPDATE SET name=excluded.name, school_id=excluded.school_id, shs_curriculum=excluded.shs_curriculum, address=excluded.address, division=excluded.division, region=excluded.region, administrator_name=excluded.administrator_name, contact_number=excluded.contact_number, official_email=excluded.official_email, school_year=excluded.school_year, recognition_applied_for=excluded.recognition_applied_for, ocular_inspection_date=excluded.ocular_inspection_date, submission_date_sdo=excluded.submission_date_sdo, submission_date_ro=excluded.submission_date_ro"
          ).bind(
            body.id, body.school.name ?? "", body.school.schoolId ?? "", body.school.shsCurriculum ?? "",
            body.school.address ?? "", body.school.division ?? "", body.school.region ?? "",
            body.school.administratorName ?? "", body.school.contactNumber ?? "", body.school.officialEmail ?? "",
            body.school.schoolYear ?? "", body.school.recognitionAppliedFor ?? "",
            body.school.ocularInspectionDate ?? null, body.school.submissionDateSDO ?? null, body.school.submissionDateRO ?? null
          ),
          env.DB.prepare("DELETE FROM evaluators WHERE evaluation_id = ?").bind(body.id),
          env.DB.prepare("DELETE FROM ratings WHERE evaluation_id = ?").bind(body.id),
          env.DB.prepare("DELETE FROM doc_requirements WHERE evaluation_id = ?").bind(body.id),
          env.DB.prepare("DELETE FROM findings WHERE evaluation_id = ?").bind(body.id),
        ];
        for (const e of body.evaluators ?? []) {
          stmts.push(env.DB.prepare("INSERT INTO evaluators (id, evaluation_id, name, role, sort_order) VALUES (?, ?, ?, ?, ?)").bind(e.id, body.id, e.name ?? "", e.role ?? "", e.order ?? 0));
        }
        for (const [indicatorId, r] of Object.entries(body.ratings ?? {})) {
          stmts.push(env.DB.prepare(
            "INSERT INTO ratings (evaluation_id, indicator_id, rating, remarks, mov_status, mov_checked, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
          ).bind(body.id, indicatorId, r.rating ?? null, r.remarks ?? "", r.movStatus ?? "not-checked", JSON.stringify(r.movChecked ?? {}), r.updatedAt ?? now));
        }
        for (const d of body.documentaryRequirements ?? []) {
          stmts.push(env.DB.prepare("INSERT INTO doc_requirements (evaluation_id, doc_id, status, remarks) VALUES (?, ?, ?, ?)").bind(body.id, d.id, d.status, d.remarks ?? null));
        }
        for (const f of body.findings ?? []) {
          stmts.push(env.DB.prepare("INSERT INTO findings (id, evaluation_id, area_id, indicator_id, finding, recommendation) VALUES (?, ?, ?, ?, ?, ?)").bind(f.id, body.id, f.areaId ?? "", f.indicatorId ?? null, f.finding ?? "", f.recommendation ?? ""));
        }
        await env.DB.batch(stmts);
        return json({ ok: true, updatedAt: body.updatedAt ?? now });
      }
    }

    return json({ error: "not found" }, 404);
  },
};
