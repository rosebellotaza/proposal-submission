// src/pages/admin/ProjectManagement.jsx
import { useState, useEffect } from "react";
import AdminNavbar from "../../components/admin/navbar";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import {
  Search, FolderOpen, Eye, X, User, DollarSign,
  Calendar, BookOpen, Users, CheckCircle2,
} from "lucide-react";

/* ── mock data ───────────────────────────────────────────── */
const MOCK = [
  {
    id: 1, project_id: "PRJ-001",
    title: "AI-Driven Healthcare Diagnosis System",
    researcher: "Prof. Michael Chen", department: "Computer Science",
    budget: 320000, approved_date: "2026-03-15",
    status: "Approved", progress: 40,
    evaluators: ["Dr. Amanda Rodriguez", "Dr. Lisa Park"],
    description: "An AI-powered system for early diagnosis of critical diseases using machine learning algorithms and patient data analytics.",
  },
  {
    id: 2, project_id: "PRJ-003",
    title: "Sustainable Farming Techniques",
    researcher: "Dr. Emily Davis", department: "Agriculture",
    budget: 180000, approved_date: "2026-02-20",
    status: "Approved", progress: 65,
    evaluators: ["Dr. James Thompson"],
    description: "Research on eco-friendly farming methods to improve crop yield while reducing chemical usage and environmental impact.",
  },
  {
    id: 3, project_id: "PRJ-005",
    title: "Renewable Energy Storage Solutions",
    researcher: "Dr. Robert Williams", department: "Physics",
    budget: 560000, approved_date: "2026-01-10",
    status: "Approved", progress: 80,
    evaluators: ["Dr. David Kumar", "Dr. Amanda Rodriguez"],
    description: "Development of next-generation battery technologies for efficient storage of solar and wind energy.",
  },
  {
    id: 4, project_id: "PRJ-007",
    title: "Urban Heat Island Mitigation",
    researcher: "Prof. Sarah Johnson", department: "Environmental Science",
    budget: 240000, approved_date: "2026-04-01",
    status: "Approved", progress: 15,
    evaluators: ["Dr. Lisa Park"],
    description: "Investigating urban greening strategies to reduce the heat island effect in densely populated metropolitan areas.",
  },
];

/* ── Detail Modal ────────────────────────────────────────── */
function DetailModal({ project, onClose }) {
  return (
    <div style={MO.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={MO.modal}>
        <div style={MO.header}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{project.project_id}</p>
            <h2 style={MO.title}>{project.title}</h2>
          </div>
          <button style={MO.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div style={MO.body}>
          {/* Status badge */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", fontSize: 13, fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Approved
            </span>
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px", marginBottom: 20 }}>
            <InfoRow icon={<User size={14} />} label="Researcher" value={project.researcher} />
            <InfoRow icon={<BookOpen size={14} />} label="Department" value={project.department} />
            <InfoRow icon={<DollarSign size={14} />} label="Budget" value={`₱${Number(project.budget).toLocaleString()}`} />
            <InfoRow icon={<Calendar size={14} />} label="Approved Date" value={project.approved_date} />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>Description</p>
            <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{project.description}</p>
          </div>

          {/* Evaluators */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <Users size={13} style={{ marginRight: 4, verticalAlign: "middle" }} />Assigned Evaluators
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(project.evaluators || []).map((ev, i) => (
                <span key={i} style={{ padding: "4px 12px", borderRadius: 20, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: 13, fontWeight: 500 }}>
                  {ev}
                </span>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>Progress</p>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>{project.progress}%</span>
            </div>
            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${project.progress}%`, background: "#15803d", borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 4 }}>
        {icon} {label}
      </p>
      <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 600, color: "#111827" }}>{value}</p>
    </div>
  );
}

const MO = {
  overlay:  { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal:    { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 580, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  header:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", gap: 12 },
  title:    { margin: "4px 0 0", fontSize: 17, fontWeight: 700, color: "#111827" },
  closeBtn: { background: "#f3f4f6", border: "none", borderRadius: 8, cursor: "pointer", padding: 6, display: "flex", color: "#374151", flexShrink: 0 },
  body:     { overflowY: "auto", padding: "20px 24px 24px" },
};

/* ── ProjectManagement ───────────────────────────────────── */
export default function ProjectManagement() {
  const [projects,     setProjects]     = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [search,       setSearch]       = useState("");
  const [loading,      setLoading]      = useState(true);
  const [viewing,      setViewing]      = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    api.get("/admin/projects/approved")
      .then(r => { setProjects(r.data); setFiltered(r.data); })
      .catch(() => { setProjects(MOCK); setFiltered(MOCK); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(projects.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.researcher?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q) ||
      p.project_id?.toLowerCase().includes(q)
    ));
  }, [search, projects]);

  const ml = isMobile ? 0 : sidebarWidth;

  return (
    <>
      <style>{`
        .pm-table { width:100%; border-collapse:collapse; }
        .pm-table th { padding:12px 16px; text-align:left; font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; border-bottom:2px solid #e5e7eb; white-space:nowrap; background:#f9fafb; }
        .pm-table td { padding:14px 16px; font-size:13px; color:#374151; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
        .pm-table tr:last-child td { border-bottom:none; }
        .pm-table tr:hover td { background:#fafafa; }
        .pm-cards { display:none; flex-direction:column; gap:12px; }
        @media(max-width:900px){ .pm-table-wrap { display:none; } .pm-cards { display:flex; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
        <AdminNavbar onWidthChange={setSidebarWidth} />

        <div style={{ marginLeft: ml, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.22s ease", minWidth: 0 }}>
          <Topbar title="Project Management" />

          <div style={{ padding: "24px", flex: 1 }}>

            {/* Heading */}
            <div style={{ marginBottom: 24 }}>
              <h3  style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>View and monitor all approved research projects</h3>
            </div>

            {/* Search + stat */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, marginBottom: 20, alignItems: "stretch" }}>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <Search size={18} color="#9ca3af" strokeWidth={1.8} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by title, researcher, or department..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", padding: "14px 0", background: "transparent" }} />
              </div>
              <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 28px", textAlign: "center", minWidth: 160, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#111827" }}>{filtered.length}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>Approved Projects</p>
              </div>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <FolderOpen size={18} color="#15803d" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Approved Projects</h3>
              </div>

              {loading ? (
                <p style={{ padding: 24, color: "#9ca3af", fontSize: 14 }}>Loading…</p>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <FolderOpen size={40} color="#d1d5db" style={{ margin: "0 auto 10px", display: "block" }} />
                  <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>No approved projects found.</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="pm-table-wrap" style={{ overflowX: "auto" }}>
                    <table className="pm-table">
                      <thead>
                        <tr>
                          {["ID", "Title", "Researcher", "Department", "Budget", "Approved Date", "Progress", "Evaluators", "Actions"].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{p.project_id}</td>
                            <td style={{ maxWidth: 220 }}>
                              <p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>{p.title}</p>
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>{p.researcher}</td>
                            <td>{p.department}</td>
                            <td style={{ whiteSpace: "nowrap" }}>₱{Number(p.budget).toLocaleString()}</td>
                            <td style={{ whiteSpace: "nowrap", color: "#6b7280" }}>{p.approved_date}</td>
                            <td style={{ minWidth: 120 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${p.progress}%`, background: "#15803d", borderRadius: 99 }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d", whiteSpace: "nowrap" }}>{p.progress}%</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {(p.evaluators || []).map((ev, i) => (
                                  <span key={i} style={{ padding: "2px 8px", borderRadius: 12, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}>
                                    {ev.split(" ").slice(-1)[0]}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <button onClick={() => setViewing(p)}
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                <Eye size={14} /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="pm-cards" style={{ padding: "14px 16px" }}>
                    {filtered.map(p => (
                      <div key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", background: "#fafafa" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 10 }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{p.project_id}</p>
                          </div>
                          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", whiteSpace: "nowrap", flexShrink: 0 }}>
                            Approved
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px", fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
                          <span><b style={{ color: "#374151" }}>By:</b> {p.researcher}</span>
                          <span><b style={{ color: "#374151" }}>Dept:</b> {p.department}</span>
                          <span><b style={{ color: "#374151" }}>Budget:</b> ₱{Number(p.budget).toLocaleString()}</span>
                          <span><b style={{ color: "#374151" }}>Approved:</b> {p.approved_date}</span>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: "#6b7280" }}>Progress</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>{p.progress}%</span>
                          </div>
                          <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${p.progress}%`, background: "#15803d", borderRadius: 99 }} />
                          </div>
                        </div>
                        <button onClick={() => setViewing(p)}
                          style={{ width: "100%", padding: "9px 0", borderRadius: 9, border: "none", background: "#f59e0b", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                          <Eye size={15} /> View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {viewing && <DetailModal project={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}