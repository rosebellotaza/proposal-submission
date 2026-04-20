import { useState, useEffect } from "react";
import { Search, Filter, Plus, ChevronDown } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const statusClass = {
  "Approved":         "approved",
  "Under Evaluation": "evaluating",
  "In Progress":      "progress",
  "Submitted":        "submitted",
  "Draft":            "draft",
};

export default function ResearchProjects() {
  const [projects,      setProjects]      = useState([]);
  const [query,         setQuery]         = useState("");
  const [statusFilter,  setStatusFilter]  = useState("All Status");
  const [loading,       setLoading]       = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/projects")
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    const matchQuery =
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      (p.department_center?.name || "").toLowerCase().includes(query.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || p.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Research Projects" />
        <div className="dashboard-content">

          {/* PAGE HEADER */}
          <div className="page-header">
            <div>
              <h2 className="page-title">Research Projects</h2>
              <p className="page-subtitle">Manage and track all research projects</p>
            </div>
            <button className="create-btn" onClick={() => navigate("/researcher/projects/create")}>
              <Plus size={16} /> Create Project
            </button>
          </div>

          {/* SEARCH + FILTER */}
          <div className="search-filter-bar">
            <div className="search-left">
              <Search size={18} color="#9ca3af" />
              <input
                type="text"
                placeholder="Search by title or department..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="filter-right">
              <Filter size={16} color="#6b7280" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option>All Status</option>
                <option>Approved</option>
                <option>Under Evaluation</option>
                <option>In Progress</option>
                <option>Submitted</option>
                <option>Draft</option>
              </select>
              <ChevronDown size={15} color="#6b7280" />
            </div>
          </div>

          {/* TABLE */}
          <div className="table-wrapper">
            <h4 className="table-title">
              {loading ? "Loading..." : `Projects (${filtered.length})`}
            </h4>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Reference No</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>{p.reference_no}</td>
                      <td><strong>{p.title}</strong></td>
                      <td>{p.type}</td>
                      <td>{p.budget ? `₱${Number(p.budget).toLocaleString()}` : "—"}</td>
                      <td>
                        <span className={`badge ${statusClass[p.status] || "draft"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <span className="action" onClick={() => navigate(`/researcher/projects/${p.id}`)}>
                          View
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>
                        No projects found. Create your first project!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}