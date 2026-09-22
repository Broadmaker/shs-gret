import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEvaluation, saveEvaluation } from "../lib/storage";
import type { SchoolProfile as SP } from "../types/evaluation";

export function SchoolProfilePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const ev = id ? getEvaluation(id) : undefined;
  const [form, setForm] = useState<SP>(ev?.school ?? {
    name: "", schoolId: "", shsCurriculum: "", address: "", division: "", region: "",
    administratorName: "", contactNumber: "", officialEmail: "", schoolYear: "2026-2027",
    recognitionAppliedFor: "", ocularInspectionDate: "", submissionDateSDO: "", submissionDateRO: "",
  } as SP);

  if (!ev) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Evaluation not found.</p>;

  const save = () => {
    saveEvaluation({ ...ev, school: form });
    nav(`/evaluations/${id}`);
  };

  const update = (k: keyof SP, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const inputStyle: React.CSSProperties = {
    height: 34, padding: "0 10px", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", fontSize: 13, outline: "none", background: "var(--bg-surface)", width: "100%",
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="page-header">
        <div className="page-pretitle">Part I • Application Information</div>
        <h1 className="page-title">School Profile</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Per Annex I profile fields — drives header, reports, and print.</p>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Application Information</div>
            <div className="card-subtitle">All fields saved locally, offline-ready</div>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>School Name</span>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g., ABC Private School" style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>School ID</span>
              <input value={form.schoolId} onChange={(e) => update("schoolId", e.target.value)} placeholder="e.g., 123456" style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>Address</span>
              <input value={form.address} onChange={(e) => update("address", e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>Division</span>
              <input value={form.division} onChange={(e) => update("division", e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>Region</span>
              <input value={form.region} onChange={(e) => update("region", e.target.value)} placeholder="e.g., Region IV-A" style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>School Year</span>
              <input value={form.schoolYear} onChange={(e) => update("schoolYear", e.target.value)} placeholder="2026-2027" style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>SHS Curriculum / Tracks</span>
              <input value={form.shsCurriculum} onChange={(e) => update("shsCurriculum", e.target.value)} placeholder="e.g., ABM, STEM" style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>Recognition Applied For</span>
              <input value={form.recognitionAppliedFor} onChange={(e) => update("recognitionAppliedFor", e.target.value)} placeholder="e.g., SHS Program" style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>Administrator Name</span>
              <input value={form.administratorName} onChange={(e) => update("administratorName", e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>Contact Number</span>
              <input value={form.contactNumber} onChange={(e) => update("contactNumber", e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>Official Email</span>
              <input value={form.officialEmail} onChange={(e) => update("officialEmail", e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>Ocular Inspection Date</span>
              <input value={form.ocularInspectionDate ?? ""} onChange={(e) => update("ocularInspectionDate", e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={save} className="btn btn-primary">Save & Continue</button>
            <button onClick={() => nav(`/evaluations/${id}`)} className="btn btn-outline">Cancel</button>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>Saved locally only — Next: Documents & Team → Areas A–H.</p>
        </div>
      </div>
    </div>
  );
}
