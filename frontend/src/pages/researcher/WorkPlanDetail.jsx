import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, CheckCircle2, Clock, Circle, Trash2 } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import api from "../../utils/api";

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

const MILESTONE_COLORS = {
  "Research Foundation": "#1f7a1f",
  "Data Collection":     "#7c3aed",
  "Data Analysis":       "#d97706",
  "Dissemination":       "#2563eb",
};

function StatusIcon({ status }) {
  if (status === "Completed")   return <CheckCircle2 size={20} color="#1f7a1f" />;
  if (status === "In Progress") return <Clock size={20} color="#d97706" />;
  return <Circle size={20} color="#d1d5db" />;
}

export default function WorkPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project,    setProject]    = useState(null);
  const [activities, setActivities] = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", start_date: "", end_date: "",
    milestone: "Research Foundation",
  });

  useEffect(() => {
    api.get(`/projects/${id}`).then((res) => setProject(res.data));
    api.get(`/projects/${id}/work-plan`).then((res) => setActivities(res.data));
  }, [id]);

  const handleAdd = async () => {
    if (!form.title) return;
    setLoading(true);
    try {
      const res = await api.post(`/projects/${id}/work-plan`, form);
      setActivities((p) => [...p, res.data]);
      setShowModal(false);
      setForm({ title: "", description: "", start_date: "", end_date: "", milestone: "Research Foundation" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (actId, newStatus) => {
    await api.put(`/projects/${id}/work-plan/${actId}`, { status: newStatus });
    setActivities((p) => p.map((a) => a.id === actId ? { ...a, status: newStatus } : a));
  };

  const handleDelete = async (actId) => {
    if (!confirm("Delete this activity?")) return;
    await api.delete(`/projects/${id}/work-plan/${actId}`);
    setActivities((p) => p.filter((a) => a.id !== actId));
  };

  const statusStyle = STATUS_BADGE[project?.status] || STATUS_BADGE["Draft"];

  const grouped = activities.reduce((acc, a) => {
    if (!acc[a.milestone]) acc[a.milestone] = [];
    acc[a.milestone].push(a);
    return acc;
  }, {});

  const total      = activities.length;
  const inProgress = activities.filter((a) => a.status === "In Progress").length;
  const completed  = activities.filter((a) => a.status === "Completed").length;

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
              <h2 className="pv-title" style={{ fontSize: "1.15rem" }}>{project?.title}</h2>
              {project && (
                <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                  {project.status}
                </span>
              )}
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "-14px 0 20px 52px" }}>{project?.reference_no}</p>

          {/* Work Plan Header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">Work Plan</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Manage project activities and timeline</p>
            </div>
            <button className="create-btn" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Add Activity
            </button>
          </div>

          {/* Activities */}
          <div className="cp-section">
            <div className="cp-section-title">Activities Timeline</div>
            {Object.entries(grouped).map(([milestone, items]) => {
              const color = MILESTONE_COLORS[milestone] || "#6b7280";
              return (
                <div key={milestone} style={{ marginBottom: 8 }}>
                  <div className="wp-milestone-label" style={{ color }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block", marginRight: 8 }} />
                    {milestone}
                  </div>
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
                            <p className="wp-activity-desc">{act.description}</p>
                            <div className="wp-activity-dates">
                              {act.start_date && <span><Calendar size={12} /> Start: {new Date(act.start_date).toLocaleDateString()}</span>}
                              {act.end_date && <span><Calendar size={12} /> End: {new Date(act.end_date).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span className="badge" style={{ background: ab.bg, color: ab.color }}>
                            {act.status}
                          </span>
                          <select
                            style={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px", color: "#374151", cursor: "pointer" }}
                            value={act.status}
                            onChange={(e) => handleStatusChange(act.id, e.target.value)}
                          >
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                          </select>
                          <button
                            onClick={() => handleDelete(act.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4 }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {activities.length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: 14 }}>No activities yet. Add your first activity!</p>
            )}
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
                <p className="tm-modal-subtitle">Create a new activity in your work plan</p>
              </div>
              <button className="tm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="cp-field">
              <label className="cp-label">Activity Title</label>
              <input className="cp-input" type="text" placeholder="Enter activity title"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            </div>

            <div className="cp-field">
              <label className="cp-label">Description</label>
              <textarea className="cp-textarea" style={{ minHeight: 72 }} placeholder="Enter activity description"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Start Date</label>
                <input className="cp-input" type="date" value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="cp-field">
                <label className="cp-label">End Date</label>
                <input className="cp-input" type="date" value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>

            <div className="cp-field">
              <label className="cp-label">Milestone</label>
              <div className="cp-select-wrap">
                <select className="cp-select" value={form.milestone}
                  onChange={(e) => setForm({ ...form, milestone: e.target.value })}>
                  <option>Research Foundation</option>
                  <option>Data Collection</option>
                  <option>Data Analysis</option>
                  <option>Dissemination</option>
                </select>
                <span className="cp-select-chevron">▾</span>
              </div>
            </div>

            <div className="tm-modal-actions">
              <button className="cp-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="cp-btn primary"
                style={{ background: "#1f7a1f", borderColor: "#1f7a1f" }}
                onClick={handleAdd} disabled={loading}>
                {loading ? "Adding..." : "Add Activity"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}