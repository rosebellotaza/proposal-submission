import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import ProposalForm from "../components/ProposalForm";
import StudentProposalTable from "../components/StudentProposalTable";
import "../styles/dashboard.css";

export default function StudentDashboard() {

  const proposals = [
    {
      id:1,
      title:"AI-Based Tuberculosis Detection",
      area:"Artificial Intelligence",
      date:"March 1, 2026",
      status:"Pending"
    },
    {
      id:2,
      title:"Smart Waste Management System",
      area:"Internet of Things",
      date:"March 3, 2026",
      status:"Revision"
    }
  ];

  return (
    <div>

      <Navbar
        name="John Doe"
        role="Student"
      />

      <Sidebar />

      <div className="dashboard-content">

        <h1>Student Dashboard</h1>
        <p className="subtitle">
          Submit and track your thesis proposal
        </p>

        {/* STAT CARDS */}
        <div className="stats-row">

          <StatCard
            title="Submitted Proposals"
            value="2"
            icon="📄"
          />

          <StatCard
            title="Pending Review"
            value="1"
            icon="⏳"
          />

          <StatCard
            title="Approved"
            value="0"
            icon="✅"
          />

        </div>

        {/* PROPOSAL SUBMISSION FORM */}
        <ProposalForm />

        {/* STUDENT PROPOSALS TABLE */}
        <StudentProposalTable proposals={proposals} />

      </div>

    </div>
  );
}