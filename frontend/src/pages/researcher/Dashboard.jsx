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

const pieData = [
  { name: "Approved",         value: 20 },
  { name: "In Progress",      value: 20 },
  { name: "Under Evaluation", value: 20 },
  { name: "Submitted",        value: 20 },
  { name: "Draft",            value: 20 },
];
const PIE_COLORS   = ["#1f7a1f", "#159570", "#3ecf8e", "#6cd1a4", "#cfcfcf"];
const LABEL_COLORS = ["#159570", "#1f7a1f", "#3ecf8e", "#6cd1a4", "#9ca3af"];

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 36;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const idx = pieData.findIndex((d) => d.name === name);
  return (
    <text
      x={x} y={y}
      fill={LABEL_COLORS[idx]}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const barData = [
  { name: "Computer Science", budget: 450 },
  { name: "Agriculture",      budget: 320 },
  { name: "Physics",          budget: 280 },
  { name: "Civil Engineering",budget: 750 },
];

const recentActivity = [
  { icon: <CheckCircle2 size={18} color="#1f7a1f" />,  title: "Project proposal approved by Research Director", by: "Dr. Robert Williams",  date: "2026-03-25 14:30", id: "PRJ-001" },
  { icon: <AlertCircle  size={18} color="#f97316" />,  title: "Evaluation completed with score 88/100",        by: "Dr. Karen Smith",     date: "2026-03-28 10:15", id: "PRJ-002" },
  { icon: <FileText     size={18} color="#3b82f6" />,  title: "New proposal submitted for review",            by: "Dr. James Anderson",  date: "2026-03-29 09:00", id: "PRJ-004" },
  { icon: <DollarSign   size={18} color="#6b7280" />,  title: "Budget plan updated",                          by: "Dr. Emily Rodriguez", date: "2026-03-30 16:45", id: "PRJ-003" },
  { icon: <PlusCircle   size={18} color="#6b7280" />,  title: "New project created",                          by: "Prof. Lisa Martinez", date: "2026-03-31 11:20", id: "PRJ-005" },
];

export default function Dashboard() {
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
                  <h2 className="card-value">2</h2>
                  <p className="card-sub">Active projects</p>
                  <span className="card-link">View all →</span>
                </div>
                <div className="card-icon blue"><User size={22} /></div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Submitted</p>
                  <h2 className="card-value">3</h2>
                  <p className="card-sub">Under review</p>
                </div>
                <div className="card-icon blue"><FileText size={22} /></div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Approved</p>
                  <h2 className="card-value">1</h2>
                  <p className="card-sub">Successfully approved</p>
                </div>
                <div className="card-icon green"><CheckCircle size={22} /></div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Total Budget</p>
                  <h2 className="card-value">$2380K</h2>
                  <p className="card-sub">Across all projects</p>
                </div>
                <div className="card-icon orange"><Receipt size={22} /></div>
              </div>
            </div>
          </div>

          {/* CHARTS */}
          <div className="charts">
            <div className="chart-box">
              <h3>Project Status Distribution</h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    labelLine={true}
                    label={renderCustomLabel}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h3>Budget by Department</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 800]} ticks={[0, 200, 400, 600, 800]} />
                  <Tooltip />
                  <Bar dataKey="budget" fill="#1f7a1f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="activity-box">
            <h3>Recent Activity</h3>
            <ul className="activity-list">
              {recentActivity.map((item, i) => (
                <li key={i} className="activity-item">
                  <span className="activity-icon">{item.icon}</span>
                  <div className="activity-body">
                    <p className="activity-title">{item.title}</p>
                    <small>{item.by} • {item.date}</small>
                  </div>
                  <span className="activity-id">{item.id}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}