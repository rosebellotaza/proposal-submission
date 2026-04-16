import {
  LayoutDashboard,
  Folder,
  FileText,
  Users,
  Calendar,
  DollarSign
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/researcher/dashboard" },
    { name: "Research Projects", icon: <Folder size={20} />, path: "/researcher/projects" },
    { name: "Proposals", icon: <FileText size={20} />, path: "/researcher/proposals" },
    { name: "Team Management", icon: <Users size={20} />, path: "/researcher/team" },
    { name: "Work Plan", icon: <Calendar size={20} />, path: "#" },
    { name: "Budget Plan", icon: <DollarSign size={20} />, path: "#" },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* 🔥 HEADER (LIKE YOUR IMAGE) */}
      <div className="sidebar-header">

        <img src={logo} alt="logo" className="logo-img" />

        {!collapsed && (
          <div className="header-text">
            <h2>Research PMS</h2>
            <p>Researcher</p>
          </div>
        )}
      </div>

      {/* MENU */}
      <ul>
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

      {/* TOGGLE */}
      <div className="sidebar-footer">
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "☰" : "←"}
        </button>
      </div>
    </div>
  );
}