import { useState } from "react";
import { ChevronDown, FileText, Clock, CheckCircle2, TrendingUp, Activity } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";

const PROJECTS = [
  { id: "PRJ-001", title: "Climate Change Impact on Coastal Ecosystems",       investigator: "Dr. Sarah Johnson",  submittedDate: "2026-01-15", currentStatus: "Approved",         processingDays: 74, statusChanges: 7, evaluationScore: "95/100" },
  { id: "PRJ-002", title: "AI-Driven Healthcare Diagnosis System",              investigator: "Prof. Michael Chen",  submittedDate: "2026-02-10", currentStatus: "Under Evaluation", processingDays: 45, statusChanges: 4, evaluationScore: "—" },
  { id: "PRJ-003", title: "Sustainable Agriculture Practices in Arid Regions",  investigator: "Dr. Emily Rodriguez", submittedDate: "2026-01-20", currentStatus: "In Progress",      processingDays: 60, statusChanges: 5, evaluationScore: "88/100" },
  { id: "PRJ-004", title: "Quantum Computing for Cryptography",                 investigator: "Dr. James Anderson",  submittedDate: "2026-03-01", currentStatus: "Submitted",        processingDays: 20, statusChanges: 2, evaluationScore: "—" },
  { id: "PRJ-005", title: "Urban Planning and Smart City Infrastructure",       investigator: "Prof. Lisa Martinez",  submittedDate: "2026-03-15", currentStatus: "Draft",           processingDays: 5,  statusChanges: 1, evaluationScore: "—" },
];

const HISTORY_DATA = {
  "PRJ-001": [
    { status: "Created",          label: "Created",          title: "Project proposal created and saved as draft",        actionBy: "Dr. Sarah Johnson",   date: "2026-01-10", time: "09:00 AM", icon: "doc",     color: "#6b7280" },
    { status: "Submitted",        label: "Submitted",        title: "Proposal submitted for review",                       actionBy: "Dr. Sarah Johnson",   date: "2026-01-15", time: "02:30 PM", icon: "clock",   color: "#d97706" },
    { status: "Under Review",     label: "Under Review",     title: "Department Head review initiated",                    actionBy: "Dr. Patricia Brown",  date: "2026-01-20", time: "10:15 AM", icon: "clock",   color: "#d97706" },
    { status: "Evaluated",        label: "Evaluated",        title: "Evaluation completed with score 95/100",              actionBy: "Dr. Karen Smith",     date: "2026-02-15", time: "03:45 PM", icon: "trend",   color: "#7c3aed" },
    { status: "Approved - Level 1",label: "Approved - Level 1", title: "Department Head approval granted",               actionBy: "Dr. Patricia Brown",  date: "2026-02-20", time: "11:00 AM", icon: "check",   color: "#15803d" },
    { status: "Approved - Level 2",label: "Approved - Level 2", title: "Dean of Research approval granted",              actionBy: "Prof. Richard Taylor", date: "2026-03-10", time: "04:20 PM", icon: "check",   color: "#15803d" },
    { status: "Approved - Final", label: "Approved - Final", title: "Research Director final approval - Budget allocated", actionBy: "Dr. Robert Williams", date: "2026-03-25", time: "02:15 PM", icon: "check",   color: "#15803d" },
  ],
  "PRJ-002": [
    { status: "Created",    label: "Created",    title: "Project proposal created and saved as draft", actionBy: "Prof. Michael Chen",  date: "2026-02-05", time: "10:00 AM", icon: "doc",   color: "#6b7280" },
    { status: "Submitted",  label: "Submitted",  title: "Proposal submitted for review",               actionBy: "Prof. Michael Chen",  date: "2026-02-10", time: "09:30 AM", icon: "clock", color: "#d97706" },
    { status: "Under Review",label: "Under Review",title: "Department review initiated",               actionBy: "Dr. Patricia Brown",  date: "2026-02-20", time: "11:00 AM", icon: "clock", color: "#d97706" },
    { status: "Evaluated",  label: "Evaluated",  title: "Under evaluation by committee",               actionBy: "Dr. Karen Smith",     date: "2026-03-01", time: "02:00 PM", icon: "trend", color: "#7c3aed" },
  ],
};

const STATUS_BADGE_STYLES = {
  "Approved":           { bg: "#dcfce7", color: "#15803d" },
  "Under Evaluation":   { bg: "#ede9fe", color: "#6d28d9" },
  "In Progress":        { bg: "#d1fae5", color: "#065f46" },
  "Submitted":          { bg: "#e0f2fe", color: "#0369a1" },
  "Draft":              { bg: "#f3f4f6", color: "#6b7280" },
};

const HISTORY_BADGE_STYLES = {
  "Created":             { bg: "#f3f4f6", color: "#6b7280" },
  "Submitted":           { bg: "#fef3c7", color: "#d97706" },
  "Under Review":        { bg: "#fef3c7", color: "#d97706" },
  "Evaluated":           { bg: "#f5f3ff", color: "#7c3aed" },
  "Approved - Level 1":  { bg: "#dcfce7", color: "#15803d" },
  "Approved - Level 2":  { bg: "#dcfce7", color: "#15803d" },
  "Approved - Final":    { bg: "#dcfce7", color: "#15803d" },
};

function TimelineIcon({ type, color }) {
  const style = {
    width: 36, height: 36, borderRadius: "50%",
    border: `2px solid ${color}`,
    background: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  };
  if (type === "doc")   return <div style={style}><FileText size={16} color={color} /></div>;
  if (type === "clock") return <div style={style}><Clock size={16} color={color} /></div>;
  if (type === "trend") return <div style={style}><TrendingUp size={16} color={color} /></div>;
  if (type === "check") return <div style={style}><CheckCircle2 size={16} color={color} /></div>;
  return <div style={style}><Activity size={16} color={color} /></div>;
}

export default function StatusTracking() {
  const [selectedId, setSelectedId] = useState("PRJ-001");

  const project = PROJECTS.find((p) => p.id === selectedId) || PROJECTS[0];
  const history = HISTORY_DATA[selectedId] || HISTORY_DATA["PRJ-001"];
  const statusStyle = STATUS_BADGE_STYLES[project.currentStatus] || STATUS_BADGE_STYLES["Draft"];

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Status Tracking" />
        <div className="dashboard-content">

          {/* Page Title */}
          <div style={{ marginBottom: 20 }}>
            <h2 className="page-title">Proposal Status Tracking</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              View detailed status history and timeline
            </p>
          </div>

          {/* Project Selector */}
          <div className="cp-section" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
                Select Project:
              </label>
              <div className="cp-select-wrap" style={{ flex: 1 }}>
                <select
                  className="cp-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  style={{ fontSize: 14, padding: "10px 36px 10px 14px" }}
                >
                  {PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.title}
                    </option>
                  ))}
                </select>
                <span className="cp-select-chevron"><ChevronDown size={14} /></span>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="cp-section" style={{ marginBottom: 16 }}>
            <div className="cp-section-title">Current Status</div>
            <div className="st-current-grid">
              <div>
                <p className="st-info-label">Project ID</p>
                <p className="st-info-value">{project.id}</p>
              </div>
              <div>
                <p className="st-info-label">Current Status</p>
                <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color, marginTop: 4, display: "inline-block" }}>
                  {project.currentStatus}
                </span>
              </div>
              <div>
                <p className="st-info-label">Principal Investigator</p>
                <p className="st-info-value">{project.investigator}</p>
              </div>
              <div>
                <p className="st-info-label">Submitted Date</p>
                <p className="st-info-value">{project.submittedDate}</p>
              </div>
            </div>
          </div>

          {/* Status History Timeline */}
          <div className="cp-section" style={{ marginBottom: 16 }}>
            <div className="cp-section-title">Status History Timeline</div>

            <div className="st-timeline">
              {history.map((item, i) => {
                const hb = HISTORY_BADGE_STYLES[item.status] || { bg: "#f3f4f6", color: "#6b7280" };
                return (
                  <div key={i} className="st-timeline-row">
                    {/* Left: icon + vertical line */}
                    <div className="st-timeline-left">
                      <TimelineIcon type={item.icon} color={item.color} />
                      {i < history.length - 1 && <div className="st-timeline-line" />}
                    </div>

                    {/* Right: card */}
                    <div className="st-timeline-card">
                      <div className="st-card-top">
                        <span className="badge" style={{ background: hb.bg, color: hb.color }}>
                          {item.label}
                        </span>
                        <span className="st-card-date">{item.date}<br />{item.time}</span>
                      </div>
                      <p className="st-card-title">{item.title}</p>
                      <p className="st-card-action">
                        Action by: <strong>{item.actionBy}</strong>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="st-stats">
            <div className="st-stat-card">
              <div className="st-stat-icon" style={{ background: "#f0fdf4" }}>
                <Clock size={22} color="#1f7a1f" />
              </div>
              <div>
                <p className="st-stat-value">{project.processingDays} days</p>
                <p className="st-stat-label">Total Processing Time</p>
              </div>
            </div>
            <div className="st-stat-card">
              <div className="st-stat-icon" style={{ background: "#eff6ff" }}>
                <CheckCircle2 size={22} color="#2563eb" />
              </div>
              <div>
                <p className="st-stat-value">{project.statusChanges}</p>
                <p className="st-stat-label">Status Changes</p>
              </div>
            </div>
            <div className="st-stat-card">
              <div className="st-stat-icon" style={{ background: "#fefce8" }}>
                <TrendingUp size={22} color="#d97706" />
              </div>
              <div>
                <p className="st-stat-value">{project.evaluationScore}</p>
                <p className="st-stat-label">Evaluation Score</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}