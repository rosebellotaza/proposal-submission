import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, BookOpen, FileText, BookMarked, Link, Search } from "lucide-react";
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

const TYPE_STYLES = {
  Journal:    { bg: "#eff6ff", color: "#2563eb", icon: <FileText size={13} /> },
  Book:       { bg: "#f0fdf4", color: "#15803d", icon: <BookMarked size={13} /> },
  Conference: { bg: "#f5f3ff", color: "#7c3aed", icon: <BookOpen size={13} /> },
  Web:        { bg: "#fefce8", color: "#a16207", icon: <Link size={13} /> },
};

const INITIAL_REFS = [
  { id: 1,  category: "Technology Acceptance", type: "Journal",    year: 1989, authors: "Davis, F. D.", title: "Perceived usefulness, perceived ease of use, and user acceptance of information technology", source: "MIS Quarterly, 13(3), 319-340", doi: "10.2307/249008", url: "" },
  { id: 2,  category: "Online Learning",       type: "Journal",    year: 2000, authors: "Garrison, D. R., Anderson, T., & Archer, W.", title: "Critical inquiry in a text-based environment: Computer conferencing in higher education", source: "The Internet and Higher Education, 2(2-3), 87-105", doi: "10.1016/S1096-7516(00)00016-6", url: "" },
  { id: 3,  category: "Pedagogical Practices", type: "Book",       year: 1987, authors: "Chickering, A. W., & Gamson, Z. F.", title: "Seven principles for good practice in undergraduate education", source: "AAHE Bulletin, 39(7), 3-7", doi: "", url: "" },
  { id: 4,  category: "Blended Learning",      type: "Journal",    year: 2013, authors: "Means, B., Toyama, Y., Murphy, R., & Baki, M.", title: "The effectiveness of online and blended learning: A meta-analysis of the empirical literature", source: "Teachers College Record, 115(3), 1-47", doi: "", url: "" },
  { id: 5,  category: "Blended Learning",      type: "Journal",    year: 2006, authors: "Graham, C. R.", title: "Blended learning systems: Definition, current trends, and future directions", source: "In C. J. Bonk & C. R. Graham (Eds.), Handbook of blended learning (pp. 3-21). Pfeiffer", doi: "", url: "" },
  { id: 6,  category: "Learning Theories",     type: "Conference", year: 2005, authors: "Siemens, G.", title: "Connectivism: A learning theory for the digital age", source: "International Journal of Instructional Technology and Distance Learning, 2(1), 3-10", doi: "", url: "http://www.itdl.org/journal/jan_05/article01.htm" },
  { id: 7,  category: "Motivation Theory",     type: "Journal",    year: 2000, authors: "Deci, E. L., & Ryan, R. M.", title: 'The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior', source: "Psychological Inquiry, 11(4), 227-268", doi: "10.1207/S15327965PLI1104_01", url: "" },
  { id: 8,  category: "Online Teaching",       type: "Journal",    year: 2011, authors: "Salmon, G.", title: "E-moderating: The key to teaching and learning online (3rd ed.)", source: "Routledge", doi: "", url: "" },
  { id: 9,  category: "Educational Technology",type: "Journal",    year: 2016, authors: "Selwyn, N.", title: "Is technology good for education?", source: "Polity Press", doi: "", url: "" },
  { id: 10, category: "Educational Research",  type: "Journal",    year: 2009, authors: "Hattie, J.", title: "Visible learning: A synthesis of over 800 meta-analyses relating to achievement", source: "Routledge", doi: "", url: "" },
  { id: 11, category: "Technology Trends",     type: "Web",        year: 2023, authors: "EDUCAUSE", title: "Horizon Report: Teaching and Learning Edition", source: "EDUCAUSE", doi: "", url: "https://library.educause.edu/resources/2023/5/2023-educause-horizon-report" },
  { id: 12, category: "Teacher Knowledge",     type: "Journal",    year: 2009, authors: "Koehler, M. J., & Mishra, P.", title: "What is technological pedagogical content knowledge?", source: "Contemporary Issues in Technology and Teacher Education, 9(1), 60-70", doi: "", url: "" },
];

export default function ReferencesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refs, setRefs] = useState(INITIAL_REFS);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "", year: "2024", authors: "", title: "", source: "", doi: "", category: "" });

  const project = PROJECT_INFO[id] || { title: "Unknown Project", status: "Draft" };
  const statusStyle = STATUS_BADGE[project.status] || STATUS_BADGE["Draft"];

  const filtered = refs.filter((r) =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.authors.toLowerCase().includes(query.toLowerCase()) ||
    r.category.toLowerCase().includes(query.toLowerCase())
  );

  // Stats
  const totalRefs = filtered.length;
  const journalCount = filtered.filter((r) => r.type === "Journal").length;
  const bookCount = filtered.filter((r) => r.type === "Book").length;
  const categories = new Set(filtered.map((r) => r.category)).size;

  // Group by category
  const grouped = filtered.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  const handleAdd = () => {
    if (!form.title || !form.authors) return;
    setRefs((p) => [...p, { id: Date.now(), ...form, year: parseInt(form.year) || 2024 }]);
    setShowModal(false);
    setForm({ type: "", year: "2024", authors: "", title: "", source: "", doi: "", category: "" });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="References" />
        <div className="dashboard-content">

          {/* Project header */}
          <div className="pv-header-left" style={{ marginBottom: 4 }}>
            <button className="pv-back-btn" onClick={() => navigate("/researcher/references")}>
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

          {/* Page header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">References</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                Manage research references and citations
              </p>
            </div>
            <button className="create-btn" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Add Reference
            </button>
          </div>

          {/* Stats */}
          <div className="ref-stats">
            <div className="ref-stat-card">
              <div>
                <p className="ref-stat-label">Total References</p>
                <p className="ref-stat-num">{totalRefs}</p>
              </div>
              <div className="ref-stat-icon" style={{ background: "#eff6ff" }}>
                <BookOpen size={22} color="#3b82f6" />
              </div>
            </div>
            <div className="ref-stat-card">
              <div>
                <p className="ref-stat-label">Journal Articles</p>
                <p className="ref-stat-num" style={{ color: "#2563eb" }}>{journalCount}</p>
              </div>
              <div className="ref-stat-icon" style={{ background: "#eff6ff" }}>
                <FileText size={22} color="#2563eb" />
              </div>
            </div>
            <div className="ref-stat-card">
              <div>
                <p className="ref-stat-label">Books</p>
                <p className="ref-stat-num" style={{ color: "#15803d" }}>{bookCount}</p>
              </div>
              <div className="ref-stat-icon" style={{ background: "#f0fdf4" }}>
                <BookMarked size={22} color="#15803d" />
              </div>
            </div>
            <div className="ref-stat-card">
              <div>
                <p className="ref-stat-label">Categories</p>
                <p className="ref-stat-num" style={{ color: "#7c3aed" }}>{categories}</p>
              </div>
              <div className="ref-stat-icon" style={{ background: "#f5f3ff" }}>
                <Search size={22} color="#7c3aed" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="search-filter-bar" style={{ marginBottom: 16 }}>
            <div className="search-left">
              <Search size={16} color="#9ca3af" />
              <input
                type="text"
                placeholder="Search references by title, author, or category..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Grouped references */}
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="cp-section" style={{ marginBottom: 16 }}>
              <div className="cp-section-title" style={{ marginBottom: 4 }}>{cat}</div>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>
                {items.length} reference(s)
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {items.map((ref) => {
                  const ts = TYPE_STYLES[ref.type] || TYPE_STYLES.Journal;
                  return (
                    <div key={ref.id} className="ref-card">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span className="ref-type-badge" style={{ background: ts.bg, color: ts.color }}>
                          {ts.icon} {ref.type}
                        </span>
                        <span style={{ fontSize: 13, color: "#9ca3af" }}>({ref.year})</span>
                      </div>
                      <p className="ref-authors">{ref.authors}</p>
                      <p className="ref-title">{ref.title}</p>
                      {ref.source && <p className="ref-source">{ref.source}</p>}
                      {ref.doi && (
                        <p className="ref-doi">
                          DOI: <span style={{ color: "#2563eb" }}>{ref.doi}</span>
                        </p>
                      )}
                      {ref.url && (
                        <p className="ref-doi">
                          <span style={{ color: "#2563eb" }}>{ref.url}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Add Reference Modal */}
      {showModal && (
        <div className="tm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tm-modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <div>
                <h3 className="tm-modal-title">Add New Reference</h3>
                <p className="tm-modal-subtitle">Add a new reference to your bibliography</p>
              </div>
              <button className="tm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Type</label>
                <input className="cp-input" placeholder="e.g., Journal Article"
                  value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} autoFocus />
              </div>
              <div className="cp-field">
                <label className="cp-label">Year</label>
                <input className="cp-input" type="number" placeholder="2024"
                  value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
            </div>

            <div className="cp-field">
              <label className="cp-label">Authors</label>
              <input className="cp-input" placeholder="Last name, First initial."
                value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} />
            </div>

            <div className="cp-field">
              <label className="cp-label">Title</label>
              <input className="cp-input" placeholder="Article or book title"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="cp-field">
              <label className="cp-label">Source</label>
              <input className="cp-input" placeholder="Journal name, volume, pages"
                value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">DOI (optional)</label>
                <input className="cp-input" placeholder="10.xxxx/xxxxx"
                  value={form.doi} onChange={(e) => setForm({ ...form, doi: e.target.value })} />
              </div>
              <div className="cp-field">
                <label className="cp-label">Category</label>
                <input className="cp-input" placeholder="Research category"
                  value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
            </div>

            <div className="tm-modal-actions">
              <button className="cp-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="cp-btn primary"
                style={{ background: "#1f7a1f", borderColor: "#1f7a1f" }}
                onClick={handleAdd}>
                Add Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}