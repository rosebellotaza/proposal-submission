import {
  LayoutDashboard,
  Folder,
  FileText,
  Users,
  Calendar,
  DollarSign,
  GitBranch,
  BookOpen,
  BarChart2,
  Activity,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { name: "Dashboard",         icon: <LayoutDashboard size={20} />, path: "/researcher/dashboard" },
    { name: "Research Projects", icon: <Folder size={20} />,          path: "/researcher/projects" },
    { name: "Proposals",         icon: <FileText size={20} />,        path: "/researcher/proposals" },
    { name: "Team Management",   icon: <Users size={20} />,           path: "/researcher/team" },
    { name: "Work Plan", icon: <Calendar size={20} />, path: "/researcher/work-plan" },    
    { name: "Budget Plan", icon: <DollarSign size={20} />, path: "/researcher/budget-plan" },
    { name: "Framework", icon: <GitBranch size={20} />, path: "/researcher/framework" },
    { name: "References", icon: <BookOpen size={20} />, path: "/researcher/references" },
    { name: "Outputs", icon: <BarChart2 size={20} />, path: "/researcher/outputs" },
    { name: "Status Tracking", icon: <Activity size={20} />, path: "/researcher/status-tracking" },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* Header */}
      <div className="sidebar-header">
        <img src={logo} alt="logo" className="logo-img" />
        {!collapsed && (
          <div className="header-text">
            <h2>Research PMS</h2>
            <p>Researcher</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <ul className="sidebar-menu">
        {menu.map((item, i) => (
          <li
            key={i}
            className={location.pathname === item.path ? "active" : ""}
            onClick={() => item.path !== "#" && navigate(item.path)}
          >
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
          </li>
        ))}
      </ul>

      {/* User info at bottom */}
      {!collapsed && (
        <div className="sidebar-user">
          <div className="avatar-circle small">
            <User size={16} color="white" />
          </div>
          <div>
            <strong>Rosebellaaa</strong>
            <small>Researcher</small>
          </div>
        </div>
      )}

      {/* Toggle */}
      <div className="sidebar-footer">
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "☰" : "←"}
        </button>
      </div>
    </div>
  );
}