import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, DollarSign, TrendingUp, TrendingDown, PieChart, Trash2 } from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import api from "../../utils/api";

const STATUS_BADGE = {
  "Approved":         { bg: "#dcfce7", color: "#15803d" },
  "Under Evaluation": { bg: "#ede9fe", color: "#6d28d9" },
  "In Progress":      { bg: "#d1fae5", color: "#065f46" },
  "Submitted":        { bg: "#e0f2fe", color: "#0369a1" },
  "Draft":            { bg: "#f3f4f6", color: "#6b7280" },
};

const CAT_COLORS = {
  Personnel: "#1f7a1f",
  Equipment: "#7c3aed",
  Travel: "#d97706",
  Supplies: "#2563eb",
  Services: "#dc2626",
  Other: "#059669",
};

const fmt = (n) => "₱" + Number(n).toLocaleString();

export default function BudgetPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "",
    unit_price: "",
    description: "",
    year_no: "1",
    quantity: "1",
  });

  useEffect(() => {
    api.get(`/projects/${id}`).then((res) => setProject(res.data));
    api.get(`/projects/${id}/budget-plan`).then((res) => setItems(res.data.items || []));
  }, [id]);

  const years = [1, 2, 3];
  const yearTotals = years.map((y) =>
    items.filter((i) => i.year_no === y).reduce((s, i) => s + Number(i.total_amount), 0)
  );
  const totalBudget = yearTotals.reduce((s, t) => s + t, 0);

  const catTotals = {};
  items.forEach((item) => {
    catTotals[item.category] = (catTotals[item.category] || 0) + Number(item.total_amount);
  });
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  const handleAdd = async () => {
    if (!form.category || !form.unit_price) return;
    setLoading(true);
    try {
      const res = await api.post(`/projects/${id}/budget-plan`, {
        ...form,
        year_no: parseInt(form.year_no),
        unit_price: parseFloat(form.unit_price),
        quantity: parseFloat(form.quantity) || 1,
      });
      setItems((p) => [...p, res.data]);
      setShowModal(false);
      setForm({
        category: "",
        unit_price: "",
        description: "",
        year_no: "1",
        quantity: "1",
      });
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
        <Topbar title="Budget Plan" />
        <div className="dashboard-content">

          {/* Project Header */}
          <div className="pv-header-left" style={{ marginBottom: 4 }}>
            <button
              className="pv-back-btn"
              onClick={() => navigate("/researcher/budget-plan")}
            >
              <ArrowLeft size={18} />
            </button>
            <div className="pv-title-row">
              <h2 className="pv-title" style={{ fontSize: "1.15rem" }}>
                {project?.title}
              </h2>
              {project && (
                <span
                  className="badge"
                  style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                  {project.status}
                </span>
              )}
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 20px 52px" }}>
            {project?.reference_no}
          </p>

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
                <p className="bp-year-value" style={{ color: "#1f7a1f" }}>
                  {fmt(yearTotals[0])}
                </p>
              </div>
              <div className="bp-year-icon" style={{ background: "#f0fdf4" }}>
                <TrendingUp size={22} color="#1f7a1f" />
              </div>
            </div>
            <div className="bp-year-card">
              <div>
                <p className="bp-year-label">Year 2</p>
                <p className="bp-year-value" style={{ color: "#7c3aed" }}>
                  {fmt(yearTotals[1])}
                </p>
              </div>
              <div className="bp-year-icon" style={{ background: "#f5f3ff" }}>
                <TrendingDown size={22} color="#7c3aed" />
              </div>
            </div>
            <div className="bp-year-card">
              <div>
                <p className="bp-year-label">Year 3</p>
                <p className="bp-year-value" style={{ color: "#d97706" }}>
                  {fmt(yearTotals[2])}
                </p>
              </div>
              <div className="bp-year-icon" style={{ background: "#fefce8" }}>
                <PieChart size={22} color="#d97706" />
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {sortedCats.length > 0 && (
            <div className="cp-section">
              <div className="cp-section-title">Budget Breakdown by Category</div>
              {sortedCats.map(([cat, total]) => {
                const pct = totalBudget > 0 ? ((total / totalBudget) * 100).toFixed(1) : 0;
                const color = CAT_COLORS[cat] || "#6b7280";
                return (
                  <div key={cat} style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                        {cat}
                      </span>
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
          )}

          {/* Year Detail Tables */}
          {years.map((year) => {
            const yearItems = items.filter((i) => i.year_no === year);
            if (yearItems.length === 0) return null;
            const subtotal = yearItems.reduce((s, i) => s + Number(i.total_amount), 0);

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
                        <th style={{ textAlign: "right" }}>Qty</th>
                        <th style={{ textAlign: "right" }}>Unit Price</th>
                        <th style={{ textAlign: "right" }}>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearItems.map((item) => {
                        const color = CAT_COLORS[item.category] || "#6b7280";
                        return (
                          <tr key={item.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    background: color,
                                    flexShrink: 0,
                                    display: "inline-block",
                                  }}
                                />
                                <span style={{ fontWeight: 500 }}>{item.category}</span>
                              </div>
                            </td>
                            <td style={{ color: "#6b7280" }}>{item.description}</td>
                            <td style={{ textAlign: "right" }}>{item.quantity}</td>
                            <td style={{ textAlign: "right" }}>{fmt(item.unit_price)}</td>
                            <td style={{ textAlign: "right", fontWeight: 500 }}>
                              {fmt(item.total_amount)}
                            </td>
                            <td>
                              <button
                                onClick={async () => {
                                  if (!confirm("Delete this budget item?")) return;
                                  await api.delete(`/projects/${id}/budget-plan/${item.id}`);
                                  setItems((p) => p.filter((i) => i.id !== item.id));
                                }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#dc2626",
                                  padding: 4,
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      <tr style={{ borderTop: "2px solid #e5e7eb" }}>
                        <td colSpan={5} style={{ fontWeight: 700, paddingTop: 14 }}>
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

          {items.length === 0 && (
            <div className="cp-section">
              <p style={{ color: "#9ca3af", fontSize: 14 }}>
                No budget items yet. Add your first item!
              </p>
            </div>
          )}

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
              <button className="tm-modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
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
                <label className="cp-label">Unit Price (₱)</label>
                <input
                  className="cp-input"
                  type="number"
                  placeholder="0.00"
                  value={form.unit_price}
                  onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                />
              </div>
            </div>

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Quantity</label>
                <input
                  className="cp-input"
                  type="number"
                  placeholder="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="cp-field">
                <label className="cp-label">Project Year</label>
                <div className="cp-select-wrap">
                  <select
                    className="cp-select"
                    value={form.year_no}
                    onChange={(e) => setForm({ ...form, year_no: e.target.value })}
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                  </select>
                  <span className="cp-select-chevron">▾</span>
                </div>
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

            <div className="tm-modal-actions">
              <button className="cp-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="cp-btn primary"
                style={{ background: "#1f7a1f", borderColor: "#1f7a1f" }}
                onClick={handleAdd}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}