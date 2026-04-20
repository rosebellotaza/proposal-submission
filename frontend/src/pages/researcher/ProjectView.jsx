import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, DollarSign, GitBranch,
  BookOpen, BarChart2, FileText, Users,
} from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import api from "../../utils/api";

const STATUS_COLORS = {
  "Approved":         { bg: "#dcfce7", color: "#15803d" },
  "Under Evaluation": { bg: "#ede9fe", color: "#6d28d9" },
  "In Progress":      { bg: "#d1fae5", color: "#065f46" },
  "Submitted":        { bg: "#e0f2fe", color: "#0369a1" },
  "Draft":            { bg: "#f3f4f6", color: "#6b7280" },
};

const VIEW_TABS = ["Overview", "Team"];

const MGMT_LINKS = [
  { label: "Work Plan",   icon: <Calendar size={22} color="#1f7a1f" />,   path: "work-plan" },
  { label: "Budget Plan", icon: <DollarSign size={22} color="#1f7a1f" />, path: "budget-plan" },
  { label: "Framework",   icon: <GitBranch size={22} color="#1f7a1f" />,  path: "framework" },
  { label: "References",  icon: <BookOpen size={22} color="#1f7a1f" />,   path: "references" },
  { label: "Outputs",     icon: <BarChart2 size={22} color="#1f7a1f" />,  path: "outputs" },
];

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project,   setProject]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="main-content">
          <Topbar title="Research Projects" />
          <div className="dashboard-content">
            <p style={{ color: "#9ca3af" }}>Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="main-content">
          <Topbar title="Research Projects" />
          <div className="dashboard-content">
            <p>Project not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_COLORS[project.status] || STATUS_COLORS["Draft"];

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Research Projects" />
        <div className="dashboard-content">

          {/* Header */}
          <div className="pv-header">
            <div className="pv-header-left">
              <button className="pv-back-btn" onClick={() => navigate("/researcher/projects")}>
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="pv-title-row">
                  <h2 className="pv-title">{project.title}</h2>
                  <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                    {project.status}
                  </span>
                </div>
                <p className="pv-id">{project.reference_no}</p>
              </div>
            </div>
          </div>

          {/* Project Management Cards */}
          <div className="pv-mgmt-box">
            <p className="pv-mgmt-label">Project Management</p>
            <div className="pv-mgmt-cards">
              {MGMT_LINKS.map((m) => (
                <div
                  key={m.label}
                  className="pv-mgmt-card"
                  onClick={() => navigate(`/researcher/${m.path}`)}
                  style={{ cursor: "pointer" }}
                >
                  {m.icon}
                  <span className="pv-mgmt-name">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="pv-stats">
            <div className="pv-stat-card">
              <FileText size={22} color="#1f7a1f" />
              <div>
                <p className="pv-stat-label">Type</p>
                <p className="pv-stat-value">{project.type}</p>
              </div>
            </div>
            <div className="pv-stat-card">
              <DollarSign size={22} color="#1f7a1f" />
              <div>
                <p className="pv-stat-label">Budget</p>
                <p className="pv-stat-value">
                  {project.budget ? `₱${Number(project.budget).toLocaleString()}` : "—"}
                </p>
              </div>
            </div>
            <div className="pv-stat-card">
              <Calendar size={22} color="#1f7a1f" />
              <div>
                <p className="pv-stat-label">Start Date</p>
                <p className="pv-stat-value">{project.start_date ? new Date(project.start_date).toLocaleDateString() : "—"}</p>
              </div>
            </div>
            <div className="pv-stat-card">
              <Users size={22} color="#1f7a1f" />
              <div>
                <p className="pv-stat-label">Team Size</p>
                <p className="pv-stat-value">{project.proponents?.length || 0} members</p>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="cp-tab-bar" style={{ marginBottom: 16 }}>
            {VIEW_TABS.map((tab) => (
              <button
                key={tab}
                className={`cp-tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "Overview" && (
            <>
              <div className="cp-section">
                <div className="cp-section-title">Project Information</div>
                <div className="pv-info-grid">
                  <div>
                    <p className="pv-info-label">Reference No</p>
                    <p className="pv-info-value">{project.reference_no}</p>
                  </div>
                  <div>
                    <p className="pv-info-label">Category</p>
                    <p className="pv-info-value">{project.category || "—"}</p>
                  </div>
                  <div>
                    <p className="pv-info-label">Site / Area</p>
                    <p className="pv-info-value">{project.site_area || "—"}</p>
                  </div>
                  <div>
                    <p className="pv-info-label">End Date</p>
                    <p className="pv-info-value">{project.end_date ? new Date(project.end_date).toLocaleDateString() : "—"}</p>
                  </div>
                </div>
              </div>

              {project.nature_and_significance && (
                <div className="cp-section">
                  <div className="cp-section-title">Nature and Significance</div>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                    {project.nature_and_significance}
                  </p>
                </div>
              )}

              {project.methodology && (
                <div className="cp-section">
                  <div className="cp-section-title">Methodology</div>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                    {project.methodology}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Team Tab */}
          {activeTab === "Team" && (
            <div className="cp-section">
              <div className="cp-section-title">Team Members</div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.proponents?.map((p, i) => (
                      <tr key={i}>
                        <td>
                          <div className="name-cell">
                            <div className="avatar">{p.personnel?.name?.charAt(0)}</div>
                            {p.personnel?.name}
                          </div>
                        </td>
                        <td>{p.personnel?.email}</td>
                        <td>{p.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}