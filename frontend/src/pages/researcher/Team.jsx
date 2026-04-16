import { useState } from "react";
import { Plus, Mail, Pencil, Trash2 } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";

const INITIAL_MEMBERS = [
  { id: 1, name: "Dr. Sarah Johnson",  email: "sarah.johnson@university.edu",  department: "Environmental Science", role: "Leader" },
  { id: 2, name: "Dr. Mark Thompson",  email: "mark.thompson@university.edu",  department: "Marine Biology",        role: "Co-Leader" },
  { id: 3, name: "Dr. Rachel Lee",     email: "rachel.lee@university.edu",     department: "Environmental Science", role: "Member" },
  { id: 4, name: "John Davis",         email: "john.davis@university.edu",     department: "Data Analytics",        role: "Member" },
];

const ROLE_STYLES = {
  Leader:    { bg: "#dcfce7", color: "#15803d" },
  "Co-Leader": { bg: "#dbeafe", color: "#1d4ed8" },
  Member:    { bg: "#f3f4f6", color: "#6b7280" },
};

export default function TeamManagement() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", department: "", role: "Member" });

  const totalMembers = members.length;
  const projectLeaders = members.filter((m) => m.role === "Leader").length;
  const departments = new Set(members.map((m) => m.department)).size;

  const openAdd = () => {
    setEditingMember(null);
    setForm({ name: "", email: "", department: "", role: "Member" });
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditingMember(member.id);
    setForm({ name: member.name, email: member.email, department: member.department, role: member.role });
    setShowModal(true);
  };

  const handleDelete = (id) => setMembers((p) => p.filter((m) => m.id !== id));

  const handleSave = () => {
    if (!form.name || !form.email || !form.department) return;
    if (editingMember) {
      setMembers((p) => p.map((m) => m.id === editingMember ? { ...m, ...form } : m));
    } else {
      setMembers((p) => [...p, { id: Date.now(), ...form }]);
    }
    setShowModal(false);
  };

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
                          <span
                            className="badge"
                            style={{ background: rs.bg, color: rs.color }}
                          >
                            {m.role}
                          </span>
                        </td>
                        <td>
                          <div className="actions" style={{ justifyContent: "flex-end" }}>
                            <span className="edit" onClick={() => openEdit(m)}>
                              Edit
                            </span>
                            <Trash2
                              size={16}
                              className="delete"
                              onClick={() => handleDelete(m.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

            <div className="cp-field">
              <label className="cp-label">Full Name *</label>
              <input
                className="cp-input"
                type="text"
                placeholder="e.g., Dr. Sarah Johnson"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">Email *</label>
              <input
                className="cp-input"
                type="email"
                placeholder="name@university.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">Department *</label>
              <input
                className="cp-input"
                type="text"
                placeholder="e.g., Computer Science"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">Role *</label>
              <div className="cp-select-wrap">
                <select
                  className="cp-select"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option>Leader</option>
                  <option>Co-Leader</option>
                  <option>Member</option>
                </select>
                <span className="cp-select-chevron">▾</span>
              </div>
            </div>

            <div className="tm-modal-actions">
              <button className="cp-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="cp-btn primary"
                style={{ background: "#1f7a1f", borderColor: "#1f7a1f" }}
                onClick={handleSave}
              >
                {editingMember ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}