import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, GitBranch, BookOpen,
  FileText, Users, Clock, ChevronRight,
  Layers, X, Download, ExternalLink, Eye,
  AlertCircle,
} from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import api from "../../utils/api";

/* ── status config ───────────────────────────────────────── */
const STATUS_CFG = {
  "Approved":         { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", dot: "#15803d" },
  "Under Evaluation": { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe", dot: "#7c3aed" },
  "In Progress":      { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0", dot: "#059669" },
  "Submitted":        { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd", dot: "#0284c7" },
  "Draft":            { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb", dot: "#9ca3af" },
};

const VIEW_TABS = ["Overview", "Team"];

/* ── document definitions (no budget) ───────────────────── */
const DOCS = [
  {
    key:       "proposal_form",
    label:     "Proposal Form",
    icon:      FileText,
    color:     "#eff6ff",
    iconColor: "#1d4ed8",
    desc:      "Signed project proposal form",
    multi:     false,
  },
  {
    key:       "cv_files",
    label:     "CV of Proponents",
    icon:      Users,
    color:     "#fef9c3",
    iconColor: "#a16207",
    desc:      "Curriculum vitae of all proponents",
    multi:     true,   // ← supports multiple files
  },
  {
    key:       "work_plan_file",
    label:     "Work Plan",
    icon:      Calendar,
    color:     "#dcfce7",
    iconColor: "#15803d",
    desc:      "Detailed activities, timelines, responsibilities and milestones",
    multi:     false,
  },
  {
    key:       "framework_file",
    label:     "Framework",
    icon:      GitBranch,
    color:     "#f5f3ff",
    iconColor: "#7c3aed",
    desc:      "Research objectives, methodology, success indicators and risks",
    multi:     false,
  },
  {
    key:       "references_file",
    label:     "References",
    icon:      BookOpen,
    color:     "#fff7ed",
    iconColor: "#c2410c",
    desc:      "References and citations in proper academic format",
    multi:     false,
  },
];

/* ── helpers ─────────────────────────────────────────────── */
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—";
const fmtBudget = (b) => b ? `₱${Number(b).toLocaleString()}` : "—";
const isPDF     = (url) => typeof url === "string" && url.toLowerCase().includes(".pdf");

/* ══════════════════════════════════════════════════════════
   DOCUMENT VIEWER MODAL
══════════════════════════════════════════════════════════ */
function DocModal({ doc, fileUrls, onClose }) {
  const Icon = doc.icon;
  // normalise to always an array
  const files = Array.isArray(fileUrls)
    ? fileUrls.filter(Boolean)
    : fileUrls ? [fileUrls] : [];
  const hasFiles   = files.length > 0;
  const [active, setActive] = useState(0);
  const activeUrl  = files[active] || null;
  const canPreview = isPDF(activeUrl) || (typeof activeUrl === "string" && activeUrl.startsWith("http"));

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div style={{
        background: "#fff", borderRadius: 16, width: "100%",
        maxWidth: (hasFiles && canPreview) ? 900 : 520,
        maxHeight: "92vh",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 22px", borderBottom: "1px solid #f1f5f9", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: doc.color,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={18} color={doc.iconColor} strokeWidth={1.8} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{doc.label}</h3>
              <p  style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                {doc.desc}{files.length > 1 ? ` · ${files.length} files` : ""}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {activeUrl && (
              <a href={activeUrl} target="_blank" rel="noreferrer" download
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                  borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb",
                  fontSize: 13, fontWeight: 500, color: "#374151", textDecoration: "none" }}>
                <Download size={14} /> Download
              </a>
            )}
            {activeUrl && canPreview && (
              <a href={activeUrl} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                  borderRadius: 8, border: "none", background: "#1f7a1f",
                  fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none" }}>
                <ExternalLink size={14} /> Open
              </a>
            )}
            <button onClick={onClose}
              style={{ background: "#f3f4f6", border: "none", borderRadius: 8,
                cursor: "pointer", padding: 7, display: "flex", color: "#374151" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Multiple file tabs (only shown when > 1 file) */}
        {files.length > 1 && (
          <div style={{ display: "flex", gap: 4, padding: "10px 22px",
            borderBottom: "1px solid #f1f5f9", overflowX: "auto", flexShrink: 0, background: "#fafafa" }}>
            {files.map((url, i) => {
              const name = url.split("/").pop() || `File ${i + 1}`;
              return (
                <button key={i} onClick={() => setActive(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: active === i ? 600 : 400, whiteSpace: "nowrap",
                    background: active === i ? doc.color : "transparent",
                    color: active === i ? doc.iconColor : "#6b7280",
                  }}>
                  <FileText size={13} />
                  {name.length > 24 ? name.slice(0, 22) + "…" : name}
                </button>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", background: "#f8fafc" }}>
          {!hasFiles ? (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f3f4f6",
                margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertCircle size={28} color="#9ca3af" />
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#374151" }}>No file uploaded yet</p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#9ca3af" }}>
                The {doc.label.toLowerCase()} has not been attached to this proposal.
              </p>
            </div>
          ) : canPreview ? (
            <iframe src={activeUrl} title={doc.label}
              style={{ width: "100%", height: "70vh", border: "none", display: "block" }} />
          ) : (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: doc.color,
                margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={28} color={doc.iconColor} />
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#374151" }}>File attached</p>
              <p style={{ margin: "6px 0 20px", fontSize: 13, color: "#9ca3af" }}>
                This file type cannot be previewed. Download it to open.
              </p>
              <a href={activeUrl} download target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 22px",
                  borderRadius: 9, background: "#1f7a1f", color: "#fff",
                  fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                <Download size={16} /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DOCUMENT CARD
══════════════════════════════════════════════════════════ */
function DocCard({ doc, fileUrls, onClick }) {
  const Icon    = doc.icon;
  const files   = Array.isArray(fileUrls) ? fileUrls.filter(Boolean) : fileUrls ? [fileUrls] : [];
  const hasFile = files.length > 0;
  const count   = files.length;

  return (
    <div onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 16px", borderRadius: 10, cursor: "pointer",
        border: `1.5px solid ${hasFile ? doc.iconColor + "30" : "#e5e7eb"}`,
        background: hasFile ? doc.color + "22" : "#fafafa",
        transition: "all 0.13s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = doc.iconColor; e.currentTarget.style.background = doc.color + "44"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = hasFile ? doc.iconColor + "30" : "#e5e7eb"; e.currentTarget.style.background = hasFile ? doc.color + "22" : "#fafafa"; }}
    >
      {/* Icon box */}
      <div style={{ width: 36, height: 36, borderRadius: 9, background: doc.color, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color={doc.iconColor} strokeWidth={1.8} />
      </div>

      {/* Label + desc */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>
          {doc.label}
          {count > 1 && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 500, color: doc.iconColor, background: doc.color, padding: "1px 7px", borderRadius: 20 }}>{count} files</span>}
        </p>
        <p style={{ margin: "1px 0 0", fontSize: 11, color: "#9ca3af" }}>{doc.desc}</p>
      </div>

      {/* Status + action */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: hasFile ? "#15803d" : "#d1d5db" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: hasFile ? doc.iconColor : "#9ca3af",
          display: "flex", alignItems: "center", gap: 4 }}>
          {hasFile ? <><Eye size={13} /> View</> : "Not uploaded"}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════ */
function StatCard({ icon: Icon, label, value, iconColor = "#1f7a1f", bg = "#f0fdf4" }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
      padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={20} color={iconColor} strokeWidth={1.8} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 700, color: "#111827" }}>{value}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INFO ROW
══════════════════════════════════════════════════════════ */
function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{value || "—"}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
export default function ProjectView() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [project,   setProject]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [openDoc,   setOpenDoc]   = useState(null); // { doc, fileUrl }

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(res => setProject(res.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Loading ── */
  if (loading) return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Research Projects" />
        <div className="dashboard-content">
          <p style={{ color: "#9ca3af" }}>Loading project…</p>
        </div>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (!project) return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Research Projects" />
        <div className="dashboard-content">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <FileText size={48} color="#d1d5db" style={{ margin: "0 auto 12px", display: "block" }} />
            <p style={{ color: "#6b7280", fontSize: 15 }}>Project not found.</p>
            <button onClick={() => navigate("/researcher/projects")}
              style={{ marginTop: 12, padding: "8px 20px", borderRadius: 8, border: "none",
                background: "#1f7a1f", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const sc = STATUS_CFG[project.status] || STATUS_CFG["Draft"];

  /* map doc keys to file URLs — cv_files returns array, others single */
  const getFileUrls = (doc) => {
    const val = project[doc.key] || project.files?.[doc.key] || null;
    if (doc.multi) {
      // could be array already, or a comma-separated string, or a single URL
      if (Array.isArray(val))            return val.filter(Boolean);
      if (typeof val === "string" && val) return val.split(",").map(s => s.trim()).filter(Boolean);
      return [];
    }
    return val ? [val] : [];
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Research Projects" />
        <div className="dashboard-content">

          {/* ── Hero header ── */}
          <div style={{
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
            padding: "22px 24px", marginBottom: 20,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            {/* Back + breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <button onClick={() => navigate("/researcher/projects")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#f3f4f6", border: "none", borderRadius: 8,
                  padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#374151", fontWeight: 500,
                }}>
                <ArrowLeft size={15} /> Back
              </button>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>
                Research Projects
                <ChevronRight size={13} color="#9ca3af" style={{ verticalAlign: "middle", margin: "0 2px" }} />
                {project.reference_no}
              </span>
            </div>

            {/* Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                    {project.status}
                  </span>
                  <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>{project.reference_no}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.35 }}>
                  {project.title}
                </h2>
                {project.type && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
                    <Layers size={13} color="#9ca3af" />
                    <span style={{ fontSize: 13, color: "#6b7280" }}>{project.type}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div className="pv-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
            <StatCard icon={FileText} label="Proposed Budget"  value={fmtBudget(project.budget)}   iconColor="#0369a1" bg="#e0f2fe" />
            <StatCard icon={Calendar} label="Start Date"       value={fmtDate(project.start_date)} iconColor="#15803d" bg="#dcfce7" />
            <StatCard icon={Clock}    label="End Date"         value={fmtDate(project.end_date)}   iconColor="#c2410c" bg="#fff7ed" />
            <StatCard icon={Users}    label="Proponents"
              value={`${project.proponents?.length || 0} member${project.proponents?.length !== 1 ? "s" : ""}`}
              iconColor="#7c3aed" bg="#f5f3ff" />
          </div>

          {/* ── Tab bar ── */}
          <div className="cp-tab-bar" style={{ marginBottom: 16 }}>
            {VIEW_TABS.map((tab) => (
              <button key={tab} className={`cp-tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {/* ══ OVERVIEW TAB ══ */}
          {activeTab === "Overview" && (
            <div className="cp-section">
              <div className="cp-section-title">Project Information</div>
              <div className="pv-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "18px 28px" }}>
                <InfoRow label="Reference No" value={project.reference_no} />
                <InfoRow label="Type"         value={project.type} />
                <InfoRow label="Category"     value={project.category} />
                <InfoRow label="Site / Area"  value={project.site_area} />
                <InfoRow label="Start Date"   value={fmtDate(project.start_date)} />
                <InfoRow label="End Date"     value={fmtDate(project.end_date)} />
              </div>
            </div>
          )}

          {/* ══ TEAM TAB ══ */}
          {activeTab === "Team" && (
            <div className="cp-section">
              <div className="cp-section-title">Project Proponents</div>
              {(!project.proponents || project.proponents.length === 0) ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Users size={36} color="#d1d5db" style={{ margin: "0 auto 10px", display: "block" }} />
                  <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>No team members added yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {project.proponents.map((p, i) => {
                    const name     = p.personnel?.name || p.name || "Unknown";
                    const email    = p.personnel?.email || p.email || "—";
                    const role     = p.role || "Proponent";
                    const isLeader = role.toLowerCase().includes("leader") || i === 0;
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px", borderRadius: 12,
                        border: `1.5px solid ${isLeader ? "#bbf7d0" : "#e5e7eb"}`,
                        background: isLeader ? "#f0fdf4" : "#fafafa",
                      }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: "50%",
                          background: isLeader ? "#15803d" : "#e5e7eb",
                          color: isLeader ? "#fff" : "#6b7280",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 16, flexShrink: 0,
                        }}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>{name}</p>
                            {isLeader && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
                                Project Leader
                              </span>
                            )}
                          </div>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{email}</p>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#374151", background: "#f3f4f6", padding: "4px 12px", borderRadius: 20, border: "1px solid #e5e7eb", flexShrink: 0 }}>
                          {role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Project Documents ── */}
          <div style={{
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
            padding: "20px 22px", marginBottom: 20,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Project Documents
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>
                Click a row to view or download the document
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DOCS.map((doc) => {
                const fileUrls = getFileUrls(doc);
                return (
                  <DocCard
                    key={doc.key}
                    doc={doc}
                    fileUrls={fileUrls}
                    onClick={() => setOpenDoc({ doc, fileUrls })}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
              {[
                { color: "#15803d", label: "File uploaded" },
                { color: "#d1d5db", label: "Not yet uploaded" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Document Viewer Modal ── */}
      {openDoc && (
        <DocModal
          doc={openDoc.doc}
          fileUrls={openDoc.fileUrls}
          onClose={() => setOpenDoc(null)}
        />
      )}

      <style>{`
        @media (max-width: 1000px) { .pv-stat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px)  { .pv-stat-grid { grid-template-columns: 1fr !important; } .pv-info-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </div>
  );
}