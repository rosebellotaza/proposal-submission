// src/pages/admin/Projects.jsx
import { useEffect, useState } from "react";
import AdminNavbar from "../../components/admin/navbar";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import {
  Search,
  ChevronDown,
  FolderOpen,
  Eye,
  X,
  User,
  Calendar,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const STATUS_STYLE = {
  Submitted: { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" },
  "Presentation Scheduled": { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  "Under Evaluation": { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe" },
  Evaluated: { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
  Endorsed: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  Recommended: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  Forwarded: { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" },
  Approved: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  "In Progress": { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
  Rejected: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  "For Revision": { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
};

const PROJECT_STATUSES = [
  "Submitted",
  "Presentation Scheduled",
  "Under Evaluation",
  "Evaluated",
  "Endorsed",
  "Recommended",
  "Forwarded",
  "Approved",
  "In Progress",
  "Rejected",
  "For Revision",
];

const fmtMoney = (value) => {
  const amount = Number(value || 0);
  if (!amount) return "—";
  return `₱${amount.toLocaleString()}`;
};

const fmtDate = (date) => {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
};

const getReference = (project) => {
  return project?.reference_no || project?.project_id || `PRJ-${project?.id}`;
};

const getResearcherName = (project) => {
  return (
    project?.creator?.name ||
    project?.researcher ||
    project?.created_by_name ||
    "—"
  );
};

const getDepartment = (project) => {
  return (
    project?.department_center?.name ||
    project?.departmentCenter?.name ||
    project?.department ||
    project?.creator?.department ||
    "—"
  );
};

const getType = (project) => {
  return project?.type || project?.scholarly_work_type || "—";
};

const getBudget = (project) => {
  return project?.budget || project?.total_budget || 0;
};

function InfoRow({ icon, label, value }) {
  return (
    <div>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        {icon}
        {label}
      </p>

      <p
        style={{
          margin: "4px 0 0",
          fontSize: 14,
          fontWeight: 600,
          color: "#111827",
          lineHeight: 1.4,
        }}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function DetailModal({ project, onClose }) {
  const status = project?.status || "Submitted";
  const style = STATUS_STYLE[status] || STATUS_STYLE.Submitted;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 620,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "20px 24px 16px",
            borderBottom: "1px solid #f1f5f9",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              {getReference(project)}
            </p>

            <h2
              style={{
                margin: "4px 0 0",
                fontSize: 18,
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.3,
              }}
            >
              {project?.title || "Untitled Project"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              padding: 7,
              display: "flex",
              color: "#374151",
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "20px 24px 24px" }}>
          <div style={{ marginBottom: 18 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 20,
                background: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={14} />
              {status}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px 24px",
              marginBottom: 22,
            }}
          >
            <InfoRow
              icon={<User size={14} />}
              label="Researcher"
              value={getResearcherName(project)}
            />
            <InfoRow
              icon={<BookOpen size={14} />}
              label="Department"
              value={getDepartment(project)}
            />
            <InfoRow
              icon={<FileText size={14} />}
              label="Type"
              value={getType(project)}
            />
            <InfoRow
              icon={<Calendar size={14} />}
              label="Start Date"
              value={fmtDate(project?.start_date)}
            />
            <InfoRow
              icon={<Calendar size={14} />}
              label="End Date"
              value={fmtDate(project?.end_date)}
            />
            <InfoRow
              icon={<Calendar size={14} />}
              label="Submitted Date"
              value={fmtDate(project?.submitted_at || project?.created_at)}
            />
          </div>

          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 20,
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 12,
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Budget
            </p>

            <p
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              {fmtMoney(getBudget(project))}
            </p>
          </div>

          <div>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 12,
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Description
            </p>

            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "#374151",
                lineHeight: 1.6,
              }}
            >
              {project?.description ||
                project?.abstract ||
                "No description available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();

    const next = projects.filter((project) => {
      const status = project.status || "Submitted";

      const matchesSearch =
        project.title?.toLowerCase().includes(q) ||
        getReference(project)?.toLowerCase().includes(q) ||
        getResearcherName(project)?.toLowerCase().includes(q) ||
        getDepartment(project)?.toLowerCase().includes(q) ||
        getType(project)?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All Status" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFiltered(next);
  }, [search, statusFilter, projects]);

  const fetchProjects = async () => {
    setLoading(true);

    try {
      const res = await api.get("/admin/proposals");
      const all = Array.isArray(res.data) ? res.data : [];

      const data = all.filter((project) =>
        PROJECT_STATUSES.includes(project.status)
      );

      setProjects(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      setProjects([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const ml = isMobile ? 0 : sidebarWidth;

  const totalBudget = projects.reduce(
    (sum, project) => sum + Number(getBudget(project) || 0),
    0
  );

  const approvedCount = projects.filter(
    (project) => project.status === "Approved"
  ).length;

  const submittedCount = projects.filter(
    (project) => project.status === "Submitted"
  ).length;

  const inProgressCount = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  return (
    <>
      <style>{`
        .admin-project-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }

        .admin-project-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .admin-filter-bar {
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: 12px;
          margin-bottom: 18px;
        }

        .admin-search-box {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .admin-search-box input {
          flex: 1;
          border: none;
          outline: none;
          padding: 12px 0;
          font-size: 14px;
          color: #111827;
          background: transparent;
        }

        .admin-select-wrap {
          position: relative;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .admin-select-wrap select {
          width: 100%;
          appearance: none;
          border: none;
          outline: none;
          background: transparent;
          padding: 12px 38px 12px 14px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .admin-select-wrap svg {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .admin-table-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .admin-table-scroll {
          overflow-x: auto;
        }

        .admin-project-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-project-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 800;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          white-space: nowrap;
        }

        .admin-project-table td {
          padding: 14px 16px;
          font-size: 13px;
          color: #374151;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .admin-project-table tr:last-child td {
          border-bottom: none;
        }

        .admin-project-table tr:hover td {
          background: #fafafa;
        }

        @media (max-width: 1100px) {
          .admin-project-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 760px) {
          .admin-project-grid,
          .admin-filter-bar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f3f4f6",
        }}
      >
        <AdminNavbar onWidthChange={setSidebarWidth} />

        <div
          style={{
            marginLeft: ml,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            transition: "margin-left 0.22s ease",
            minWidth: 0,
          }}
        >
          <Topbar title="Projects Management" />

          <div style={{ padding: "24px", flex: 1 }}>
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  margin: "4px 0 0",
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                Monitor submitted proposals, approved projects, and active
                research projects
              </h3>
            </div>

            <div className="admin-project-grid">
              <div className="admin-project-card">
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#6b7280",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Total Records
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {loading ? "—" : projects.length}
                </p>
              </div>

              <div className="admin-project-card">
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#6b7280",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Submitted
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#0369a1",
                  }}
                >
                  {loading ? "—" : submittedCount}
                </p>
              </div>

              <div className="admin-project-card">
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#6b7280",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Approved
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#15803d",
                  }}
                >
                  {loading ? "—" : approvedCount}
                </p>
              </div>

              <div className="admin-project-card">
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#6b7280",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Total Budget
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {loading ? "—" : fmtMoney(totalBudget)}
                </p>
              </div>
            </div>

            <div className="admin-filter-bar">
              <div className="admin-search-box">
                <Search size={18} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search by title, reference number, researcher, department, or type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="admin-select-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Submitted</option>
                  <option>Presentation Scheduled</option>
                  <option>Under Evaluation</option>
                  <option>Evaluated</option>
                  <option>Endorsed</option>
                  <option>Recommended</option>
                  <option>Forwarded</option>
                  <option>Approved</option>
                  <option>In Progress</option>
                  <option>Rejected</option>
                  <option>For Revision</option>
                </select>
                <ChevronDown size={15} color="#6b7280" />
              </div>
            </div>

            <div className="admin-table-card">
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FolderOpen size={17} color="#f59e0b" />
                  Research Projects / Proposals
                </h4>

                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  {loading ? "Loading..." : `${filtered.length} shown`}
                </span>
              </div>

              <div className="admin-table-scroll">
                <table className="admin-project-table">
                  <thead>
                    <tr>
                      <th>Reference No</th>
                      <th>Title</th>
                      <th>Researcher</th>
                      <th>Department</th>
                      <th>Type</th>
                      <th>Budget</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading && (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            textAlign: "center",
                            padding: 28,
                            color: "#9ca3af",
                          }}
                        >
                          Loading records...
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      filtered.map((project) => {
                        const status = project.status || "Submitted";
                        const style =
                          STATUS_STYLE[status] || STATUS_STYLE.Submitted;

                        return (
                          <tr key={project.id}>
                            <td style={{ fontWeight: 700 }}>
                              {getReference(project)}
                            </td>

                            <td>
                              <strong style={{ color: "#111827" }}>
                                {project.title || "Untitled Project"}
                              </strong>
                            </td>

                            <td>{getResearcherName(project)}</td>
                            <td>{getDepartment(project)}</td>
                            <td>{getType(project)}</td>
                            <td>{fmtMoney(getBudget(project))}</td>

                            <td>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "4px 11px",
                                  borderRadius: 999,
                                  background: style.bg,
                                  color: style.color,
                                  border: `1px solid ${style.border}`,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {status}
                              </span>
                            </td>

                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => setViewing(project)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    border: "none",
                                    background: "transparent",
                                    color: "#f59e0b",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    padding: 0,
                                    fontSize: 13,
                                  }}
                                >
                                  <Eye size={15} />
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            textAlign: "center",
                            padding: 34,
                            color: "#9ca3af",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <AlertCircle size={28} color="#d1d5db" />
                            <span>No records found.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {!loading && projects.length === 0 && (
              <div
                style={{
                  marginTop: 18,
                  background: "#fff",
                  border: "1px dashed #d1d5db",
                  borderRadius: 12,
                  padding: "28px 20px",
                  textAlign: "center",
                }}
              >
                <FolderOpen
                  size={38}
                  color="#d1d5db"
                  style={{ margin: "0 auto 10px", display: "block" }}
                />

                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#374151",
                  }}
                >
                  No submitted proposals or projects yet.
                </p>

                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 13,
                    color: "#9ca3af",
                  }}
                >
                  Submitted researcher proposals will appear here once they are
                  saved with Submitted status.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewing && (
        <DetailModal project={viewing} onClose={() => setViewing(null)} />
      )}
    </>
  );
}