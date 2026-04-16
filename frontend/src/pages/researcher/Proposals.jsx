import { useState, useRef, useEffect } from "react";
import {
  FileText,
  User,
  Image,
  ChevronDown,
  Upload,
  Check,
  ClipboardList,
  DollarSign,
  BookOpen,
  BookMarked,
  BarChart2,
} from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  { id: 1, name: "Dr. Sarah Johnson", dept: "Environmental Science" },
  { id: 2, name: "Dr. Mark Thompson", dept: "Marine Biology" },
  { id: 3, name: "Dr. Rachel Lee", dept: "Environmental Science" },
  { id: 4, name: "John Davis", dept: "Data Analytics" },
  { id: 5, name: "Prof. Elena Cruz", dept: "Biochemistry" },
];

// Each tab maps to a file upload card in Required Documents
const TAB_UPLOADS = [
  {
    key: "workplan",
    title: "Work Plan",
    sub: "Upload your detailed work plan",
    icon: <ClipboardList size={18} color="#7C3AED" />,
    iconBg: "#F5F3FF",
    accept: ".pdf,.doc,.docx,.xlsx",
  },
  {
    key: "budget",
    title: "Budget",
    sub: "Upload your budget breakdown",
    icon: <DollarSign size={18} color="#0369A1" />,
    iconBg: "#E0F2FE",
    accept: ".pdf,.doc,.docx,.xlsx",
  },
  {
    key: "framework",
    title: "Framework",
    sub: "Upload your research framework",
    icon: <BookOpen size={18} color="#065F46" />,
    iconBg: "#ECFDF5",
    accept: ".pdf,.doc,.docx",
  },
  {
    key: "references",
    title: "References",
    sub: "Upload your reference list",
    icon: <BookMarked size={18} color="#92400E" />,
    iconBg: "#FFFBEB",
    accept: ".pdf,.doc,.docx",
  },
  {
    key: "outputs",
    title: "Outputs",
    sub: "Upload expected outputs/deliverables",
    icon: <BarChart2 size={18} color="#9D174D" />,
    iconBg: "#FDF2F8",
    accept: ".pdf,.doc,.docx,.xlsx,.pptx",
  },
];

// ─── ComboBox ─────────────────────────────────────────────────────────────────
function ComboBox({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const wrapRef = useRef(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (opt) => {
    setQuery(opt);
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="cp-combo-wrap" ref={wrapRef}>
      <input
        className="cp-input"
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      <span className="cp-combo-chevron">
        <ChevronDown size={14} />
      </span>
      {open && filtered.length > 0 && (
        <div className="cp-dropdown">
          {filtered.map((opt) => (
            <div
              key={opt}
              className="cp-dropdown-item"
              onMouseDown={() => select(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DocUploadRow (required documents — rows) ─────────────────────────────────
function DocUploadRow({ icon, iconBg, title, hint, required, multiple, accept }) {
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);

  const uploaded = files.length > 0;

  return (
    <div className="cp-doc-row" onClick={() => fileRef.current.click()}>
      <div className="cp-doc-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="cp-doc-label">
        <div className="cp-doc-title">{title}</div>
        <div className="cp-doc-hint">{hint}</div>
        {uploaded && (
          <div className="cp-doc-filename">
            {files.length === 1 ? files[0].name : `${files.length} files selected`}
          </div>
        )}
      </div>
      <span className={`cp-badge ${uploaded ? "uploaded" : required ? "required" : "optional"}`}>
        {uploaded ? (
          <><Check size={11} />{files.length > 1 ? `${files.length} files` : "Uploaded"}</>
        ) : required ? "Required" : "Optional"}
      </span>
      <button
        className="cp-upload-btn"
        onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}
      >
        <Upload size={13} />
        <span>Choose {multiple ? "files" : "file"}</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        multiple={multiple}
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
    </div>
  );
}

// ─── TabUploadCard (tab documents — cards) ────────────────────────────────────
function TabUploadCard({ icon, iconBg, title, sub, accept, multiple }) {
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);

  const uploaded = files.length > 0;

  return (
    <div
      className={`cp-tab-upload-card ${uploaded ? "uploaded" : ""}`}
      onClick={() => fileRef.current.click()}
    >
      <div className="cp-tab-upload-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="cp-tab-upload-title">{title}</div>
      <div className="cp-tab-upload-sub">{sub}</div>
      {uploaded ? (
        <div className="cp-tab-upload-filename">
          {files.length === 1 ? files[0].name : `${files.length} files`}
        </div>
      ) : (
        <button
          className="cp-tab-upload-btn"
          onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}
        >
          Choose file
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        multiple={multiple}
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
    </div>
  );
}

// ─── ConditionalQuestion ──────────────────────────────────────────────────────
function ConditionalQuestion({ question, name, children, flip = false }) {
  const [answer, setAnswer] = useState(null);
  const showDetails = flip ? answer === "no" : answer === "yes";

  return (
    <div className="cp-q-block">
      <p className="cp-q-text">{question}</p>
      <div className="cp-radio-row">
        <label className="cp-radio-label">
          <input
            type="radio"
            name={name}
            value="yes"
            checked={answer === "yes"}
            onChange={() => setAnswer("yes")}
          />
          Yes
        </label>
        <label className="cp-radio-label">
          <input
            type="radio"
            name={name}
            value="no"
            checked={answer === "no"}
            onChange={() => setAnswer("no")}
          />
          No
        </label>
      </div>
      {showDetails && <div className="cp-cond-box">{children}</div>}
    </div>
  );
}

// ─── CreateProposal ───────────────────────────────────────────────────────────
export default function CreateProposal() {
  const [leader, setLeader] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="main">
        <Topbar title="Create Proposal" />

        <div className="content">
          <div className="cp-page">

            <div className="cp-page-sub">Complete all sections to submit your research proposal</div>

            {/* ── Basic Information ── */}
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
                      <option value="" disabled defaultValue="">Select research type</option>
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
                <textarea
                  className="cp-textarea"
                  placeholder="Provide a brief abstract of your research..."
                />
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

            {/* ── Research Team ── */}
            <div className="cp-section">
              <div className="cp-section-title">Research Team</div>

              <div className="cp-field" style={{ marginBottom: 16 }}>
                <label className="cp-label">Team Leader *</label>
                <ComboBox
                  value={leader}
                  onChange={setLeader}
                  options={TEAM_MEMBERS.map((m) => m.name)}
                  placeholder="Type or select team leader"
                />
              </div>

              <div className="cp-field">
                <label className="cp-label">Team Members (if any)</label>
                <div className="cp-members-list">
                  {TEAM_MEMBERS.map((m) => {
                    const checked = selectedMembers.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className={`cp-member-row ${checked ? "selected" : ""}`}
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
                        <span className="cp-member-dept">{m.dept}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Required Documents ── */}
            <div className="cp-section">
              <div className="cp-section-title">Required Documents</div>

              {/* Overview documents — row style */}
              <DocUploadRow
                icon={<FileText size={18} color="#4F46E5" />}
                iconBg="#EEF2FF"
                title="Brief Description"
                hint="PDF or Word document"
                required
                accept=".pdf,.doc,.docx"
              />
              <DocUploadRow
                icon={<User size={18} color="#16A34A" />}
                iconBg="#F0FDF4"
                title="Curriculum Vitae of Proponents"
                hint="Multiple CV files accepted"
                required
                multiple
              />
              <DocUploadRow
                icon={<Image size={18} color="#EA580C" />}
                iconBg="#FFF7ED"
                title="Supporting Images"
                hint="Images related to your research"
                required={false}
                multiple
                accept="image/*"
              />

              {/* Divider before tab uploads */}
              <div className="cp-divider" style={{ margin: "1.25rem 0 1rem" }} />

              <div style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                Tab Documents
              </div>

              {/* Tab documents — card style */}
              <div className="cp-tab-uploads">
                {TAB_UPLOADS.map((t) => (
                  <TabUploadCard
                    key={t.key}
                    icon={t.icon}
                    iconBg={t.iconBg}
                    title={t.title}
                    sub={t.sub}
                    accept={t.accept}
                    multiple={t.multiple}
                  />
                ))}
              </div>
            </div>

            {/* ── Additional Information ── */}
            <div className="cp-section">
              <div className="cp-section-title">Additional Information</div>

              <ConditionalQuestion
                question="Is similar work being carried out elsewhere? If yes, please give details."
                name="q1"
              >
                <textarea
                  className="cp-textarea"
                  placeholder="Please give details about the similar work being carried out..."
                />
              </ConditionalQuestion>

              <div className="cp-divider" />

              <ConditionalQuestion
                question="Are there any external groups or individuals, aside from the proponent(s) collaborating in this work? If yes, please specify and indicate the type of collaboration or expected contribution of the other party to this work."
                name="q2"
              >
                <textarea
                  className="cp-textarea"
                  placeholder="Please specify collaborators and indicate type of collaboration or expected contribution..."
                />
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
                <textarea
                  className="cp-textarea"
                  placeholder="Enter additional information..."
                />
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="cp-form-actions">
              <button className="cp-btn danger">Discard</button>
              <div className="cp-actions-right">
                <button className="cp-btn">Save as Draft</button>
                <button className="cp-btn">Preview</button>
                <button className="cp-btn primary">Submit Proposal</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}