import { useParams } from "react-router-dom";
import { useEvaluation } from "../hooks/useEvaluation";
import { calculateOverall } from "../lib/calculations";

export function PrintPage() {
  const { id } = useParams();
  const { evaluation } = useEvaluation(id);
  if (!evaluation) return <p className="p-6 text-sm">Loading…</p>;
  const overall = calculateOverall(evaluation);
  return (
    <div className="mx-auto max-w-[800px] bg-white p-6 print:p-0">
      <div className="text-center border-b-2 border-zinc-900 pb-4">
        <p className="text-xs tracking-widest">DEPARTMENT OF EDUCATION</p>
        <h1 className="text-lg font-bold">SHS GOVERNMENT RECOGNITION EVALUATION</h1>
        <p className="text-xs text-zinc-600">Annex I — Evaluation Tool Summary (Print)</p>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><span className="font-semibold">School:</span> {evaluation.school.name || "—"}</div>
        <div><span className="font-semibold">School ID:</span> {evaluation.school.schoolId || "—"}</div>
        <div><span className="font-semibold">Address:</span> {evaluation.school.address || "—"}</div>
        <div><span className="font-semibold">Division/Region:</span> {evaluation.school.division} / {evaluation.school.region}</div>
        <div><span className="font-semibold">SY:</span> {evaluation.school.schoolYear}</div>
        <div><span className="font-semibold">Date:</span> {evaluation.school.ocularInspectionDate || "—"}</div>
      </section>

      <div className="mt-4 rounded-lg border-2 border-zinc-900 p-4 text-center">
        <p className="text-xs tracking-widest">OVERALL COMPLIANCE</p>
        <p className="text-3xl font-bold">{overall.overallScore!=null ? overall.overallScore.toFixed(2) : "INCOMPLETE"}</p>
        <p className="text-sm font-semibold">{overall.complianceStatus ?? "INCOMPLETE — finish all indicators"}</p>
      </div>

      <table className="mt-4 w-full text-sm border border-zinc-300">
        <thead className="bg-zinc-100">
          <tr><th className="border px-2 py-1 text-left">Area</th><th className="border px-2 py-1 text-right">Average</th><th className="border px-2 py-1 text-right">Weight</th><th className="border px-2 py-1 text-right">Partial</th></tr>
        </thead>
        <tbody>
          {overall.areas.map((a)=> (
            <tr key={a.areaId}><td className="border px-2 py-1">{a.areaId}. {a.title}</td><td className="border px-2 py-1 text-right">{a.average!=null? a.average.toFixed(2):"—"}</td><td className="border px-2 py-1 text-right">{(a.weight*100).toFixed(0)}%</td><td className="border px-2 py-1 text-right">{a.partialProduct!=null? a.partialProduct.toFixed(3):"—"}</td></tr>
          ))}
          <tr className="font-bold bg-zinc-50"><td className="border px-2 py-1">Overall</td><td className="border px-2 py-1"></td><td className="border px-2 py-1 text-right">100%</td><td className="border px-2 py-1 text-right">{overall.overallScore!=null? overall.overallScore.toFixed(3):"—"}</td></tr>
        </tbody>
      </table>

      <section className="mt-6">
        <h2 className="text-sm font-bold border-b border-zinc-900 pb-1">Significant Findings & Recommendations</h2>
        {evaluation.findings.length===0 ? <p className="text-sm text-zinc-600 mt-2">None recorded.</p> : (
          <ul className="mt-2 space-y-2 text-sm">
            {evaluation.findings.map((f)=> <li key={f.id} className="border border-zinc-300 p-2"><span className="font-semibold">Area {f.areaId}:</span> {f.finding} {f.recommendation && <><br/><span className="font-semibold">Recommendation:</span> {f.recommendation}</>}</li>)}
          </ul>
        )}
      </section>

      <section className="mt-8 text-sm">
        <h2 className="text-sm font-bold border-b border-zinc-900 pb-1">Evaluation Team (MEIT)</h2>
        {evaluation.evaluators.length===0 ? <p className="text-zinc-600 mt-2">No evaluators recorded.</p> : (
          <div className="mt-3 grid grid-cols-2 gap-6">
            {evaluation.evaluators.map((ev)=> (
              <div key={ev.id} className="border-t border-zinc-900 pt-1 mt-6">
                <p className="font-medium">{ev.name || "—"}</p>
                <p className="text-xs text-zinc-600">{ev.role || "Evaluator"} • #{ev.order}</p>
                <p className="text-xs text-zinc-500">Signature</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div><p className="font-semibold">Recommending Approval — RO QAD Chief</p><div className="mt-6 border-t border-zinc-900 pt-1"></div></div>
          <div><p className="font-semibold">Approved — Regional Director</p><div className="mt-6 border-t border-zinc-900 pt-1"></div></div>
        </div>
      </section>

      <div className="no-print mt-6 flex gap-2">
        <button onClick={() => window.print()} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">Print / Save PDF</button>
        <button onClick={() => window.history.back()} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm">Back</button>
      </div>
    </div>
  );
}
