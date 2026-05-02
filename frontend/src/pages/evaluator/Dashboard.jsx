import { useEffect, useState } from "react";
import EvaluatorNavbar from "../../components/evaluator/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/evaluator.css";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { ClipboardList, CheckCircle, FileText, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const PIE_COLORS   = ["#1f7a1f", "#159570", "#3ecf8e", "#6cd1a4", "#cfcfcf"];
const LABEL_COLORS = ["#159570", "#1f7a1f", "#3ecf8e", "#6cd1a4", "#9ca3af"];

export default function EvaluatorDashboard() {
  const navigate = useNavigate();
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
      <EvaluatorNavbar />
      <div className="main-content">
        <Topbar title="Dashboard" />
        <div className="dashboard-content">

          {/* STAT CARDS */}
          <div className="cards">
            <div className="card ev-card-accent">
              <div className="card-top">
                <div>
                  <p className="card-label">Awaiting Evaluation</p>
                  <h2 className="card-value">{stats?.awaiting_evaluation ?? "—"}</h2>
                  <p className="card-sub">Proposals to review</p>
                  <span className="ev-card-link" onClick={() => navigate("/evaluator/evaluations")}>
                    Start evaluating →
                  </span>
                </div>
                <div className="card-icon" style={{ background: "#f5f3ff", color: "#391676" }}>
                  <ClipboardList size={22} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Evaluated</p>
                  <h2 className="card-value">{stats?.evaluated ?? "—"}</h2>
                  <p className="card-sub">Completed evaluations</p>
                </div>
                <div className="card-icon" style={{ background: "#f0fdf4", color: "#1f7a1f" }}>
                  <CheckCircle size={22} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Total Proposals</p>
                  <h2 className="card-value">{stats?.total_proposals ?? "—"}</h2>
                  <p className="card-sub">All submissions</p>
                </div>
                <div className="card-icon" style={{ background: "#eff6ff", color: "#3b82f6" }}>
                  <FileText size={22} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Avg. Score</p>
                  <h2 className="card-value">{stats?.avg_score ?? "—"}</h2>
                  <p className="card-sub">Out of 100</p>
                </div>
                <div className="card-icon" style={{ background: "#fff7ed", color: "#f97316" }}>
                  <AlertCircle size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* CHART */}
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

        </div>
      </div>
    </div>
  );
}