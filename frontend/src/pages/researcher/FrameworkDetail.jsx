import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Target, Users, TrendingUp, BookOpen } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";

const PROJECT_INFO = {
  "PRJ-001": { title: "Climate Change Impact on Coastal Ecosystems", status: "Approved" },
  "PRJ-002": { title: "AI-Driven Healthcare Diagnosis System",       status: "Under Evaluation" },
  "PRJ-003": { title: "Sustainable Agriculture Practices in Arid Regions", status: "In Progress" },
  "PRJ-004": { title: "Quantum Computing for Cryptography",          status: "Submitted" },
  "PRJ-005": { title: "Urban Planning and Smart City Infrastructure", status: "Draft" },
};

const STATUS_BADGE = {
  "Approved":         { bg: "#dcfce7", color: "#15803d" },
  "Under Evaluation": { bg: "#ede9fe", color: "#6d28d9" },
  "In Progress":      { bg: "#d1fae5", color: "#065f46" },
  "Submitted":        { bg: "#e0f2fe", color: "#0369a1" },
  "Draft":            { bg: "#f3f4f6", color: "#6b7280" },
};

const OBJECTIVES = [
  { title: "Primary Objective",     desc: "To investigate the impact of digital learning technologies on student engagement and academic performance in higher education institutions" },
  { title: "Secondary Objective 1", desc: "To identify best practices for integrating technology-enhanced learning in traditional classroom settings" },
  { title: "Secondary Objective 2", desc: "To develop a comprehensive framework for faculty training and support in digital pedagogy" },
  { title: "Secondary Objective 3", desc: "To assess the long-term effects of blended learning approaches on student retention and success rates" },
];

const PHASES = [
  {
    num: 1, label: "Phase 1: Literature Review & Framework Development", duration: "3 months", color: "#1f7a1f",
    tasks: [
      "Comprehensive review of existing research on digital learning",
      "Analysis of current educational technology trends",
      "Development of theoretical framework",
      "Identification of key variables and indicators",
    ],
  },
  {
    num: 2, label: "Phase 2: Quantitative Data Collection", duration: "6 months", color: "#7c3aed",
    tasks: [
      "Survey distribution to 500+ students across 5 institutions",
      "Collection of academic performance data",
      "Digital platform usage analytics gathering",
      "Statistical analysis of engagement metrics",
    ],
  },
  {
    num: 3, label: "Phase 3: Qualitative Research", duration: "4 months", color: "#d97706",
    tasks: [
      "Semi-structured interviews with faculty members (n=30)",
      "Focus group discussions with students (n=50)",
      "Classroom observations and field notes",
      "Thematic analysis of qualitative data",
    ],
  },
  {
    num: 4, label: "Phase 4: Analysis & Synthesis", duration: "5 months", color: "#2563eb",
    tasks: [
      "Mixed-methods data integration",
      "Framework validation and refinement",
      "Development of practical recommendations",
      "Preparation of research outputs",
    ],
  },
];

const THEORIES = [
  { title: "Technology Acceptance Model (TAM)",  desc: "Examines how perceived usefulness and ease of use influence technology adoption among educators and students",        bg: "#eff6ff" },
  { title: "Community of Inquiry Framework",     desc: "Analyzes cognitive, social, and teaching presence in online and blended learning environments",                     bg: "#f5f3ff" },
  { title: "Self-Determination Theory",          desc: "Explores how digital tools support student autonomy, competence, and relatedness in learning",                      bg: "#f0fdf4" },
];

const OUTCOMES = [
  { title: "Theoretical Contribution", desc: "A novel framework for understanding technology-mediated learning in higher education",              icon: <Target size={20} color="#1f7a1f" />,  bg: "#f0fdf4", iconBg: "#dcfce7" },
  { title: "Practical Guidelines",     desc: "Evidence-based recommendations for educators and administrators",                                   icon: <BookOpen size={20} color="#7c3aed" />, bg: "#f5f3ff", iconBg: "#ede9fe" },
  { title: "Policy Implications",      desc: "Insights to inform institutional technology adoption policies",                                     icon: <Users size={20} color="#d97706" />,   bg: "#fefce8", iconBg: "#fef9c3" },
  { title: "Academic Publications",    desc: "At least 3 peer-reviewed journal articles and conference presentations",                            icon: <TrendingUp size={20} color="#2563eb" />, bg: "#eff6ff", iconBg: "#dbeafe" },
];

const ETHICS = [
  "Informed consent will be obtained from all participants, with clear explanation of research purposes and procedures",
  "All data will be anonymized and stored securely, with access limited to authorized research team members",
  "Participants retain the right to withdraw from the study at any time without penalty",
  "Ethics approval will be obtained from the Institutional Review Board before data collection begins",
];

export default function FrameworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const project = PROJECT_INFO[id] || { title: "Unknown Project", status: "Draft" };
  const statusStyle = STATUS_BADGE[project.status] || STATUS_BADGE["Draft"];

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Framework" />
        <div className="dashboard-content">

          {/* Project Header */}
          <div className="pv-header-left" style={{ marginBottom: 4 }}>
            <button className="pv-back-btn" onClick={() => navigate("/researcher/framework")}>
              <ArrowLeft size={18} />
            </button>
            <div className="pv-title-row">
              <h2 className="pv-title" style={{ fontSize: "1.15rem" }}>{project.title}</h2>
              <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                {project.status}
              </span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 20px 52px" }}>{id}</p>

          {/* Page Title */}
          <div style={{ marginBottom: 20 }}>
            <h2 className="page-title">Research Framework</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Project framework, methodology, and theoretical foundation
            </p>
          </div>

          {/* Research Overview */}
          <div className="cp-section">
            <div className="cp-section-title">Research Overview</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 16px" }}>
              Core research problem and significance
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Research Problem</h3>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "0 0 20px" }}>
              Despite the widespread adoption of digital learning technologies in higher education, there remains limited
              understanding of how these tools effectively enhance student engagement and learning outcomes. Many institutions
              struggle to implement technology in ways that meaningfully improve educational experiences while addressing equity
              and accessibility concerns. This research aims to fill this gap by examining the multifaceted relationship between
              digital learning tools, pedagogical practices, and student success.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Significance</h3>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
              This research will provide evidence-based insights to guide educational institutions in making informed decisions
              about technology integration. The findings will help educators optimize their use of digital tools, support
              administrators in resource allocation, and inform policy makers about effective strategies for enhancing
              educational quality through technology.
            </p>
          </div>

          {/* Research Objectives */}
          <div className="cp-section">
            <div className="cp-section-title">Research Objectives</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 16px" }}>
              Primary and secondary research goals
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {OBJECTIVES.map((obj, i) => (
                <div key={i} className="fw-objective-row">
                  <div className="fw-obj-num">{i + 1}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#111827", margin: "0 0 3px" }}>{obj.title}</p>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{obj.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Methodology */}
          <div className="cp-section">
            <div className="cp-section-title">Research Methodology</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 20px" }}>
              Mixed-methods research approach with four distinct phases
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {PHASES.map((phase, i) => (
                <div key={i}>
                  <div className="fw-phase-row">
                    <div className="fw-phase-num" style={{ background: phase.color }}>{phase.num}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: "#111827", margin: 0 }}>{phase.label}</p>
                        <span className="fw-duration-badge" style={{ background: phase.color }}>{phase.duration}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {phase.tasks.map((task, ti) => (
                          <div key={ti} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <CheckCircle2 size={15} color={phase.color} style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: "#374151" }}>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {i < PHASES.length - 1 && (
                    <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 18, margin: "8px 0" }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Theoretical Framework */}
          <div className="cp-section">
            <div className="cp-section-title">Theoretical Framework</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 16px" }}>
              Theoretical foundations and conceptual models
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {THEORIES.map((t, i) => (
                <div key={i} className="fw-theory-card" style={{ background: t.bg }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "#111827", margin: "0 0 4px" }}>{t.title}</p>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Outcomes */}
          <div className="cp-section">
            <div className="cp-section-title">Expected Outcomes & Impact</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 16px" }}>
              Anticipated contributions and deliverables
            </p>
            <div className="fw-outcomes-grid">
              {OUTCOMES.map((o, i) => (
                <div key={i} className="fw-outcome-card" style={{ background: o.bg }}>
                  <div className="fw-outcome-icon" style={{ background: o.iconBg }}>{o.icon}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#111827", margin: "0 0 4px" }}>{o.title}</p>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{o.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ethical Considerations */}
          <div className="cp-section">
            <div className="cp-section-title">Ethical Considerations</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 16px" }}>
              Research ethics and participant protection
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ETHICS.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1f7a1f", flexShrink: 0, marginTop: 5 }} />
                  <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>{e}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}