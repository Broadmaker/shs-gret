import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
}

export function Dropdown({
  value,
  options,
  onChange,
  label,
  width,
}: {
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
  label: string;
  width?: number | string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    // Focus the selected option (or first) for arrow-key navigation.
    const el = rootRef.current?.querySelector<HTMLElement>(".dd-opt.selected") ?? rootRef.current?.querySelector<HTMLElement>(".dd-opt");
    el?.focus();
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open ]);

  const closeToButton = () => { setOpen(false); btnRef.current?.focus(); };
  const choose = (v: string) => { onChange(v); setOpen(false); btnRef.current?.focus(); };

  const onOptionKey = (e: React.KeyboardEvent, v: string) => {
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(".dd-opt") ?? []);
    const i = items.indexOf(e.currentTarget as HTMLElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(items.length - 1, i + 1)]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); (items[Math.max(0, i - 1)] ?? btnRef.current)?.focus(); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(v); }
    else if (e.key === "Escape") { e.preventDefault(); closeToButton(); }
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={rootRef} className="dd" style={width != null ? { width } : undefined}>
      <button
        ref={btnRef}
        type="button"
        className={`dd-btn${open ? " open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && !open) { e.preventDefault(); setOpen(true); }
          else if (e.key === "Escape") setOpen(false);
        }}
      >
        <span className="dd-value">{selected?.label ?? "Select…"}</span>
        <ChevronDown size={14} className="dd-chev" />
      </button>
      {open && (
        <ul className="dd-pop" role="listbox" aria-label={label}>
          {options.map((o) => {
            const sel = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={sel}>
                <button
                  type="button"
                  className={`dd-opt${sel ? " selected" : ""}`}
                  onClick={() => choose(o.value)}
                  onKeyDown={(e) => onOptionKey(e, o.value)}
                >
                  <span style={{ flex: 1, textAlign: "left" }}>{o.label}</span>
                  {sel && <Check size={14} className="dd-check" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
