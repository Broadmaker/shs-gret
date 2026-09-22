import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
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
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { getAuthUser, logout } from "../../lib/auth";
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

export function GentelellaLayout({ children, evaluationId }: { children: React.ReactNode; evaluationId?: string }) {
  const { open, setOpen } = useSidebarState();
  const loc = useLocation();
  const params = useParams();
  const activeId = evaluationId ?? params.id;

  const isActive = (path: string) => loc.pathname === path || loc.pathname.startsWith(path + "/");

  // Determine which tree should be open (Areas)
  const [areasOpen, setAreasOpen] = useState(() => loc.pathname.includes("/area/"));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  useEffect(() => { if (loc.pathname.includes("/area/")) setAreasOpen(true); }, [loc.pathname]);

  const areaItems = ["A","B","C","D","E","F","G","H"] as const;

  // Breadcrumb from path
  const breadcrumb = (() => {
    if (loc.pathname === "/") return ["Home", "Evaluations"];
    if (loc.pathname === "/evaluations/new") return ["Home","Evaluations","New"];
    if (activeId && loc.pathname.includes("/profile")) return ["Home","Evaluations", activeId.slice(0,6), "School Profile"];
    if (activeId && loc.pathname.includes("/documents")) return ["Home","Evaluations", activeId.slice(0,6), "Documents & Team"];
    if (activeId && loc.pathname.includes("/area/")) {
      const area = loc.pathname.split("/").pop()?.toUpperCase();
      return ["Home","Evaluations", activeId.slice(0,6), "Area " + area];
    }
    if (activeId && loc.pathname.includes("/review")) return ["Home","Evaluations", activeId.slice(0,6), "Review"];
    if (activeId && loc.pathname.includes("/summary")) return ["Home","Evaluations", activeId.slice(0,6), "Summary"];
    if (activeId && loc.pathname.includes("/print")) return ["Home","Evaluations", activeId.slice(0,6), "Print"];
    if (activeId) return ["Home","Evaluations", activeId.slice(0,6), "Dashboard"];
    return ["Home"];
  })();

  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Primary navigation">
        <div className="sidebar-brand">
          <div className="brand-icon">S</div>
          <div className="brand-name">SHS<small>Eval</small></div>
        </div>

        <nav className="sidebar-nav">
          {/* General */}
          <div className="nav-group">
            <div className="nav-label">General</div>
            <Link to="/" className={`nav-link ${loc.pathname === "/" ? "active" : ""}`}>
              <LayoutDashboard className="icon" /> <span className="nav-text">Evaluations</span>
            </Link>
          </div>

          {/* Current Evaluation */}
          {activeId ? (
            <>
              <div className="nav-group">
                <div className="nav-label">Evaluation</div>
                <Link to={`/evaluations/${activeId}`} className={`nav-link ${loc.pathname === `/evaluations/${activeId}` ? "active" : ""}`}>
                  <Layers className="icon" /> <span className="nav-text">Dashboard</span>
                </Link>
                <Link to={`/evaluations/${activeId}/profile`} className={`nav-link ${isActive(`/evaluations/${activeId}/profile`) ? "active" : ""}`}>
                  <School className="icon" /> <span className="nav-text">School Profile</span>
                </Link>
                <Link to={`/evaluations/${activeId}/documents`} className={`nav-link ${isActive(`/evaluations/${activeId}/documents`) ? "active" : ""}`}>
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
                        <Link key={a} to={`/evaluations/${activeId}/area/${a}`} className={`nav-sublink ${loc.pathname === `/evaluations/${activeId}/area/${a}` ? "active" : ""}`}>
                          Area {a}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="nav-group">
                <div className="nav-label">Results</div>
                <Link to={`/evaluations/${activeId}/review`} className={`nav-link ${isActive(`/evaluations/${activeId}/review`) ? "active" : ""}`}>
                  <ClipboardCheck className="icon" /> <span className="nav-text">Review</span>
                </Link>
                <Link to={`/evaluations/${activeId}/summary`} className={`nav-link ${isActive(`/evaluations/${activeId}/summary`) ? "active" : ""}`}>
                  <BarChart3 className="icon" /> <span className="nav-text">Summary & Findings</span>
                </Link>
                <Link to={`/evaluations/${activeId}/print`} className={`nav-link ${isActive(`/evaluations/${activeId}/print`) ? "active" : ""}`}>
                  <Printer className="icon" /> <span className="nav-text">Print</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="nav-group">
              <div className="nav-label">Get Started</div>
              <Link to="/evaluations/new" className={`nav-link ${isActive("/evaluations/new") ? "active" : ""}`}>
                <School className="icon" /> <span className="nav-text">New Evaluation</span>
              </Link>
            </div>
          )}

          <div className="nav-group">
            <div className="nav-label">Account</div>
            <Link to="/login" className={`nav-link ${isActive("/login") ? "active" : ""}`}>
              <LogIn className="icon" /> <span className="nav-text">Sign in</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          {(() => {
            const u = getAuthUser();
            if (!u) return (
              <Link to="/login" className="sidebar-user" style={{ textDecoration: "none" }}>
                <div className="avatar"><User size={14} /></div>
                <div className="sidebar-user-info">
                  <div className="name">Guest</div>
                  <div className="role">Sign in</div>
                </div>
              </Link>
            );
            return (
              <div className="sidebar-user" onClick={() => setShowLogoutConfirm(true)} style={{ cursor: "pointer" }} title="Click to sign out">
                <div className="avatar">{u.name.slice(0,2).toUpperCase()}<span className="online"></span></div>
                <div className="sidebar-user-info">
                  <div className="name">{u.name}</div>
                  <div className="role">{u.email}</div>
                </div>
                <LogOut size={14} style={{ color: "var(--sidebar-text)" }} />
              </div>
            );
          })()}
        </div>
      </aside>

      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <header className="topbar">
        <div className="topbar-left">
          <button className="sidebar-toggle" type="button" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>
            <Menu size={18} />
          </button>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {breadcrumb.map((c, i) => (
              <span key={c + i} className="flex items-center gap-1">
                {i > 0 && <span className="sep">›</span>}
                <span className={i === breadcrumb.length - 1 ? "current" : ""}>{c}</span>
              </span>
            ))}
          </nav>
        </div>

        <div className="search-box">
          <Search className="s-icon" />
          <input type="text" placeholder="Search evaluations…" aria-label="Search" onFocus={(e) => (e.target as HTMLInputElement).blur()} />
          <kbd>⌘K</kbd>
        </div>

        <div className="topbar-right">
          <Link to="/login" className="tb-btn" title="Sign in" style={{ textDecoration: "none" }}><LogIn size={16} /></Link>
          <Link to="/login" className="tb-avatar" style={{ textDecoration: "none" }}>
            {(() => { const u = getAuthUser(); return u ? u.name.slice(0,1).toUpperCase() : "G"; })()}
          </Link>
        </div>
      </header>

      <div className="main">
        <div className="page-wrapper">{children}</div>
        <footer className="footer">
          <span>SHS Evaluation Tool — DepEd Government Recognition • Gentelella v4 • Teal #1ABB9C</span>
          <span>85 indicators • Weights A20 B10 C10 D15 E20 F10 G10 H5</span>
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
