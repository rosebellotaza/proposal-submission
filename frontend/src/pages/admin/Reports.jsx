import { useState, useEffect, useRef } from "react";
import AdminNavbar from "../../components/admin/navbar";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FileText, Download, TrendingUp, CheckCircle2,
  Clock, XCircle, Users, Filter, ChevronDown,
  BarChart2, PieChart as PieIcon, Activity,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";

/* ── mock data ───────────────────────────────────────────── */
const MOCK = {
  summary: {
    totalProposals:   24,
    approved:         9,
    rejected:         4,
    pending:          11,
    totalBudget:      4820000,
    avgScore:         78.4,
    totalFaculty:     15,
    totalEvaluators:  8,
  },
  monthly: [
    { month: "Jan", submitted: 3, approved: 1, rejected: 0 },
    { month: "Feb", submitted: 4, approved: 2, rejected: 1 },
    { month: "Mar", submitted: 5, approved: 2, rejected: 1 },
    { month: "Apr", submitted: 6, approved: 3, rejected: 2 },
    { month: "May", submitted: 3, approved: 1, rejected: 0 },
    { month: "Jun", submitted: 3, approved: 0, rejected: 0 },
  ],
  byDepartment: [
    { department: "Computer Science",    proposals: 6, budget: 1200000, approved: 3 },
    { department: "Agriculture",         proposals: 5, budget: 850000,  approved: 2 },
    { department: "Physics",             proposals: 4, budget: 920000,  approved: 2 },
    { department: "Civil Engineering",   proposals: 4, budget: 1050000, approved: 1 },
    { department: "Environmental Sci.",  proposals: 3, budget: 500000,  approved: 1 },
    { department: "Biochemistry",        proposals: 2, budget: 300000,  approved: 0 },
  ],
  statusDist: [
    { name: "Approved",         value: 9,  color: "#15803d" },
    { name: "Pending",          value: 11, color: "#f59e0b" },
    { name: "Rejected",         value: 4,  color: "#dc2626" },
    { name: "Under Evaluation", value: 3,  color: "#7c3aed" },
    { name: "Scheduled",        value: 3,  color: "#1d4ed8" },
  ],
  topProposals: [
    { id: "PRJ-003", title: "Renewable Energy Storage Solutions",    researcher: "Dr. Robert Williams", dept: "Physics",          score: 94, budget: 560000, status: "Approved" },
    { id: "PRJ-001", title: "AI-Driven Healthcare Diagnosis System", researcher: "Prof. Michael Chen",  dept: "Computer Science", score: 91, budget: 320000, status: "Approved" },
    { id: "PRJ-002", title: "Smart Water Quality Monitoring",        researcher: "Prof. Carlos Reyes",  dept: "Env. Science",     score: 88, budget: 280000, status: "Approved" },
    { id: "PRJ-007", title: "Blockchain-Based Land Registry",        researcher: "Dr. Anna Lee",        dept: "Info. Technology", score: 85, budget: 195000, status: "Scheduled" },
    { id: "PRJ-005", title: "Sustainable Farming Techniques",        researcher: "Dr. Emily Davis",     dept: "Agriculture",      score: 82, budget: 180000, status: "Approved" },
  ],
  evaluatorPerf: [
    { name: "Dr. Amanda Rodriguez", assigned: 8, completed: 7, avgScore: 84 },
    { name: "Dr. Lisa Park",        assigned: 7, completed: 6, avgScore: 81 },
    { name: "Dr. James Thompson",   assigned: 6, completed: 6, avgScore: 79 },
    { name: "Dr. David Kumar",      assigned: 4, completed: 2, avgScore: 76 },
  ],
};

/* ── helpers ─────────────────────────────────────────────── */
const fmt    = n  => Number(n || 0).toLocaleString();
const fmtM   = n  => `₱${(n / 1000000).toFixed(2)}M`;
const STATUS_STYLE = {
  Approved:         { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  Pending:          { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  Rejected:         { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  Scheduled:        { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  "Under Evaluation":{ bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
};

/* ── ScoreBar ────────────────────────────────────────────── */
function ScoreBar({ score }) {
  const color = score >= 90 ? "#15803d" : score >= 80 ? "#f59e0b" : "#dc2626";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 99 }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 99, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28 }}>{score}</span>
    </div>
  );
}

/* ── Tab Button ──────────────────────────────────────────── */
function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "8px 18px", borderRadius: 9,
      border: `1.5px solid ${active ? "#f59e0b" : "#e5e7eb"}`,
      background: active ? "#f59e0b" : "#fff",
      color: active ? "#fff" : "#374151",
      fontWeight: active ? 600 : 400,
      fontSize: 13, cursor: "pointer", transition: "all 0.15s",
    }}>
      <Icon size={15} /> {label}
    </button>
  );
}

/* ── Custom Pie Label ────────────────────────────────────── */
const PieLabel = ({ cx, cy, midAngle, outerRadius, name, percent }) => {
  const R = Math.PI / 180;
  const r = outerRadius + 34;
  const x = cx + r * Math.cos(-midAngle * R);
  const y = cy + r * Math.sin(-midAngle * R);
  return (
    <text x={x} y={y} fill="#374151" textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central" fontSize={11} fontWeight={500}>
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ── Reports Page ────────────────────────────────────────── */
export default function Reports() {
  const [data,         setData]         = useState(MOCK);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("overview");
  const [yearFilter,   setYearFilter]   = useState("2026");
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    api.get("/admin/reports")
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* export CSV */
  const exportCSV = (rows, filename) => {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv  = [keys.join(","), ...rows.map(r => keys.map(k => `"${r[k]}"`).join(","))].join("\n");
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = filename;
    a.click();
  };

  const ml = isMobile ? 0 : sidebarWidth;
  const s  = data.summary;

  const summaryCards = [
    { label: "Total Proposals", value: s.totalProposals, sub: `+3 this month`,        icon: FileText,    color: "#f59e0b", bg: "#fefce8", border: "#fde68a", trend: "up"   },
    { label: "Approved",        value: s.approved,       sub: `${Math.round(s.approved/s.totalProposals*100)}% approval rate`, icon: CheckCircle2, color: "#15803d", bg: "#dcfce7", border: "#bbf7d0", trend: "up"   },
    { label: "Pending Review",  value: s.pending,        sub: "Awaiting action",       icon: Clock,       color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", trend: "down" },
    { label: "Rejected",        value: s.rejected,       sub: "Not approved",          icon: XCircle,     color: "#dc2626", bg: "#fef2f2", border: "#fecaca", trend: null   },
    { label: "Total Budget",    value: fmtM(s.totalBudget), sub: "Across all projects", icon: TrendingUp,  color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", trend: "up"   },
    { label: "Avg. Score",      value: `${s.avgScore}`,  sub: "Evaluation average",    icon: Activity,    color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", trend: "up"   },
    { label: "Faculty",         value: s.totalFaculty,   sub: "Active researchers",    icon: Users,       color: "#0e7490", bg: "#e0f2fe", border: "#bae6fd", trend: null   },
    { label: "Evaluators",      value: s.totalEvaluators,sub: "Active evaluators",     icon: Users,       color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe", trend: null   },
  ];

  return (
    <>
      <style>{`
        .rpt-grid-8  { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
        .rpt-grid-2  { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
        .rpt-table   { width:100%; border-collapse:collapse; }
        .rpt-table th{ padding:11px 14px; text-align:left; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.06em; border-bottom:2px solid #e5e7eb; background:#f9fafb; white-space:nowrap; }
        .rpt-table td{ padding:13px 14px; font-size:13px; color:#374151; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
        .rpt-table tr:last-child td{ border-bottom:none; }
        .rpt-table tr:hover td{ background:#fafafa; }
        @media(max-width:1200px){ .rpt-grid-8 { grid-template-columns:repeat(4,1fr); } }
        @media(max-width:900px) { .rpt-grid-8 { grid-template-columns:repeat(2,1fr); } .rpt-grid-2 { grid-template-columns:1fr; } }
        @media(max-width:500px) { .rpt-grid-8 { grid-template-columns:1fr 1fr; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
        <AdminNavbar onWidthChange={setSidebarWidth} />

        <div style={{ marginLeft: ml, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.22s ease", minWidth: 0 }}>
          <Topbar title="Reports" />

          <div style={{ padding: "24px", flex: 1 }}>

            {/* ── Page header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3  style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Research project and proposal performance overview</h3>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {/* Year filter */}
                <div style={{ position: "relative" }}>
                  <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
                    style={{ appearance: "none", padding: "8px 36px 8px 14px", borderRadius: 9, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, color: "#374151", fontWeight: 500, cursor: "pointer", outline: "none" }}>
                    {["2026","2025","2024"].map(y => <option key={y}>{y}</option>)}
                  </select>
                  <ChevronDown size={14} color="#6b7280" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
                {/* Export */}
                <button
                  onClick={() => exportCSV(data.topProposals, "proposals-report.csv")}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 9, border: "none", background: "#f59e0b", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 6px rgba(245,158,11,0.3)" }}>
                  <Download size={15} /> Export CSV
                </button>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              <TabBtn active={activeTab === "overview"}    onClick={() => setActiveTab("overview")}    icon={BarChart2}  label="Overview"     />
              <TabBtn active={activeTab === "proposals"}   onClick={() => setActiveTab("proposals")}   icon={FileText}   label="Proposals"    />
              <TabBtn active={activeTab === "evaluators"}  onClick={() => setActiveTab("evaluators")}  icon={Users}      label="Evaluators"   />
              <TabBtn active={activeTab === "departments"} onClick={() => setActiveTab("departments")} icon={PieIcon}    label="Departments"  />
            </div>

            {/* ════ OVERVIEW TAB ════ */}
            {activeTab === "overview" && (
              <>
                {/* Summary cards */}
                <div className="rpt-grid-8">
                  {summaryCards.map(({ label, value, sub, icon: Icon, color, bg, border, trend }) => (
                    <div key={label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderTop: `3px solid ${color}`, borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={16} color={color} strokeWidth={1.8} />
                        </div>
                        {trend === "up"   && <ArrowUpRight   size={16} color="#15803d" />}
                        {trend === "down" && <ArrowDownRight size={16} color="#dc2626" />}
                      </div>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</p>
                      <p style={{ margin: "4px 0 2px", fontSize: 12, fontWeight: 500, color: "#374151" }}>{label}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="rpt-grid-2">
                  {/* Line chart */}
                  <div style={CARD}>
                    <div style={CARD_TOP}>
                      <h3 style={CARD_H}>Monthly Submission Trends</h3>
                      <span style={BADGE_YELLOW}>{yearFilter}</span>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={data.monthly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line type="monotone" dataKey="submitted" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} name="Submitted" />
                        <Line type="monotone" dataKey="approved"  stroke="#15803d" strokeWidth={2.5} dot={{ r: 4 }} name="Approved"  />
                        <Line type="monotone" dataKey="rejected"  stroke="#dc2626" strokeWidth={2}   dot={{ r: 4 }} name="Rejected"  strokeDasharray="5 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie */}
                  <div style={CARD}>
                    <div style={CARD_TOP}>
                      <h3 style={CARD_H}>Proposal Status Distribution</h3>
                      <span style={BADGE_YELLOW}>{s.totalProposals} total</span>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={data.statusDist} cx="50%" cy="50%" outerRadius={85}
                          label={PieLabel} labelLine dataKey="value">
                          {data.statusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar chart — department budget */}
                <div style={{ ...CARD, marginBottom: 0 }}>
                  <div style={CARD_TOP}>
                    <h3 style={CARD_H}>Budget Allocation by Department</h3>
                    <button onClick={() => exportCSV(data.byDepartment, "dept-budget.csv")} style={EXPORT_MINI}>
                      <Download size={13} /> CSV
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.byDepartment} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="department" tick={{ fontSize: 10, fill: "#6b7280" }} interval={0} angle={-18} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={v => `₱${v/1000}K`} />
                      <Tooltip formatter={v => [`₱${Number(v).toLocaleString()}`, "Budget"]} />
                      <Bar dataKey="budget" fill="#f59e0b" radius={[5, 5, 0, 0]} maxBarSize={52} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* ════ PROPOSALS TAB ════ */}
            {activeTab === "proposals" && (
              <div style={CARD}>
                <div style={{ ...CARD_TOP, marginBottom: 16 }}>
                  <h3 style={CARD_H}>Top Performing Proposals</h3>
                  <button onClick={() => exportCSV(data.topProposals, "top-proposals.csv")} style={EXPORT_MINI}>
                    <Download size={13} /> Export
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="rpt-table">
                    <thead>
                      <tr>
                        {["Rank", "ID", "Title", "Researcher", "Department", "Budget", "Score", "Status"].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProposals.map((p, i) => {
                        const ss = STATUS_STYLE[p.status] || STATUS_STYLE.Pending;
                        return (
                          <tr key={p.id}>
                            <td>
                              <div style={{ width: 26, height: 26, borderRadius: "50%", background: i === 0 ? "#fef9c3" : i === 1 ? "#f3f4f6" : "#fff7ed", border: `1px solid ${i === 0 ? "#fde68a" : "#e5e7eb"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: i === 0 ? "#a16207" : "#6b7280" }}>
                                {i + 1}
                              </div>
                            </td>
                            <td style={{ fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{p.id}</td>
                            <td style={{ maxWidth: 220 }}><p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>{p.title}</p></td>
                            <td style={{ whiteSpace: "nowrap" }}>{p.researcher}</td>
                            <td style={{ whiteSpace: "nowrap" }}>{p.dept}</td>
                            <td style={{ whiteSpace: "nowrap" }}>₱{fmt(p.budget)}</td>
                            <td style={{ minWidth: 120 }}><ScoreBar score={p.score} /></td>
                            <td>
                              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, whiteSpace: "nowrap" }}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Monthly bar */}
                <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
                  <h3 style={{ ...CARD_H, marginBottom: 16 }}>Monthly Submissions vs Approvals</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.monthly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="submitted" name="Submitted" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="approved"  name="Approved"  fill="#15803d" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="rejected"  name="Rejected"  fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ════ EVALUATORS TAB ════ */}
            {activeTab === "evaluators" && (
              <div style={CARD}>
                <div style={{ ...CARD_TOP, marginBottom: 20 }}>
                  <h3 style={CARD_H}>Evaluator Performance</h3>
                  <button onClick={() => exportCSV(data.evaluatorPerf, "evaluator-perf.csv")} style={EXPORT_MINI}>
                    <Download size={13} /> Export
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="rpt-table">
                    <thead>
                      <tr>
                        {["Evaluator", "Assigned", "Completed", "Completion Rate", "Avg. Score"].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.evaluatorPerf.map((ev) => {
                        const rate = Math.round((ev.completed / ev.assigned) * 100);
                        return (
                          <tr key={ev.name}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f59e0b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                  {ev.name.charAt(0)}
                                </div>
                                <span style={{ fontWeight: 600, color: "#111827" }}>{ev.name}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{ev.assigned}</td>
                            <td style={{ fontWeight: 600 }}>{ev.completed}</td>
                            <td style={{ minWidth: 160 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 99 }}>
                                  <div style={{ height: "100%", width: `${rate}%`, background: rate >= 90 ? "#15803d" : rate >= 70 ? "#f59e0b" : "#dc2626", borderRadius: 99 }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, minWidth: 32, color: "#374151" }}>{rate}%</span>
                              </div>
                            </td>
                            <td style={{ minWidth: 120 }}><ScoreBar score={ev.avgScore} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ════ DEPARTMENTS TAB ════ */}
            {activeTab === "departments" && (
              <>
                <div className="rpt-grid-2">
                  {/* Bar — proposals per dept */}
                  <div style={CARD}>
                    <h3 style={CARD_H}>Proposals per Department</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={data.byDepartment} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} />
                        <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: "#374151" }} width={80} />
                        <Tooltip />
                        <Bar dataKey="proposals" name="Proposals" fill="#f59e0b" radius={[0, 5, 5, 0]} maxBarSize={24} />
                        <Bar dataKey="approved"  name="Approved"  fill="#15803d" radius={[0, 5, 5, 0]} maxBarSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie — budget share */}
                  <div style={CARD}>
                    <h3 style={CARD_H}>Budget Share by Department</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={data.byDepartment.map(d => ({ name: d.department, value: d.budget }))}
                          cx="50%" cy="50%" outerRadius={85} dataKey="value"
                          label={({ name, percent }) => `${(percent*100).toFixed(0)}%`}
                          labelLine>
                          {data.byDepartment.map((_, i) => (
                            <Cell key={i} fill={["#f59e0b","#15803d","#1d4ed8","#7c3aed","#0e7490","#dc2626"][i % 6]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={v => [`₱${Number(v).toLocaleString()}`, "Budget"]} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Department table */}
                <div style={CARD}>
                  <div style={{ ...CARD_TOP, marginBottom: 16 }}>
                    <h3 style={CARD_H}>Department Summary Table</h3>
                    <button onClick={() => exportCSV(data.byDepartment, "departments.csv")} style={EXPORT_MINI}>
                      <Download size={13} /> Export
                    </button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="rpt-table">
                      <thead>
                        <tr>
                          {["Department", "Total Proposals", "Approved", "Approval Rate", "Total Budget"].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.byDepartment.map(d => {
                          const rate = Math.round((d.approved / d.proposals) * 100);
                          return (
                            <tr key={d.department}>
                              <td style={{ fontWeight: 600, color: "#111827" }}>{d.department}</td>
                              <td>{d.proposals}</td>
                              <td>
                                <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
                                  {d.approved}
                                </span>
                              </td>
                              <td style={{ minWidth: 140 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 99 }}>
                                    <div style={{ height: "100%", width: `${rate}%`, background: "#f59e0b", borderRadius: 99 }} />
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", minWidth: 30 }}>{rate}%</span>
                                </div>
                              </td>
                              <td style={{ fontWeight: 600, color: "#111827" }}>₱{fmt(d.budget)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

/* ── shared styles ───────────────────────────────────────── */
const CARD       = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 20 };
const CARD_TOP   = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 };
const CARD_H     = { margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" };
const BADGE_YELLOW = { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#fefce8", color: "#a16207", border: "1px solid #fde68a" };
const EXPORT_MINI  = { display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 12, color: "#374151", fontWeight: 500 };