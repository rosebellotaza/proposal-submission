import { useEffect, useState } from "react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  User, FileText, CheckCircle, Receipt,
  CheckCircle2, AlertCircle, Clock, DollarSign, PlusCircle,
} from "lucide-react";
import api from "../../utils/api";

const PIE_COLORS   = ["#1f7a1f", "#159570", "#3ecf8e", "#6cd1a4", "#cfcfcf"];
const LABEL_COLORS = ["#159570", "#1f7a1f", "#3ecf8e", "#6cd1a4", "#9ca3af"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((res) => setStats(res.data));
  }, []);

  const pieData = stats
    ? Object.entries(stats.status_counts || {}).map(([name, value]) => ({ name, value }))
    : [];

  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 36;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const idx = pieData.findIndex((d) => d.name === name);
    return (
      <text x={x} y={y} fill={LABEL_COLORS[idx] || "#9ca3af"}
        textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12} fontWeight={500}>
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

          {/* STAT CARDS */}
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
                    {stats?.total_budget ? `₱${Number(stats.total_budget).toLocaleString()}` : "—"}
                  </h2>
                  <p className="card-sub">Across all projects</p>
                </div>
                <div className="card-icon orange"><Receipt size={22} /></div>
              </div>
            </div>
          </div>

          {/* CHARTS */}
          {pieData.length > 0 && (
            <div className="charts">
              <div className="chart-box">
                <h3>Project Status Distribution</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={100}
                      dataKey="value" labelLine={true} label={renderCustomLabel}>
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* RECENT ACTIVITY */}
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
    </div>
  );
}