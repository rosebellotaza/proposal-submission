import { useState, useEffect } from "react";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";

const ROLE_BADGE = {
  researcher:         { bg: "#dcfce7", color: "#15803d" },
  evaluator:          { bg: "#ede9fe", color: "#6d28d9" },
  rde_division_chief: { bg: "#e0f2fe", color: "#0369a1" },
  campus_director:    { bg: "#fef9c3", color: "#a16207" },
  vprie:              { bg: "#fff7ed", color: "#c2410c" },
  president:          { bg: "#fdf2f8", color: "#9d174d" },
  admin:              { bg: "#f3f4f6", color: "#6b7280" },
};

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState("");

  useEffect(() => {
    api.get("/admin/users")
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase()) ||
    u.role.toLowerCase().includes(query.toLowerCase())
  );

  const handleToggle = async (id) => {
    const res = await api.put(`/admin/users/${id}/toggle`);
    setUsers((p) => p.map((u) => u.id === id ? { ...u, is_active: res.data.is_active } : u));
  };

  return (
    <div className="dashboard-layout">
      <div className="main-content" style={{ marginLeft: 0 }}>
        <Topbar title="User Management" />
        <div className="dashboard-content">

          <div style={{ marginBottom: 20 }}>
            <h2 className="page-title">User Management</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Manage all personnel accounts
            </p>
          </div>

          {/* Search */}
          <div className="search-filter-bar" style={{ marginBottom: 16 }}>
            <div className="search-left">
              <input type="text" placeholder="Search by name, email, or role..."
                value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <h4 className="table-title">
              {loading ? "Loading..." : `Personnel (${filtered.length})`}
            </h4>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const rb = ROLE_BADGE[u.role] || ROLE_BADGE.admin;
                    return (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td style={{ color: "#6b7280" }}>{u.email}</td>
                        <td>
                          <span className="badge" style={{ background: rb.bg, color: rb.color }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{
                            background: u.is_active ? "#dcfce7" : "#fef2f2",
                            color: u.is_active ? "#15803d" : "#dc2626"
                          }}>
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <span className="action" onClick={() => handleToggle(u.id)}>
                            {u.is_active ? "Deactivate" : "Activate"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>
                        No users found.
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