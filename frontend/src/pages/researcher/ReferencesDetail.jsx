import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import api from "../../utils/api";
import { ArrowLeft, Plus, BookOpen, FileText, BookMarked, Link, Search, Trash2 } from "lucide-react";

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

export default function ReferencesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project,   setProject]   = useState(null);
  const [refs,      setRefs]      = useState([]);
  const [query,     setQuery]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [form, setForm] = useState({
    type: "Journal", year: "2024", authors: "", title: "", source: "", doi: "", category: "",
  });

  useEffect(() => {
    api.get(`/projects/${id}`).then((res) => setProject(res.data));
    api.get(`/projects/${id}/references`).then((res) => setRefs(res.data));
  }, [id]);

  const filtered = refs.filter((r) =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.authors.toLowerCase().includes(query.toLowerCase()) ||
    (r.category || "").toLowerCase().includes(query.toLowerCase())
  );

  const grouped = filtered.reduce((acc, r) => {
    const cat = r.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const handleAdd = async () => {
    if (!form.title || !form.authors) return;
    setLoading(true);
    try {
      const res = await api.post(`/projects/${id}/references`, {
        ...form, year: parseInt(form.year) || 2024,
      });
      setRefs((p) => [...p, res.data]);
      setShowModal(false);
      setForm({ type: "Journal", year: "2024", authors: "", title: "", source: "", doi: "", category: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = STATUS_BADGE[project?.status] || STATUS_BADGE["Draft"];

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="References" />
        <div className="dashboard-content">

          {/* Project Header */}
          <div className="pv-header-left" style={{ marginBottom: 4 }}>
            <button className="pv-back-btn" onClick={() => navigate("/researcher/references")}>
              <ArrowLeft size={18} />
            </button>
            <div className="pv-title-row">
              <h2 className="pv-title" style={{ fontSize: "1.15rem" }}>{project?.title}</h2>
              {project && (
                <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                  {project.status}
                </span>
              )}
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 20px 52px" }}>{project?.reference_no}</p>

          {/* Page Header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">References</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Manage research references and citations</p>
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
                <p className="ref-stat-num">{filtered.length}</p>
              </div>
              <div className="ref-stat-icon" style={{ background: "#eff6ff" }}>
                <BookOpen size={22} color="#3b82f6" />
              </div>
            </div>
            <div className="ref-stat-card">
              <div>
                <p className="ref-stat-label">Journal Articles</p>
                <p className="ref-stat-num" style={{ color: "#2563eb" }}>
                  {filtered.filter((r) => r.type === "Journal").length}
                </p>
              </div>
              <div className="ref-stat-icon" style={{ background: "#eff6ff" }}>
                <FileText size={22} color="#2563eb" />
              </div>
            </div>
            <div className="ref-stat-card">
              <div>
                <p className="ref-stat-label">Books</p>
                <p className="ref-stat-num" style={{ color: "#15803d" }}>
                  {filtered.filter((r) => r.type === "Book").length}
                </p>
              </div>
              <div className="ref-stat-icon" style={{ background: "#f0fdf4" }}>
                <BookMarked size={22} color="#15803d" />
              </div>
            </div>
            <div className="ref-stat-card">
              <div>
                <p className="ref-stat-label">Categories</p>
                <p className="ref-stat-num" style={{ color: "#7c3aed" }}>
                  {new Set(filtered.map((r) => r.category)).size}
                </p>
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
              <input type="text" placeholder="Search references..."
                value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          {/* Grouped References */}
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="cp-section" style={{ marginBottom: 16 }}>
              <div className="cp-section-title" style={{ marginBottom: 4 }}>{cat}</div>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>{items.length} reference(s)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {items.map((ref) => {
                  const ts = TYPE_STYLES[ref.type] || TYPE_STYLES.Journal;
                  return (
                      <div key={ref.id} className="ref-card" style={{ position: "relative" }}>
                        <button
                          onClick={async () => {
                            if (!confirm("Delete this reference?")) return;
                            await api.delete(`/projects/${id}/references/${ref.id}`);
                            setRefs((p) => p.filter((r) => r.id !== ref.id));
                          }}
                          style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4 }}
                        >
                          <Trash2 size={15} />
                        </button>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span className="ref-type-badge" style={{ background: ts.bg, color: ts.color }}>
                            {ts.icon} {ref.type}
                          </span>
                          <span style={{ fontSize: 13, color: "#9ca3af" }}>({ref.year})</span>
                        </div>
                        <p className="ref-authors">{ref.authors}</p>
                        <p className="ref-title">{ref.title}</p>
                        {ref.source && <p className="ref-source">{ref.source}</p>}
                        {ref.doi && <p className="ref-doi">DOI: <span style={{ color: "#2563eb" }}>{ref.doi}</span></p>}
                      </div>
                  );
                })}
              </div>
            </div>
          ))}

          {refs.length === 0 && (
            <div className="cp-section">
              <p style={{ color: "#9ca3af", fontSize: 14 }}>No references yet. Add your first reference!</p>
            </div>
          )}

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
                <div className="cp-select-wrap">
                  <select className="cp-select" value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option>Journal</option>
                    <option>Book</option>
                    <option>Conference</option>
                    <option>Web</option>
                  </select>
                  <span className="cp-select-chevron">▾</span>
                </div>
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
                onClick={handleAdd} disabled={loading}>
                {loading ? "Adding..." : "Add Reference"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}