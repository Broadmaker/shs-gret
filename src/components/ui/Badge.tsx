export function Badge({ children, tone = "zinc", className = "" }: { children: React.ReactNode; tone?: "green"|"blue"|"amber"|"red"|"zinc"; className?: string }) {
  const map: Record<string,string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    zinc: "bg-zinc-50 text-zinc-700 border-zinc-200",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[tone]} ${className}`}>{children}</span>;
}
