import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import ProposalTable from "../components/ProposalTable";
import "../styles/dashboard.css";

export default function AdviserDashboard() {

  const proposals = [
    {
      id: 1,
      student: "John Doe",
      title: "Machine Learning Applications in Healthcare Diagnostics",
      area: "Artificial Intelligence",
      date: "Feb 15, 2026",
      status: "Pending"
    },
    {
      id: 2,
      student: "Jane Smith",
      title: "Sustainable Energy Solutions for Urban Development",
      area: "Environmental Engineering",
      date: "Feb 20, 2026",
      status: "Revision"
    },
    {
      id: 3,
      student: "Michael Chen",
      title: "Blockchain Technology in Supply Chain Management",
      area: "Computer Science",
      date: "Feb 25, 2026",
      status: "Approved"
    }
  ];

  return (
    <div>

      <Navbar
        name="Dr. Sarah Johnson"
        role="Adviser"
      />

      <Sidebar />

      <div className="dashboard-content">

        <h1>Welcome, Dr. Sarah Johnson</h1>
        <p className="subtitle">
          Review and manage student thesis proposals
        </p>

        {/* STATISTICS */}
        <div className="stats-row">

          <StatCard
            title="Pending Review"
            value="1"
            icon="⏳"
          />

          <StatCard
            title="Revision Requested"
            value="1"
            icon="⚠️"
          />

          <StatCard
            title="Approved"
            value="1"
            icon="✅"
          />

        </div>

        {/* PROPOSAL TABLE */}
        <ProposalTable proposals={proposals} />

      </div>

      <footer className="footer">
        © 2026 University Thesis Proposal System. All rights reserved.
      </footer>

    </div>
  );
}