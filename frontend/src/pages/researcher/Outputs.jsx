import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";

const projects = [
  { id: "PRJ-001", title: "Climate Change Impact on Coastal Ecosystems",       dept: "Environmental Science", status: "Approved" },
  { id: "PRJ-002", title: "AI-Driven Healthcare Diagnosis System",              dept: "Computer Science",      status: "Under Evaluation" },
  { id: "PRJ-003", title: "Sustainable Agriculture Practices in Arid Regions", dept: "Agriculture",           status: "In Progress" },
  { id: "PRJ-004", title: "Quantum Computing for Cryptography",                 dept: "Physics",               status: "Submitted" },
  { id: "PRJ-005", title: "Urban Planning and Smart City Infrastructure",       dept: "Civil Engineering",     status: "Draft" },
];

const STATUS_STYLES = {
  "Approved":         { bg: "#dcfce7", color: "#15803d" },
  "Under Evaluation": { bg: "#ede9fe", color: "#6d28d9" },
  "In Progress":      { bg: "#d1fae5", color: "#065f46" },
  "Submitted":        { bg: "#e0f2fe", color: "#0369a1" },
  "Draft":            { bg: "#f3f4f6", color: "#6b7280" },
};

export default function Outputs() {
  const navigate = useNavigate();
  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Outputs" />
        <div className="dashboard-content">
          <div style={{ marginBottom: 20 }}>
            <h2 className="page-title">Research Outputs</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Select a project to view and manage its research outputs
            </p>
          </div>
          <div className="cp-section">
            <div className="cp-section-title">Your Projects</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 16px" }}>
              Click on a project to view its outputs
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {projects.map((p, i) => {
                const s = STATUS_STYLES[p.status];
                return (
                  <div key={p.id} className="wp-project-row"
                    style={{ borderTop: i === 0 ? "1px solid #f3f4f6" : "none" }}
                    onClick={() => navigate(`/researcher/outputs/${p.id}`)}>
                    <div>
                      <p className="wp-project-title">{p.title}</p>
                      <p className="wp-project-sub">{p.id} • {p.dept}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="badge" style={{ background: s.bg, color: s.color }}>{p.status}</span>
                      <Package size={18} color="#9ca3af" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}