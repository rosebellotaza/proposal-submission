import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Package } from "lucide-react";
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

const OUTPUT_STATUS_BADGE = {
  "Pending":     { bg: "#f3f4f6", color: "#6b7280" },
  "In Progress": { bg: "#fef9c3", color: "#a16207" },
  "Completed":   { bg: "#dcfce7", color: "#15803d" },
};

export default function OutputsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project,   setProject]   = useState(null);
  const [outputs,   setOutputs]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [form, setForm] = useState({
    output_type: "", description: "", status: "Pending", target_date: "",
  });

  useEffect(() => {
    api.get(`/projects/${id}`).then((res) => setProject(res.data));
    api.get(`/projects/${id}/outputs`).then((res) => setOutputs(res.data));
  }, [id]);

  const handleAdd = async () => {
    if (!form.output_type || !form.description) return;
    setLoading(true);
    try {
      const res = await api.post(`/projects/${id}/outputs`, form);
      setOutputs((p) => [...p, res.data]);
      setShowModal(false);
      setForm({ output_type: "", description: "", status: "Pending", target_date: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = STATUS_BADGE[project?.status] || STATUS_BADGE["Draft"];

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
              <h2 className="pv-title" style={{ fontSize: "1.15rem" }}>{project?.title}</h2>
              {project && (
                <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                  {project.status}
                </span>
              )}
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 20px 52px" }}>{project?.reference_no}</p>

          {/* Page Header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">Research Outputs</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Track and manage project deliverables</p>
            </div>
            <button className="create-btn" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Add Output
            </button>
          </div>

          {/* Outputs List */}
          <div className="cp-section">
            <div className="cp-section-title">Outputs ({outputs.length})</div>
            {outputs.length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: 14 }}>No outputs yet. Add your first output!</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {outputs.map((o) => {
                const os = OUTPUT_STATUS_BADGE[o.status] || OUTPUT_STATUS_BADGE["Pending"];
                return (
                  <div key={o.id} className="ref-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Package size={18} color="#1f7a1f" />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14, color: "#111827", margin: "0 0 4px" }}>
                            {o.output_type}
                          </p>
                          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{o.description}</p>
                          {o.target_date && (
                            <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>
                              Target: {new Date(o.target_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="badge" style={{ background: os.bg, color: os.color, flexShrink: 0 }}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Add Output Modal */}
      {showModal && (
        <div className="tm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <div>
                <h3 className="tm-modal-title">Add Research Output</h3>
                <p className="tm-modal-subtitle">Add a new deliverable to this project</p>
              </div>
              <button className="tm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="cp-field">
              <label className="cp-label">Output Type</label>
              <input className="cp-input" type="text" placeholder="e.g., Publication, Presentation, Patent"
                value={form.output_type} onChange={(e) => setForm({ ...form, output_type: e.target.value })} autoFocus />
            </div>

            <div className="cp-field">
              <label className="cp-label">Description</label>
              <textarea className="cp-textarea" style={{ minHeight: 72 }} placeholder="Describe this output..."
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Status</label>
                <div className="cp-select-wrap">
                  <select className="cp-select" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                  <span className="cp-select-chevron">▾</span>
                </div>
              </div>
              <div className="cp-field">
                <label className="cp-label">Target Date</label>
                <input className="cp-input" type="date" value={form.target_date}
                  onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
              </div>
            </div>

            <div className="tm-modal-actions">
              <button className="cp-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="cp-btn primary"
                style={{ background: "#1f7a1f", borderColor: "#1f7a1f" }}
                onClick={handleAdd} disabled={loading}>
                {loading ? "Adding..." : "Add Output"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}