import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, DollarSign, GitBranch,
  BookOpen, BarChart2, FileText, Users, Pencil,
} from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";

// ─── Mock project data ─────────────────────────────────────────────────────
const PROJECT_DATA = {
  "PRJ-001": {
    id: "PRJ-001",
    title: "Climate Change Impact on Coastal Ecosystems",
    status: "Approved",
    type: "Basic Research",
    budget: "$450,000",
    duration: "24 months",
    teamSize: 4,
    investigator: "Dr. Sarah Johnson",
    department: "Environmental Science",
    site: "Coastal Region A",
    submittedDate: "2026-01-15",
    description:
      "This research project aims to investigate the impact of environmental factors on the designated area. The study will employ comprehensive methodologies to gather and analyze data, contributing to the advancement of knowledge in this field. Expected outcomes include publications, technical reports, and practical recommendations for stakeholders.",
    team: [
      { name: "Dr. Sarah Johnson",  role: "Principal Investigator", dept: "Environmental Science" },
      { name: "Dr. Mark Thompson",  role: "Co-Investigator",        dept: "Marine Biology" },
      { name: "Dr. Rachel Lee",     role: "Research Associate",     dept: "Environmental Science" },
      { name: "John Davis",         role: "Data Analyst",           dept: "Data Analytics" },
    ],
    budgetItems: [
      { category: "Personnel",   description: "Research Assistants (2 positions)", qty: 24, unitPrice: 3500 },
      { category: "Equipment",   description: "Laboratory Equipment Set",          qty: 1,  unitPrice: 125000 },
      { category: "Materials",   description: "Research Materials and Supplies",   qty: 24, unitPrice: 2500 },
      { category: "Travel",      description: "Field Research Travel",             qty: 12, unitPrice: 4500 },
      { category: "Services",    description: "Data Analysis Services",            qty: 1,  unitPrice: 35000 },
      { category: "Publication", description: "Journal Publication Fees",          qty: 3,  unitPrice: 2500 },
    ],
    schedule: [
      { phase: "Phase 1: Data Collection",   start: "2026-01-15", end: "2026-06-15", status: "Completed" },
      { phase: "Phase 2: Data Analysis",     start: "2026-06-16", end: "2026-10-15", status: "In Progress" },
      { phase: "Phase 3: Report Writing",    start: "2026-10-16", end: "2027-01-15", status: "Pending" },
      { phase: "Phase 4: Publication",       start: "2027-01-16", end: "2028-01-15", status: "Pending" },
    ],
  },
  "PRJ-002": {
    id: "PRJ-002",
    title: "AI-Driven Healthcare Diagnosis System",
    status: "Under Evaluation",
    type: "Applied Research",
    budget: "$320,000",
    duration: "18 months",
    teamSize: 3,
    investigator: "Prof. Michael Chen",
    department: "Computer Science",
    site: "University Lab B",
    submittedDate: "2026-02-10",
    description: "This project develops an AI-powered diagnostic system to improve healthcare outcomes through machine learning and data analysis.",
    team: [
      { name: "Prof. Michael Chen", role: "Principal Investigator", dept: "Computer Science" },
      { name: "Dr. Anna Wu",        role: "Co-Investigator",        dept: "Medicine" },
      { name: "Kevin Reyes",        role: "Research Associate",     dept: "Data Science" },
    ],
    budgetItems: [
      { category: "Personnel",  description: "Research Staff",         qty: 18, unitPrice: 5000 },
      { category: "Equipment",  description: "GPU Servers",            qty: 2,  unitPrice: 50000 },
      { category: "Services",   description: "Cloud Computing",        qty: 18, unitPrice: 3000 },
      { category: "Travel",     description: "Conference Attendance",  qty: 3,  unitPrice: 4000 },
    ],
    schedule: [
      { phase: "Phase 1: System Design",   start: "2026-02-10", end: "2026-05-10", status: "Completed" },
      { phase: "Phase 2: Development",     start: "2026-05-11", end: "2026-10-10", status: "In Progress" },
      { phase: "Phase 3: Testing",         start: "2026-10-11", end: "2027-02-10", status: "Pending" },
    ],
  },
};

// Fallback for projects without full mock data
const buildFallback = (id, projects) => {
  const found = projects?.find((p) => p.id === id);
  if (!found) return null;
  return {
    ...found,
    teamSize: 3,
    investigator: found.leader,
    site: "University Campus",
    submittedDate: "2026-01-01",
    description: "This research project aims to investigate and contribute to the advancement of knowledge in this field.",
    team: [{ name: found.leader, role: "Principal Investigator", dept: found.department }],
    budgetItems: [],
    schedule: [],
  };
};

const STATUS_COLORS = {
  "Approved":         { bg: "#dcfce7", color: "#15803d" },
  "Under Evaluation": { bg: "#ede9fe", color: "#6d28d9" },
  "In Progress":      { bg: "#d1fae5", color: "#065f46" },
  "Submitted":        { bg: "#e0f2fe", color: "#0369a1" },
  "Draft":            { bg: "#f3f4f6", color: "#6b7280" },
};

const CATEGORY_COLORS = {
  Personnel:   { bg: "#f0fdf4", color: "#15803d" },
  Equipment:   { bg: "#eff6ff", color: "#1d4ed8" },
  Materials:   { bg: "#fefce8", color: "#a16207" },
  Travel:      { bg: "#fff7ed", color: "#c2410c" },
  Services:    { bg: "#f5f3ff", color: "#6d28d9" },
  Publication: { bg: "#fdf2f8", color: "#9d174d" },
};

const SCHEDULE_COLORS = {
  Completed:   { bg: "#dcfce7", color: "#15803d" },
  "In Progress": { bg: "#dbeafe", color: "#1d4ed8" },
  Pending:     { bg: "#f3f4f6", color: "#6b7280" },
};

const VIEW_TABS = ["Overview", "Team", "Budget", "Schedule"];

const MGMT_LINKS = [
  { label: "Work Plan",    icon: <Calendar size={22} color="#1f7a1f" /> },
  { label: "Budget Plan",  icon: <DollarSign size={22} color="#1f7a1f" /> },
  { label: "Framework",    icon: <GitBranch size={22} color="#1f7a1f" /> },
  { label: "References",   icon: <BookOpen size={22} color="#1f7a1f" /> },
  { label: "Outputs",      icon: <BarChart2 size={22} color="#1f7a1f" /> },
];

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  const project = PROJECT_DATA[id] || buildFallback(id, []);

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
  const fmt = (n) => "$" + n.toLocaleString();
  const total = project.budgetItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Research Projects" />

        <div className="dashboard-content">

          {/* ── Header ── */}
          <div className="pv-header">
            <div className="pv-header-left">
              <button className="pv-back-btn" onClick={() => navigate("/researcher/projects")}>
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="pv-title-row">
                  <h2 className="pv-title">{project.title}</h2>
                  <span
                    className="badge"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="pv-id">{project.id}</p>
              </div>
            </div>
            <button className="create-btn">
              <Pencil size={15} /> Edit Project
            </button>
          </div>

          {/* ── Project Management Cards ── */}
          <div className="pv-mgmt-box">
            <p className="pv-mgmt-label">Project Management</p>
            <div className="pv-mgmt-cards">
              {MGMT_LINKS.map((m) => (
                <div key={m.label} className="pv-mgmt-card">
                  {m.icon}
                  <span className="pv-mgmt-name">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Stat Cards ── */}
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
                <p className="pv-stat-value">{project.budget}</p>
              </div>
            </div>
            <div className="pv-stat-card">
              <Calendar size={22} color="#1f7a1f" />
              <div>
                <p className="pv-stat-label">Duration</p>
                <p className="pv-stat-value">{project.duration}</p>
              </div>
            </div>
            <div className="pv-stat-card">
              <Users size={22} color="#1f7a1f" />
              <div>
                <p className="pv-stat-label">Team Size</p>
                <p className="pv-stat-value">{project.teamSize} members</p>
              </div>
            </div>
          </div>

          {/* ── Tab Bar ── */}
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

          {/* ── Tab Content ── */}
          {activeTab === "Overview" && (
            <>
              <div className="cp-section">
                <div className="cp-section-title">Project Information</div>
                <div className="pv-info-grid">
                  <div>
                    <p className="pv-info-label">Principal Investigator</p>
                    <p className="pv-info-value">{project.investigator}</p>
                  </div>
                  <div>
                    <p className="pv-info-label">Department</p>
                    <p className="pv-info-value">{project.department}</p>
                  </div>
                  <div>
                    <p className="pv-info-label">Research Site</p>
                    <p className="pv-info-value">{project.site}</p>
                  </div>
                  <div>
                    <p className="pv-info-label">Submitted Date</p>
                    <p className="pv-info-value">{project.submittedDate}</p>
                  </div>
                </div>
              </div>

              <div className="cp-section">
                <div className="cp-section-title">Project Description</div>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                  {project.description}
                </p>
              </div>
            </>
          )}

          {activeTab === "Team" && (
            <div className="cp-section">
              <div className="cp-section-title">Team Members</div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.team.map((m, i) => (
                      <tr key={i}>
                        <td>
                          <div className="name-cell">
                            <div className="avatar">
                              {m.name.charAt(0)}
                            </div>
                            {m.name}
                          </div>
                        </td>
                        <td>{m.role}</td>
                        <td>{m.dept}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "Budget" && (
            <div className="cp-section">
              <div className="cp-section-title">Budget Breakdown</div>
              {project.budgetItems.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: 14 }}>No budget items available.</p>
              ) : (
                <div className="table-scroll">
                  <table className="cp-budget-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Item Description</th>
                        <th style={{ textAlign: "right" }}>Quantity</th>
                        <th style={{ textAlign: "right" }}>Unit Price</th>
                        <th style={{ textAlign: "right" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.budgetItems.map((item, i) => {
                        const c = CATEGORY_COLORS[item.category] || { bg: "#f3f4f6", color: "#374151" };
                        return (
                          <tr key={i}>
                            <td>
                              <span className="cp-cat-badge" style={{ background: c.bg, color: c.color }}>
                                {item.category}
                              </span>
                            </td>
                            <td>{item.description}</td>
                            <td style={{ textAlign: "right" }}>{item.qty}</td>
                            <td style={{ textAlign: "right" }}>{fmt(item.unitPrice)}</td>
                            <td style={{ textAlign: "right", fontWeight: 600 }}>
                              {fmt(item.qty * item.unitPrice)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="cp-total-row">
                        <td colSpan={4} style={{ textAlign: "right", fontWeight: 600, color: "#374151" }}>
                          Total Budget:
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#1f7a1f" }}>
                          {fmt(total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "Schedule" && (
            <div className="cp-section">
              <div className="cp-section-title">Project Schedule</div>
              {project.schedule.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: 14 }}>No schedule available.</p>
              ) : (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Phase</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.schedule.map((s, i) => {
                        const sc = SCHEDULE_COLORS[s.status] || SCHEDULE_COLORS["Pending"];
                        return (
                          <tr key={i}>
                            <td><strong>{s.phase}</strong></td>
                            <td>{s.start}</td>
                            <td>{s.end}</td>
                            <td>
                              <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}