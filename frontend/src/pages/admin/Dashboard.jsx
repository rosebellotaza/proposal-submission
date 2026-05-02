import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/admin/navbar";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import { getSession } from "../../utils/auth";
import { Users, FileText, ClipboardList, ShieldCheck } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

/* ── constants ───────────────────────────────────────────── */
const PIE_COLORS = ["#15803d", "#4ade80", "#86efac", "#d1d5db", "#0e7490"];

/* ── mock fallback ───────────────────────────────────────── */
const MOCK = {
  total_faculty:    15,
  total_evaluators: 8,
  total_proposals:  5,
  system_users:     23,
  byStatus: { approved: 1, in_progress: 1, submitted: 1, draft: 1, under_evaluation: 1 },
  byDepartment: [
    { department: "Computer Science", total_budget: 440000 },
    { department: "Agriculture",      total_budget: 310000 },
    { department: "Physics",          total_budget: 270000 },
    { department: "Civil Engineering",total_budget: 760000 },
  ],
};

/* ── Pie label ───────────────────────────────────────────── */
const PieLabel = ({ cx, cy, midAngle, outerRadius, name, percent }) => {
  const R = Math.PI / 180;
  const r = outerRadius + 36;
  const x = cx + r * Math.cos(-midAngle * R);
  const y = cy + r * Math.sin(-midAngle * R);
  return (
    <text x={x} y={y} fill="#374151" textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central" fontSize={11} fontWeight={500}>
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ── AdminDashboard ──────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,        setStats]        = useState(MOCK);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then(res => setStats(res.data))
      .catch(() => {});
  }, []);

  const ml = isMobile ? 0 : sidebarWidth;

  const cards = [
    {
      label:   "Total Faculty",
      value:   stats?.total_faculty    ?? MOCK.total_faculty,
      sub:     "Active researchers",
      action:  "Manage faculty",
      icon:    Users,
      color:   "#f59e0b",
      bg:      "#fefce8",
      border:  "#fde68a",
      accent:  "#f59e0b",
    },
    {
      label:   "Total Evaluators",
      value:   stats?.total_evaluators ?? MOCK.total_evaluators,
      sub:     "Active evaluators",
      action:  "Manage evaluators",
      icon:    ClipboardList,
      color:   "#7c3aed",
      bg:      "#f5f3ff",
      border:  "#ddd6fe",
      accent:  "#7c3aed",
    },
    {
      label:  "Total Proposals",
      value:  stats?.total_proposals  ?? MOCK.total_proposals,
      sub:    "All submissions",
      icon:   FileText,
      color:  "#6b7280",
      bg:     "#f3f4f6",
      border: "#e5e7eb",
      accent: "#9ca3af",
    },
    {
      label:  "System Users",
      value:  stats?.system_users     ?? MOCK.system_users,
      sub:    "Total active users",
      icon:   ShieldCheck,
      color:  "#16a34a",
      bg:     "#dcfce7",
      border: "#bbf7d0",
      accent: "#16a34a",
    },
  ];

  const pieData = [
    { name: "Approved",         value: stats?.byStatus?.approved         || 1 },
    { name: "In Progress",      value: stats?.byStatus?.in_progress      || 1 },
    { name: "Submitted",        value: stats?.byStatus?.submitted        || 1 },
    { name: "Draft",            value: stats?.byStatus?.draft            || 1 },
    { name: "Under Evaluation", value: stats?.byStatus?.under_evaluation || 1 },
  ];

  const barData = (stats?.byDepartment || MOCK.byDepartment).map(d => ({
    dept:   d.department,
    budget: Math.round((d.total_budget || 0) / 1000),
  }));

  return (
    <>
      <style>{`
        .adm-grid       { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:28px; }
        .adm-chart-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        @media(max-width:1100px){ .adm-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:700px) { .adm-grid { grid-template-columns:1fr; } .adm-chart-grid { grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
        <AdminNavbar onWidthChange={setSidebarWidth} />

        <div style={{
          marginLeft: ml, flex: 1,
          display: "flex", flexDirection: "column",
          transition: "margin-left 0.22s ease", minWidth: 0,
        }}>

          <Topbar title="Dashboard" />

          <div style={{ padding: "24px", flex: 1 }}>

            <div style={{ marginBottom: 24 }}>
              <h3  style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
                Manage proposals, users, and oral presentations
              </h3>
            </div>

            {/* ── Stat Cards ── */}
            <div className="adm-grid">
              {cards.map(({ label, value, sub, action, icon: Icon, color, bg, border, accent, onClick }) => (
                <div key={label}
                  onClick={onClick}
                  style={{
                    background:    "#fff",
                    border:        "1px solid #e5e7eb",
                    borderLeft:    `4px solid ${accent}`,
                    borderRadius:  12,
                    padding:       "20px 22px",
                    display:       "flex",
                    flexDirection: "column",
                    gap:           6,
                    boxShadow:     "0 1px 3px rgba(0,0,0,0.04)",
                    cursor:        onClick ? "pointer" : "default",
                    transition:    "box-shadow 0.15s",
                  }}
                  onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={e => { if (onClick) e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#6b7280" }}>{label}</p>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: bg, border: `1px solid ${border}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={18} color={color} strokeWidth={1.8} />
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>{value}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{sub}</p>
                  {action && (
                    <button
                      onClick={e => { e.stopPropagation(); onClick?.(); }}
                      style={{
                        marginTop: 2, background: "none", border: "none",
                        cursor: "pointer", fontSize: 13, fontWeight: 600,
                        color: accent, display: "flex", alignItems: "center", gap: 4, padding: 0,
                      }}>
                      {action} →
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* ── Charts ── */}
            <div className="adm-chart-grid">

              {/* Pie */}
              <div style={CARD}>
                <h3 style={CARD_H}>Project Status Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90}
                      label={PieLabel} labelLine dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar */}
              <div style={CARD}>
                <h3 style={CARD_H}>Budget by Department</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#6b7280" }}
                      interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }}
                      label={{ value: "Budget (K)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#9ca3af" }} />
                    <Tooltip formatter={v => [`₱${v}K`, "Budget"]} />
                    <Bar dataKey="budget" fill="#15803d" radius={[4, 4, 0, 0]} maxBarSize={52} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const CARD   = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" };
const CARD_H = { margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#111827" };