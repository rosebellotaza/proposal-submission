import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import { Users, FileText, Calendar, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((res) => setStats(res.data));
  }, []);

  return (
    <div className="dashboard-layout">
      <div className="main-content" style={{ marginLeft: 0 }}>
        <Topbar title="Admin Dashboard" />
        <div className="dashboard-content">

          <div style={{ marginBottom: 20 }}>
            <h2 className="page-title">Admin Dashboard</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Manage proposals, users, and oral presentations
            </p>
          </div>

          {/* Quick Actions */}
          <div className="cards">
            <div className="card card-accent" style={{ cursor: "pointer" }}
              onClick={() => navigate("/admin/schedule")}>
              <div className="card-top">
                <div>
                  <p className="card-label">Schedule Presentation</p>
                  <h2 className="card-value">{stats?.total_projects ?? "—"}</h2>
                  <p className="card-sub">Total proposals</p>
                </div>
                <div className="card-icon blue"><Calendar size={22} /></div>
              </div>
            </div>

            <div className="card" style={{ cursor: "pointer" }}
              onClick={() => navigate("/admin/users")}>
              <div className="card-top">
                <div>
                  <p className="card-label">Manage Users</p>
                  <h2 className="card-value">—</h2>
                  <p className="card-sub">All personnel</p>
                </div>
                <div className="card-icon blue"><Users size={22} /></div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Approved</p>
                  <h2 className="card-value">
                    {stats?.status_counts?.Approved ?? "—"}
                  </h2>
                  <p className="card-sub">Final approvals</p>
                </div>
                <div className="card-icon green"><CheckCircle size={22} /></div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Submitted</p>
                  <h2 className="card-value">
                    {stats?.status_counts?.Submitted ?? "—"}
                  </h2>
                  <p className="card-sub">Awaiting scheduling</p>
                </div>
                <div className="card-icon orange"><FileText size={22} /></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}