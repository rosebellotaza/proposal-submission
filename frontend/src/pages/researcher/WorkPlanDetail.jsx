import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, CheckCircle2, Clock, Circle } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";

const MILESTONES = {
  "Research Foundation": { color: "#1f7a1f", dot: "#1f7a1f" },
  "Data Collection":     { color: "#7c3aed", dot: "#7c3aed" },
  "Data Analysis":       { color: "#d97706", dot: "#d97706" },
  "Dissemination":       { color: "#2563eb", dot: "#2563eb" },
};

const INITIAL_ACTIVITIES = [
  { id: 1,  milestone: "Research Foundation", title: "Literature Review",          desc: "Comprehensive review of existing research in the field",       start: "1/1/2024",  end: "3/31/2024",  status: "Completed" },
  { id: 2,  milestone: "Research Foundation", title: "Research Design Development", desc: "Design research methodology and data collection instruments",  start: "2/1/2024",  end: "4/30/2024",  status: "In Progress" },
  { id: 3,  milestone: "Research Foundation", title: "Ethics Approval Application", desc: "Submit and obtain ethics committee approval",                  start: "3/1/2024",  end: "5/31/2024",  status: "In Progress" },
  { id: 4,  milestone: "Data Collection",     title: "Data Collection Phase 1",     desc: "Conduct initial data collection with target participants",     start: "6/1/2024",  end: "9/30/2024",  status: "Pending" },
  { id: 5,  milestone: "Data Analysis",       title: "Preliminary Data Analysis",   desc: "Analyze initial findings and adjust methodology if needed",    start: "8/1/2024",  end: "10/31/2024", status: "Pending" },
  { id: 6,  milestone: "Data Collection",     title: "Data Collection Phase 2",     desc: "Complete final round of data collection",                     start: "10/1/2024", end: "12/31/2024", status: "Pending" },
  { id: 7,  milestone: "Data Analysis",       title: "Comprehensive Data Analysis", desc: "Complete statistical and qualitative analysis",               start: "1/1/2025",  end: "4/30/2025",  status: "Pending" },
  { id: 8,  milestone: "Dissemination",       title: "Manuscript Preparation",      desc: "Write research papers for publication",                       start: "3/1/2025",  end: "6/30/2025",  status: "Pending" },
  { id: 9,  milestone: "Dissemination",       title: "Final Report Submission",     desc: "Prepare and submit final project report",                     start: "6/1/2025",  end: "7/31/2025",  status: "Pending" },
];

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

const ACTIVITY_STATUS_BADGE = {
  "Completed":   { bg: "#dcfce7", color: "#15803d" },
  "In Progress": { bg: "#fef9c3", color: "#a16207" },
  "Pending":     { bg: "#f3f4f6", color: "#6b7280" },
};

function StatusIcon({ status }) {
  if (status === "Completed")   return <CheckCircle2 size={20} color="#1f7a1f" />;
  if (status === "In Progress") return <Clock size={20} color="#d97706" />;
  return <Circle size={20} color="#d1d5db" />;
}

export default function WorkPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", start: "", end: "", milestone: "Research Foundation" });

  const project = PROJECT_INFO[id] || { title: "Unknown Project", status: "Draft" };
  const statusStyle = STATUS_BADGE[project.status] || STATUS_BADGE["Draft"];

  // Group activities by milestone
  const grouped = Object.keys(MILESTONES).reduce((acc, m) => {
    const items = activities.filter((a) => a.milestone === m);
    if (items.length) acc[m] = items;
    return acc;
  }, {});

  // Stats
  const total = activities.length;
  const inProgress = activities.filter((a) => a.status === "In Progress").length;
  const completed = activities.filter((a) => a.status === "Completed").length;

  const handleAdd = () => {
    if (!form.title) return;
    setActivities((p) => [
      ...p,
      { id: Date.now(), milestone: form.milestone, title: form.title, desc: form.desc, start: form.start, end: form.end, status: "Pending" },
    ]);
    setShowModal(false);
    setForm({ title: "", desc: "", start: "", end: "", milestone: "Research Foundation" });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Work Plan" />
        <div className="dashboard-content">

          {/* Project Header */}
          <div className="pv-header-left" style={{ marginBottom: 20 }}>
            <button className="pv-back-btn" onClick={() => navigate("/researcher/work-plan")}>
              <ArrowLeft size={18} />
            </button>
            <div className="pv-title-row">
              <h2 className="pv-title" style={{ fontSize: "1.15rem" }}>{project.title}</h2>
              <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                {project.status}
              </span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "-14px 0 20px 52px" }}>{id}</p>

          {/* Work Plan Header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">Work Plan</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                Manage project activities and timeline
              </p>
            </div>
            <button className="create-btn" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Add Activity
            </button>
          </div>

          {/* Milestones */}
          <div className="cp-section">
            <div className="cp-section-title">Project Milestones</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 16px" }}>
              Key milestones and phases
            </p>
            <div className="wp-milestones">
              {Object.entries(MILESTONES).map(([name, style]) => {
                const count = activities.filter((a) => a.milestone === name).length;
                return (
                  <div key={name} className="wp-milestone-card" style={{ borderTop: `3px solid ${style.dot}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: style.dot, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{name}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{count} activities</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activities Timeline */}
          <div className="cp-section">
            <div className="cp-section-title">Activities Timeline</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 16px" }}>
              Detailed breakdown of all project activities
            </p>

            {Object.entries(grouped).map(([milestone, items]) => {
              const ms = MILESTONES[milestone];
              return (
                <div key={milestone} style={{ marginBottom: 8 }}>
                  {/* Milestone label */}
                  <div className="wp-milestone-label" style={{ color: ms.dot }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: ms.dot, display: "inline-block", marginRight: 8 }} />
                    {milestone}
                  </div>

                  {/* Activities */}
                  {items.map((act) => {
                    const ab = ACTIVITY_STATUS_BADGE[act.status] || ACTIVITY_STATUS_BADGE["Pending"];
                    return (
                      <div key={act.id} className="wp-activity-card">
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1 }}>
                          <div style={{ marginTop: 2, flexShrink: 0 }}>
                            <StatusIcon status={act.status} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p className="wp-activity-title">{act.title}</p>
                            <p className="wp-activity-desc">{act.desc}</p>
                            <div className="wp-activity-dates">
                              <span><Calendar size={12} /> Start: {act.start}</span>
                              <span><Calendar size={12} /> End: {act.end}</span>
                            </div>
                          </div>
                        </div>
                        <span className="badge" style={{ background: ab.bg, color: ab.color, flexShrink: 0 }}>
                          {act.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="wp-stats">
            <div className="wp-stat-card">
              <div>
                <p className="wp-stat-label">Total Activities</p>
                <p className="wp-stat-num">{total}</p>
              </div>
              <div className="wp-stat-icon" style={{ background: "#eff6ff" }}>
                <Calendar size={22} color="#3b82f6" />
              </div>
            </div>
            <div className="wp-stat-card">
              <div>
                <p className="wp-stat-label">In Progress</p>
                <p className="wp-stat-num">{inProgress}</p>
              </div>
              <div className="wp-stat-icon" style={{ background: "#fefce8" }}>
                <Clock size={22} color="#d97706" />
              </div>
            </div>
            <div className="wp-stat-card">
              <div>
                <p className="wp-stat-label">Completed</p>
                <p className="wp-stat-num">{completed}</p>
              </div>
              <div className="wp-stat-icon" style={{ background: "#f0fdf4" }}>
                <CheckCircle2 size={22} color="#1f7a1f" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Add Activity Modal */}
      {showModal && (
        <div className="tm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <div>
                <h3 className="tm-modal-title">Add New Activity</h3>
                <p className="tm-modal-subtitle">Create a new activity in your work plan timeline</p>
              </div>
              <button className="tm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="cp-field">
              <label className="cp-label">Activity Title</label>
              <input
                className="cp-input"
                type="text"
                placeholder="Enter activity title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">Description</label>
              <textarea
                className="cp-textarea"
                style={{ minHeight: 72 }}
                placeholder="Enter activity description"
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
              />
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Start Date</label>
                <input className="cp-input" type="date" value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })} />
              </div>
              <div className="cp-field">
                <label className="cp-label">End Date</label>
                <input className="cp-input" type="date" value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })} />
              </div>
            </div>

            <div className="cp-field">
              <label className="cp-label">Milestone</label>
              <div className="cp-select-wrap">
                <select className="cp-select" value={form.milestone}
                  onChange={(e) => setForm({ ...form, milestone: e.target.value })}>
                  {Object.keys(MILESTONES).map((m) => <option key={m}>{m}</option>)}
                </select>
                <span className="cp-select-chevron">▾</span>
              </div>
            </div>

            <div className="tm-modal-actions">
              <button className="cp-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="cp-btn primary"
                style={{ background: "#1f7a1f", borderColor: "#1f7a1f" }}
                onClick={handleAdd}>
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}