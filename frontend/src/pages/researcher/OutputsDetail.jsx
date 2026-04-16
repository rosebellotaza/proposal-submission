import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Package, CheckCircle2, Clock, Info,
  FileText, Monitor, Users, BookOpen, Wrench, Database,
} from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";

const PROJECT_INFO = {
  "PRJ-001": { title: "Climate Change Impact on Coastal Ecosystems", status: "Approved" },
  "PRJ-002": { title: "AI-Driven Healthcare Diagnosis System",       status: "Under Evaluation" },
  "PRJ-003": { title: "Sustainable Agriculture Practices in Arid Regions", status: "In Progress" },
  "PRJ-004": { title: "Quantum Computing for Cryptography",          status: "Submitted" },
  "PRJ-005": { title: "Urban Planning and Smart City Infrastructure", status: "Draft" },
};

const STATUS_BADGE = {
  "Approved":         { bg: "#dcfce7", color: "#15803d" },
  "Under Evaluation": { bg: "#ede9fe", color: "#6d28d9" },
  "In Progress":      { bg: "#d1fae5", color: "#065f46" },
  "Submitted":        { bg: "#e0f2fe", color: "#0369a1" },
  "Draft":            { bg: "#f3f4f6", color: "#6b7280" },
};

const OUTPUT_STATUS_BADGE = {
  "Completed":   { bg: "#dcfce7", color: "#15803d" },
  "In Progress": { bg: "#fef9c3", color: "#a16207" },
  "Planned":     { bg: "#eff6ff", color: "#2563eb" },
};

const OUTPUT_STATUS_ICON = {
  "Completed":   <CheckCircle2 size={18} color="#15803d" />,
  "In Progress": <Clock size={18} color="#d97706" />,
  "Planned":     <Info size={18} color="#2563eb" />,
};

const CATEGORY_CONFIG = {
  "Publications":    { color: "#1f7a1f", bg: "#f0fdf4", icon: <FileText size={20} color="#fff" />,  iconBg: "#1f7a1f" },
  "Presentations":   { color: "#7c3aed", bg: "#f5f3ff", icon: <Monitor size={20} color="#fff" />,   iconBg: "#7c3aed" },
  "Workshops":       { color: "#d97706", bg: "#fefce8", icon: <Users size={20} color="#fff" />,     iconBg: "#d97706" },
  "Policy Briefs":   { color: "#2563eb", bg: "#eff6ff", icon: <BookOpen size={20} color="#fff" />,  iconBg: "#2563eb" },
  "Software/Tools":  { color: "#dc2626", bg: "#fef2f2", icon: <Wrench size={20} color="#fff" />,   iconBg: "#dc2626" },
  "Datasets":        { color: "#059669", bg: "#ecfdf5", icon: <Database size={20} color="#fff" />,  iconBg: "#059669" },
};

const INITIAL_OUTPUTS = [
  { id: 1,  category: "Publications",  title: "Journal Article: Technology Integration Framework",   desc: "Peer-reviewed article in Educational Technology Research and Development journal",          targetDate: "6/30/2025",  completedDate: "",          status: "In Progress" },
  { id: 2,  category: "Publications",  title: "Journal Article: Student Engagement Patterns",        desc: "Quantitative study results published in International Journal of Educational Technology",  targetDate: "9/30/2025",  completedDate: "",          status: "Planned" },
  { id: 3,  category: "Publications",  title: "Book Chapter: Blended Learning Approaches",           desc: "Contributed chapter in edited volume on contemporary educational technology",              targetDate: "3/31/2025",  completedDate: "",          status: "In Progress" },
  { id: 4,  category: "Presentations", title: "Conference Presentation: AERA Annual Meeting",        desc: "Presentation of preliminary findings at American Educational Research Association conference", targetDate: "4/15/2024", completedDate: "4/15/2024", status: "Completed" },
  { id: 5,  category: "Presentations", title: "Conference Poster: EdTech Summit 2024",               desc: "Poster presentation on digital learning best practices",                                   targetDate: "10/20/2024", completedDate: "10/18/2024", status: "Completed" },
  { id: 6,  category: "Presentations", title: "Webinar Series: Digital Pedagogy",                    desc: "Public webinar series reaching 200+ educators internationally",                           targetDate: "4/30/2025",  completedDate: "",          status: "Planned" },
  { id: 7,  category: "Workshops",     title: "Faculty Development Workshop Series",                 desc: "Three-part workshop series for educators on effective technology integration (60 participants)", targetDate: "12/15/2024", completedDate: "",        status: "In Progress" },
  { id: 8,  category: "Policy Briefs", title: "Institutional Technology Guidelines",                 desc: "Evidence-based policy recommendations for university technology adoption",                 targetDate: "8/30/2025",  completedDate: "",          status: "Planned" },
  { id: 9,  category: "Software/Tools",title: "Learning Analytics Dashboard",                        desc: "Open-source tool for tracking student engagement metrics in digital platforms",           targetDate: "5/30/2025",  completedDate: "",          status: "In Progress" },
  { id: 10, category: "Datasets",      title: "Student Engagement Dataset",                          desc: "Anonymized dataset from 500+ students available for research community (via institutional repository)", targetDate: "7/31/2025", completedDate: "", status: "Planned" },
];

const PROJECTED_IMPACT = [
  {
    title: "Academic Impact", color: "#2563eb", bg: "#eff6ff",
    points: [
      "3 peer-reviewed publications in high-impact journals",
      "International conference presentations reaching 500+ researchers",
      "Open-access dataset for future research studies",
    ],
  },
  {
    title: "Dissemination Reach", color: "#7c3aed", bg: "#f5f3ff",
    points: [
      "Estimated 1,000+ educators reached through various channels",
      "International webinar series with global participation",
      "Media coverage in education technology publications",
    ],
  },
  {
    title: "Practical Impact", color: "#1f7a1f", bg: "#f0fdf4",
    points: [
      "Faculty development workshops training 60+ educators",
      "Policy guidelines influencing institutional practices",
      "Open-source tools benefiting educational community",
    ],
  },
  {
    title: "Long-term Benefits", color: "#d97706", bg: "#fefce8",
    points: [
      "Framework adopted by multiple educational institutions",
      "Potential for follow-up research collaborations",
      "Contribution to evidence base for educational policy",
    ],
  },
];

const fmt = (d) => d || "—";

export default function OutputsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [outputs, setOutputs] = useState(INITIAL_OUTPUTS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "", title: "", description: "", targetDate: "", status: "Planned" });

  const project = PROJECT_INFO[id] || { title: "Unknown Project", status: "Draft" };
  const statusStyle = STATUS_BADGE[project.status] || STATUS_BADGE["Draft"];

  // Stats
  const total = outputs.length;
  const completed = outputs.filter((o) => o.status === "Completed").length;
  const inProgress = outputs.filter((o) => o.status === "In Progress").length;
  const planned = outputs.filter((o) => o.status === "Planned").length;

  // Category counts
  const catCounts = outputs.reduce((acc, o) => {
    acc[o.category] = (acc[o.category] || 0) + 1;
    return acc;
  }, {});

  // Group by category
  const grouped = outputs.reduce((acc, o) => {
    if (!acc[o.category]) acc[o.category] = [];
    acc[o.category].push(o);
    return acc;
  }, {});

  const handleAdd = () => {
    if (!form.title) return;
    setOutputs((p) => [...p, {
      id: Date.now(),
      category: form.type || "Publications",
      title: form.title,
      desc: form.description,
      targetDate: form.targetDate,
      completedDate: "",
      status: form.status,
    }]);
    setShowModal(false);
    setForm({ type: "", title: "", description: "", targetDate: "", status: "Planned" });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Outputs" />
        <div className="dashboard-content">

          {/* Project Header */}
          <div className="pv-header-left" style={{ marginBottom: 4 }}>
            <button className="pv-back-btn" onClick={() => navigate("/researcher/outputs")}>
              <ArrowLeft size={18} />
            </button>
            <div className="pv-title-row">
              <h2 className="pv-title" style={{ fontSize: "1.15rem" }}>{project.title}</h2>
              <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                {project.status}
              </span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 20px 52px" }}>{id}</p>

          {/* Page Header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">Research Outputs</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                Track project deliverables and dissemination activities
              </p>
            </div>
            <button className="create-btn" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Add Output
            </button>
          </div>

          {/* Stats */}
          <div className="out-stats">
            <div className="out-stat-card">
              <div>
                <p className="out-stat-label">Total Outputs</p>
                <p className="out-stat-num">{total}</p>
              </div>
              <div className="out-stat-icon" style={{ background: "#eff6ff" }}>
                <Package size={22} color="#3b82f6" />
              </div>
            </div>
            <div className="out-stat-card">
              <div>
                <p className="out-stat-label">Completed</p>
                <p className="out-stat-num" style={{ color: "#15803d" }}>{completed}</p>
              </div>
              <div className="out-stat-icon" style={{ background: "#f0fdf4" }}>
                <CheckCircle2 size={22} color="#15803d" />
              </div>
            </div>
            <div className="out-stat-card">
              <div>
                <p className="out-stat-label">In Progress</p>
                <p className="out-stat-num" style={{ color: "#d97706" }}>{inProgress}</p>
              </div>
              <div className="out-stat-icon" style={{ background: "#fefce8" }}>
                <Clock size={22} color="#d97706" />
              </div>
            </div>
            <div className="out-stat-card">
              <div>
                <p className="out-stat-label">Planned</p>
                <p className="out-stat-num" style={{ color: "#2563eb" }}>{planned}</p>
              </div>
              <div className="out-stat-icon" style={{ background: "#eff6ff" }}>
                <Info size={22} color="#2563eb" />
              </div>
            </div>
          </div>

          {/* Output Categories */}
          <div className="cp-section">
            <div className="cp-section-title">Output Categories</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 16px" }}>
              Distribution of outputs by type
            </p>
            <div className="out-categories-grid">
              {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => (
                <div key={cat} className="out-cat-card" style={{ background: cfg.bg }}>
                  <div className="out-cat-icon" style={{ background: cfg.iconBg }}>
                    {cfg.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#111827", margin: "0 0 2px" }}>{cat}</p>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                      {catCounts[cat] || 0} output(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grouped Outputs */}
          {Object.entries(grouped).map(([cat, items]) => {
            const cfg = CATEGORY_CONFIG[cat] || { color: "#6b7280", bg: "#f3f4f6", iconBg: "#6b7280", icon: <Package size={20} color="#fff" /> };
            return (
              <div key={cat} className="cp-section" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: cfg.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {cfg.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, color: "#111827", margin: 0 }}>{cat}</p>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{items.length} output(s)</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                  {items.map((out) => {
                    const sb = OUTPUT_STATUS_BADGE[out.status] || OUTPUT_STATUS_BADGE["Planned"];
                    return (
                      <div key={out.id} className="out-item-card">
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
                          <div style={{ marginTop: 2, flexShrink: 0 }}>
                            {OUTPUT_STATUS_ICON[out.status]}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: 14, color: "#111827", margin: "0 0 3px" }}>{out.title}</p>
                            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px" }}>{out.desc}</p>
                            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#9ca3af" }}>
                              <span>Target Date: {fmt(out.targetDate)}</span>
                              {out.completedDate && <span>Completed: {out.completedDate}</span>}
                            </div>
                          </div>
                        </div>
                        <span className="badge" style={{ background: sb.bg, color: sb.color, flexShrink: 0 }}>
                          {out.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Projected Impact */}
          <div className="cp-section">
            <div className="cp-section-title">Projected Impact</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 16px" }}>
              Expected reach and influence of research outputs
            </p>
            <div className="out-impact-grid">
              {PROJECTED_IMPACT.map((imp, i) => (
                <div key={i} className="out-impact-card" style={{ background: imp.bg }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: imp.color, margin: "0 0 10px" }}>{imp.title}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {imp.points.map((pt, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: imp.color, flexShrink: 0, marginTop: 5 }} />
                        <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Add Output Modal */}
      {showModal && (
        <div className="tm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tm-modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <div>
                <h3 className="tm-modal-title">Add New Output</h3>
                <p className="tm-modal-subtitle">Add a new deliverable or output to track</p>
              </div>
              <button className="tm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="cp-field">
              <label className="cp-label">Output Type</label>
              <input className="cp-input" placeholder="e.g., Publication"
                value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} autoFocus />
            </div>

            <div className="cp-field">
              <label className="cp-label">Title</label>
              <input className="cp-input" placeholder="Enter output title"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="cp-field">
              <label className="cp-label">Description</label>
              <textarea className="cp-textarea" style={{ minHeight: 72 }}
                placeholder="Provide details about this output"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Target Date</label>
                <input className="cp-input" type="date"
                  value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
              </div>
              <div className="cp-field">
                <label className="cp-label">Status</label>
                <div className="cp-select-wrap">
                  <select className="cp-select" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Planned</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                  <span className="cp-select-chevron">▾</span>
                </div>
              </div>
            </div>

            <div className="tm-modal-actions">
              <button className="cp-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="cp-btn primary"
                style={{ background: "#1f7a1f", borderColor: "#1f7a1f" }}
                onClick={handleAdd}>
                Add Output
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}