import { useState, useRef, useEffect } from "react";
import {
  ChevronDown, Upload, Check, Plus, Trash2, FileText, Send,
} from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  { id: 1, name: "Dr. Sarah Johnson",  dept: "Environmental Science" },
  { id: 2, name: "Dr. Mark Thompson",  dept: "Marine Biology" },
  { id: 3, name: "Dr. Rachel Lee",     dept: "Environmental Science" },
  { id: 4, name: "John Davis",         dept: "Data Analytics" },
  { id: 5, name: "Prof. Elena Cruz",   dept: "Biochemistry" },
];

const TABS = ["Overview", "Work Plan", "Budget", "Framework", "References", "Outputs"];

const CATEGORY_COLORS = {
  Personnel:   { bg: "#f0fdf4", color: "#15803d" },
  Equipment:   { bg: "#eff6ff", color: "#1d4ed8" },
  Materials:   { bg: "#fefce8", color: "#a16207" },
  Travel:      { bg: "#fff7ed", color: "#c2410c" },
  Services:    { bg: "#f5f3ff", color: "#6d28d9" },
  Publication: { bg: "#fdf2f8", color: "#9d174d" },
};

// ─── Simple file input row ────────────────────────────────────────────────────
function FileInputRow({ label, required, multiple, accept }) {
  const [files, setFiles] = useState([]);
  const ref = useRef(null);
  return (
    <div className="cp-field">
      <label className="cp-label">
        {label} {required && "*"}
      </label>
      <div className="cp-file-row">
        <button className="cp-file-btn" onClick={() => ref.current.click()}>
          Choose {multiple ? "Files" : "File"}
        </button>
        <span className="cp-file-name">
          {files.length === 0
            ? "No file chosen"
            : files.length === 1
            ? files[0].name
            : `${files.length} files selected`}
        </span>
        <button className="cp-file-upload-icon" onClick={() => ref.current.click()}>
          <Upload size={16} color="#6b7280" />
        </button>
        <input
          ref={ref}
          type="file"
          multiple={multiple}
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => setFiles(Array.from(e.target.files))}
        />
      </div>
    </div>
  );
}

// ─── Simple upload tab section (Work Plan / Framework / References) ───────────
function SimpleUploadTab({ title, subtitle, fieldLabel, note, accept }) {
  return (
    <div className="cp-section">
      <div className="cp-section-title" style={{ borderBottom: "none", marginBottom: 4 }}>
        {title}
      </div>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>{subtitle}</p>
      <FileInputRow label={fieldLabel} required accept={accept} />
      {note && (
        <div className="cp-note-box">
          <strong>Note:</strong> {note}
        </div>
      )}
    </div>
  );
}

// ─── Conditional yes/no question ──────────────────────────────────────────────
function ConditionalQuestion({ question, name, flip = false, children }) {
  const [answer, setAnswer] = useState(null);
  const show = flip ? answer === "no" : answer === "yes";
  return (
    <div className="cp-q-block">
      <p className="cp-q-text">{question}</p>
      <div className="cp-radio-row">
        {["yes", "no"].map((v) => (
          <label key={v} className="cp-radio-label">
            <input
              type="radio"
              name={name}
              value={v}
              checked={answer === v}
              onChange={() => setAnswer(v)}
            />
            {v === "yes" ? "Yes" : "No"}
          </label>
        ))}
      </div>
      {show && <div className="cp-cond-box">{children}</div>}
    </div>
  );
}

// ─── ComboBox ─────────────────────────────────────────────────────────────────
function ComboBox({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const wrapRef = useRef(null);
  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="cp-combo-wrap" ref={wrapRef}>
      <input
        className="cp-input"
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      <span className="cp-combo-chevron"><ChevronDown size={14} /></span>
      {open && filtered.length > 0 && (
        <div className="cp-dropdown">
          {filtered.map((opt) => (
            <div key={opt} className="cp-dropdown-item"
              onMouseDown={() => { setQuery(opt); onChange(opt); setOpen(false); }}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

// Overview Tab
function OverviewTab() {
  const [leader, setLeader] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const toggleMember = (id) =>
    setSelectedMembers((p) => p.includes(id) ? p.filter((m) => m !== id) : [...p, id]);

  return (
    <>
      {/* Basic Information */}
      <div className="cp-section">
        <div className="cp-section-title">Basic Information</div>
        <div className="cp-grid-2">
          <div className="cp-field">
            <label className="cp-label">Proposal Title *</label>
            <input className="cp-input" type="text" placeholder="Enter proposal title" />
          </div>
          <div className="cp-field">
            <label className="cp-label">Research Type *</label>
            <div className="cp-select-wrap">
              <select className="cp-select">
                <option value="" disabled defaultValue="">e.g., Basic Research</option>
                <option>Basic Research</option>
                <option>Applied Research</option>
                <option>Developmental Research</option>
                <option>Action Research</option>
              </select>
              <span className="cp-select-chevron"><ChevronDown size={14} /></span>
            </div>
          </div>
        </div>
        <div className="cp-field">
          <label className="cp-label">Abstract *</label>
          <textarea className="cp-textarea" placeholder="Provide a brief abstract of your research..." />
        </div>
        <div className="cp-grid-3">
          <div className="cp-field">
            <label className="cp-label">Proposed Starting Date *</label>
            <input className="cp-input" type="date" />
          </div>
          <div className="cp-field">
            <label className="cp-label">Proposed Completion Date *</label>
            <input className="cp-input" type="date" />
          </div>
          <div className="cp-field">
            <label className="cp-label">Total Proposed Budget (₱) *</label>
            <input className="cp-input" type="number" placeholder="0.00" />
          </div>
        </div>
      </div>

      {/* Research Team */}
      <div className="cp-section">
        <div className="cp-section-title">Research Team</div>
        <div className="cp-field">
          <label className="cp-label">Team Leader *</label>
          <ComboBox
            value={leader}
            onChange={setLeader}
            options={TEAM_MEMBERS.map((m) => m.name)}
            placeholder="Select team leader"
          />
        </div>
        <div className="cp-field">
          <label className="cp-label">Team Members (if any)</label>
          <div className="cp-members-list-vertical">
            {TEAM_MEMBERS.map((m) => {
              const checked = selectedMembers.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`cp-member-row-v ${checked ? "selected" : ""}`}
                  onClick={() => toggleMember(m.id)}
                >
                  <input
                    type="checkbox"
                    className="cp-member-checkbox"
                    checked={checked}
                    onChange={() => toggleMember(m.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="cp-member-name">{m.name}</span>
                  <span className="cp-member-dept">- {m.dept}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="cp-section">
        <div className="cp-section-title">Required Documents</div>
        <FileInputRow
          label="Brief Description"
          required
          accept=".pdf,.doc,.docx"
        />
        <p className="cp-file-hint">Upload PDF or Word document</p>
        <FileInputRow
          label="Curriculum Vitae of Proponents"
          required
          multiple
        />
        <p className="cp-file-hint">Upload multiple CV files if needed</p>
      </div>

      {/* Additional Information */}
      <div className="cp-section">
        <div className="cp-section-title">Additional Information</div>

        <ConditionalQuestion
          question="Is similar work being carried out elsewhere? If yes, please give details."
          name="q1"
        >
          <textarea className="cp-textarea" placeholder="Please give details..." />
        </ConditionalQuestion>

        <div className="cp-divider" />

        <ConditionalQuestion
          question="Are there any external groups or individuals, aside from the proponent(s) collaborating in this work? If yes, please specify and indicate the type of collaboration or expected contribution of the other party to this work."
          name="q2"
        >
          <textarea className="cp-textarea" placeholder="Please specify collaborators..." />
        </ConditionalQuestion>

        <div className="cp-divider" />

        <ConditionalQuestion
          question="Has this proposal been submitted to another agency for support? If yes, please indicate:"
          name="q3"
        >
          <div className="cp-detail-grid">
            <div>
              <div className="cp-col-label">Agency</div>
              <input className="cp-input" type="text" placeholder="Agency name" />
            </div>
            <div>
              <div className="cp-col-label">Amount</div>
              <input className="cp-input" type="number" placeholder="Amount" />
            </div>
            <div>
              <div className="cp-col-label">Extent of Difference</div>
              <input className="cp-input" type="text" placeholder="How is it different?" />
            </div>
          </div>
        </ConditionalQuestion>

        <div className="cp-divider" />

        <ConditionalQuestion
          question="Is this your first time to apply for the proposed scholarly work?"
          name="q4"
          flip
        >
          <p className="cp-cond-note">
            If no, please list the titles of past work(s) and indicate the status (within three (3) years):
          </p>
          <div className="cp-past-grid">
            <div>
              <div className="cp-col-label">Title(s)</div>
              <input className="cp-input" type="text" placeholder="Project title" />
            </div>
            <div>
              <div className="cp-col-label">Duration</div>
              <input className="cp-input" type="text" placeholder="Duration" />
            </div>
            <div>
              <div className="cp-col-label">Budget</div>
              <input className="cp-input" type="number" placeholder="Budget" />
            </div>
            <div>
              <div className="cp-col-label">Status</div>
              <div className="cp-select-wrap">
                <select className="cp-select">
                  <option value="" disabled defaultValue="">Select</option>
                  <option>Ongoing</option>
                  <option>Completed</option>
                  <option>Terminated</option>
                </select>
                <span className="cp-select-chevron"><ChevronDown size={14} /></span>
              </div>
            </div>
          </div>
        </ConditionalQuestion>

        <div className="cp-divider" />

        <div className="cp-field" style={{ marginBottom: 0 }}>
          <label className="cp-label">
            Additional information or comment pertinent to the scholarly work
            (e.g., relevance of proposed project to career development)
          </label>
          <textarea className="cp-textarea" placeholder="Enter additional information..." />
        </div>
      </div>

      {/* Attached Images */}
      <div className="cp-section">
        <div className="cp-section-title">Attached Images</div>
        <FileInputRow label="Upload Supporting Images" multiple accept="image/*" />
        <p className="cp-file-hint">Upload images related to your research proposal</p>
      </div>
    </>
  );
}

// Budget Tab
function BudgetTab() {
  const [items, setItems] = useState([
    { id: 1, category: "Personnel",   description: "Research Assistants (2 positions)", qty: 24, unitPrice: 3500 },
    { id: 2, category: "Equipment",   description: "Laboratory Equipment Set",           qty: 1,  unitPrice: 125000 },
    { id: 3, category: "Materials",   description: "Research Materials and Supplies",    qty: 24, unitPrice: 2500 },
    { id: 4, category: "Travel",      description: "Field Research Travel",              qty: 12, unitPrice: 4500 },
    { id: 5, category: "Services",    description: "Data Analysis Services",             qty: 1,  unitPrice: 35000 },
    { id: 6, category: "Publication", description: "Journal Publication Fees",           qty: 3,  unitPrice: 2500 },
  ]);

  const total = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);

  const addItem = () =>
    setItems((p) => [...p, { id: Date.now(), category: "Personnel", description: "", qty: 1, unitPrice: 0 }]);

  const deleteItem = (id) => setItems((p) => p.filter((i) => i.id !== id));

  const fmt = (n) => "$" + n.toLocaleString();

  return (
    <div className="cp-section">
      <div className="cp-budget-header">
        <div className="cp-section-title" style={{ margin: 0, border: "none", padding: 0 }}>
          Budget Plan
        </div>
        <button className="create-btn" onClick={addItem}>
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
                  <td>
                    <span className="cp-cat-badge" style={{ background: c.bg, color: c.color }}>
                      {item.category}
                    </span>
                  </td>
                  <td>{item.description}</td>
                  <td style={{ textAlign: "right" }}>{item.qty}</td>
                  <td style={{ textAlign: "right" }}>{fmt(item.unitPrice)}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(item.qty * item.unitPrice)}</td>
                  <td>
                    <button className="cp-delete-btn" onClick={() => deleteItem(item.id)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr className="cp-total-row">
              <td colSpan={4} style={{ textAlign: "right", fontWeight: 600, color: "#374151" }}>
                Total Budget:
              </td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "#1f7a1f" }}>
                {fmt(total)}
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Outputs Tab
function OutputsTab() {
  const [outputs, setOutputs] = useState([
    { id: 1, title: "Research Publication",  desc: "Peer-reviewed journal article in high-impact environmental science journal", target: "Month 18" },
    { id: 2, title: "Technical Report",      desc: "Comprehensive technical report with findings and recommendations",           target: "Month 24" },
    { id: 3, title: "Dataset",               desc: "Publicly available dataset of coastal ecosystem measurements",               target: "Month 20" },
  ]);

  const addOutput = () =>
    setOutputs((p) => [...p, { id: Date.now(), title: "New Output", desc: "", target: "Month 0" }]);

  const deleteOutput = (id) => setOutputs((p) => p.filter((o) => o.id !== id));

  return (
    <div className="cp-section">
      <div className="cp-budget-header">
        <div className="cp-section-title" style={{ margin: 0, border: "none", padding: 0 }}>
          Expected Outputs &amp; Deliverables
        </div>
        <button className="create-btn" onClick={addOutput}>
          <Plus size={15} /> Add Output
        </button>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {outputs.map((o) => (
          <div key={o.id} className="cp-output-card">
            <div className="cp-output-body">
              <div className="cp-output-title">{o.title}</div>
              <div className="cp-output-desc">{o.desc}</div>
              <div className="cp-output-target">Target: {o.target}</div>
            </div>
            <button className="cp-delete-btn" onClick={() => deleteOutput(o.id)}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Proposals() {
  const [activeTab, setActiveTab] = useState("Overview");

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":   return <OverviewTab />;
      case "Work Plan":  return (
        <SimpleUploadTab
          title="Work Plan"
          subtitle="Upload your detailed work plan document"
          fieldLabel="Work Plan Document"
          accept=".pdf,.doc,.docx,.xlsx"
          note="Your work plan should include detailed activities, timelines, responsibilities, and milestones for your research project."
        />
      );
      case "Budget":     return <BudgetTab />;
      case "Framework":  return (
        <SimpleUploadTab
          title="Project Framework"
          subtitle="Upload your project framework document"
          fieldLabel="Project Framework Document"
          accept=".pdf,.doc,.docx"
          note="Your framework should include research objectives, success indicators, methodology, assumptions, and potential risks."
        />
      );
      case "References": return (
        <SimpleUploadTab
          title="References and Citations"
          subtitle="Upload your references document"
          fieldLabel="References Document"
          accept=".pdf,.doc,.docx"
          note="Include all references and citations used in your research proposal in proper academic format."
        />
      );
      case "Outputs":    return <OutputsTab />;
      default:           return <OverviewTab />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="main-content">
        <Topbar title="Proposals" />

        <div className="dashboard-content">
          {/* Page Header */}
          <div style={{ marginBottom: 20 }}>
            <h2 className="page-title">Create Proposal</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Complete all tabs to submit your research proposal
            </p>
          </div>

          {/* Tab Bar */}
          <div className="cp-tab-bar">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`cp-tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {renderTab()}

          {/* Action Buttons */}
          <div className="cp-form-actions">
            <button className="cp-btn">Save as Draft</button>
            <div className="cp-actions-right">
              <button className="cp-btn">Preview</button>
              <button className="cp-btn primary" style={{ background: "#1f7a1f", borderColor: "#1f7a1f", display: "flex", alignItems: "center", gap: 7 }}>
                <Send size={14} /> Submit Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}