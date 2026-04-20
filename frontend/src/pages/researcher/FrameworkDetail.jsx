import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
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

export default function FrameworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project,    setProject]    = useState(null);
  const [frameworks, setFrameworks] = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [form, setForm] = useState({
    year_no: "1",
    objective: "",
    activities: "",
    performance_indicators: "",
    target_q1: "", target_q2: "", target_q3: "", target_q4: "",
    means_of_verification: "",
    key_assumptions: "",
    funding_source: "GAA",
  });

  useEffect(() => {
    api.get(`/projects/${id}`).then((res) => setProject(res.data));
    api.get(`/projects/${id}/framework`).then((res) => setFrameworks(res.data));
  }, [id]);

  const handleAdd = async () => {
    if (!form.objective || !form.activities) return;
    setLoading(true);
    try {
      const res = await api.post(`/projects/${id}/framework`, {
        ...form,
        year_no: parseInt(form.year_no),
      });
      setFrameworks((p) => [...p, res.data]);
      setShowModal(false);
      setForm({
        year_no: "1", objective: "", activities: "", performance_indicators: "",
        target_q1: "", target_q2: "", target_q3: "", target_q4: "",
        means_of_verification: "", key_assumptions: "", funding_source: "GAA",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = STATUS_BADGE[project?.status] || STATUS_BADGE["Draft"];

  // Group by year
  const grouped = frameworks.reduce((acc, f) => {
    if (!acc[f.year_no]) acc[f.year_no] = [];
    acc[f.year_no].push(f);
    return acc;
  }, {});

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Framework" />
        <div className="dashboard-content">

          {/* Project Header */}
          <div className="pv-header-left" style={{ marginBottom: 4 }}>
            <button className="pv-back-btn" onClick={() => navigate("/researcher/framework")}>
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
              <h2 className="page-title">Research Framework (Logframe)</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                Manage project objectives, activities, and performance indicators
              </p>
            </div>
            <button className="create-btn" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Add Row
            </button>
          </div>

          {/* Framework Table by Year */}
          {Object.entries(grouped).map(([year, rows]) => (
            <div key={year} className="cp-section">
              <div className="cp-section-title">Year {year} Framework</div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Objective</th>
                      <th>Activities</th>
                      <th>Performance Indicators</th>
                      <th>Q1</th>
                      <th>Q2</th>
                      <th>Q3</th>
                      <th>Q4</th>
                      <th>Funding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((f) => (
                      <tr key={f.id}>
                        <td style={{ minWidth: 150 }}>{f.objective}</td>
                        <td style={{ minWidth: 150 }}>{f.activities}</td>
                        <td style={{ minWidth: 150 }}>{f.performance_indicators}</td>
                        <td>{f.target_q1 || "—"}</td>
                        <td>{f.target_q2 || "—"}</td>
                        <td>{f.target_q3 || "—"}</td>
                        <td>{f.target_q4 || "—"}</td>
                        <td>{f.funding_source || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {frameworks.length === 0 && (
            <div className="cp-section">
              <p style={{ color: "#9ca3af", fontSize: 14 }}>No framework rows yet. Add your first row!</p>
            </div>
          )}

        </div>
      </div>

      {/* Add Framework Modal */}
      {showModal && (
        <div className="tm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tm-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <div>
                <h3 className="tm-modal-title">Add Framework Row</h3>
                <p className="tm-modal-subtitle">Add a new row to the logframe</p>
              </div>
              <button className="tm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Year</label>
                <div className="cp-select-wrap">
                  <select className="cp-select" value={form.year_no}
                    onChange={(e) => setForm({ ...form, year_no: e.target.value })}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                  </select>
                  <span className="cp-select-chevron">▾</span>
                </div>
              </div>
              <div className="cp-field">
                <label className="cp-label">Funding Source</label>
                <div className="cp-select-wrap">
                  <select className="cp-select" value={form.funding_source}
                    onChange={(e) => setForm({ ...form, funding_source: e.target.value })}>
                    <option>GAA</option>
                    <option>STF</option>
                    <option>Others</option>
                  </select>
                  <span className="cp-select-chevron">▾</span>
                </div>
              </div>
            </div>

            <div className="cp-field">
              <label className="cp-label">Objective *</label>
              <textarea className="cp-textarea" style={{ minHeight: 60 }} placeholder="Enter objective"
                value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
            </div>

            <div className="cp-field">
              <label className="cp-label">Activities *</label>
              <textarea className="cp-textarea" style={{ minHeight: 60 }} placeholder="Enter activities"
                value={form.activities} onChange={(e) => setForm({ ...form, activities: e.target.value })} />
            </div>

            <div className="cp-field">
              <label className="cp-label">Performance Indicators</label>
              <input className="cp-input" placeholder="Enter performance indicators"
                value={form.performance_indicators}
                onChange={(e) => setForm({ ...form, performance_indicators: e.target.value })} />
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Target Q1</label>
                <input className="cp-input" placeholder="Q1 target"
                  value={form.target_q1} onChange={(e) => setForm({ ...form, target_q1: e.target.value })} />
              </div>
              <div className="cp-field">
                <label className="cp-label">Target Q2</label>
                <input className="cp-input" placeholder="Q2 target"
                  value={form.target_q2} onChange={(e) => setForm({ ...form, target_q2: e.target.value })} />
              </div>
              <div className="cp-field">
                <label className="cp-label">Target Q3</label>
                <input className="cp-input" placeholder="Q3 target"
                  value={form.target_q3} onChange={(e) => setForm({ ...form, target_q3: e.target.value })} />
              </div>
              <div className="cp-field">
                <label className="cp-label">Target Q4</label>
                <input className="cp-input" placeholder="Q4 target"
                  value={form.target_q4} onChange={(e) => setForm({ ...form, target_q4: e.target.value })} />
              </div>
            </div>

            <div className="cp-field">
              <label className="cp-label">Means of Verification</label>
              <input className="cp-input" placeholder="How to verify completion"
                value={form.means_of_verification}
                onChange={(e) => setForm({ ...form, means_of_verification: e.target.value })} />
            </div>

            <div className="cp-field">
              <label className="cp-label">Key Assumptions</label>
              <input className="cp-input" placeholder="Key assumptions"
                value={form.key_assumptions}
                onChange={(e) => setForm({ ...form, key_assumptions: e.target.value })} />
            </div>

            <div className="tm-modal-actions">
              <button className="cp-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="cp-btn primary"
                style={{ background: "#1f7a1f", borderColor: "#1f7a1f" }}
                onClick={handleAdd} disabled={loading}>
                {loading ? "Adding..." : "Add Row"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}