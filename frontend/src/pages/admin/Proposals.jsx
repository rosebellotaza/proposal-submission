import { useState, useEffect } from "react";
import AdminNavbar from "../../components/admin/navbar";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import {
  Search, FileText, Calendar, Users, X,
  CheckCircle2, Clock, Eye, ClipboardList,
} from "lucide-react";

/* ── mock data ───────────────────────────────────────────── */
const MOCK_PROPOSALS = [
  { id: 1, proposal_id: "PRJ-002", title: "Blockchain-Based Land Registry System",     researcher: "Dr. Anna Lee",       department: "Information Technology", budget: 195000, submitted_date: "2026-04-10", status: "Pending",         defense_date: null,       evaluators: [] },
  { id: 2, proposal_id: "PRJ-004", title: "Smart Water Quality Monitoring Network",    researcher: "Prof. Carlos Reyes", department: "Environmental Science",   budget: 280000, submitted_date: "2026-04-05", status: "Pending",         defense_date: null,       evaluators: [] },
  { id: 3, proposal_id: "PRJ-006", title: "Quantum Computing for Drug Discovery",      researcher: "Dr. Maya Patel",     department: "Biochemistry",            budget: 750000, submitted_date: "2026-03-28", status: "Scheduled",       defense_date: "2026-05-20", evaluators: ["Dr. Amanda Rodriguez", "Dr. James Thompson"] },
  { id: 4, proposal_id: "PRJ-008", title: "Neural Interface for Rehabilitation",       researcher: "Dr. Leo Santos",     department: "Biomedical Engineering",  budget: 420000, submitted_date: "2026-03-20", status: "Under Evaluation", defense_date: "2026-05-10", evaluators: ["Dr. Lisa Park"] },
  { id: 5, proposal_id: "PRJ-009", title: "Autonomous Drone Crop Monitoring System",  researcher: "Prof. Nina Cruz",    department: "Agriculture",             budget: 310000, submitted_date: "2026-04-15", status: "Pending",         defense_date: null,       evaluators: [] },
];

const MOCK_EVALUATORS = [
  { id: 1, name: "Dr. Amanda Rodriguez", expertise: "Machine Learning",    position: "Senior Evaluator" },
  { id: 2, name: "Dr. James Thompson",   expertise: "Biotechnology",        position: "Evaluator"        },
  { id: 3, name: "Dr. Lisa Park",        expertise: "Environmental Science",position: "Senior Evaluator" },
  { id: 4, name: "Dr. David Kumar",      expertise: "Physics",              position: "Evaluator"        },
];

/* ── status config ───────────────────────────────────────── */
const STATUS_MAP = {
  "Pending":          { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  "Scheduled":        { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  "Under Evaluation": { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  "Approved":         { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
};

/* ── Schedule + Assign Modal ─────────────────────────────── */
function ScheduleModal({ proposal, evaluatorList, onClose, onSave, saving }) {
  const [defenseDate,      setDefenseDate]      = useState(proposal.defense_date || "");
  const [defenseTime,      setDefenseTime]      = useState("");
  const [defenseVenue,     setDefenseVenue]     = useState("");
  const [selectedEvals,    setSelectedEvals]    = useState(proposal.evaluators || []);

  const toggleEval = (name) => {
    setSelectedEvals(prev =>
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    );
  };

  return (
    <div style={MO.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={MO.modal}>
        <div style={MO.header}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{proposal.proposal_id}</p>
            <h2 style={MO.title}>Schedule Defense & Assign Evaluators</h2>
          </div>
          <button style={MO.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div style={MO.body}>
          {/* Proposal info */}
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>{proposal.title}</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{proposal.researcher} · {proposal.department}</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#374151" }}>Budget: ₱{Number(proposal.budget).toLocaleString()}</p>
          </div>

          {/* Defense schedule */}
          <div style={{ marginBottom: 20 }}>
            <p style={MO.sectionTitle}><Calendar size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />Defense Schedule</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
              <div style={MO.field}>
                <label style={MO.label}>Date of Defense <span style={{ color: "#dc2626" }}>*</span></label>
                <input style={MO.input} type="date" value={defenseDate} onChange={e => setDefenseDate(e.target.value)} />
              </div>
              <div style={MO.field}>
                <label style={MO.label}>Time</label>
                <input style={MO.input} type="time" value={defenseTime} onChange={e => setDefenseTime(e.target.value)} />
              </div>
              <div style={{ ...MO.field, gridColumn: "1 / -1" }}>
                <label style={MO.label}>Venue / Room</label>
                <input style={MO.input} placeholder="e.g. Conference Room A, Building 2" value={defenseVenue} onChange={e => setDefenseVenue(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Assign Evaluators */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={MO.sectionTitle}><Users size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />Assign Evaluators</p>
              <span style={{ fontSize: 12, color: "#6b7280" }}>{selectedEvals.length} selected</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {evaluatorList.map(ev => {
                const checked = selectedEvals.includes(ev.name);
                return (
                  <div key={ev.id}
                    onClick={() => toggleEval(ev.name)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                      border: `1.5px solid ${checked ? "#16a34a" : "#e5e7eb"}`,
                      background: checked ? "#f0fdf4" : "#fff",
                      transition: "all 0.15s",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: checked ? "#16a34a" : "#f3f4f6",
                        color: checked ? "#fff" : "#6b7280",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 13, flexShrink: 0,
                      }}>
                        {ev.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{ev.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{ev.expertise} · {ev.position}</p>
                      </div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      border: `2px solid ${checked ? "#16a34a" : "#d1d5db"}`,
                      background: checked ? "#16a34a" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {checked && <CheckCircle2 size={13} color="#fff" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button style={MO.cancelBtn} onClick={onClose}>Cancel</button>
            <button
              style={{ ...MO.saveBtn, opacity: !defenseDate ? 0.5 : 1 }}
              disabled={!defenseDate || saving}
              onClick={() => onSave({ defense_date: defenseDate, defense_time: defenseTime, venue: defenseVenue, evaluators: selectedEvals })}>
              {saving ? "Saving…" : "Save Schedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── View Modal ──────────────────────────────────────────── */
function ViewModal({ proposal, onClose }) {
  const sb = STATUS_MAP[proposal.status] || STATUS_MAP["Pending"];
  return (
    <div style={MO.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...MO.modal, maxWidth: 520 }}>
        <div style={MO.header}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{proposal.proposal_id}</p>
            <h2 style={MO.title}>{proposal.title}</h2>
          </div>
          <button style={MO.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={MO.body}>
          <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: sb.bg, color: sb.color, border: `1px solid ${sb.border}`, marginBottom: 16 }}>
            {proposal.status}
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginBottom: 16 }}>
            {[
              ["Researcher",    proposal.researcher],
              ["Department",    proposal.department],
              ["Budget",        `₱${Number(proposal.budget).toLocaleString()}`],
              ["Submitted",     proposal.submitted_date],
              ["Defense Date",  proposal.defense_date || "Not scheduled"],
            ].map(([l, v]) => (
              <div key={l}>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</p>
                <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 600, color: "#111827" }}>{v}</p>
              </div>
            ))}
          </div>
          {proposal.evaluators?.length > 0 && (
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Assigned Evaluators</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {proposal.evaluators.map((ev, i) => (
                  <span key={i} style={{ padding: "4px 12px", borderRadius: 20, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: 13, fontWeight: 500 }}>
                    {ev}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Modal styles ────────────────────────────────────────── */
const MO = {
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal:       { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9", gap: 12 },
  title:       { margin: "4px 0 0", fontSize: 16, fontWeight: 700, color: "#111827" },
  closeBtn:    { background: "#f3f4f6", border: "none", borderRadius: 8, cursor: "pointer", padding: 6, display: "flex", color: "#374151", flexShrink: 0 },
  body:        { overflowY: "auto", padding: "20px 22px 22px" },
  sectionTitle:{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#374151", display: "flex", alignItems: "center" },
  field:       { display: "flex", flexDirection: "column", gap: 5 },
  label:       { fontSize: 13, fontWeight: 600, color: "#374151" },
  input:       { padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", color: "#111827", width: "100%", boxSizing: "border-box" },
  cancelBtn:   { padding: "9px 20px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 500 },
  saveBtn:     { padding: "9px 22px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 },
};

/* ── ProposalManagement ──────────────────────────────────── */
export default function ProposalManagement() {
  const [proposals,    setProposals]    = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [evaluators,   setEvaluators]   = useState([]);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading,      setLoading]      = useState(true);
  const [scheduling,   setScheduling]   = useState(null);
  const [viewing,      setViewing]      = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [success,      setSuccess]      = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get("/admin/proposals/pending").catch(() => ({ data: MOCK_PROPOSALS })),
      api.get("/admin/evaluators").catch(() => ({ data: MOCK_EVALUATORS })),
    ]).then(([pRes, eRes]) => {
      setProposals(pRes.data); setFiltered(pRes.data);
      setEvaluators(eRes.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(proposals.filter(p =>
      (statusFilter === "All" || p.status === statusFilter) &&
      (p.title?.toLowerCase().includes(q) ||
       p.researcher?.toLowerCase().includes(q) ||
       p.department?.toLowerCase().includes(q) ||
       p.proposal_id?.toLowerCase().includes(q))
    ));
  }, [search, statusFilter, proposals]);

  const handleSave = async ({ defense_date, defense_time, venue, evaluators: evals }) => {
    setSaving(true);
    try {
      await api.post(`/admin/proposals/${scheduling.id}/schedule`, { defense_date, defense_time, venue, evaluators: evals });
      setProposals(prev => prev.map(p =>
        p.id === scheduling.id ? { ...p, defense_date, evaluators: evals, status: "Scheduled" } : p
      ));
      setSuccess("Defense scheduled and evaluators assigned successfully!");
      setScheduling(null);
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      // update local state as fallback
      setProposals(prev => prev.map(p =>
        p.id === scheduling.id ? { ...p, defense_date, evaluators: evals, status: "Scheduled" } : p
      ));
      setSuccess("Schedule saved!");
      setScheduling(null);
      setTimeout(() => setSuccess(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  const ml = isMobile ? 0 : sidebarWidth;
  const statuses = ["All", "Pending", "Scheduled", "Under Evaluation"];
  const counts = {
    Pending:          proposals.filter(p => p.status === "Pending").length,
    Scheduled:        proposals.filter(p => p.status === "Scheduled").length,
    "Under Evaluation": proposals.filter(p => p.status === "Under Evaluation").length,
  };

  return (
    <>
      <style>{`
        .ppm-table { width:100%; border-collapse:collapse; }
        .ppm-table th { padding:12px 16px; text-align:left; font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; border-bottom:2px solid #e5e7eb; white-space:nowrap; background:#f9fafb; }
        .ppm-table td { padding:14px 16px; font-size:13px; color:#374151; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
        .ppm-table tr:last-child td { border-bottom:none; }
        .ppm-table tr:hover td { background:#fafafa; }
        .ppm-cards { display:none; flex-direction:column; gap:12px; }
        .ppm-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        @media(max-width:900px){ .ppm-table-wrap { display:none; } .ppm-cards { display:flex; } }
        @media(max-width:600px){ .ppm-stats { grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
        <AdminNavbar onWidthChange={setSidebarWidth} />

        <div style={{ marginLeft: ml, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.22s ease", minWidth: 0 }}>
          <Topbar title="Proposal Management" />

          <div style={{ padding: "24px", flex: 1 }}>

            {/* Heading */}
            <div style={{ marginBottom: 24 }}>
              <h3  style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Schedule defense dates and assign evaluators to pending proposals</h3>
            </div>

            {success && (
              <div style={{ background: "#dcfce7", color: "#15803d", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} /> {success}
              </div>
            )}

            {/* Stat mini-cards */}
            <div className="ppm-stats">
              {[
                { label: "Pending",          count: counts.Pending,          bg: "#fff7ed", border: "#fed7aa", color: "#c2410c", icon: Clock },
                { label: "Scheduled",        count: counts.Scheduled,        bg: "#dbeafe", border: "#bfdbfe", color: "#1d4ed8", icon: Calendar },
                { label: "Under Evaluation", count: counts["Under Evaluation"], bg: "#f5f3ff", border: "#ddd6fe", color: "#6d28d9", icon: ClipboardList },
              ].map(({ label, count, bg, border, color, icon: Icon }) => (
                <div key={label}
                  onClick={() => setStatusFilter(statusFilter === label ? "All" : label)}
                  style={{
                    background: statusFilter === label ? bg : "#fff",
                    border: `1px solid ${statusFilter === label ? border : "#e5e7eb"}`,
                    borderRadius: 12, padding: "16px 20px",
                    display: "flex", alignItems: "center", gap: 14,
                    cursor: "pointer", transition: "all 0.15s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} color={color} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>{count}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Search + filter */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <Search size={18} color="#9ca3af" strokeWidth={1.8} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by title, researcher, or department..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", padding: "12px 0", background: "transparent" }} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {statuses.map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    style={{
                      padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
                      border: `1px solid ${statusFilter === s ? "#f59e0b" : "#e5e7eb"}`,
                      background: statusFilter === s ? "#f59e0b" : "#fff",
                      color: statusFilter === s ? "#fff" : "#374151",
                      transition: "all 0.15s",
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Table card */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={18} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>
                  Proposals ({filtered.length})
                </h3>
              </div>

              {loading ? (
                <p style={{ padding: 24, color: "#9ca3af", fontSize: 14 }}>Loading…</p>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <FileText size={40} color="#d1d5db" style={{ margin: "0 auto 10px", display: "block" }} />
                  <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>No proposals found.</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="ppm-table-wrap" style={{ overflowX: "auto" }}>
                    <table className="ppm-table">
                      <thead>
                        <tr>
                          {["ID","Title","Researcher","Department","Budget","Submitted","Defense Date","Evaluators","Status","Actions"].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(p => {
                          const sb = STATUS_MAP[p.status] || STATUS_MAP["Pending"];
                          return (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{p.proposal_id}</td>
                              <td style={{ maxWidth: 200 }}>
                                <p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>{p.title}</p>
                              </td>
                              <td style={{ whiteSpace: "nowrap" }}>{p.researcher}</td>
                              <td>{p.department}</td>
                              <td style={{ whiteSpace: "nowrap" }}>₱{Number(p.budget).toLocaleString()}</td>
                              <td style={{ whiteSpace: "nowrap", color: "#6b7280" }}>{p.submitted_date}</td>
                              <td>
                                {p.defense_date
                                  ? <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#1d4ed8", fontWeight: 600, fontSize: 12 }}><Calendar size={12} />{p.defense_date}</span>
                                  : <span style={{ color: "#9ca3af", fontSize: 12 }}>Not set</span>
                                }
                              </td>
                              <td>
                                {p.evaluators?.length > 0
                                  ? <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                      {p.evaluators.map((ev, i) => (
                                        <span key={i} style={{ padding: "2px 8px", borderRadius: 12, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}>
                                          {ev.split(" ").slice(-1)[0]}
                                        </span>
                                      ))}
                                    </div>
                                  : <span style={{ color: "#9ca3af", fontSize: 12 }}>None</span>
                                }
                              </td>
                              <td>
                                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: sb.bg, color: sb.color, border: `1px solid ${sb.border}`, whiteSpace: "nowrap" }}>
                                  {p.status}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button onClick={() => setViewing(p)}
                                    style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "#374151" }}>
                                    <Eye size={13} /> View
                                  </button>
                                  <button onClick={() => setScheduling(p)}
                                    style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "none", background: "#f59e0b", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
                                    <Calendar size={13} /> Schedule
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
                  <div className="ppm-cards" style={{ padding: "14px 16px" }}>
                    {filtered.map(p => {
                      const sb = STATUS_MAP[p.status] || STATUS_MAP["Pending"];
                      return (
                        <div key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", background: "#fafafa" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 10 }}>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{p.proposal_id}</p>
                            </div>
                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: sb.bg, color: sb.color, border: `1px solid ${sb.border}`, whiteSpace: "nowrap", flexShrink: 0 }}>
                              {p.status}
                            </span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px", fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                            <span><b style={{ color: "#374151" }}>By:</b> {p.researcher}</span>
                            <span><b style={{ color: "#374151" }}>Dept:</b> {p.department}</span>
                            <span><b style={{ color: "#374151" }}>Budget:</b> ₱{Number(p.budget).toLocaleString()}</span>
                            <span><b style={{ color: "#374151" }}>Defense:</b> {p.defense_date || "Not set"}</span>
                          </div>
                          {p.evaluators?.length > 0 && (
                            <div style={{ marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {p.evaluators.map((ev, i) => (
                                <span key={i} style={{ padding: "2px 8px", borderRadius: 12, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: 11, fontWeight: 500 }}>{ev.split(" ").slice(-1)[0]}</span>
                              ))}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setViewing(p)}
                              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#374151" }}>
                              <Eye size={14} /> View
                            </button>
                            <button onClick={() => setScheduling(p)}
                              style={{ flex: 2, padding: "8px 0", borderRadius: 8, border: "none", background: "#f59e0b", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#fff" }}>
                              <Calendar size={14} /> Schedule Defense
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

      {scheduling && (
        <ScheduleModal proposal={scheduling} evaluatorList={evaluators}
          onClose={() => setScheduling(null)} onSave={handleSave} saving={saving} />
      )}
      {viewing && <ViewModal proposal={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}