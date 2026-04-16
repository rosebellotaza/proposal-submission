import { useState } from "react";
import { Search, Filter, Plus, ChevronDown } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import { useNavigate } from "react-router-dom";


const projects = [
  {
    id: "PRJ-001",
    title: "Climate Change Impact on Coastal Ecosystems",
    type: "Basic Research",
    department: "Environmental Science",
    leader: "Dr. Sarah Johnson",
    budget: "$450,000",
    duration: "24 months",
    status: "Approved",
  },
  {
    id: "PRJ-002",
    title: "AI-Driven Healthcare Diagnosis System",
    type: "Applied Research",
    department: "Computer Science",
    leader: "Prof. Michael Chen",
    budget: "$320,000",
    duration: "18 months",
    status: "Under Evaluation",
  },
  {
    id: "PRJ-003",
    title: "Sustainable Agriculture Practices in Arid Regions",
    type: "Applied Research",
    department: "Agriculture",
    leader: "Dr. Emily Rodriguez",
    budget: "$280,000",
    duration: "36 months",
    status: "In Progress",
  },
  {
    id: "PRJ-004",
    title: "Quantum Computing for Cryptography",
    type: "Basic Research",
    department: "Physics",
    leader: "Dr. James Anderson",
    budget: "$580,000",
    duration: "30 months",
    status: "Submitted",
  },
  {
    id: "PRJ-005",
    title: "Urban Planning and Smart City Infrastructure",
    type: "Development",
    department: "Civil Engineering",
    leader: "Prof. Lisa Martinez",
    budget: "$750,000",
    duration: "48 months",
    status: "Draft",
  },
];

const statusClass = {
  "Approved":         "approved",
  "Under Evaluation": "evaluating",
  "In Progress":      "progress",
  "Submitted":        "submitted",
  "Draft":            "draft",
};

export default function ResearchProjects() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const navigate = useNavigate();

  const filtered = projects.filter((p) => {
    const matchQuery =
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.department.toLowerCase().includes(query.toLowerCase()) ||
      p.leader.toLowerCase().includes(query.toLowerCase());
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
              <Plus size={16} />
              Create Project
            </button>
          </div>

          {/* SEARCH + FILTER */}
          <div className="search-filter-bar">
            <div className="search-left">
              <Search size={18} color="#9ca3af" />
              <input
                type="text"
                placeholder="Search by title, department, or leader..."
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
            <h4 className="table-title">Projects ({filtered.length})</h4>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Project ID</th>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Leader</th>
                    <th>Budget</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>
                        <strong>{p.title}</strong>
                        <div className="sub">{p.type}</div>
                      </td>
                      <td>{p.department}</td>
                      <td>{p.leader}</td>
                      <td>{p.budget}</td>
                      <td>{p.duration}</td>
                      <td>
                        <span className={`badge ${statusClass[p.status]}`}>
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
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}