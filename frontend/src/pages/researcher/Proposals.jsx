import { useState, useRef, useEffect } from "react";
import {
  ChevronDown, Upload, Check, Plus, Trash2, Send,
  Users, Search, X, CheckCircle2, UserCheck, ChevronRight,
} from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import { FACULTY_BY_COLLEGE, DEFAULT_EVALUATORS } from "../../data/faculty";
import api from "../../utils/api";

const TABS = ["Overview", "Work Plan", "Budget", "Framework", "References", "Outputs"];

const CATEGORY_COLORS = {
  Personnel:   { bg: "#f0fdf4", color: "#15803d" },
  Equipment:   { bg: "#eff6ff", color: "#1d4ed8" },
  Materials:   { bg: "#fefce8", color: "#a16207" },
  Travel:      { bg: "#fff7ed", color: "#c2410c" },
  Services:    { bg: "#f5f3ff", color: "#6d28d9" },
  Publication: { bg: "#fdf2f8", color: "#9d174d" },
};

// ─── Evaluator Modal ──────────────────────────────────────────────────────────
function EvaluatorModal({ onClose, onAdd, alreadyAdded }) {
  const [search, setSearch] = useState("");
  const [openCollege, setOpenCollege] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const colleges = Object.keys(FACULTY_BY_COLLEGE);

  const toggleCollege = (c) => setOpenCollege(openCollege === c ? null : c);
  const toggleSelect = (member, college) => {
    const key = member.id;
    if (selectedFaculty.find((f) => f.id === key)) {
      setSelectedFaculty((p) => p.filter((f) => f.id !== key));
    } else {
      setSelectedFaculty((p) => [...p, { ...member, college }]);
    }
  };
  const isAlreadyAdded = (id) => alreadyAdded.some((f) => f.id === id);
  const isSelected = (id) => selectedFaculty.some((f) => f.id === id);

  const filteredColleges = colleges.filter((college) => {
    if (!search) return true;
    const lc = search.toLowerCase();
    return college.toLowerCase().includes(lc) ||
      FACULTY_BY_COLLEGE[college].some((f) =>
        f.name.toLowerCase().includes(lc) || f.expertise.toLowerCase().includes(lc)
      );
  });

  const getFilteredMembers = (college) => {
    if (!search) return FACULTY_BY_COLLEGE[college];
    const lc = search.toLowerCase();
    return FACULTY_BY_COLLEGE[college].filter((f) =>
      f.name.toLowerCase().includes(lc) || f.expertise.toLowerCase().includes(lc) || college.toLowerCase().includes(lc)
    );
  };

  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="ev-faculty-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tm-modal-header">
          <div>
            <h3 className="tm-modal-title">Select Preferred Evaluators</h3>
            <p className="tm-modal-subtitle">Browse faculty by college and select your preferred evaluators</p>
          </div>
          <button className="tm-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="ev-faculty-search">
          <Search size={16} color="#9ca3af" />
          <input type="text" placeholder="Search by name, college, or expertise..."
            value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          {search && <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }} onClick={() => setSearch("")}><X size={14} /></button>}
        </div>
        {selectedFaculty.length > 0 && (
          <div className="ev-selected-count">
            <CheckCircle2 size={14} color="#7c3aed" />
            <span>{selectedFaculty.length} faculty selected</span>
          </div>
        )}
        <div className="ev-college-list">
          {filteredColleges.map((college) => {
            const members = getFilteredMembers(college);
            const isOpen = openCollege === college || !!search;
            const selCount = members.filter((m) => isSelected(m.id)).length;
            return (
              <div key={college} className="ev-college-item">
                <div className="ev-college-header" onClick={() => !search && toggleCollege(college)} style={{ cursor: search ? "default" : "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="ev-college-dot" />
                    <div>
                      <p className="ev-college-name">{college}</p>
                      <p className="ev-college-count">{members.length} faculty member{members.length !== 1 ? "s" : ""}
                        {selCount > 0 && <span className="ev-college-sel-badge">{selCount} selected</span>}
                      </p>
                    </div>
                  </div>
                  {!search && <ChevronRight size={16} color="#9ca3af" style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }} />}
                </div>
                {(isOpen || search) && members.length > 0 && (
                  <div className="ev-faculty-list">
                    {members.map((member) => {
                      const added = isAlreadyAdded(member.id);
                      const selected = isSelected(member.id);
                      return (
                        <div key={member.id} className={`ev-faculty-row ${selected ? "selected" : ""} ${added ? "added" : ""}`}
                          onClick={() => !added && toggleSelect(member, college)}>
                          <div className={`ev-faculty-checkbox ${selected ? "checked" : ""}`}>
                            {selected && <Check size={11} color="white" />}
                          </div>
                          <div className="ev-faculty-info">
                            <p className="ev-faculty-name">{member.name}{added && <span className="ev-already-badge">Already added</span>}</p>
                            <p className="ev-faculty-pos">{member.position}</p>
                            <p className="ev-faculty-exp">{member.expertise}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="ev-modal-footer">
          <button className="cp-btn" onClick={onClose}>Cancel</button>
          <button className="cp-btn primary"
            style={{ background: "#1f7a1f", borderColor: "#1f7a1f", opacity: selectedFaculty.length === 0 ? 0.5 : 1 }}
            onClick={() => { if (selectedFaculty.length > 0) { onAdd(selectedFaculty); onClose(); } }}
            disabled={selectedFaculty.length === 0}>
            Add {selectedFaculty.length > 0 ? `(${selectedFaculty.length})` : ""} Evaluator{selectedFaculty.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── File Input Row ───────────────────────────────────────────────────────────
function FileInputRow({ label, required, multiple, accept }) {
  const [files, setFiles] = useState([]);
  const ref = useRef(null);
  return (
    <div className="cp-field">
      <label className="cp-label">{label} {required && "*"}</label>
      <div className="cp-file-row">
        <button className="cp-file-btn" onClick={() => ref.current.click()}>Choose {multiple ? "Files" : "File"}</button>
        <span className="cp-file-name">{files.length === 0 ? "No file chosen" : files.length === 1 ? files[0].name : `${files.length} files selected`}</span>
        <button className="cp-file-upload-icon" onClick={() => ref.current.click()}><Upload size={16} color="#6b7280" /></button>
        <input ref={ref} type="file" multiple={multiple} accept={accept} style={{ display: "none" }}
          onChange={(e) => setFiles(Array.from(e.target.files))} />
      </div>
    </div>
  );
}

// ─── Simple Upload Tab ────────────────────────────────────────────────────────
function SimpleUploadTab({ title, subtitle, fieldLabel, note, accept }) {
  return (
    <div className="cp-section">
      <div className="cp-section-title" style={{ borderBottom: "none", marginBottom: 4 }}>{title}</div>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>{subtitle}</p>
      <FileInputRow label={fieldLabel} required accept={accept} />
      {note && <div className="cp-note-box"><strong>Note:</strong> {note}</div>}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ form, setForm, projects }) {
  const [preferredEvaluators, setPreferredEvaluators] = useState([]);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const allAdded = [...DEFAULT_EVALUATORS, ...preferredEvaluators];

  return (
    <>
      {/* Project Selector */}
      <div className="cp-section">
        <div className="cp-section-title">Select Project</div>
        <div className="cp-field">
          <label className="cp-label">Project *</label>
          <div className="cp-select-wrap">
            <select className="cp-select" value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.reference_no} — {p.title}</option>
              ))}
            </select>
            <span className="cp-select-chevron"><ChevronDown size={14} /></span>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="cp-section">
        <div className="cp-section-title">Basic Information</div>
        <div className="cp-grid-2">
          <div className="cp-field">
            <label className="cp-label">Scholarly Work Type *</label>
            <div className="cp-select-wrap">
              <select className="cp-select" value={form.scholarly_work_type}
                onChange={(e) => setForm({ ...form, scholarly_work_type: e.target.value })}>
                <option>Research</option>
                <option>Extension</option>
                <option>Instructional Material Development</option>
              </select>
              <span className="cp-select-chevron"><ChevronDown size={14} /></span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Questions */}
      <div className="cp-section">
        <div className="cp-section-title">Additional Information</div>

        <div className="cp-q-block">
          <p className="cp-q-text">Is this your first time applying for this scholarly work?</p>
          <div className="cp-radio-row">
            {["yes", "no"].map((v) => (
              <label key={v} className="cp-radio-label">
                <input type="radio" name="first_time" value={v}
                  checked={form.is_first_time === (v === "yes")}
                  onChange={() => setForm({ ...form, is_first_time: v === "yes" })} />
                {v === "yes" ? "Yes" : "No"}
              </label>
            ))}
          </div>
        </div>

        <div className="cp-q-block">
          <p className="cp-q-text">Are there external collaborators?</p>
          <div className="cp-radio-row">
            {["yes", "no"].map((v) => (
              <label key={v} className="cp-radio-label">
                <input type="radio" name="collab" value={v}
                  checked={form.has_external_collab === (v === "yes")}
                  onChange={() => setForm({ ...form, has_external_collab: v === "yes" })} />
                {v === "yes" ? "Yes" : "No"}
              </label>
            ))}
          </div>
          {form.has_external_collab && (
            <div className="cp-cond-box">
              <textarea className="cp-textarea" placeholder="Please specify collaborators..."
                value={form.external_collab_details}
                onChange={(e) => setForm({ ...form, external_collab_details: e.target.value })} />
            </div>
          )}
        </div>

        <div className="cp-q-block">
          <p className="cp-q-text">Has this been submitted to another agency for support?</p>
          <div className="cp-radio-row">
            {["yes", "no"].map((v) => (
              <label key={v} className="cp-radio-label">
                <input type="radio" name="submitted_elsewhere" value={v}
                  checked={form.submitted_elsewhere === (v === "yes")}
                  onChange={() => setForm({ ...form, submitted_elsewhere: v === "yes" })} />
                {v === "yes" ? "Yes" : "No"}
              </label>
            ))}
          </div>
          {form.submitted_elsewhere && (
            <div className="cp-cond-box">
              <div className="cp-detail-grid">
                <div>
                  <div className="cp-col-label">Agency</div>
                  <input className="cp-input" type="text" placeholder="Agency name"
                    value={form.other_agency_name}
                    onChange={(e) => setForm({ ...form, other_agency_name: e.target.value })} />
                </div>
                <div>
                  <div className="cp-col-label">Amount</div>
                  <input className="cp-input" type="number" placeholder="Amount"
                    value={form.other_agency_amount}
                    onChange={(e) => setForm({ ...form, other_agency_amount: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Required Documents */}
      <div className="cp-section">
        <div className="cp-section-title">Required Documents</div>
        <FileInputRow label="Curriculum Vitae of Proponents" required multiple />
        <p className="cp-file-hint">Upload multiple CV files if needed</p>
      </div>

      {/* Evaluator Assignment */}
      <div className="cp-section">
        <div className="cp-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Evaluator Assignment</span>
          <button className="ev-add-eval-btn" onClick={() => setShowEvalModal(true)}>
            <Plus size={14} /> Add Preferred Evaluator
          </button>
        </div>
        <div className="ev-evaluator-list">
          {DEFAULT_EVALUATORS.map((ev) => (
            <div key={ev.id} className="ev-evaluator-card default">
              <div className="ev-evaluator-avatar">{ev.name.charAt(0)}</div>
              <div className="ev-evaluator-info">
                <p className="ev-evaluator-name">{ev.name}</p>
                <p className="ev-evaluator-pos">{ev.position} • {ev.college}</p>
                <p className="ev-evaluator-exp">{ev.expertise}</p>
              </div>
              <span className="ev-default-badge">Default</span>
            </div>
          ))}
          {preferredEvaluators.map((ev) => (
            <div key={ev.id} className="ev-evaluator-card preferred">
              <div className="ev-evaluator-avatar" style={{ background: "#f5f3ff", color: "#7c3aed" }}>{ev.name.charAt(0)}</div>
              <div className="ev-evaluator-info">
                <p className="ev-evaluator-name">{ev.name}</p>
                <p className="ev-evaluator-pos">{ev.position} • {ev.college}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span className="ev-preferred-badge">Preferred</span>
                <button className="cp-delete-btn" onClick={() => setPreferredEvaluators((p) => p.filter((e) => e.id !== ev.id))} style={{ padding: 3 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEvalModal && (
        <EvaluatorModal onClose={() => setShowEvalModal(false)}
          onAdd={(selected) => {
            const newOnes = selected.filter((s) => !allAdded.some((a) => a.id === s.id));
            setPreferredEvaluators((p) => [...p, ...newOnes]);
          }}
          alreadyAdded={allAdded} />
      )}
    </>
  );
}

// ─── Budget Tab ───────────────────────────────────────────────────────────────
function BudgetTab() {
  const [items, setItems] = useState([
    { id: 1, category: "Personnel",   description: "Research Assistants (2 positions)", qty: 24, unitPrice: 3500 },
    { id: 2, category: "Equipment",   description: "Laboratory Equipment Set",          qty: 1,  unitPrice: 125000 },
    { id: 3, category: "Travel",      description: "Field Research Travel",             qty: 12, unitPrice: 4500 },
  ]);

  const total = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const fmt = (n) => "₱" + n.toLocaleString();

  return (
    <div className="cp-section">
      <div className="cp-budget-header">
        <div className="cp-section-title" style={{ margin: 0, border: "none", padding: 0 }}>Budget Plan</div>
        <button className="create-btn" onClick={() => setItems((p) => [...p, { id: Date.now(), category: "Personnel", description: "", qty: 1, unitPrice: 0 }])}>
          <Plus size={15} /> Add Item
        </button>
      </div>
      <div className="table-scroll" style={{ marginTop: 16 }}>
        <table className="cp-budget-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Item Description</th>
              <th style={{ textAlign: "right" }}>Quantity</th>
              <th style={{ textAlign: "right" }}>Unit Price</th>
              <th style={{ textAlign: "right" }}>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const c = CATEGORY_COLORS[item.category] || { bg: "#f3f4f6", color: "#374151" };
              return (
                <tr key={item.id}>
                  <td><span className="cp-cat-badge" style={{ background: c.bg, color: c.color }}>{item.category}</span></td>
                  <td>{item.description}</td>
                  <td style={{ textAlign: "right" }}>{item.qty}</td>
                  <td style={{ textAlign: "right" }}>{fmt(item.unitPrice)}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(item.qty * item.unitPrice)}</td>
                  <td><button className="cp-delete-btn" onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))}><Trash2 size={15} /></button></td>
                </tr>
              );
            })}
            <tr className="cp-total-row">
              <td colSpan={4} style={{ textAlign: "right", fontWeight: 600, color: "#374151" }}>Total Budget:</td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "#1f7a1f" }}>{fmt(total)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Proposals() {
  const [activeTab,  setActiveTab]  = useState("Overview");
  const [projects,   setProjects]   = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");
  const [form, setForm] = useState({
    project_id:             "",
    scholarly_work_type:    "Research",
    is_first_time:          true,
    has_external_collab:    false,
    external_collab_details:"",
    submitted_elsewhere:    false,
    other_agency_name:      "",
    other_agency_amount:    "",
  });

  useEffect(() => {
    api.get("/projects").then((res) => {
      // Only show Draft projects
      setProjects(res.data.filter((p) => p.status === "Draft"));
    });
  }, []);

  const handleSubmit = async () => {
    if (!form.project_id) {
      setError("Please select a project first.");
      return;
    }
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      // First create/save the proposal info
      await api.post(`/projects/${form.project_id}/proposals`, {
        scholarly_work_type:     form.scholarly_work_type,
        is_first_time:           form.is_first_time,
        has_external_collab:     form.has_external_collab,
        external_collab_details: form.external_collab_details,
        submitted_elsewhere:     form.submitted_elsewhere,
        other_agency_name:       form.other_agency_name,
        other_agency_amount:     form.other_agency_amount || null,
      }).catch(() => {}); // ignore if proposal already exists

      // Then submit the project
      await api.post(`/projects/${form.project_id}/submit`);
      setSuccess("Proposal submitted successfully! Status changed to Submitted.");

      // Refresh projects list
      const res = await api.get("/projects");
      setProjects(res.data.filter((p) => p.status === "Draft"));
      setForm({ ...form, project_id: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":   return <OverviewTab form={form} setForm={setForm} projects={projects} />;
      case "Work Plan":  return <SimpleUploadTab title="Work Plan" subtitle="Upload your detailed work plan document" fieldLabel="Work Plan Document" accept=".pdf,.doc,.docx,.xlsx" note="Your work plan should include detailed activities, timelines, responsibilities, and milestones." />;
      case "Budget":     return <BudgetTab />;
      case "Framework":  return <SimpleUploadTab title="Project Framework" subtitle="Upload your project framework document" fieldLabel="Project Framework Document" accept=".pdf,.doc,.docx" note="Your framework should include research objectives, success indicators, methodology, assumptions, and potential risks." />;
      case "References": return <SimpleUploadTab title="References and Citations" subtitle="Upload your references document" fieldLabel="References Document" accept=".pdf,.doc,.docx" note="Include all references and citations used in proper academic format." />;
      case "Outputs":    return <SimpleUploadTab title="Expected Outputs" subtitle="Upload your expected outputs document" fieldLabel="Outputs Document" accept=".pdf,.doc,.docx" />;
      default:           return <OverviewTab form={form} setForm={setForm} projects={projects} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Proposals" />
        <div className="dashboard-content">

          <div style={{ marginBottom: 20 }}>
            <h2 className="page-title">Submit Proposal</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Complete all tabs to submit your research proposal
            </p>
          </div>

          {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
          {success && (
            <div style={{ background: "#dcfce7", color: "#15803d", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {success}
            </div>
          )}

          <div className="cp-tab-bar">
            {TABS.map((tab) => (
              <button key={tab} className={`cp-tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </div>

          {renderTab()}

          <div className="cp-form-actions">
            <button className="cp-btn">Save as Draft</button>
            <div className="cp-actions-right">
              <button className="cp-btn primary"
                style={{ background: "#1f7a1f", borderColor: "#1f7a1f", display: "flex", alignItems: "center", gap: 7 }}
                onClick={handleSubmit} disabled={submitting}>
                <Send size={14} /> {submitting ? "Submitting..." : "Submit Proposal"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}