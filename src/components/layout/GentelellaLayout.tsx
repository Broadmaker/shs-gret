import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  School,
  FileCheck,
  Layers,
  ClipboardCheck,
  BarChart3,
  Printer,
  Menu,
  Search,
  GraduationCap,
  ChevronRight,
  LogOut,
  User,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { getAuthUser, logout } from "../../lib/auth";
import { loadEvaluations } from "../../lib/storage";
import { getEvaluation } from "../../lib/storage";
import { ConfirmModal } from "../ui/ConfirmModal";

function useSidebarState() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 768px)");
    const handler = () => { if (!m.matches) setOpen(false); };
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, []);
  useEffect(() => {
    document.body.classList.toggle("sidebar-open", open);
    return () => document.body.classList.remove("sidebar-open");
  }, [open]);
  return { open, setOpen } as const;
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    try { return document.documentElement.dataset.theme === "dark" || localStorage.getItem("shs-theme") === "dark"; }
    catch { return false; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "";
    try { localStorage.setItem("shs-theme", dark ? "dark" : "light"); } catch { /* ignore */ }
  }, [dark]);
  return { dark, toggle: () => setDark((v) => !v) };
}

export function GentelellaLayout({ children, evaluationId }: { children: React.ReactNode; evaluationId?: string }) {
  const { open, setOpen } = useSidebarState();
  const { dark, toggle } = useTheme();
  // Desktop icon-rail collapse (persisted). The burger toggles this on desktop
  // and the overlay drawer on mobile.
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("shs-sidebar-collapsed") === "1"; }
    catch { return false; }
  });
  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    try { localStorage.setItem("shs-sidebar-collapsed", collapsed ? "1" : "0"); } catch { /* ignore */ }
  }, [collapsed]);
  const onBurger = () => {
    if (window.matchMedia("(max-width: 768px)").matches) setOpen((v) => !v);
    else setCollapsed((v) => !v);
  };
  const loc = useLocation();
  const nav = useNavigate();
  const params = useParams();
  const activeId = evaluationId ?? params.id;
  const authUser = getAuthUser();

  const schoolName = useMemo(() => {
    if (!activeId) return null;
    try { return getEvaluation(activeId)?.school?.name || null; }
    catch { return null; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, loc.key]);

  const isActive = (path: string) => loc.pathname === path || loc.pathname.startsWith(path + "/");

  // Determine which tree should be open (Areas)
  const [areasOpen, setAreasOpen] = useState(() => loc.pathname.includes("/area/"));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (loc.pathname.includes("/area/")) setAreasOpen(true); }, [loc.pathname]);
  // Close the mobile drawer on navigation so it never traps the page.
  useEffect(() => { setOpen(false); }, [loc.pathname, setOpen]);

  // ⌘K focuses search; Esc closes menus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") { setSearchFocus(false); setUserMenuOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return loadEvaluations()
      .filter((e) =>
        (e.school.name || "").toLowerCase().includes(q) ||
        (e.school.schoolId || "").toLowerCase().includes(q) ||
        (e.school.division || "").toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query]);

  const areaItems = ["A","B","C","D","E","F","G","H"] as const;

  // Breadcrumb from path — school name instead of raw id
  const breadcrumb = (() => {
    const label = schoolName || "Evaluation";
    if (loc.pathname === "/") return ["Home", "Evaluations"];
    if (loc.pathname === "/evaluations/new") return ["Home","Evaluations","New"];
    if (activeId && loc.pathname.includes("/profile")) return ["Home","Evaluations", label, "School Profile"];
    if (activeId && loc.pathname.includes("/documents")) return ["Home","Evaluations", label, "Documents & Team"];
    if (activeId && loc.pathname.includes("/area/")) {
      const area = loc.pathname.split("/").pop()?.toUpperCase();
      return ["Home","Evaluations", label, "Area " + area];
    }
    if (activeId && loc.pathname.includes("/review")) return ["Home","Evaluations", label, "Review"];
    if (activeId && loc.pathname.includes("/summary")) return ["Home","Evaluations", label, "Summary"];
    if (activeId && loc.pathname.includes("/print")) return ["Home","Evaluations", label, "Report"];
    if (activeId) return ["Home","Evaluations", label, "Dashboard"];
    return ["Home"];
  })();

  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Primary navigation">
        <div className="sidebar-brand">
          <div className="brand-icon" aria-hidden="true">S</div>
          <div className="brand-name">SHS<small>Eval</small></div>
          <button type="button" className="sidebar-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* General */}
          <div className="nav-group">
            <div className="nav-label">General</div>
            <Link to="/" className={`nav-link ${loc.pathname === "/" ? "active" : ""}`} onClick={() => setOpen(false)}>
              <LayoutDashboard className="icon" /> <span className="nav-text">Evaluations</span>
            </Link>
          </div>

          {/* Current Evaluation */}
          {activeId ? (
            <>
              <div className="nav-group">
                <div className="nav-label">Evaluation</div>
                <Link to={`/evaluations/${activeId}`} className={`nav-link ${loc.pathname === `/evaluations/${activeId}` ? "active" : ""}`} onClick={() => setOpen(false)}>
                  <Layers className="icon" /> <span className="nav-text">Dashboard</span>
                </Link>
                <Link to={`/evaluations/${activeId}/profile`} className={`nav-link ${isActive(`/evaluations/${activeId}/profile`) ? "active" : ""}`} onClick={() => setOpen(false)}>
                  <School className="icon" /> <span className="nav-text">School Profile</span>
                </Link>
                <Link to={`/evaluations/${activeId}/documents`} className={`nav-link ${isActive(`/evaluations/${activeId}/documents`) ? "active" : ""}`} onClick={() => setOpen(false)}>
                  <FileCheck className="icon" /> <span className="nav-text">Documents & Team</span>
                </Link>

                {/* Areas tree */}
                <div className={`nav-tree ${areasOpen ? "open has-active" : ""} ${loc.pathname.includes("/area/") ? "has-active" : ""}`}>
                  <button type="button" className="nav-link nav-toggle" onClick={() => setAreasOpen((v) => !v)} aria-expanded={areasOpen}>
                    <GraduationCap className="icon" />
                    <span className="nav-text">Areas A–H</span>
                    <ChevronRight className="nav-chev" style={{ width: 12, height: 12 }} />
                  </button>
                  <div className="nav-sub">
                    <div className="nav-sub-inner">
                      {areaItems.map((a) => (
                        <Link key={a} to={`/evaluations/${activeId}/area/${a}`} className={`nav-sublink ${loc.pathname === `/evaluations/${activeId}/area/${a}` ? "active" : ""}`} onClick={() => setOpen(false)}>
                          Area {a}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="nav-group">
                <div className="nav-label">Results</div>
                <Link to={`/evaluations/${activeId}/review`} className={`nav-link ${isActive(`/evaluations/${activeId}/review`) ? "active" : ""}`} onClick={() => setOpen(false)}>
                  <ClipboardCheck className="icon" /> <span className="nav-text">Review</span>
                </Link>
                <Link to={`/evaluations/${activeId}/summary`} className={`nav-link ${isActive(`/evaluations/${activeId}/summary`) ? "active" : ""}`} onClick={() => setOpen(false)}>
                  <BarChart3 className="icon" /> <span className="nav-text">Summary & Findings</span>
                </Link>
                <Link to={`/evaluations/${activeId}/print`} className={`nav-link ${isActive(`/evaluations/${activeId}/print`) ? "active" : ""}`} onClick={() => setOpen(false)}>
                  <Printer className="icon" /> <span className="nav-text">Report</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="nav-group">
              <div className="nav-label">Get Started</div>
              <Link to="/evaluations/new" className={`nav-link ${isActive("/evaluations/new") ? "active" : ""}`} onClick={() => setOpen(false)}>
                <School className="icon" /> <span className="nav-text">New Evaluation</span>
              </Link>
            </div>
          )}

          {!authUser && (
            <div className="nav-group">
              <div className="nav-label">Account</div>
              <Link to="/login" className={`nav-link ${isActive("/login") ? "active" : ""}`} onClick={() => setOpen(false)}>
                <User className="icon" /> <span className="nav-text">Sign in</span>
              </Link>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          {!authUser ? (
            <Link to="/login" className="sidebar-user" style={{ textDecoration: "none" }}>
              <div className="avatar"><User size={14} /></div>
              <div className="sidebar-user-info">
                <div className="name">Guest</div>
                <div className="role">Sign in to continue</div>
              </div>
            </Link>
          ) : (
            <div className="sidebar-user" onClick={() => setShowLogoutConfirm(true)} style={{ cursor: "pointer" }} title="Click to sign out" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setShowLogoutConfirm(true); }}>
              <div className="avatar">{authUser.name.slice(0,2).toUpperCase()}<span className="online"></span></div>
              <div className="sidebar-user-info">
                <div className="name">{authUser.name}</div>
                <div className="role">{authUser.email}</div>
              </div>
              <LogOut size={14} style={{ color: "var(--sidebar-text)" }} />
            </div>
          )}
        </div>
      </aside>

      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <header className="topbar">
        <div className="topbar-left">
          <button className="sidebar-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={onBurger}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {breadcrumb.map((c, i) => (
              <span key={c + i} className="flex items-center gap-1" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                {i > 0 && <span className="sep">›</span>}
                <span className={i === breadcrumb.length - 1 ? "current" : ""} style={i === 2 ? { maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", verticalAlign: "bottom" } : undefined} title={c}>{c}</span>
              </span>
            ))}
          </nav>
        </div>

        <div className="search-box" style={{ position: "relative" }}>
          <Search className="s-icon" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search schools, IDs…"
            aria-label="Search evaluations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setTimeout(() => setSearchFocus(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchResults.length > 0) {
                nav(`/evaluations/${searchResults[0].id}`);
                setQuery(""); (e.target as HTMLInputElement).blur();
              }
            }}
          />
          {query ? (
            <button onClick={() => setQuery("")} aria-label="Clear search" style={{ position: "absolute", insetInlineEnd: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <X size={13} />
            </button>
          ) : <kbd>⌘K</kbd>}
          {searchFocus && query.trim() && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", boxShadow: "0 12px 32px rgba(15,23,42,0.14)", overflow: "hidden", zIndex: 200 }}>
              {searchResults.length === 0 ? (
                <p style={{ padding: "10px 12px", fontSize: 12.5, color: "var(--text-muted)" }}>No matches for “{query.trim()}”.</p>
              ) : searchResults.map((e) => (
                <button
                  key={e.id}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => { nav(`/evaluations/${e.id}`); setQuery(""); setSearchFocus(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", background: "none", border: "none", borderBottom: "1px solid var(--border-color-light)", cursor: "pointer" }}
                >
                  <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{e.school.name || "Untitled School"}</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>{e.school.schoolId || "No ID"} • {e.school.division || "—"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="topbar-right">
          <button className="tb-btn" title={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div ref={userMenuRef} style={{ position: "relative" }}>
            <button className="tb-avatar" onClick={() => setUserMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={userMenuOpen} title={authUser ? authUser.name : "Account"}>
              {authUser ? authUser.name.slice(0,1).toUpperCase() : "G"}
            </button>
            {userMenuOpen && (
              <div role="menu" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 230, background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", boxShadow: "0 12px 32px rgba(15,23,42,0.14)", overflow: "hidden", zIndex: 200 }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-color-light)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{authUser?.name ?? "Guest"}</p>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{authUser?.email ?? "Not signed in"} {authUser ? `• ${authUser.role}` : ""}</p>
                </div>
                {authUser ? (
                  <button onClick={() => { setUserMenuOpen(false); setShowLogoutConfirm(true); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: "var(--text-secondary)" }}>
                    <LogOut size={14} /> Sign out
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setUserMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", fontSize: 12.5, color: "var(--text-secondary)", textDecoration: "none" }}>
                    <User size={14} /> Sign in
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="main">
        <div className="page-wrapper">{children}</div>
        <footer className="footer">
          <span>SHS Evaluation Tool — Schools Division of Zamboanga Sibugay</span>
          <span>Annex I • 85 indicators • A–H weighted compliance</span>
        </footer>
      </div>
      <ConfirmModal
        open={showLogoutConfirm}
        title="Sign out?"
        message="You will be signed out and redirected to the login page. Your evaluations remain saved locally."
        confirmLabel="Sign out"
        variant="primary"
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => { logout(); location.href = "/login"; }}
      />
    </>
  );
}
