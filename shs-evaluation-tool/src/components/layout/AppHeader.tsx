import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Printer } from "lucide-react";

export function AppHeader() {
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-[1280px] px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg bg-[#1a4d8f] text-white grid place-items-center">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="leading-none">
            <span className="block text-sm font-semibold text-zinc-900">SHS Evaluation Tool</span>
            <span className="block text-[11px] tracking-wide text-zinc-500">Government Recognition • DepEd</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button onClick={() => nav("/evaluations/new")} className="rounded-lg bg-[#1a4d8f] px-3.5 py-1.5 text-sm font-medium text-white hover:bg-[#153d70]">New Evaluation</button>
        </div>
      </div>
    </header>
  );
}
