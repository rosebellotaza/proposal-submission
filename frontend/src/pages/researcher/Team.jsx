import { useState, useEffect } from "react";
import { Plus, Mail, Pencil, Trash2 } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import api from "../../utils/api";

const ROLE_STYLES = {
  Leader:      { bg: "#dcfce7", color: "#15803d" },
  "Co-Leader": { bg: "#dbeafe", color: "#1d4ed8" },
  Member:      { bg: "#f3f4f6", color: "#6b7280" },
};

export default function TeamManagement() {
  const [projects,       setProjects]       = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [members,        setMembers]        = useState([]);
  const [showModal,      setShowModal]      = useState(false);
  const [editingMember,  setEditingMember]  = useState(null);
  const [form,           setForm]           = useState({ name: "", email: "", department: "", role: "Member" });
  const [loading,        setLoading]        = useState(false);

  // Load researcher's projects
  useEffect(() => {
    api.get("/projects").then((res) => {
      setProjects(res.data);
      if (res.data.length > 0) setSelectedProject(res.data[0].id);
    });
  }, []);

  // Load team when project changes
  useEffect(() => {
    if (!selectedProject) return;
    api.get(`/projects/${selectedProject}/team`).then((res) => setMembers(res.data));
  }, [selectedProject]);

  const openAdd = () => {
    setEditingMember(null);
    setForm({ name: "", email: "", department: "", role: "Member" });
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditingMember(member);
    setForm({ name: member.name, email: member.email, department: member.department, role: member.role });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await api.delete(`/projects/${selectedProject}/team/${id}`);
    setMembers((p) => p.filter((m) => m.id !== id));
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setLoading(true);
    try {
      if (editingMember) {
        const res = await api.put(`/projects/${selectedProject}/team/${editingMember.id}`, { role: form.role });
        setMembers((p) => p.map((m) => m.id === editingMember.id ? { ...m, role: res.data.role } : m));
      } else {
        // For adding, we need to find the personnel by email first
        // For now just refresh the team list
        await api.get(`/projects/${selectedProject}/team`).then((res) => setMembers(res.data));
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalMembers   = members.length;
  const projectLeaders = members.filter((m) => m.role === "Leader").length;
  const departments    = new Set(members.map((m) => m.department)).size;

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Team Management" />
        <div className="dashboard-content">

          {/* Page Header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">Team Management</h2>
              <p className="page-subtitle">Manage project team members and roles</p>
            </div>
            <button className="create-btn" onClick={openAdd}>
              <Plus size={16} /> Add Team Member
            </button>
          </div>

          {/* Project Selector */}
          {projects.length > 0 && (
            <div className="cp-section" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
                  Select Project:
                </label>
                <div className="cp-select-wrap" style={{ flex: 1 }}>
                  <select
                    className="cp-select"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.reference_no} — {p.title}</option>
                    ))}
                  </select>
                  <span className="cp-select-chevron">▾</span>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="table-wrapper">
            <h4 className="table-title">Current Team Members</h4>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const rs = ROLE_STYLES[m.role] || ROLE_STYLES.Member;
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="name-cell">
                            <div className="tm-avatar">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f7a1f" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                            </div>
                            {m.name}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#6b7280" }}>
                            <Mail size={14} />
                            <span style={{ fontSize: 13 }}>{m.email}</span>
                          </div>
                        </td>
                        <td>{m.department}</td>
                        <td>
                          <span className="badge" style={{ background: rs.bg, color: rs.color }}>
                            {m.role}
                          </span>
                        </td>
                        <td>
                          <div className="actions" style={{ justifyContent: "flex-end" }}>
                            <span className="edit" onClick={() => openEdit(m)}>Edit</span>
                            {m.role !== "Leader" && (
                              <Trash2 size={16} className="delete" onClick={() => handleDelete(m.id)} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>
                        No team members yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats */}
          <div className="tm-stats">
            <div className="tm-stat-card">
              <p className="tm-stat-num">{totalMembers}</p>
              <p className="tm-stat-label">Total Members</p>
            </div>
            <div className="tm-stat-card">
              <p className="tm-stat-num">{projectLeaders}</p>
              <p className="tm-stat-label">Project Leaders</p>
            </div>
            <div className="tm-stat-card">
              <p className="tm-stat-num">{departments}</p>
              <p className="tm-stat-label">Departments</p>
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="tm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="tm-modal-title">
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </h3>

            {editingMember ? (
              <div className="cp-field">
                <label className="cp-label">Role *</label>
                <div className="cp-select-wrap">
                  <select className="cp-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option>Leader</option>
                    <option>Co-Leader</option>
                    <option>Member</option>
                  </select>
                  <span className="cp-select-chevron">▾</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#6b7280" }}>
                To add a team member, the person must first register an account in the system. Then you can assign them here by their personnel ID.
              </p>
            )}

            <div className="tm-modal-actions">
              <button className="cp-btn" onClick={() => setShowModal(false)}>Cancel</button>
              {editingMember && (
                <button
                  className="cp-btn primary"
                  style={{ background: "#1f7a1f", borderColor: "#1f7a1f" }}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}