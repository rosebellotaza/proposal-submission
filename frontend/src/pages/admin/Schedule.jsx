import { useState, useEffect } from "react";
import { Calendar, Users, CheckCircle2 } from "lucide-react";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";

const STATUS_BADGE = {
  "Submitted":               { bg: "#e0f2fe", color: "#0369a1" },
  "Presentation Scheduled":  { bg: "#fef9c3", color: "#a16207" },
  "Under Evaluation":        { bg: "#ede9fe", color: "#6d28d9" },
  "Evaluated":               { bg: "#dcfce7", color: "#15803d" },
  "Approved":                { bg: "#dcfce7", color: "#15803d" },
  "Draft":                   { bg: "#f3f4f6", color: "#6b7280" },
};

export default function Schedule() {
  const [proposals,   setProposals]   = useState([]);
  const [evaluators,  setEvaluators]  = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState("");
  const [error,       setError]       = useState("");
  const [form, setForm] = useState({
    presentation_date: "",
    presentation_time: "",
    venue: "",
    evaluator_ids: [],
  });

  useEffect(() => {
    api.get("/admin/proposals").then((res) => setProposals(res.data));
    api.get("/admin/evaluators").then((res) => setEvaluators(res.data));
  }, []);

  const toggleEvaluator = (id) => {
    setForm((p) => ({
      ...p,
      evaluator_ids: p.evaluator_ids.includes(id)
        ? p.evaluator_ids.filter((e) => e !== id)
        : [...p.evaluator_ids, id],
    }));
  };

  const handleSchedule = async () => {
    if (!form.presentation_date || !form.presentation_time || !form.venue) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.evaluator_ids.length === 0) {
      setError("Please assign at least one evaluator.");
      return;
    }
    setError(""); setLoading(true);
    try {
      await api.post("/admin/schedule", {
        research_project_id: selected.id,
        ...form,
      });
      setSuccess(`Presentation scheduled for "${selected.title}"!`);
      setShowModal(false);
      setSelected(null);
      setForm({ presentation_date: "", presentation_time: "", venue: "", evaluator_ids: [] });
      // Refresh proposals
      const res = await api.get("/admin/proposals");
      setProposals(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule presentation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="main-content" style={{ marginLeft: 0 }}>
        <Topbar title="Schedule Presentations" />
        <div className="dashboard-content">

          <div style={{ marginBottom: 20 }}>
            <h2 className="page-title">Oral Presentation Scheduling</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Schedule presentations and assign evaluators to submitted proposals
            </p>
          </div>

          {success && (
            <div style={{ background: "#dcfce7", color: "#15803d", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {success}
            </div>
          )}

          {/* Proposals Table */}
          <div className="table-wrapper">
            <h4 className="table-title">Submitted Proposals ({proposals.length})</h4>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Reference No</th>
                    <th>Title</th>
                    <th>Submitted By</th>
                    <th>Status</th>
                    <th>Presentation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p) => {
                    const sb = STATUS_BADGE[p.status] || STATUS_BADGE["Draft"];
                    return (
                      <tr key={p.id}>
                        <td>{p.reference_no}</td>
                        <td><strong>{p.title}</strong></td>
                        <td>{p.creator?.name}</td>
                        <td>
                          <span className="badge" style={{ background: sb.bg, color: sb.color }}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          {p.oral_presentation ? (
                            <div style={{ fontSize: 12, color: "#374151" }}>
                              <div>{p.oral_presentation.presentation_date}</div>
                              <div style={{ color: "#9ca3af" }}>{p.oral_presentation.venue}</div>
                              <div style={{ color: "#7c3aed" }}>
                                {p.oral_presentation.evaluators?.length || 0} evaluator(s)
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>Not scheduled</span>
                          )}
                        </td>
                        <td>
                          <span className="action" onClick={() => {
                            setSelected(p);
                            setShowModal(true);
                            setError("");
                            // Pre-fill if already scheduled
                            if (p.oral_presentation) {
                              setForm({
                                presentation_date: p.oral_presentation.presentation_date,
                                presentation_time: p.oral_presentation.presentation_time,
                                venue: p.oral_presentation.venue,
                                evaluator_ids: p.oral_presentation.evaluators?.map((e) => e.id) || [],
                              });
                            } else {
                              setForm({ presentation_date: "", presentation_time: "", venue: "", evaluator_ids: [] });
                            }
                          }}>
                            {p.oral_presentation ? "Edit" : "Schedule"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {proposals.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>
                        No submitted proposals yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && selected && (
        <div className="tm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tm-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <div>
                <h3 className="tm-modal-title">Schedule Oral Presentation</h3>
                <p className="tm-modal-subtitle">{selected.title}</p>
              </div>
              <button className="tm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {error}
              </div>
            )}

            <div className="cp-grid-2">
              <div className="cp-field">
                <label className="cp-label">Date *</label>
                <input className="cp-input" type="date"
                  value={form.presentation_date}
                  onChange={(e) => setForm({ ...form, presentation_date: e.target.value })} />
              </div>
              <div className="cp-field">
                <label className="cp-label">Time *</label>
                <input className="cp-input" type="time"
                  value={form.presentation_time}
                  onChange={(e) => setForm({ ...form, presentation_time: e.target.value })} />
              </div>
            </div>

            <div className="cp-field">
              <label className="cp-label">Venue *</label>
              <input className="cp-input" type="text" placeholder="e.g., Conference Room A"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>

            <div className="cp-field">
              <label className="cp-label">Assign Evaluators *</label>
              {evaluators.length === 0 ? (
                <p style={{ fontSize: 13, color: "#9ca3af" }}>No evaluators registered yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
                  {evaluators.map((ev) => {
                    const isSelected = form.evaluator_ids.includes(ev.id);
                    return (
                      <div key={ev.id}
                        onClick={() => toggleEvaluator(ev.id)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, cursor: "pointer", background: isSelected ? "#f5f3ff" : "#fafafa", border: `1px solid ${isSelected ? "#7c3aed" : "#e5e7eb"}` }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${isSelected ? "#7c3aed" : "#d1d5db"}`, background: isSelected ? "#7c3aed" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {isSelected && <CheckCircle2 size={12} color="white" />}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{ev.name}</p>
                          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{ev.expertise || ev.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
                {form.evaluator_ids.length} evaluator(s) selected
              </p>
            </div>

            <div className="tm-modal-actions">
              <button className="cp-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="cp-btn primary"
                style={{ background: "#1f7a1f", borderColor: "#1f7a1f" }}
                onClick={handleSchedule} disabled={loading}>
                {loading ? "Scheduling..." : "Schedule Presentation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}