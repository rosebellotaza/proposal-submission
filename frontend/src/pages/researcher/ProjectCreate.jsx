import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";

export default function ProjectCreate() {
  const navigate = useNavigate();

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

          {/* Form */}
          <div className="cp-section">
            <div className="cp-section-title">Project Information</div>

            {/* Project Title */}
            <div className="cp-field">
              <label className="cp-label">Project Title *</label>
              <input className="cp-input" type="text" placeholder="Enter project title" />
            </div>

            {/* Description */}
            <div className="cp-field">
              <label className="cp-label">Description *</label>
              <textarea
                className="cp-textarea"
                placeholder="Provide a detailed description of the research project"
              />
            </div>

            {/* Department + Project Leader */}
            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Department *</label>
                <input className="cp-input" type="text" placeholder="e.g., Computer Science" />
              </div>
              <div className="cp-field">
                <label className="cp-label">Project Leader *</label>
                <input className="cp-input" type="text" placeholder="Lead researcher name" />
              </div>
            </div>

            {/* Start Date + End Date */}
            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Start Date *</label>
                <input className="cp-input" type="date" />
              </div>
              <div className="cp-field">
                <label className="cp-label">End Date *</label>
                <input className="cp-input" type="date" />
              </div>
            </div>

            {/* Budget + Research Category */}
            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Budget (₱) *</label>
                <input className="cp-input" type="number" placeholder="0.00" />
              </div>
              <div className="cp-field">
                <label className="cp-label">Research Category *</label>
                <div className="cp-select-wrap">
                  <select className="cp-select" defaultValue="">
                    <option value="" disabled>Select category</option>
                    <option>Basic Research</option>
                    <option>Applied Research</option>
                    <option>Developmental Research</option>
                    <option>Action Research</option>
                  </select>
                  <span className="cp-select-chevron">▾</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="cp-form-actions">
            <button
              className="cp-btn"
              onClick={() => navigate("/researcher/projects")}
            >
              Cancel
            </button>
            <button
              className="cp-btn primary"
              style={{
                background: "#1f7a1f",
                borderColor: "#1f7a1f",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <FileText size={14} />
              Create Project
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}