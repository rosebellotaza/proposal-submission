// src/pages/researcher/Dashboard.jsx
import { useEffect, useState } from "react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  User, FileText, CheckCircle, Receipt, CheckCircle2,
} from "lucide-react";
import api from "../../utils/api";

const PIE_COLORS   = ["#1f7a1f", "#159570", "#3ecf8e", "#6cd1a4", "#cfcfcf"];
const LABEL_COLORS = ["#159570", "#1f7a1f", "#3ecf8e", "#6cd1a4", "#9ca3af"];

/* ── mock budget fallback ── */
const MOCK_BUDGET = [
  { department: "Computer Science", total_budget: 440000 },
  { department: "Agriculture",      total_budget: 310000 },
  { department: "Physics",          total_budget: 270000 },
  { department: "Civil Engineering",total_budget: 760000 },
];

export default function Dashboard() {
  const [stats,      setStats]      = useState(null);
  const [budgetData, setBudgetData] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then(res => {
        setStats(res.data);

        /* budget by department — try from stats first, else separate endpoint */
        if (res.data?.by_department?.length) {
          setBudgetData(res.data.by_department);
        } else {
          api.get("/dashboard/budget-by-department")
            .then(r => setBudgetData(r.data))
            .catch(() => setBudgetData(MOCK_BUDGET));
        }
      })
      .catch(() => setBudgetData(MOCK_BUDGET));
  }, []);

  const pieData = stats
    ? Object.entries(stats.status_counts || {}).map(([name, value]) => ({ name, value }))
    : [];

  const barData = budgetData.map(d => ({
    dept:   d.department,
    budget: Math.round((d.total_budget || 0) / 1000),
  }));

  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 36;
    const x      = cx + radius * Math.cos(-midAngle * RADIAN);
    const y      = cy + radius * Math.sin(-midAngle * RADIAN);
    const idx    = pieData.findIndex(d => d.name === name);
    return (
      <text x={x} y={y}
        fill={LABEL_COLORS[idx] || "#9ca3af"}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12} fontWeight={500}>
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Dashboard" />
        <div className="dashboard-content">

            <div style={{ marginBottom: 24 }}>
              <h3  style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
                Overview of your research projects, proposals, and activity
              </h3>
            </div>

          {/* ── Stat Cards ── */}
          <div className="cards">
            <div className="card card-accent">
              <div className="card-top">
                <div>
                  <p className="card-label">My Projects</p>
                  <h2 className="card-value">{stats?.my_projects ?? "—"}</h2>
                  <p className="card-sub">Active projects</p>
                </div>
                <div className="card-icon blue"><User size={22} /></div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Submitted</p>
                  <h2 className="card-value">{stats?.submitted ?? "—"}</h2>
                  <p className="card-sub">Under review</p>
                </div>
                <div className="card-icon blue"><FileText size={22} /></div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Approved</p>
                  <h2 className="card-value">{stats?.approved ?? "—"}</h2>
                  <p className="card-sub">Successfully approved</p>
                </div>
                <div className="card-icon green"><CheckCircle size={22} /></div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Total Budget</p>
                  <h2 className="card-value">
                    {stats?.total_budget
                      ? `₱${Number(stats.total_budget).toLocaleString()}`
                      : "—"}
                  </h2>
                  <p className="card-sub">Across all projects</p>
                </div>
                <div className="card-icon orange"><Receipt size={22} /></div>
              </div>
            </div>
          </div>

          {/* ── Charts — side by side ── */}
          <div style={{
            display:   "grid",
            gridTemplateColumns: pieData.length > 0 ? "1fr 1fr" : "1fr",
            gap:       20,
            marginBottom: 24,
          }}
            className="charts-grid"
          >
            {/* Pie — Project Status Distribution */}
            {pieData.length > 0 && (
              <div className="chart-box">
                <h3>Project Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      labelLine
                      label={renderCustomLabel}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar — Budget by Department */}
            {barData.length > 0 && (
              <div className="chart-box">
                <h3>Budget by Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={barData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="dept"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      interval={0}
                      angle={-18}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      label={{
                        value:    "Budget (K)",
                        angle:    -90,
                        position: "insideLeft",
                        fontSize: 11,
                        fill:     "#9ca3af",
                      }}
                    />
                    <Tooltip formatter={v => [`₱${v}K`, "Budget"]} />
                    <Bar
                      dataKey="budget"
                      fill="#1f7a1f"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={52}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ── Recent Activity ── */}
          {stats?.recent_activity?.length > 0 && (
            <div className="activity-box">
              <h3>Recent Activity</h3>
              <ul className="activity-list">
                {stats.recent_activity.map((item, i) => (
                  <li key={i} className="activity-item">
                    <span className="activity-icon">
                      <CheckCircle2 size={18} color="#1f7a1f" />
                    </span>
                    <div className="activity-body">
                      <p className="activity-title">{item.title}</p>
                      <small>{item.by} • {item.date}</small>
                    </div>
                    <span className="activity-id">{item.project_id}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>

      {/* ── Responsive: stack charts on small screens ── */}
      <style>{`
        @media (max-width: 900px) {
          .charts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}