import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import api from "../../utils/api";
import { ArrowLeft, FileText, Eye, Search, ChevronRight } from "lucide-react";

const STATUS_CFG = {
  "Approved":         { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", dot: "#15803d" },
  "Under Evaluation": { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe", dot: "#7c3aed" },
  "In Progress":      { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0", dot: "#059669" },
  "Submitted":        { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd", dot: "#0284c7" },
  "Draft":            { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb", dot: "#9ca3af" },
};

export default function Outputs() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    api.get("/projects")
      .then(r => setProjects(r.data || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.reference_no?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Outputs" />
        <div className="dashboard-content">

          {/* ── Page header ── */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <button onClick={() => navigate("/researcher/outputs")}
              style={{
                display: "flex", alignItems: "center", gap: 6, marginTop: 2,
                background: "#f3f4f6", border: "none", borderRadius: 8,
                padding: "6px 12px", cursor: "pointer", fontSize: 13,
                color: "#374151", fontWeight: 500, flexShrink: 0,
              }}>
              <ArrowLeft size={15} /> Back
            </button>
          </div>

          {/* ── Search + count ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, marginBottom: 20, alignItems: "stretch" }}>
            <div style={{
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
              display: "flex", alignItems: "center", gap: 10, padding: "0 16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <Search size={17} color="#9ca3af" strokeWidth={1.8} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search projects by title or reference number..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14,
                  color: "#111827", padding: "13px 0", background: "transparent" }} />
            </div>
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12,
              padding: "12px 22px", textAlign: "center", minWidth: 120,
            }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>{filtered.length}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Projects</p>
            </div>
          </div>

          {/* ── Project list ── */}
          <div style={{
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden",
          }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>
                Research Projects
              </h3>
            </div>

            {loading ? (
              <p style={{ padding: 24, color: "#9ca3af", fontSize: 14 }}>Loading…</p>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <FileText size={40} color="#d1d5db" style={{ margin: "0 auto 10px", display: "block" }} />
                <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
                  {search ? "No projects match your search." : "No projects found."}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {filtered.map((p, i) => {
                  const sc = STATUS_CFG[p.status] || STATUS_CFG["Draft"];
                  return (
                    <div key={p.id}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "16px 22px",
                        borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: "#f0fdf4",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <FileText size={20} color="#1f7a1f" strokeWidth={1.8} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.title}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{p.reference_no}</span>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot }} />
                            {p.status}
                          </span>
                        </div>
                      </div>

                      {/* View button */}
                      <button
                        onClick={() => navigate(`/researcher/outputs/${p.id}`)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "7px 16px", borderRadius: 8, border: "none",
                          background: "#1f7a1f", color: "#fff",
                          fontSize: 13, fontWeight: 600, cursor: "pointer",
                          flexShrink: 0,
                        }}>
                        <Eye size={14} /> View Output
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}