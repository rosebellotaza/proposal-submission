import { LayoutDashboard, ClipboardCheck, Activity, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/logo.png";

export default function EvaluatorNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { name: "Dashboard",      icon: <LayoutDashboard size={20} />, path: "/evaluator/dashboard" },
    { name: "Evaluations",    icon: <ClipboardCheck size={20} />, path: "/evaluator/evaluations" },
    { name: "Status Tracking",icon: <Activity size={20} />,       path: "/evaluator/status-tracking" },
  ];

  return (
    <div className={`ev-sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* Header */}
      <div className="ev-sidebar-header">
        <img src={logo} alt="logo" className="logo-img" />
        {!collapsed && (
          <div className="header-text">
            <h2>Research PMS</h2>
            <p>Evaluator</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <ul className="ev-sidebar-menu">
        {menu.map((item, i) => (
          <li
            key={i}
            className={location.pathname === item.path ? "active" : ""}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
          </li>
        ))}
      </ul>

      {/* User at bottom */}
      {!collapsed && (
        <div className="ev-sidebar-user">
          <div className="ev-avatar-circle">
            <User size={16} color="white" />
          </div>
          <div>
            <strong>Rosebellaaa</strong>
            <small>Evaluator</small>
          </div>
        </div>
      )}

      {/* Toggle */}
      <div className="ev-sidebar-footer">
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "☰" : "←"}
        </button>
      </div>
    </div>
  );
}