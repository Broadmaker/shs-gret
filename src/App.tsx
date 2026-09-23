import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { GentelellaLayout } from "./components/layout/GentelellaLayout";
import { Dashboard } from "./pages/Dashboard";
import { NewEvaluationPage } from "./pages/NewEvaluation";
import { SchoolProfilePage } from "./pages/SchoolProfile";
import { DocumentsPage } from "./pages/Documents";
import { EvaluationAreaPage } from "./pages/EvaluationArea";
import { ReviewPage } from "./pages/Review";
import { SummaryPage } from "./pages/Summary";
import { PrintPage } from "./pages/Print";
import { LoginPage } from "./pages/Login";
import { getEvaluation } from "./lib/storage";
import { isAuthenticated } from "./lib/auth";

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
    </BrowserRouter>
  );
}
