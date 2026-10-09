import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { GentelellaLayout } from "./components/layout/GentelellaLayout";
import { getEvaluation } from "./lib/storage";
import { isAuthenticated } from "./lib/auth";

// Route-level code splitting — each page loads on demand; the shell and
// Dashboard stay in the entry chunk for instant first paint.
const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const NewEvaluationPage = lazy(() => import("./pages/NewEvaluation").then((m) => ({ default: m.NewEvaluationPage })));
const SchoolProfilePage = lazy(() => import("./pages/SchoolProfile").then((m) => ({ default: m.SchoolProfilePage })));
const DocumentsPage = lazy(() => import("./pages/Documents").then((m) => ({ default: m.DocumentsPage })));
const EvaluationAreaPage = lazy(() => import("./pages/EvaluationArea").then((m) => ({ default: m.EvaluationAreaPage })));
const ReviewPage = lazy(() => import("./pages/Review").then((m) => ({ default: m.ReviewPage })));
const SummaryPage = lazy(() => import("./pages/Summary").then((m) => ({ default: m.SummaryPage })));
const PrintPage = lazy(() => import("./pages/Print").then((m) => ({ default: m.PrintPage })));
const LoginPage = lazy(() => import("./pages/Login").then((m) => ({ default: m.LoginPage })));

function PageFallback() {
  return (
    <div className="card" style={{ padding: "32px 20px", textAlign: "center" }}>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading…</p>
    </div>
  );
}

function EvaluationDashboardWrapper() {
  const { id } = useParams();
  const ev = id ? getEvaluation(id) : undefined;
  if (!ev) return <div className="p-6 text-sm" style={{ color: "var(--text-muted)" }}>Evaluation not found. <a href="/" style={{ color: "var(--primary)" }}>Back home</a></div>;
  return <Dashboard evaluation={ev} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  return <GentelellaLayout evaluationId={id}>{children}</GentelellaLayout>;
}

function Protected({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<GentelellaLayout><PageFallback /></GentelellaLayout>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Protected><GentelellaLayout><Dashboard /></GentelellaLayout></Protected>} />
          <Route path="/evaluations/new" element={<Protected><GentelellaLayout><NewEvaluationPage /></GentelellaLayout></Protected>} />
          <Route path="/evaluations/:id" element={<Protected><Shell><EvaluationDashboardWrapper /></Shell></Protected>} />
          <Route path="/evaluations/:id/profile" element={<Protected><Shell><SchoolProfilePage /></Shell></Protected>} />
          <Route path="/evaluations/:id/documents" element={<Protected><Shell><DocumentsPage /></Shell></Protected>} />
          <Route path="/evaluations/:id/area/:areaId" element={<Protected><Shell><EvaluationAreaPage /></Shell></Protected>} />
          <Route path="/evaluations/:id/review" element={<Protected><Shell><ReviewPage /></Shell></Protected>} />
          <Route path="/evaluations/:id/summary" element={<Protected><Shell><SummaryPage /></Shell></Protected>} />
          <Route path="/evaluations/:id/print" element={<Protected><PrintPage /></Protected>} />
          <Route path="*" element={<div className="p-10 text-center" style={{ fontSize: 13, color: "var(--text-muted)" }}>Not found — <a href="/" style={{ color: "var(--primary)" }}>Go home</a></div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
