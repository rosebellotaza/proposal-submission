// src/pages/approver/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApproverNavbar from "../../components/approver/navbar";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  ShieldCheck, CheckCircle2, FileText, TrendingUp,
  ArrowRight, Bell,
} from "lucide-react";
import { getSession } from "../../utils/auth";

/* ── constants ───────────────────────────────────────────── */
const PIE_COLORS = ["#15803d", "#4ade80", "#86efac", "#6b7280", "#0e7490"];
const pct        = (n, t) => (t ? Math.round((n / t) * 100) : 0);

/* ── mock fallback ───────────────────────────────────────── */
const MOCK = {
  pending: 1, approved: 1, total: 5,
  byStatus: { approved: 1, in_progress: 1, submitted: 1, draft: 1, under_evaluation: 1 },
  byDepartment: [
    { department: "Environmental Science", total_budget: 440000 },
    { department: "Agriculture",           total_budget: 310000 },
    { department: "Physics",               total_budget: 270000 },
    { department: "Civil Engineering",     total_budget: 760000 },
  ],
};

/* ── pie label ───────────────────────────────────────────── */
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

/* ── stat card — matches researcher style ────────────────── */
function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub, action, accentColor }) {
  const navigate = useNavigate();
  return (
    <div style={{
      background:  "#fff",
      border:      "1px solid #e5e7eb",
      borderTop:   `3px solid ${accentColor}`,
      borderRadius: 12,
      padding:     "20px 22px",
      display:     "flex",
      flexDirection: "column",
      gap:         6,
      boxShadow:   "0 1px 3px rgba(0,0,0,0.04)",
      minWidth:    0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</p>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={19} color={iconColor} strokeWidth={1.8} />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>{value}</p>
      <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{sub}</p>
      {action && (
        <button onClick={() => navigate("/approver/approvals")} style={{
          marginTop: 2, background: "none", border: "none", cursor: "pointer",
          fontSize: 13, fontWeight: 600, color: "#16a34a",
          display: "flex", alignItems: "center", gap: 4, padding: 0,
        }}>
          {action} <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────────── */
export default function Dashboard() {
  const [stats,        setStats]        = useState(MOCK);
  const [loading,      setLoading]      = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);

  const session  = getSession?.() || {};
  const userName = session?.name || "Approver";
  const initial  = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approvalRate = pct(stats.approved ?? 1, stats.total ?? 5);

  const pieData = [
    { name: "Approved",         value: stats.byStatus?.approved         || 1 },
    { name: "In Progress",      value: stats.byStatus?.in_progress      || 1 },
    { name: "Submitted",        value: stats.byStatus?.submitted        || 1 },
    { name: "Draft",            value: stats.byStatus?.draft            || 1 },
    { name: "Under Evaluation", value: stats.byStatus?.under_evaluation || 1 },
  ];

  const barData = (stats.byDepartment || MOCK.byDepartment).map(d => ({
    dept:   d.department,
    budget: Math.round((d.total_budget || 0) / 1000),
  }));

  const ml = isMobile ? 0 : sidebarWidth;

  return (
    <>
      <style>{`
        .db-stat-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
        .db-chart-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        @media(max-width:1100px){ .db-stat-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:700px) { .db-stat-grid { grid-template-columns:1fr; } .db-chart-grid { grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
        <ApproverNavbar onWidthChange={setSidebarWidth} />

        <div style={{ marginLeft: ml, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.22s ease", minWidth: 0 }}>
          
          <Topbar title="Dashboard" />
          {/* ── Page body ── */}
          <div style={{ padding: "24px 24px", flex: 1 }}>

            {/* Stat Cards */}
            <div className="db-stat-grid">
              <StatCard icon={ShieldCheck}  iconColor="#0e7490" iconBg="#e0f2fe" accentColor="#0e7490"
                label="Pending Approval" value={stats.pending ?? 1}  sub="Awaiting decision" action="Review now" />
              <StatCard icon={CheckCircle2} iconColor="#16a34a" iconBg="#dcfce7" accentColor="#16a34a"
                label="Approved"         value={stats.approved ?? 1} sub="Successfully approved" />
              <StatCard icon={FileText}     iconColor="#6b7280" iconBg="#f3f4f6" accentColor="#9ca3af"
                label="Total Proposals"  value={stats.total ?? 5}    sub="All submissions" />
              <StatCard icon={TrendingUp}   iconColor="#7c3aed" iconBg="#f5f3ff" accentColor="#7c3aed"
                label="Approval Rate"   value={`${approvalRate}%`}  sub="Success rate" />
            </div>

            {/* Charts */}
            <div className="db-chart-grid">

              {/* Pie */}
              <div style={CARD}>
                <h3 style={CARD_H}>Project Status Distribution</h3>
                <ResponsiveContainer width="100%" height={270}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={88}
                      label={PieLabel} labelLine dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar */}
              <div style={CARD}>
                <h3 style={CARD_H}>Budget by Department</h3>
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#6b7280" }}
                      interval={0} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }}
                      label={{ value: "Budget (K)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#9ca3af" }} />
                    <Tooltip formatter={v => [`₱${v}K`, "Budget"]} />
                    <Bar dataKey="budget" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={50} />
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