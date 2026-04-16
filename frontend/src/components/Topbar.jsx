import { Bell } from "lucide-react";

export default function Topbar({ title }) {
  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        <h3>Research Project Proposal Management System</h3>
      </div>

      <div className="topbar-right">
        <Bell size={20} />

        <div className="user">
          <div className="avatar">P</div>
          <div>
            <strong>Pyt Notarion</strong>
            <small>Researcher</small>
          </div>
        </div>
      </div>
    </div>
  );
}