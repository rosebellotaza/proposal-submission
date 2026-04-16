import { Bell, LogOut, User, CheckCheck, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NOTIFICATIONS = [
  { id: 1,  type: "approval",   title: "Proposal Approved",               message: "Your proposal 'Climate Change Impact' has been approved.",          time: "2 min ago",   read: false },
  { id: 2,  type: "evaluation", title: "Evaluation Completed",             message: "PRJ-002 evaluation completed with score 88/100.",                   time: "1 hour ago",  read: false },
  { id: 3,  type: "review",     title: "Proposal Under Review",            message: "PRJ-004 has been forwarded to the Dean of Research.",               time: "3 hours ago", read: false },
  { id: 4,  type: "team",       title: "New Team Member Added",            message: "Dr. Rachel Lee has been added to your research team.",              time: "Yesterday",   read: true  },
  { id: 5,  type: "budget",     title: "Budget Plan Updated",              message: "Your budget plan for PRJ-003 was reviewed and updated.",            time: "Yesterday",   read: true  },
  { id: 6,  type: "deadline",   title: "Upcoming Deadline",                message: "Work plan milestone due in 3 days for PRJ-001.",                    time: "2 days ago",  read: true  },
];

const TYPE_STYLES = {
  approval:   { bg: "#f0fdf4", color: "#15803d", dot: "#1f7a1f" },
  evaluation: { bg: "#f5f3ff", color: "#6d28d9", dot: "#7c3aed" },
  review:     { bg: "#fefce8", color: "#a16207", dot: "#d97706" },
  team:       { bg: "#eff6ff", color: "#1d4ed8", dot: "#2563eb" },
  budget:     { bg: "#fff7ed", color: "#c2410c", dot: "#ea580c" },
  deadline:   { bg: "#fef2f2", color: "#b91c1c", dot: "#dc2626" },
};

export default function Topbar({ title = "Dashboard", role = "Researcher", userName = "Rosebellaaa" }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const markRead = (id) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id) => setNotifications((p) => p.filter((n) => n.id !== id));

  return (
    <div className="topbar">
      <div>
        <h1 className="topbar-title">{title}</h1>
        <p className="topbar-subtitle">Research Project Proposal Management System</p>
      </div>

      <div className="topbar-right">

        {/* Notification Bell */}
        <div className="notif-wrapper" ref={notifRef}>
          <button
            className="notif-btn"
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              {/* Header */}
              <div className="notif-dropdown-header">
                <div>
                  <p className="notif-dropdown-title">Notifications</p>
                  {unreadCount > 0 && (
                    <p className="notif-dropdown-sub">{unreadCount} unread</p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={markAllRead}>
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Bell size={28} color="#d1d5db" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const ts = TYPE_STYLES[n.type] || TYPE_STYLES.review;
                    return (
                      <div
                        key={n.id}
                        className={`notif-item ${!n.read ? "unread" : ""}`}
                        onClick={() => markRead(n.id)}
                      >
                        <div className="notif-dot-col">
                          <span className="notif-type-dot" style={{ background: ts.dot }} />
                        </div>
                        <div className="notif-item-body">
                          <div className="notif-item-top">
                            <span className="notif-item-title"
                              style={{ color: !n.read ? "#111827" : "#6b7280" }}>
                              {n.title}
                            </span>
                            <span className="notif-item-time">{n.time}</span>
                          </div>
                          <p className="notif-item-msg">{n.message}</p>
                        </div>
                        <button
                          className="notif-dismiss"
                          onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="notif-footer">
                  <button className="notif-clear-all" onClick={() => setNotifications([])}>
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="user-dropdown-wrapper" ref={dropdownRef}>
          <div
            className="user-info"
            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
          >
            <div className="user-text">
                <strong>{userName}</strong>
                <small>{role}</small>
            </div>
            <div className="avatar-circle" style={{ background: role === "Evaluator" ? "#7c3aed" : "#1f7a1f" }}>
              <User size={18} color="white" />
            </div>
          </div>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <strong>{userName}</strong>
                <small>{role}</small>
              </div>
              <hr />
              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={15} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}