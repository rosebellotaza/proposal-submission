import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";
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

const CAT_COLORS = {
  Personnel:  "#1f7a1f",
  Equipment:  "#7c3aed",
  Travel:     "#d97706",
  Supplies:   "#2563eb",
  Services:   "#dc2626",
  Other:      "#059669",
};

const CAT_ICONS = {
  Personnel: "👥", Equipment: "🔧", Travel: "✈️",
  Supplies: "📦", Services: "⚙️", Other: "📄",
};

const INITIAL_ITEMS = [
  // Year 1
  { id: 1,  year: 1, category: "Personnel",  description: "Research Assistants (2 positions)", amount: 80000 },
  { id: 2,  year: 1, category: "Personnel",  description: "Principal Investigator Salary",     amount: 45000 },
  { id: 3,  year: 1, category: "Equipment",  description: "Laboratory Equipment",              amount: 35000 },
  { id: 4,  year: 1, category: "Equipment",  description: "Computing Infrastructure",          amount: 15000 },
  { id: 5,  year: 1, category: "Travel",     description: "Conference Attendance",             amount: 8000 },
  { id: 6,  year: 1, category: "Supplies",   description: "Research Materials",                amount: 12000 },
  { id: 7,  year: 1, category: "Other",      description: "Publication Fees",                  amount: 5000 },
  // Year 2
  { id: 8,  year: 2, category: "Personnel",  description: "Research Assistants (2 positions)", amount: 82000 },
  { id: 9,  year: 2, category: "Personnel",  description: "Principal Investigator Salary",     amount: 46000 },
  { id: 10, year: 2, category: "Travel",     description: "Field Research Travel",             amount: 15000 },
  { id: 11, year: 2, category: "Supplies",   description: "Research Materials",                amount: 10000 },
  { id: 12, year: 2, category: "Services",   description: "Data Analysis Software Licenses",   amount: 6000 },
  { id: 13, year: 2, category: "Other",      description: "Publication Fees",                  amount: 5000 },
  // Year 3
  { id: 14, year: 3, category: "Personnel",  description: "Research Assistants (1 position)", amount: 42000 },
  { id: 15, year: 3, category: "Personnel",  description: "Principal Investigator Salary",    amount: 47000 },
  { id: 16, year: 3, category: "Travel",     description: "Conference Presentations",         amount: 12000 },
  { id: 17, year: 3, category: "Services",   description: "Professional Editing Services",    amount: 4000 },
  { id: 18, year: 3, category: "Other",      description: "Publication & Dissemination",      amount: 8000 },
];

const fmt = (n) => "$" + n.toLocaleString();

export default function BudgetPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: "", amount: "", description: "", year: "1" });

  const project = PROJECT_INFO[id] || { title: "Unknown Project", status: "Draft" };
  const statusStyle = STATUS_BADGE[project.status] || STATUS_BADGE["Draft"];

  const years = [1, 2, 3];
  const yearTotals = years.map((y) => items.filter((i) => i.year === y).reduce((s, i) => s + i.amount, 0));
  const totalBudget = yearTotals.reduce((s, t) => s + t, 0);

  // Category breakdown (all years)
  const catTotals = {};
  items.forEach((item) => {
    catTotals[item.category] = (catTotals[item.category] || 0) + item.amount;
  });
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  const handleAdd = () => {
    if (!form.category || !form.amount) return;
    setItems((p) => [...p, {
      id: Date.now(),
      year: parseInt(form.year),
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount) || 0,
    }]);
    setShowModal(false);
    setForm({ category: "", amount: "", description: "", year: "1" });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Budget Plan" />
        <div className="dashboard-content">

          {/* Project Header */}
          <div className="pv-header-left" style={{ marginBottom: 4 }}>
            <button className="pv-back-btn" onClick={() => navigate("/researcher/budget-plan")}>
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

          {/* Budget Plan Header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">Budget Plan</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                Manage project budget and financial allocations
              </p>
            </div>
            <button className="create-btn" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Add Budget Item
            </button>
          </div>

          {/* Year Summary Cards */}
          <div className="bp-year-cards">
            <div className="bp-year-card">
              <div>
                <p className="bp-year-label">Total Budget</p>
                <p className="bp-year-value">{fmt(totalBudget)}</p>
              </div>
              <div className="bp-year-icon" style={{ background: "#eff6ff" }}>
                <DollarSign size={22} color="#3b82f6" />
              </div>
            </div>
            <div className="bp-year-card">
              <div>
                <p className="bp-year-label">Year 1</p>
                <p className="bp-year-value" style={{ color: "#1f7a1f" }}>{fmt(yearTotals[0])}</p>
              </div>
              <div className="bp-year-icon" style={{ background: "#f0fdf4" }}>
                <TrendingUp size={22} color="#1f7a1f" />
              </div>
            </div>
            <div className="bp-year-card">
              <div>
                <p className="bp-year-label">Year 2</p>
                <p className="bp-year-value" style={{ color: "#7c3aed" }}>{fmt(yearTotals[1])}</p>
              </div>
              <div className="bp-year-icon" style={{ background: "#f5f3ff" }}>
                <TrendingDown size={22} color="#7c3aed" />
              </div>
            </div>
            <div className="bp-year-card">
              <div>
                <p className="bp-year-label">Year 3</p>
                <p className="bp-year-value" style={{ color: "#d97706" }}>{fmt(yearTotals[2])}</p>
              </div>
              <div className="bp-year-icon" style={{ background: "#fefce8" }}>
                <PieChart size={22} color="#d97706" />
              </div>
            </div>
          </div>

          {/* Budget Breakdown by Category */}
          <div className="cp-section">
            <div className="cp-section-title">Budget Breakdown by Category</div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 20px" }}>
              Total allocation across all categories
            </p>
            {sortedCats.map(([cat, total]) => {
              const pct = ((total / totalBudget) * 100).toFixed(1);
              const color = CAT_COLORS[cat] || "#6b7280";
              return (
                <div key={cat} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{CAT_ICONS[cat] || "📋"}</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{cat}</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#374151" }}>
                      {fmt(total)} <span style={{ color: "#9ca3af" }}>({pct}%)</span>
                    </span>
                  </div>
                  <div className="bp-progress-bg">
                    <div
                      className="bp-progress-bar"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Year Detail Tables */}
          {years.map((year, yi) => {
            const yearItems = items.filter((i) => i.year === year);
            const subtotal = yearItems.reduce((s, i) => s + i.amount, 0);
            return (
              <div key={year} className="cp-section">
                <div className="cp-section-title">Year {year} Budget Details</div>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "-8px 0 16px" }}>
                  Total: {fmt(subtotal)}
                </p>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Description</th>
                        <th style={{ textAlign: "right" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearItems.map((item) => {
                        const color = CAT_COLORS[item.category] || "#6b7280";
                        return (
                          <tr key={item.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                                <span style={{ fontWeight: 500 }}>{item.category}</span>
                              </div>
                            </td>
                            <td style={{ color: "#6b7280" }}>{item.description}</td>
                            <td style={{ textAlign: "right", fontWeight: 500 }}>{fmt(item.amount)}</td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderTop: "2px solid #e5e7eb" }}>
                        <td colSpan={2} style={{ fontWeight: 700, paddingTop: 14 }}>
                          Year {year} Subtotal
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, paddingTop: 14 }}>
                          {fmt(subtotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Add Budget Item Modal */}
      {showModal && (
        <div className="tm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <div>
                <h3 className="tm-modal-title">Add Budget Item</h3>
                <p className="tm-modal-subtitle">Add a new item to your budget plan</p>
              </div>
              <button className="tm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Category</label>
                <input
                  className="cp-input"
                  type="text"
                  placeholder="e.g., Personnel"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="cp-field">
                <label className="cp-label">Amount (USD)</label>
                <input
                  className="cp-input"
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="cp-field">
              <label className="cp-label">Description</label>
              <input
                className="cp-input"
                type="text"
                placeholder="Enter item description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">Project Year</label>
              <div className="cp-select-wrap">
                <select
                  className="cp-select"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
                <span className="cp-select-chevron">▾</span>
              </div>
            </div>

            <div className="tm-modal-actions">
              <button className="cp-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="cp-btn primary"
                style={{ background: "#1f7a1f", borderColor: "#1f7a1f" }}
                onClick={handleAdd}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}