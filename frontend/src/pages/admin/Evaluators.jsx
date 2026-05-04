import { useState, useEffect } from "react";
import AdminNavbar from "../../components/admin/navbar";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import { getSession } from "../../utils/auth";
import { Bell, Search, UserPlus, Pencil, Trash2, X, GraduationCap } from "lucide-react";

/* ── helpers ─────────────────────────────────────────────── */
const STATUS = {
  Active:   { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  Inactive: { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
};

/* normalise whatever the API returns into "Active" | "Inactive" */
const resolveStatus = (e) => {
  if (typeof e.is_active === "boolean") return e.is_active ? "Active" : "Inactive";
  if (e.status === "Active" || e.status === "Inactive") return e.status;
  return "Inactive";
};

const EMPTY_FORM = {
  name: "", email: "", position: "", department: "", program: "", status: "Active",
};

/* ── Field helper ────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      {children}
    </div>
  );
}

/* ── Modal styles ────────────────────────────────────────── */
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

/* ── Add / Edit Modal ────────────────────────────────────── */
function EvaluatorModal({ initial = EMPTY_FORM, onClose, onSave, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!initial.id;

  return (
    <div style={M.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={M.modal}>
        <div style={M.header}>
          <h2 style={M.title}>{isEdit ? "Edit Evaluator" : "Add Evaluator"}</h2>
          <button style={M.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={M.body}>
          <div style={M.grid}>
            <Field label="Full Name">
              <input style={M.input} placeholder="e.g. Dr. Amanda Rodriguez"
                value={form.name} onChange={e => set("name", e.target.value)} />
            </Field>
            <Field label="Email">
              <input style={M.input} type="email" placeholder="e.g. amanda@university.edu"
                value={form.email} onChange={e => set("email", e.target.value)} />
            </Field>
            <Field label="Position">
              <select style={M.input} value={form.position} onChange={e => set("position", e.target.value)}>
                <option value="">Select position</option>
                <option>Senior Evaluator</option>
                <option>Evaluator</option>
              </select>
            </Field>
            <Field label="Department">
              <input style={M.input} placeholder="e.g. College of Engineering"
                value={form.department || ""} onChange={e => set("department", e.target.value)} />
            </Field>

            <Field label="Program">
              <input style={M.input} placeholder="e.g. MS Computer Science"
                value={form.program || ""} onChange={e => set("program", e.target.value)} />
            </Field>
            <Field label="Status">
              <select style={M.input} value={form.status} onChange={e => set("status", e.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button style={M.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={M.saveBtn} onClick={() => onSave(form)} disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Evaluator"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm ──────────────────────────────────────── */
function DeleteModal({ evaluator, onClose, onConfirm, deleting }) {
  return (
    <div style={M.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...M.modal, maxWidth: 420 }}>
        <div style={M.header}>
          <h2 style={{ ...M.title, color: "#dc2626" }}>Delete Evaluator</h2>
          <button style={M.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={M.body}>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "#374151" }}>
            Are you sure you want to remove <strong>{evaluator.name}</strong>? This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button style={M.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={{ ...M.saveBtn, background: "#dc2626" }} onClick={onConfirm} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── EvaluatorManagement ─────────────────────────────────── */
export default function EvaluatorManagement() {
  const [evaluators,   setEvaluators]   = useState([]);
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

  const fetchEvaluators = () =>
    api.get("/admin/evaluators")
      .then(r => { setEvaluators(r.data); setFiltered(r.data); })
      .catch(() => {
        const mock = [
          { id: 1, evaluator_id: "E001", name: "Dr. Amanda Rodriguez", email: "amanda.rodriguez@university.edu", position: "Senior Evaluator", assigned: 5, status: "Active" },
          { id: 2, evaluator_id: "E002", name: "Dr. James Thompson",   email: "james.thompson@university.edu",  position: "Evaluator",        assigned: 3, status: "Active"},
          { id: 3, evaluator_id: "E003", name: "Dr. Lisa Park",        email: "lisa.park@university.edu",       position: "Senior Evaluator", assigned: 4, status: "Active" },
          { id: 4, evaluator_id: "E004", name: "Dr. David Kumar",      email: "david.kumar@university.edu",     position: "Evaluator",        assigned: 0, status: "Inactive" },
        ];
        setEvaluators(mock); setFiltered(mock);
      })
      .finally(() => setLoading(false));

  useEffect(() => { fetchEvaluators(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(evaluators.filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.position?.toLowerCase().includes(q)
    ));
  }, [search, evaluators]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (form.id) await api.put(`/admin/evaluators/${form.id}`, form);
      else         await api.post("/admin/evaluators", form);
      setShowAdd(false); setEditing(null);
      await fetchEvaluators();
    } catch { /* handle */ } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/admin/evaluators/${deleting.id}`);
      setDeleting(null);
      await fetchEvaluators();
    } catch { /* handle */ } finally { setIsDeleting(false); }
  };

  const totalActive = filtered.filter(e => e.status === "Active").length;
  const ml = isMobile ? 0 : sidebarWidth;

  return (
    <>
      <style>{`
        .em-table { width:100%; border-collapse:collapse; }
        .em-table th { padding:12px 16px; text-align:left; font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; border-bottom:2px solid #e5e7eb; white-space:nowrap; }
        .em-table td { padding:14px 16px; font-size:13px; color:#374151; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
        .em-table tr:last-child td { border-bottom:none; }
        .em-table tr:hover td { background:#fafafa; }
        .em-cards { display:none; flex-direction:column; gap:12px; }
        .em-search-row { display:grid; grid-template-columns:1fr auto auto; gap:16px; margin-bottom:20px; align-items:stretch; }
        @media(max-width:800px){ .em-table-wrap { display:none; } .em-cards { display:flex; } }
        @media(max-width:640px){ .em-search-row { grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
        <AdminNavbar onWidthChange={setSidebarWidth} />

        <div style={{ marginLeft: ml, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.22s ease", minWidth: 0 }}>

        <Topbar title="Evaluator Management" />

          {/* ── Body ── */}
          <div style={{ padding: "24px", flex: 1 }}>

            {/* Heading + Add button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3  style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Manage proposal evaluators and their assignments</h3>
              </div>
              <button onClick={() => setShowAdd(true)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 9,
                border: "none", background: "#f59e0b", color: "#fff",
                fontWeight: 600, fontSize: 14, cursor: "pointer",
                boxShadow: "0 2px 6px rgba(245,158,11,0.35)",
              }}>
                <UserPlus size={17} /> Add Evaluator
              </button>
            </div>

            {/* Search + stat cards */}
            <div className="em-search-row">
              {/* Search */}
              <div style={{
                background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
                display: "flex", alignItems: "center", gap: 10, padding: "0 16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <Search size={18} color="#9ca3af" strokeWidth={1.8} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", padding: "14px 0", background: "transparent" }} />
              </div>

              {/* Total */}
              <div style={{
                background: "#fefce8", border: "1px solid #fde68a", borderRadius: 12,
                padding: "14px 28px", textAlign: "center", minWidth: 150,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#111827" }}>{filtered.length}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>Total Evaluators</p>
              </div>

              {/* Active */}
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12,
                padding: "14px 28px", textAlign: "center", minWidth: 150,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#111827" }}>{totalActive}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>Active Evaluators</p>
              </div>
            </div>

            {/* Table card */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Evaluator List</h3>
              </div>

              {loading ? (
                <p style={{ padding: 24, color: "#9ca3af", fontSize: 14 }}>Loading…</p>
              ) : filtered.length === 0 ? (
                <p style={{ padding: 24, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>No evaluators found.</p>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="em-table-wrap" style={{ overflowX: "auto" }}>
                    <table className="em-table">
                      <thead>
                        <tr>
{["ID","Name","Email","Department","Program","Position","Assigned","Status","Actions"].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(e => {
                          const sb  = STATUS[resolveStatus(e)] || STATUS.Inactive;
                          const statusLabel = resolveStatus(e);
                          const asg = e.assigned ?? 0;
                          const asgColor = asg > 0 ? { bg:"#eff6ff", color:"#1d4ed8", border:"#bfdbfe" } : { bg:"#f3f4f6", color:"#6b7280", border:"#e5e7eb" };
                          return (
                            <tr key={e.id}>
                              <td style={{ fontWeight: 600, color: "#111827" }}>
                                {e.evaluator_id || `E${String(e.id).padStart(3,"0")}`}
                              </td>
                              <td style={{ fontWeight: 500, color: "#111827" }}>{e.name}</td>
                              <td style={{ color: "#6b7280" }}>{e.email}</td>
                              <td>{e.department}</td>
                              <td>{e.program}</td>
                              <td>{e.position}</td>
                              <td>
                                <span style={{
                                  display: "inline-block", padding: "3px 10px", borderRadius: 20,
                                  fontSize: 12, fontWeight: 600,
                                  background: asgColor.bg, color: asgColor.color, border: `1px solid ${asgColor.border}`,
                                }}>
                                  {asg} project{asg !== 1 ? "s" : ""}
                                </span>
                              </td>
                              <td>
                                <span style={{
                                  display: "inline-block", padding: "3px 12px", borderRadius: 20,
                                  fontSize: 12, fontWeight: 600,
                                  background: sb.bg, color: sb.color, border: `1px solid ${sb.border}`,
                                }}>
                                  {statusLabel}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button onClick={() => setEditing(e)} title="Edit"
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280", display: "flex" }}>
                                    <Pencil size={16} />
                                  </button>
                                  <button onClick={() => setDeleting(e)} title="Delete"
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#dc2626", display: "flex" }}>
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
                  <div className="em-cards" style={{ padding: "14px 16px" }}>
                    {filtered.map(e => {
                      const sb  = STATUS[resolveStatus(e)] || STATUS.Inactive;
                      const statusLabel = resolveStatus(e);
                      const asg = e.assigned ?? 0;
                      const asgColor = asg > 0 ? { bg:"#eff6ff", color:"#1d4ed8", border:"#bfdbfe" } : { bg:"#f3f4f6", color:"#6b7280", border:"#e5e7eb" };
                      return (
                        <div key={e.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", background: "#fafafa" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>{e.name}</p>
                              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{e.evaluator_id || `E${String(e.id).padStart(3,"0")}`}</p>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: sb.bg, color: sb.color, border: `1px solid ${sb.border}` }}>
                                {statusLabel}
                              </span>
                              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: asgColor.bg, color: asgColor.color, border: `1px solid ${asgColor.border}` }}>
                                {asg} project{asg !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px", fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                            <span><b style={{ color: "#374151" }}>Email:</b> {e.email}</span>
                            <span><b style={{ color: "#374151" }}>Position:</b> {e.position}</span>
                            <span><b style={{ color: "#374151" }}>Dept:</b> {e.department || "—"}</span>
                            <span><b style={{ color: "#374151" }}>Program:</b> {e.program || "—"}</span>
                          </div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setEditing(e)}
                              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#374151" }}>
                              <Pencil size={14} /> Edit
                            </button>
                            <button onClick={() => setDeleting(e)}
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

      {showAdd  && <EvaluatorModal onClose={() => setShowAdd(false)} onSave={handleSave} saving={saving} />}
      {editing  && <EvaluatorModal initial={{ ...editing, status: resolveStatus(editing) }} onClose={() => setEditing(null)} onSave={handleSave} saving={saving} />}
      {deleting && <DeleteModal evaluator={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} deleting={isDeleting} />}
    </>
  );
}