import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const pieData = [
  { name: "Approved", value: 20 },
  { name: "In Progress", value: 20 },
  { name: "Under Evaluation", value: 20 },
  { name: "Submitted", value: 20 },
  { name: "Draft", value: 20 },
];

const COLORS = ["#1f7a1f", "#159570", "#3ecf8e", "#6cd1a4", "#cfcfcf"];

const barData = [
  { name: "Environmental Science", budget: 450 },
  { name: "IT", budget: 320 },
  { name: "Agriculture", budget: 280 },
  { name: "Physics", budget: 580 },
  { name: "Civil Engineering", budget: 750 },
];

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="main-content">
        <Topbar />

        <div className="dashboard-content">

          {/* CARDS */}
          <div className="cards">
            <div className="card active">
              <h3>My Projects</h3>
              <h2>2</h2>
              <p>Active projects</p>
              <span>View all →</span>
            </div>

            <div className="card">
              <h3>Submitted</h3>
              <h2>3</h2>
              <p>Under review</p>
            </div>

            <div className="card">
              <h3>Approved</h3>
              <h2>1</h2>
              <p>Successfully approved</p>
            </div>

            <div className="card">
              <h3>Total Budget</h3>
              <h2>$2380K</h2>
              <p>Across all projects</p>
            </div>
          </div>

          {/* CHARTS */}
          <div className="charts">
            <div className="chart-box">
              <h3>Project Status Distribution</h3>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h3>Budget by Department</h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="budget" fill="#1f7a1f" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}