import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useEvaluation } from "../hooks/useEvaluation";
import { calculateOverall } from "../lib/calculations";

const CONTACT_INFO = [
  { icon: "pin", text: "Pangi, Ipil, Zamboanga Sibugay, 7001" },
  { icon: "phone", text: "0968-520-9123" },
  { icon: "mail", text: "zamboanga.sibugay@deped.gov.ph" },
  { icon: "globe", text: "depedzamboangasibugay.ph" },
  { icon: "facebook", text: "DepEd Tayo Zamboanga Sibugay Division" },
];

// TODO: replace placeholder names/titles with the actual signatories.
const PLACEHOLDER_EVALUATORS = [
  { name: "JUAN D. DELA CRUZ", title: "MEIT Member" },
  { name: "MARIA C. SANTOS", title: "MEIT Member" },
  { name: "CARLOS M. REYES", title: "MEIT Member" },
  { name: "LISA F. AQUINO", title: "MEIT Member" },
];
const PLACEHOLDER_RECOMMENDING = "JOSE P. RAMOS";
const PLACEHOLDER_APPROVED = "ANA L. REYES";

function ContactIcon({ name, className = "w-2 h-2" }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    pin: <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" />,
    phone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z" />
    ),
    mail: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    ),
    facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  };
  const isFill = name === "facebook";
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={isFill ? "currentColor" : "none"}
      stroke={isFill ? "none" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function PrintHeader() {
  return (
    <header className="print-header text-center mb-5 print:mb-2">
      <img
        src="/DepEd-Seal-New-ish-1-copy-720px.png"
        alt="DepEd Seal"
        className="w-16 h-16 print:w-[22mm] print:h-[22mm] object-contain mx-auto mb-2.5 print:mb-[1mm]"
      />
      <p style={{ fontFamily: "'OldEnglish', serif" }} className="text-[20px] print:text-[20px] print:leading-[1.05] leading-tight">
        Republic of the Philippines
      </p>
      <p style={{ fontFamily: "'OldEnglish', serif" }} className="text-[26px] print:text-[26px] print:leading-[1.05] leading-tight">
        Department of Education
      </p>
      <p className="text-[10px] print:text-[11px] text-neutral-600 tracking-[0.15em] uppercase mt-0.5 print:mt-[1mm]">
        Region IX — Zamboanga Peninsula
      </p>
      <p style={{ fontFamily: "'Verdana', sans-serif" }} className="font-bold text-[11px] print:text-[12px] tracking-wide uppercase">
        Schools Division of Zamboanga Sibugay
      </p>
      <div className="border-t-2 border-neutral-900 mt-2.5 print:mt-[2mm]" />
      <h1
        style={{ fontFamily: "'Verdana', sans-serif" }}
        className="font-bold text-[13px] print:text-[15px] print:tracking-[0.08em] tracking-wide uppercase mt-2 print:mt-1"
      >
        SHS Government Recognition Evaluation
      </h1>
      <p className="text-[10px] print:text-[11px] print:font-semibold text-neutral-600 mt-0.5 print:mt-0.5">Annex I — Evaluation Tool Summary (Print)</p>
    </header>
  );
}

function PrintFooter() {
  return (
    <footer className="print-footer mt-auto pt-7 print:pt-[2mm] break-inside-avoid">
      <div className="border-t border-neutral-800 mb-3 print:mb-2" />
      <div className="flex items-center h-16 print:h-auto gap-5 print:gap-3">
        <div className="flex items-center gap-2.5 print:gap-1.5 shrink-0">
          <img src="/DepEd Logo-01.png" alt="DepEd Logo" className="h-16 print:h-[14mm] w-[5.25rem] print:w-auto object-contain" />
          <img src="/Bagong Pilipinas.png" alt="Bagong Pilipinas" className="h-16 print:h-[14mm] w-[4rem] print:w-auto object-contain" />
          <img src="/sdo_logo_colored.png" alt="SDO Logo" className="h-16 print:h-[14mm] w-[4rem] print:w-auto object-contain" />
        </div>
        <div className="text-[9px] print:text-[9px] leading-[1.15] text-neutral-700 space-y-[1px] print:space-y-0">
          {CONTACT_INFO.map((c) => (
            <p key={c.text} className="flex items-center gap-1.5">
              <span className="w-3 h-3 print:w-[4mm] print:h-[4mm] bg-neutral-800 text-white rounded-[3px] flex items-center justify-center shrink-0">
                <ContactIcon name={c.icon} className="w-2 h-2 print:w-[3mm] print:h-[3mm]" />
              </span>
              {c.text}
            </p>
          ))}
        </div>
      </div>
    </footer>
  );
}

// Shared signature format (same as the training management PDFs): gray label,
// bold uppercase name with signing space above it, gray title below the name.
function SigBlock({
  label,
  name,
  title,
  align = "left",
}: {
  label: string;
  name: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <p className="text-[11px] print:text-[9px] text-neutral-500">{label}</p>
      <p
        style={{ fontFamily: "'Verdana', sans-serif" }}
        className="font-bold uppercase text-[12px] print:text-[11px] text-neutral-900 mt-5 print:mt-4"
      >
        {name}
      </p>
      <p style={{ fontFamily: "'Verdana', sans-serif" }} className="text-[10px] print:text-[9px] text-neutral-500 mt-1 print:mt-1">
        {title}
      </p>
    </div>
  );
}

export function PrintPage() {
  const { id } = useParams();
  const { evaluation } = useEvaluation(id);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Shrink-to-fit: measure the body content right before printing and zoom it
  // down only enough to fit a single A4 page (297mm − 2×8mm margins, minus the
  // footer which is never zoomed). Covers both the Print button and Ctrl+P via
  // beforeprint; zoom is reset after printing so the on-screen preview is
  // unaffected. The footer stays full-size, pinned at the sheet bottom.
  useEffect(() => {
    const PAGE_CONTENT_PX = ((297 - 20) * 96) / 25.4 - 2; // 2px safety slack
    const fitToPage = () => {
      const sheet = sheetRef.current;
      const content = contentRef.current;
      if (!sheet || !content) return;
      content.style.zoom = "";
      const footer = sheet.querySelector<HTMLElement>(".print-footer");
      const avail = PAGE_CONTENT_PX - (footer ? footer.offsetHeight : 0);
      const h = content.scrollHeight;
      if (h > avail) content.style.zoom = String(avail / h);
    };
    const resetZoom = () => {
      if (contentRef.current) contentRef.current.style.zoom = "";
    };
    window.addEventListener("beforeprint", fitToPage);
    window.addEventListener("afterprint", resetZoom);
    return () => {
      window.removeEventListener("beforeprint", fitToPage);
      window.removeEventListener("afterprint", resetZoom);
    };
  }, []);

  if (!evaluation) return <p className="p-6 text-sm">Loading…</p>;
  const overall = calculateOverall(evaluation);
  return (
    <div className="mx-auto max-w-[800px] bg-white p-6 print:m-0 print:w-full print:max-w-none print:p-0">
      <div ref={sheetRef} className="print-sheet font-serif text-neutral-900 px-8 sm:px-12 py-8 sm:py-10 print:px-1 print:py-0 flex flex-col min-h-full">
        <div ref={contentRef}>
        <PrintHeader />

        <section className="mt-4 print:mt-1.5 grid grid-cols-2 gap-3 print:gap-x-4 print:gap-y-1 text-sm print:text-[11px] font-sans">
          <div><span className="font-semibold">School:</span> {evaluation.school.name || "—"}</div>
          <div><span className="font-semibold">School ID:</span> {evaluation.school.schoolId || "—"}</div>
          <div><span className="font-semibold">Address:</span> {evaluation.school.address || "—"}</div>
          <div><span className="font-semibold">Division/Region:</span> {evaluation.school.division} / {evaluation.school.region}</div>
          <div><span className="font-semibold">SY:</span> {evaluation.school.schoolYear}</div>
          <div><span className="font-semibold">Date:</span> {evaluation.school.ocularInspectionDate || "—"}</div>
        </section>

        <div className="mt-4 print:mt-1.5 rounded-lg print:rounded border-2 border-zinc-900 p-4 print:p-1.5 text-center font-sans">
          <p className="text-xs print:text-[8px] tracking-widest">OVERALL COMPLIANCE</p>
          <p className="text-3xl print:text-[22px] print:leading-tight font-bold">{overall.overallScore!=null ? overall.overallScore.toFixed(2) : "INCOMPLETE"}</p>
          <p className="text-sm print:text-[11px] font-semibold">{overall.complianceStatus ?? "INCOMPLETE — finish all indicators"}</p>
        </div>

        <table className="mt-4 print:mt-1.5 w-full text-sm print:text-[10.5px] border border-zinc-300 font-sans">
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

        <section className="mt-6 print:mt-2 font-sans">
          <h2 className="text-sm print:text-[12px] font-bold border-b border-zinc-900 pb-1 print:pb-0.5">Significant Findings & Recommendations</h2>
          {evaluation.findings.length===0 ? <p className="text-sm print:text-[11px] text-zinc-600 mt-2 print:mt-1">None recorded.</p> : (
            <ul className="mt-2 print:mt-1 space-y-2 print:space-y-1 text-sm print:text-[11px]">
              {evaluation.findings.map((f)=> <li key={f.id} className="break-words" style={{ whiteSpace: "pre-wrap" }}><span className="font-semibold">Area {f.areaId}:</span> {f.finding} {f.recommendation && <><br/><span className="font-semibold">Recommendation:</span> {f.recommendation}</>}</li>)}
            </ul>
          )}
        </section>

        <section className="mt-4 print:mt-2 font-sans break-inside-avoid">
          <h2 className="text-sm print:text-[12px] font-bold border-b border-zinc-900 pb-1 print:pb-0.5">
            Evaluation Team (MEIT)
          </h2>
          <div className="grid grid-cols-2 gap-x-8 print:gap-x-6 gap-y-2 print:gap-y-3 mt-2 print:mt-1">
            {[0, 1, 2, 3].map((i) => {
              const ev = evaluation.evaluators[i];
              const ph = PLACEHOLDER_EVALUATORS[i];
              return (
                <SigBlock
                  key={i}
                  label={`Evaluator ${i + 1}`}
                  name={ev?.name || ph.name}
                  title={ev?.role || ph.title}
                />
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-x-8 print:gap-x-6 mt-4 print:mt-3">
            <SigBlock label="Recommending Approval" name={PLACEHOLDER_RECOMMENDING} title="RO QAD Chief" />
            <SigBlock label="Approved" name={PLACEHOLDER_APPROVED} title="Regional Director" />
          </div>
        </section>
        </div>

        <PrintFooter />
      </div>

      <div className="no-print mt-6 flex gap-2">
        <button onClick={() => window.print()} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">Print / Save PDF</button>
        <button onClick={() => window.history.back()} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm">Back</button>
      </div>
    </div>
  );
}
