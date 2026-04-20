import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import api from "../../utils/api";

export default function ProjectCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [form,    setForm]    = useState({
    title:    "",
    type:     "Research",
    category: "",
    budget:   "",
    start_date: "",
    end_date:   "",
    methodology: "",
    nature_and_significance: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.title || !form.type) {
      setError("Title and type are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/projects", form);
      navigate(`/researcher/projects/${res.data.id}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors)[0][0]);
      } else {
        setError(err.response?.data?.message || "Failed to create project.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Research Projects" />
        <div className="dashboard-content">

          {/* Header */}
          <div className="pv-header-left" style={{ marginBottom: 20 }}>
            <button className="pv-back-btn" onClick={() => navigate("/researcher/projects")}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="page-title">Create New Project</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                Fill in the project details below
              </p>
            </div>
          </div>

          {error && (
            <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>
          )}

          {/* Form */}
          <div className="cp-section">
            <div className="cp-section-title">Project Information</div>

            <div className="cp-field">
              <label className="cp-label">Project Title *</label>
              <input
                className="cp-input"
                type="text"
                name="title"
                placeholder="Enter project title"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Type *</label>
                <div className="cp-select-wrap">
                  <select className="cp-select" name="type" value={form.type} onChange={handleChange}>
                    <option>Research</option>
                    <option>ICT</option>
                    <option>Extension</option>
                    <option>ORGMS</option>
                    <option>Others</option>
                  </select>
                  <span className="cp-select-chevron">▾</span>
                </div>
              </div>
              <div className="cp-field">
                <label className="cp-label">Research Category</label>
                <div className="cp-select-wrap">
                  <select className="cp-select" name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    <option>Basic Research</option>
                    <option>Applied Research</option>
                    <option>Developmental Research</option>
                    <option>Action Research</option>
                  </select>
                  <span className="cp-select-chevron">▾</span>
                </div>
              </div>
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Start Date</label>
                <input className="cp-input" type="date" name="start_date" value={form.start_date} onChange={handleChange} />
              </div>
              <div className="cp-field">
                <label className="cp-label">End Date</label>
                <input className="cp-input" type="date" name="end_date" value={form.end_date} onChange={handleChange} />
              </div>
            </div>

            <div className="cp-field">
              <label className="cp-label">Budget (₱)</label>
              <input
                className="cp-input"
                type="number"
                name="budget"
                placeholder="0.00"
                value={form.budget}
                onChange={handleChange}
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">Nature and Significance</label>
              <textarea
                className="cp-textarea"
                name="nature_and_significance"
                placeholder="Describe the background and significance of this research..."
                value={form.nature_and_significance}
                onChange={handleChange}
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">Methodology</label>
              <textarea
                className="cp-textarea"
                name="methodology"
                placeholder="Describe the research methodology..."
                value={form.methodology}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="cp-form-actions">
            <button className="cp-btn" onClick={() => navigate("/researcher/projects")}>
              Cancel
            </button>
            <button
              className="cp-btn primary"
              style={{ background: "#1f7a1f", borderColor: "#1f7a1f", display: "flex", alignItems: "center", gap: 7 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              <FileText size={14} />
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}