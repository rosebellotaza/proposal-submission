import { useState, useEffect } from "react";
import AdminNavbar from "../../components/admin/navbar";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import { getSession } from "../../utils/auth";
import { Bell, Search, UserPlus, Pencil, Trash2, X } from "lucide-react";

/* ── helpers ─────────────────────────────────────────────── */
const STATUS = {
  Active:   { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  Inactive: { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
};

const EMPTY_FORM = {
  name: "", email: "", department: "", position: "", status: "Active", join_date: "",
};

/* ── Add / Edit Modal ────────────────────────────────────── */
function FacultyModal({ initial = EMPTY_FORM, onClose, onSave, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!initial.id;

  return (
    <div style={M.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={M.modal}>
        <div style={M.header}>
          <h2 style={M.title}>{isEdit ? "Edit Faculty" : "Add Faculty"}</h2>
          <button style={M.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={M.body}>
          <div style={M.grid}>
            <Field label="Full Name">
              <input style={M.input} placeholder="e.g. Dr. Sarah Johnson"
                value={form.name} onChange={e => set("name", e.target.value)} />
            </Field>
            <Field label="Email">
              <input style={M.input} type="email" placeholder="e.g. sarah@university.edu"
                value={form.email} onChange={e => set("email", e.target.value)} />
            </Field>
            <Field label="Department">
              <input style={M.input} placeholder="e.g. Computer Science"
                value={form.department} onChange={e => set("department", e.target.value)} />
            </Field>
            <Field label="Position">
              <input style={M.input} placeholder="e.g. Professor"
                value={form.position} onChange={e => set("position", e.target.value)} />
            </Field>
            <Field label="Status">
              <select style={M.input} value={form.status} onChange={e => set("status", e.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </Field>
            <Field label="Join Date">
              <input style={M.input} type="date"
                value={form.join_date} onChange={e => set("join_date", e.target.value)} />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button style={M.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={M.saveBtn} onClick={() => onSave(form)} disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Faculty"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      {children}
    </div>
  );
}

const M = {
  overlay:   { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal:     { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" },
  header:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9" },
  title:     { margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" },
  closeBtn:  { background: "#f3f4f6", border: "none", borderRadius: 8, cursor: "pointer", padding: 6, display: "flex", color: "#374151" },
  body:      { padding: "20px 22px 22px" },
  grid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px", marginBottom: 20 },
  input:     { padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", color: "#111827", width: "100%", boxSizing: "border-box" },
  cancelBtn: { padding: "9px 20px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 500 },
  saveBtn:   { padding: "9px 22px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 },
};

/* ── Delete Confirm Modal ────────────────────────────────── */
function DeleteModal({ faculty, onClose, onConfirm, deleting }) {
  return (
    <div style={M.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...M.modal, maxWidth: 420 }}>
        <div style={M.header}>
          <h2 style={{ ...M.title, color: "#dc2626" }}>Delete Faculty</h2>
          <button style={M.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={M.body}>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "#374151" }}>
            Are you sure you want to remove <strong>{faculty.name}</strong>? This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button style={M.cancelBtn} onClick={onClose}>Cancel</button>
            <button
              style={{ ...M.saveBtn, background: "#dc2626" }}
              onClick={onConfirm} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FacultyManagement ───────────────────────────────────── */
export default function FacultyManagement() {
  const [faculty,      setFaculty]      = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [search,       setSearch]       = useState("");
  const [loading,      setLoading]      = useState(true);
  const [showAdd,      setShowAdd]      = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [deleting,     setDeleting]     = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [isDeleting,   setIsDeleting]   = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);

  const session  = getSession?.() || {};
  const userName = session?.name || "Admin";
  const initial  = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchFaculty = () =>
    api.get("/admin/faculty")
      .then(r => { setFaculty(r.data); setFiltered(r.data); })
      .catch(() => {
        // mock data fallback
        const mock = [
          { id: 1, faculty_id: "F001", name: "Dr. Sarah Johnson",   email: "sarah.johnson@university.edu",   department: "Computer Science", position: "Professor",           status: "Active",   join_date: "2020-01-15" },
          { id: 2, faculty_id: "F002", name: "Dr. Michael Chen",    email: "michael.chen@university.edu",    department: "Engineering",      position: "Associate Professor", status: "Active",   join_date: "2019-08-20" },
          { id: 3, faculty_id: "F003", name: "Dr. Emily Davis",     email: "emily.davis@university.edu",     department: "Biology",          position: "Assistant Professor", status: "Active",   join_date: "2021-03-10" },
          { id: 4, faculty_id: "F004", name: "Dr. Robert Williams", email: "robert.williams@university.edu", department: "Physics",          position: "Professor",           status: "Inactive", join_date: "2018-06-05" },
        ];
        setFaculty(mock); setFiltered(mock);
      })
      .finally(() => setLoading(false));

  useEffect(() => { fetchFaculty(); }, []);

  /* search filter */
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      faculty.filter(f =>
        f.name?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q) ||
        f.department?.toLowerCase().includes(q)
      )
    );
  }, [search, faculty]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (form.id) await api.put(`/admin/faculty/${form.id}`, form);
      else         await api.post("/admin/faculty", form);
      setShowAdd(false); setEditing(null);
      await fetchFaculty();
    } catch {
      /* handle error */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/admin/faculty/${deleting.id}`);
      setDeleting(null);
      await fetchFaculty();
    } catch {
      /* handle error */
    } finally {
      setIsDeleting(false);
    }
  };

  const ml = isMobile ? 0 : sidebarWidth;

  return (
    <>
      <style>{`
        .fm-table { width:100%; border-collapse:collapse; }
        .fm-table th { padding:12px 16px; text-align:left; font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; border-bottom:2px solid #e5e7eb; white-space:nowrap; }
        .fm-table td { padding:14px 16px; font-size:13px; color:#374151; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
        .fm-table tr:last-child td { border-bottom:none; }
        .fm-table tr:hover td { background:#fafafa; }
        .fm-cards { display:none; flex-direction:column; gap:12px; }
        @media(max-width:800px){ .fm-table-wrap { display:none; } .fm-cards { display:flex; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
        <AdminNavbar onWidthChange={setSidebarWidth} />

        <div style={{ marginLeft: ml, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.22s ease", minWidth: 0 }}>

            <Topbar title="Faculty Management" />
          {/* ── Body ── */}
          <div style={{ padding: "24px", flex: 1 }}>

            {/* Page heading + Add button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3  style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Manage faculty members and researchers</h3>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 20px", borderRadius: 9,
                  border: "none", background: "#f59e0b", color: "#fff",
                  fontWeight: 600, fontSize: 14, cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(245,158,11,0.35)",
                }}>
                <UserPlus size={17} /> Add Faculty
              </button>
            </div>

            {/* Search + Total */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, marginBottom: 20, alignItems: "stretch" }}>
              {/* Search */}
              <div style={{
                background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
                display: "flex", alignItems: "center", gap: 10,
                padding: "0 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <Search size={18} color="#9ca3af" strokeWidth={1.8} />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, or department..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", padding: "14px 0", background: "transparent" }}
                />
              </div>
              {/* Total card */}
              <div style={{
                background: "#fefce8", border: "1px solid #fde68a", borderRadius: 12,
                padding: "14px 28px", textAlign: "center", minWidth: 140,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#111827" }}>{filtered.length}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>Total Faculty</p>
              </div>
            </div>

            {/* Table card */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Faculty List</h3>
              </div>

              {loading ? (
                <p style={{ padding: 24, color: "#9ca3af", fontSize: 14 }}>Loading…</p>
              ) : filtered.length === 0 ? (
                <p style={{ padding: 24, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>No faculty found.</p>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="fm-table-wrap" style={{ overflowX: "auto" }}>
                    <table className="fm-table">
                      <thead>
                        <tr>
                          {["ID", "Name", "Email", "Department", "Position", "Status", "Join Date", "Actions"].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(f => {
                          const sb = STATUS[f.status] || STATUS.Inactive;
                          return (
                            <tr key={f.id}>
                              <td style={{ fontWeight: 600, color: "#111827" }}>{f.faculty_id || `F${String(f.id).padStart(3, "0")}`}</td>
                              <td style={{ fontWeight: 500, color: "#111827" }}>{f.name}</td>
                              <td style={{ color: "#6b7280" }}>{f.email}</td>
                              <td>{f.department}</td>
                              <td>{f.position}</td>
                              <td>
                                <span style={{
                                  display: "inline-block", padding: "3px 12px", borderRadius: 20,
                                  fontSize: 12, fontWeight: 600,
                                  background: sb.bg, color: sb.color, border: `1px solid ${sb.border}`,
                                }}>
                                  {f.status}
                                </span>
                              </td>
                              <td style={{ color: "#6b7280" }}>{f.join_date}</td>
                              <td>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button
                                    onClick={() => setEditing(f)}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280", display: "flex" }}
                                    title="Edit">
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => setDeleting(f)}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#dc2626", display: "flex" }}
                                    title="Delete">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="fm-cards" style={{ padding: "14px 16px" }}>
                    {filtered.map(f => {
                      const sb = STATUS[f.status] || STATUS.Inactive;
                      return (
                        <div key={f.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", background: "#fafafa" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>{f.name}</p>
                              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{f.faculty_id || `F${String(f.id).padStart(3,"0")}`}</p>
                            </div>
                            <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: sb.bg, color: sb.color, border: `1px solid ${sb.border}` }}>
                              {f.status}
                            </span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px", fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                            <span><b style={{ color: "#374151" }}>Email:</b> {f.email}</span>
                            <span><b style={{ color: "#374151" }}>Dept:</b> {f.department}</span>
                            <span><b style={{ color: "#374151" }}>Position:</b> {f.position}</span>
                            <span><b style={{ color: "#374151" }}>Joined:</b> {f.join_date}</span>
                          </div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setEditing(f)}
                              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#374151" }}>
                              <Pencil size={14} /> Edit
                            </button>
                            <button onClick={() => setDeleting(f)}
                              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#dc2626" }}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <FacultyModal onClose={() => setShowAdd(false)} onSave={handleSave} saving={saving} />
      )}

      {/* Edit Modal */}
      {editing && (
        <FacultyModal initial={editing} onClose={() => setEditing(null)} onSave={handleSave} saving={saving} />
      )}

      {/* Delete Confirm */}
      {deleting && (
        <DeleteModal faculty={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} deleting={isDeleting} />
      )}
    </>
  );
}