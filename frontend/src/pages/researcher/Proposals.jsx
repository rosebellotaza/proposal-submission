import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Upload,
  Check,
  Plus,
  Trash2,
  Send,
  Search,
  X,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  Save,
  FileCheck,
  Pen,
  RotateCcw,
  FileText,
  BookOpen,
  Users,
  Printer,
} from "lucide-react";
import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/researcher.css";
import { DEFAULT_EVALUATORS } from "../../data/faculty";
import api from "../../utils/api";

const TABS = ["Overview", "Work Plan", "Framework", "References", "Review"];

const EMPTY_FORM = {
  title: "",
  scholarly_work_type: "Research",
  total_budget: "",
  start_date: "",
  end_date: "",

  proponents: [],
  signatures: {},

  similar_work_elsewhere: false,
  similar_work_details: "",

  is_first_time: true,
  past_works: [],

  has_external_collab: false,
  external_collab_details: "",

  submitted_elsewhere: false,
  other_agency_name: "",
  other_agency_amount: "",
  agency_difference_extent: "",

  cv_files: [],
  proposal_form: null,
};

const fmt = (n) => "₱" + Number(n || 0).toLocaleString();



const normalizeJsonObject = (value) => {
  if (!value) return {};

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return {};
};

const normalizeJsonArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const lastPos = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [tab, setTab] = useState("draw");
  const fileRef = useRef(null);

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width;
    const sy = canvas.height / r.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - r.left) * sx,
        y: (e.touches[0].clientY - r.top) * sy,
      };
    }

    return {
      x: (e.clientX - r.left) * sx,
      y: (e.clientY - r.top) * sy,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    if (!drawing) return;

    e.preventDefault();

    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    const p = getPos(e, c);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPos.current = p;
    setHasDrawn(true);
    onChange(c.toDataURL("image/png"));
  };

  const stopDraw = () => setDrawing(false);

  const clear = () => {
    canvasRef.current?.getContext("2d").clearRect(0, 0, 560, 110);
    setHasDrawn(false);
    onChange(null);
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #e5e7eb" }}>
        {["draw", "upload"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: "8px 0",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === t ? 600 : 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: tab === t ? "#fff" : "#f9fafb",
              color: tab === t ? "#1f7a1f" : "#6b7280",
              borderBottom: tab === t ? "2px solid #1f7a1f" : "none",
            }}
          >
            {t === "draw" ? <Pen size={13} /> : <Upload size={13} />}
            {t === "draw" ? "Draw" : "Upload"}
          </button>
        ))}
      </div>

      {tab === "draw" && (
        <>
          <canvas
            ref={canvasRef}
            width={560}
            height={110}
            style={{
              display: "block",
              width: "100%",
              cursor: "crosshair",
              background: "#fafafa",
              touchAction: "none",
            }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />

          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderTop: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              {hasDrawn || value ? "Signature captured" : "Draw your signature above"}
            </span>

            {(hasDrawn || value) && (
              <button
                type="button"
                onClick={clear}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "#dc2626",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>
        </>
      )}

      {tab === "upload" && (
        <div style={{ padding: 16 }}>
          <div className="cp-file-row">
            <button
              type="button"
              className="cp-file-btn"
              onClick={() => fileRef.current.click()}
            >
              Choose File
            </button>

            <span className="cp-file-name">
              {value ? "Signature uploaded" : "No file chosen"}
            </span>

            <input
              ref={fileRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files[0];
                if (!f) return;

                const reader = new FileReader();
                reader.onload = (ev) => onChange(ev.target.result);
                reader.readAsDataURL(f);
              }}
            />
          </div>

          {value && (
            <img
              src={value}
              alt="sig"
              style={{
                maxHeight: 60,
                marginTop: 10,
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: 4,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function EvaluatorModal({ onClose, onAdd, alreadyAdded, evaluatorsList }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  const toggle = (ev) => {
    const ex = selected.find((s) => s.id === ev.id);
    setSelected(ex ? selected.filter((s) => s.id !== ev.id) : [...selected, ev]);
  };

  const isAdded = (id) => alreadyAdded.some((e) => e.id === id);
  const isSel = (id) => selected.some((s) => s.id === id);

  const filtered = evaluatorsList.filter((ev) => {
    if (!search) return true;

    const lc = search.toLowerCase();

    return (
      ev.name?.toLowerCase().includes(lc) ||
      ev.expertise?.toLowerCase().includes(lc) ||
      ev.position?.toLowerCase().includes(lc)
    );
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 520,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "18px 22px 14px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>
              Add Preferred Evaluators
            </h3>

            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
              Select from the list of admin-registered evaluators
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              padding: 6,
              display: "flex",
              color: "#374151",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "12px 22px", borderBottom: "1px solid #f1f5f9" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 9,
              padding: "8px 12px",
            }}
          >
            <Search size={15} color="#9ca3af" />

            <input
              type="text"
              placeholder="Search by name, position, or expertise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 13,
                color: "#111827",
              }}
            />

            {search && (
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                }}
                onClick={() => setSearch("")}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {selected.length > 0 && (
          <div
            style={{
              padding: "8px 22px",
              background: "#f5f3ff",
              borderBottom: "1px solid #ede9fe",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle2 size={14} color="#7c3aed" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>
              {selected.length} evaluator{selected.length !== 1 ? "s" : ""} selected
            </span>
          </div>
        )}

        <div style={{ overflowY: "auto", flex: 1, padding: "8px 14px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#9ca3af", fontSize: 13 }}>
              No evaluators found.
            </div>
          ) : (
            filtered.map((ev) => {
              const added = isAdded(ev.id);
              const sel = isSel(ev.id);

              return (
                <div
                  key={ev.id}
                  onClick={() => !added && toggle(ev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 10px",
                    borderRadius: 10,
                    cursor: added ? "not-allowed" : "pointer",
                    marginBottom: 4,
                    background: sel ? "#f0fdf4" : added ? "#f9fafb" : "#fff",
                    border: `1.5px solid ${sel ? "#bbf7d0" : added ? "#e5e7eb" : "#f1f5f9"}`,
                    opacity: added ? 0.65 : 1,
                    transition: "all 0.12s",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      flexShrink: 0,
                      border: `2px solid ${sel ? "#15803d" : added ? "#d1d5db" : "#d1d5db"}`,
                      background: sel ? "#15803d" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {sel && <Check size={12} color="#fff" />}
                  </div>

                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: sel ? "#dcfce7" : "#f3f4f6",
                      color: sel ? "#15803d" : "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {ev.name?.charAt(0)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: added ? "#9ca3af" : "#111827" }}>
                        {ev.name}
                      </p>

                      {added && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#9ca3af",
                            background: "#f3f4f6",
                            padding: "1px 7px",
                            borderRadius: 20,
                          }}
                        >
                          Already added
                        </span>
                      )}
                    </div>

                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
                      {ev.position}
                    </p>

                    {ev.expertise && (
                      <p style={{ margin: "1px 0 0", fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>
                        {ev.expertise}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            padding: "14px 22px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <button type="button" className="cp-btn" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="cp-btn primary"
            style={{
              background: "#1f7a1f",
              borderColor: "#1f7a1f",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: selected.length === 0 ? 0.5 : 1,
            }}
            onClick={() => {
              if (selected.length > 0) {
                onAdd(selected);
                onClose();
              }
            }}
            disabled={selected.length === 0}
          >
            <Check size={14} />
            Add {selected.length > 0 ? `(${selected.length}) ` : ""}Evaluator{selected.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function QCheckbox({ name, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
      {[true, false].map((v) => (
        <label
          key={String(v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: value === v ? 600 : 400,
            color: "#374151",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 3,
              flexShrink: 0,
              border: `2px solid ${value === v ? "#1f7a1f" : "#9ca3af"}`,
              background: value === v ? "#1f7a1f" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {value === v && <Check size={10} color="#fff" />}
          </div>

          <input
            type="radio"
            name={name}
            style={{ display: "none" }}
            checked={value === v}
            onChange={() => onChange(v)}
          />

          {v ? "Yes" : "No"}
        </label>
      ))}
    </div>
  );
}

function ExistingFileNote({ label, path }) {
  if (!path) return null;

  return (
    <div
      style={{
        marginTop: 6,
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: "#15803d",
      }}
    >
      <FileCheck size={13} />
      Existing {label} already uploaded
    </div>
  );
}

function OverviewTab({
  form,
  setForm,
  preferredEvaluators,
  setPreferredEvaluators,
  proponentsList,
  evaluatorsList,
  existingFiles,
}) {
  const [showEval, setShowEval] = useState(false);
  const allAdded = [...DEFAULT_EVALUATORS, ...preferredEvaluators];

  return (
    <>
      <div className="cp-section">
        <div className="cp-section-title">Basic Information</div>

        <div className="cp-field">
          <label className="cp-label">Title of the Scholarly Work *</label>

          <input
            className="cp-input"
            type="text"
            placeholder="Enter the full title of your research or project"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="cp-field" style={{ marginTop: 14 }}>
          <label className="cp-label">Type of Scholarly Work *</label>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
            {["Research", "Extension", "Instructional Material Development"].map((type) => (
              <label
                key={type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 9,
                  cursor: "pointer",
                  border: `1.5px solid ${form.scholarly_work_type === type ? "#1f7a1f" : "#e5e7eb"}`,
                  background: form.scholarly_work_type === type ? "#f0fdf4" : "#fff",
                  fontSize: 13,
                  fontWeight: form.scholarly_work_type === type ? 600 : 400,
                  color: form.scholarly_work_type === type ? "#15803d" : "#374151",
                }}
              >
                <input
                  type="radio"
                  name="scholarly_work_type"
                  style={{ display: "none" }}
                  checked={form.scholarly_work_type === type}
                  onChange={() => setForm({ ...form, scholarly_work_type: type })}
                />

                {form.scholarly_work_type === type && <Check size={13} color="#15803d" />}
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className="cp-grid-2" style={{ marginTop: 14 }}>
          <div className="cp-field">
            <label className="cp-label">Total Proposed Budget (₱) *</label>

            <input
              className="cp-input"
              type="number"
              min="0"
              placeholder="e.g. 250000"
              value={form.total_budget}
              onChange={(e) => setForm({ ...form, total_budget: e.target.value })}
            />
          </div>

          <div />

          <div className="cp-field">
            <label className="cp-label">Proposed Starting Date *</label>

            <input
              className="cp-input"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </div>

          <div className="cp-field">
            <label className="cp-label">Proposed Completion Date *</label>

            <input
              className="cp-input"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="cp-field" style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label className="cp-label" style={{ margin: 0 }}>
              Name of Proponent(s) *
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div className="cp-select-wrap" style={{ flex: 1 }}>
              <select
                className="cp-select"
                value=""
                onChange={(e) => {
                  const pid = e.target.value;
                  if (!pid) return;

                  if (form.proponents.some((p) => String(p.id) === pid)) return;

                  const found = proponentsList.find((p) => String(p.id) === pid);

                  if (found) {
                    setForm((f) => ({
                      ...f,
                      proponents: [...f.proponents, found],
                      signatures: {
                        ...(f.signatures || {}),
                        [found.id]: f.signatures?.[found.id] || null,
                      },
                    }));
                  }

                  e.target.value = "";
                }}
              >
                <option value="">Add a proponent</option>

                {proponentsList
                  .filter((p) => !form.proponents.some((added) => String(added.id) === String(p.id)))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.department ? ` - ${p.department}` : ""}
                    </option>
                  ))}
              </select>

              <span className="cp-select-chevron">
                <ChevronDown size={14} />
              </span>
            </div>
          </div>

          {proponentsList.length === 0 && (
            <div
              style={{
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: 10,
                padding: "10px 12px",
                color: "#9a3412",
                fontSize: 12,
                marginBottom: 10,
                lineHeight: 1.5,
              }}
            >
              No proponents are available. Add faculty accounts in the admin Faculty page first.
            </div>
          )}

          {form.proponents.length === 0 ? (
            <p style={{ fontSize: 12, color: "#9ca3af", padding: "10px 0" }}>
              No proponents added yet. Use the dropdown above.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {form.proponents.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e5e7eb",
                    background: "#fafafa",
                    transition: "all 0.12s",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "#f3f4f6",
                      color: "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {p.name?.charAt(0)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                        {p.name}
                      </span>

                      {form.signatures?.[String(p.id)] && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#15803d",
                            background: "#dcfce7",
                            padding: "1px 8px",
                            borderRadius: 20,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Pen size={10} /> Signed
                        </span>
                      )}
                    </div>

                    {(p.department || p.position) && (
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>
                        {[p.department, p.position].filter(Boolean).join(" - ")}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => {
                        const updatedSignatures = { ...(f.signatures || {}) };
                        delete updatedSignatures[p.id];

                        return {
                          ...f,
                          proponents: f.proponents.filter((x) => String(x.id) !== String(p.id)),
                          signatures: updatedSignatures,
                        };
                      })
                    }
                    className="cp-delete-btn"
                    title="Remove proponent"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
            Proponents are managed by the admin. Each proponent must provide their own signature below.
          </p>
        </div>

        {form.proponents.length > 0 && (
          <div className="cp-field" style={{ marginTop: 18 }}>
            <label className="cp-label">Signatures of Proponents *</label>

            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px" }}>
              Draw or upload the signature for each proponent.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {form.proponents.map((p) => (
                <div
                  key={`signature-box-${p.id}`}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 14,
                    background: "#fff",
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827" }}>
                      {p.name}
                    </p>

                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>
                      {[p.department, p.position].filter(Boolean).join(" - ") || "Proponent"}
                    </p>
                  </div>

                  <SignaturePad
                    key={`signature-pad-${p.id}`}
                    value={form.signatures?.[p.id] || null}
                    onChange={(sig) =>
                      setForm((f) => ({
                        ...f,
                        signatures: {
                          ...(f.signatures || {}),
                          [String(p.id)]: sig,
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="cp-section">
        <div className="cp-section-title">Additional Information</div>

        <div className="cp-q-block">
          <p className="cp-q-text">
            Is similar work being carried out elsewhere? If yes, please give details.
          </p>

          <QCheckbox
            name="similar_elsewhere"
            value={form.similar_work_elsewhere}
            onChange={(v) =>
              setForm({
                ...form,
                similar_work_elsewhere: v,
                similar_work_details: v ? form.similar_work_details : "",
              })
            }
          />

          {form.similar_work_elsewhere && (
            <div className="cp-cond-box" style={{ marginTop: 10 }}>
              <textarea
                className="cp-textarea"
                placeholder="Please give details of the similar work being carried out elsewhere..."
                value={form.similar_work_details}
                onChange={(e) => setForm({ ...form, similar_work_details: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="cp-q-block">
          <p className="cp-q-text">
            Are there any external groups or individuals, aside from the proponent(s) collaborating in this work?
            If yes, please specify and indicate the type of collaboration or expected contribution of the other party to this work.
          </p>

          <QCheckbox
            name="collab"
            value={form.has_external_collab}
            onChange={(v) =>
              setForm({
                ...form,
                has_external_collab: v,
                external_collab_details: v ? form.external_collab_details : "",
              })
            }
          />

          {form.has_external_collab && (
            <div className="cp-cond-box" style={{ marginTop: 10 }}>
              <textarea
                className="cp-textarea"
                placeholder="Please specify collaborators and describe the type of collaboration or their expected contribution..."
                value={form.external_collab_details}
                onChange={(e) => setForm({ ...form, external_collab_details: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="cp-q-block">
          <p className="cp-q-text">
            Has this proposal been submitted to another agency for support? If yes, please indicate:
          </p>

          <QCheckbox
            name="elsewhere"
            value={form.submitted_elsewhere}
            onChange={(v) =>
              setForm({
                ...form,
                submitted_elsewhere: v,
                other_agency_name: v ? form.other_agency_name : "",
                other_agency_amount: v ? form.other_agency_amount : "",
                agency_difference_extent: v ? form.agency_difference_extent : "",
              })
            }
          />

          {form.submitted_elsewhere && (
            <div className="cp-cond-box" style={{ marginTop: 10 }}>
              <div className="cp-detail-grid">
                <div>
                  <div className="cp-col-label">Agency Name</div>

                  <input
                    className="cp-input"
                    type="text"
                    placeholder="Agency name"
                    value={form.other_agency_name}
                    onChange={(e) => setForm({ ...form, other_agency_name: e.target.value })}
                  />
                </div>

                <div>
                  <div className="cp-col-label">Amount Requested (₱)</div>

                  <input
                    className="cp-input"
                    type="number"
                    placeholder="Amount"
                    value={form.other_agency_amount}
                    onChange={(e) => setForm({ ...form, other_agency_amount: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
                  To what extent is the proposed project different from the one proposed to this other agency? *
                </p>

                <textarea
                  className="cp-textarea"
                  placeholder="Describe how this proposal differs, such as scope, objectives, methodology, coverage, or budget."
                  value={form.agency_difference_extent}
                  style={{ minHeight: 90 }}
                  onChange={(e) => setForm({ ...form, agency_difference_extent: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="cp-q-block">
          <p className="cp-q-text">
            Is this your first time to apply for the proposed scholarly work?
          </p>

          <QCheckbox
            name="first_time"
            value={form.is_first_time}
            onChange={(v) =>
              setForm({
                ...form,
                is_first_time: v,
                past_works: v ? [] : form.past_works,
              })
            }
          />

          {!form.is_first_time && (
            <div style={{ marginTop: 14 }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "#374151", fontStyle: "italic" }}>
                If no, please list the titles of past work(s) and indicate the status: <strong>within three years</strong>
              </p>

              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      {["Title(s)", "Duration", "Budget Amount (₱)", "Status", ""].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            fontWeight: 600,
                            fontSize: 12,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {(form.past_works || []).length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "18px 12px",
                            textAlign: "center",
                            color: "#9ca3af",
                            fontSize: 12,
                            fontStyle: "italic",
                          }}
                        >
                          No past works added yet.
                        </td>
                      </tr>
                    )}

                    {(form.past_works || []).map((pw, i) => (
                      <tr key={pw.id || i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 8px" }}>
                          <input
                            className="cp-input"
                            style={{ width: "100%", minWidth: 140 }}
                            placeholder="Title of past work"
                            value={pw.title}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                past_works: f.past_works.map((r, idx) =>
                                  idx === i ? { ...r, title: e.target.value } : r
                                ),
                              }))
                            }
                          />
                        </td>

                        <td style={{ padding: "6px 8px" }}>
                          <input
                            className="cp-input"
                            style={{ width: 120 }}
                            placeholder="e.g. 2022-2023"
                            value={pw.duration}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                past_works: f.past_works.map((r, idx) =>
                                  idx === i ? { ...r, duration: e.target.value } : r
                                ),
                              }))
                            }
                          />
                        </td>

                        <td style={{ padding: "6px 8px" }}>
                          <input
                            className="cp-input"
                            type="number"
                            style={{ width: 120 }}
                            placeholder="0"
                            value={pw.budget}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                past_works: f.past_works.map((r, idx) =>
                                  idx === i ? { ...r, budget: e.target.value } : r
                                ),
                              }))
                            }
                          />
                        </td>

                        <td style={{ padding: "6px 8px" }}>
                          <select
                            className="cp-input"
                            style={{ width: 130 }}
                            value={pw.status}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                past_works: f.past_works.map((r, idx) =>
                                  idx === i ? { ...r, status: e.target.value } : r
                                ),
                              }))
                            }
                          >
                            <option value="">Select</option>
                            <option>Completed</option>
                            <option>Ongoing</option>
                            <option>Terminated</option>
                          </select>
                        </td>

                        <td style={{ padding: "6px 8px", textAlign: "center" }}>
                          <button
                            type="button"
                            className="cp-delete-btn"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                past_works: f.past_works.filter((_, idx) => idx !== i),
                              }))
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ padding: "10px 12px", borderTop: "1px solid #f1f5f9" }}>
                  <button
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#1f7a1f",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        past_works: [
                          ...(f.past_works || []),
                          {
                            id: Date.now(),
                            title: "",
                            duration: "",
                            budget: "",
                            status: "",
                          },
                        ],
                      }))
                    }
                  >
                    <Plus size={14} /> Add Row
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="cp-section">
        <div className="cp-section-title">Required Documents</div>

        <div className="cp-field">
          <label className="cp-label">Curriculum Vitae of Proponents *</label>

          <div className="cp-file-row">
            <button
              type="button"
              className="cp-file-btn"
              onClick={() => document.getElementById("cv-upload").click()}
            >
              Choose Files
            </button>

            <span className="cp-file-name">
              {form.cv_files?.length > 0
                ? `${form.cv_files.length} file(s) selected`
                : existingFiles.cv_files
                ? "Existing CV file(s) uploaded"
                : "No file chosen"}
            </span>

            <input
              id="cv-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={(e) =>
                setForm({
                  ...form,
                  cv_files: Array.from(e.target.files),
                })
              }
            />
          </div>

          <p className="cp-file-hint">Upload one CV per proponent</p>
          <ExistingFileNote label="CV file(s)" path={existingFiles.cv_files} />
        </div>

        <div className="cp-field" style={{ marginTop: 14 }}>
          <label className="cp-label">Project Proposal Form *</label>

          <div className="cp-file-row">
            <button
              type="button"
              className="cp-file-btn"
              onClick={() => document.getElementById("proposal-form-upload").click()}
            >
              Choose File
            </button>

            <span className="cp-file-name">
              {form.proposal_form?.name ?? (existingFiles.proposal_form ? "Existing proposal form uploaded" : "No file chosen")}
            </span>

            <button
              type="button"
              className="cp-file-upload-icon"
              onClick={() => document.getElementById("proposal-form-upload").click()}
            >
              <Upload size={16} color="#6b7280" />
            </button>

            <input
              id="proposal-form-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={(e) =>
                setForm({
                  ...form,
                  proposal_form: e.target.files[0] || null,
                })
              }
            />
          </div>

          {form.proposal_form && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "#15803d" }}>
              <FileCheck size={13} /> {form.proposal_form.name}
            </div>
          )}

          <ExistingFileNote label="proposal form" path={existingFiles.proposal_form} />
        </div>
      </div>

      <div className="cp-section">
        <div
          className="cp-section-title"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>Evaluator Assignment</span>

          <button
            type="button"
            className="ev-add-eval-btn"
            onClick={() => setShowEval(true)}
          >
            <Plus size={14} /> Add Preferred Evaluator
          </button>
        </div>

        <div className="ev-evaluator-list">
          {DEFAULT_EVALUATORS.map((ev) => (
            <div key={ev.id} className="ev-evaluator-card default">
              <div className="ev-evaluator-avatar">{ev.name.charAt(0)}</div>

              <div className="ev-evaluator-info">
                <p className="ev-evaluator-name">{ev.name}</p>
                <p className="ev-evaluator-pos">{ev.position} - {ev.college}</p>
                <p className="ev-evaluator-exp">{ev.expertise}</p>
              </div>

              <span className="ev-default-badge">Default</span>
            </div>
          ))}

          {preferredEvaluators.map((ev) => (
            <div key={ev.id} className="ev-evaluator-card preferred">
              <div
                className="ev-evaluator-avatar"
                style={{ background: "#f5f3ff", color: "#7c3aed" }}
              >
                {ev.name.charAt(0)}
              </div>

              <div className="ev-evaluator-info">
                <p className="ev-evaluator-name">{ev.name}</p>
                <p className="ev-evaluator-pos">{ev.position} - {ev.college}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span className="ev-preferred-badge">Preferred</span>

                <button
                  type="button"
                  className="cp-delete-btn"
                  onClick={() =>
                    setPreferredEvaluators((p) => p.filter((e) => e.id !== ev.id))
                  }
                  style={{ padding: 3 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEval && (
        <EvaluatorModal
          onClose={() => setShowEval(false)}
          onAdd={(sel) => {
            const newOnes = sel.filter((s) => !allAdded.some((a) => a.id === s.id));
            setPreferredEvaluators((p) => [...p, ...newOnes]);
          }}
          alreadyAdded={allAdded}
          evaluatorsList={evaluatorsList}
        />
      )}
    </>
  );
}

function WorkPlanTab({ file, setFile, existingFile }) {
  const ref = useRef(null);

  return (
    <div className="cp-section">
      <div className="cp-section-title">Work Plan</div>

      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
        Upload your detailed work plan document.
      </p>

      <div className="cp-field">
        <label className="cp-label">Work Plan Document *</label>

        <div className="cp-file-row">
          <button type="button" className="cp-file-btn" onClick={() => ref.current.click()}>
            Choose File
          </button>

          <span className="cp-file-name">
            {file?.name ?? (existingFile ? "Existing work plan uploaded" : "No file chosen")}
          </span>

          <button type="button" className="cp-file-upload-icon" onClick={() => ref.current.click()}>
            <Upload size={16} color="#6b7280" />
          </button>

          <input
            ref={ref}
            type="file"
            accept=".pdf,.doc,.docx,.xlsx"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </div>

        {file && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "#15803d" }}>
            <FileCheck size={13} /> {file.name}
          </div>
        )}

        <ExistingFileNote label="work plan" path={existingFile} />
      </div>
    </div>
  );
}

function UploadTab({ title, subtitle, fieldLabel, note, accept, file, setFile, existingFile }) {
  const ref = useRef(null);

  return (
    <div className="cp-section">
      <div className="cp-section-title">{title}</div>

      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
        {subtitle}
      </p>

      <div className="cp-field">
        <label className="cp-label">{fieldLabel} *</label>

        <div className="cp-file-row">
          <button type="button" className="cp-file-btn" onClick={() => ref.current.click()}>
            Choose File
          </button>

          <span className="cp-file-name">
            {file?.name ?? (existingFile ? `Existing ${title.toLowerCase()} uploaded` : "No file chosen")}
          </span>

          <button type="button" className="cp-file-upload-icon" onClick={() => ref.current.click()}>
            <Upload size={16} color="#6b7280" />
          </button>

          <input
            ref={ref}
            type="file"
            accept={accept}
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </div>

        {file && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "#15803d" }}>
            <FileCheck size={13} /> {file.name}
          </div>
        )}

        <ExistingFileNote label={title.toLowerCase()} path={existingFile} />
      </div>

      {note && (
        <div className="cp-note-box">
          <strong>Note:</strong> {note}
        </div>
      )}
    </div>
  );
}

function OutputsTab({ form, workPlanFile, frameworkFile, referencesFile, existingFiles }) {

  const handlePrint = () => {
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "—";
    const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

    const fileRows = [
      { label: "Project Proposal Form",  file: form.proposal_form,  existing: existingFiles.proposal_form },
      { label: "Curriculum Vitae",       file: form.cv_files?.[0],  existing: existingFiles.cv_files },
      { label: "Work Plan",              file: workPlanFile,         existing: existingFiles.work_plan_file },
      { label: "Project Framework",      file: frameworkFile,        existing: existingFiles.framework_file },
      { label: "References",             file: referencesFile,       existing: existingFiles.references_file },
    ];

    const proponentRows = (form.proponents || []).map((p) => {
      const signature = form.signatures?.[p.id];
      const sigImg = signature
        ? `<div style="width:160px;height:60px;margin:0 auto;display:flex;align-items:center;justify-content:center;">
             <img src="${signature}" alt="${p.name} signature" style="max-height:55px;max-width:150px;object-fit:contain;display:block;" />
           </div>`
        : `<span style="color:#d1d5db;font-style:italic;">No signature</span>`;
      return `
        <tr>
          <td style="padding:10px 12px;font-weight:600;border-bottom:1px solid #f1f5f9;">${p.name}</td>
          <td style="padding:10px 12px;color:#6b7280;border-bottom:1px solid #f1f5f9;">${[p.department, p.position].filter(Boolean).join(" — ") || "—"}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">Proponent</td>
          <td style="padding:10px 12px;text-align:center;border-bottom:1px solid #f1f5f9;">${sigImg}</td>
        </tr>`;
    }).join("");

    const fileList = fileRows.map(({ label, file, existing }) => {
      const uploaded = file || existing;
      const name     = file?.name || (existing ? "Previously uploaded" : "Not uploaded");
      const icon     = uploaded ? "✔" : "✗";
      const color    = uploaded ? "#15803d" : "#9ca3af";
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f9fafb;">
            <span style="color:${color};font-weight:700;margin-right:8px;">${icon}</span>
            <span style="color:${uploaded ? "#111827" : "#9ca3af"};font-style:${uploaded ? "normal" : "italic"};">${label}</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f9fafb;color:${color};font-weight:${uploaded ? 600 : 400};">${name}</td>
        </tr>`;
    }).join("");

    const additionalInfo = [];
    if (form.similar_work_elsewhere) additionalInfo.push(`<li><b>Similar work elsewhere:</b> ${form.similar_work_details || "Yes (no details provided)"}</li>`);
    if (form.has_external_collab)    additionalInfo.push(`<li><b>External collaboration:</b> ${form.external_collab_details || "Yes (no details provided)"}</li>`);
    if (form.submitted_elsewhere)    additionalInfo.push(`<li><b>Submitted to another agency:</b> ${form.other_agency_name || "—"} — ₱${Number(form.other_agency_amount || 0).toLocaleString()}</li>`);
    if (!form.is_first_time)         additionalInfo.push(`<li><b>First-time application:</b> No</li>`);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Research Proposal — ${form.title || "Untitled"}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
            color: #111827;
            background: #fff;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 25mm 20mm;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
            table { page-break-inside: avoid; }
          }

          .page { max-width: 780px; margin: 0 auto; padding: 40px 48px; }

          /* Header */
          .header { text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 3px double #1f3864; }
          .header .uni-name { font-size: 13pt; font-weight: 700; color: #1f3864; letter-spacing: 0.04em; text-transform: uppercase; }
          .header .office   { font-size: 10pt; color: #6b7280; margin-top: 2px; }
          .header .doc-title{ font-size: 17pt; font-weight: 700; color: #1f3864; margin: 14px 0 6px; line-height: 1.3; }
          .header .ref-date { font-size: 10pt; color: #6b7280; }
          .header .badge    { display: inline-block; margin-top: 8px; padding: 4px 16px; border-radius: 20px; background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; font-size: 11pt; font-weight: 600; font-family: Arial, sans-serif; }

          /* Section */
          .section { margin-bottom: 28px; }
          .section-title {
            display: flex; align-items: center; gap: 8px;
            font-size: 11pt; font-weight: 700; color: #1f3864;
            text-transform: uppercase; letter-spacing: 0.06em;
            font-family: Arial, sans-serif;
            border-bottom: 2px solid #1f3864;
            padding-bottom: 6px; margin-bottom: 14px;
          }
          .section-title .num {
            display: inline-flex; align-items: center; justify-content: center;
            width: 22px; height: 22px; border-radius: 50%;
            background: #1f3864; color: #fff;
            font-size: 10pt; font-weight: 700; flex-shrink: 0;
          }

          /* Info Grid */
          .info-grid { display: grid; grid-template-columns: 200px 1fr; gap: 6px 12px; }
          .info-label { font-size: 11pt; color: #6b7280; font-weight: 500; padding: 4px 0; }
          .info-value { font-size: 11pt; color: #111827; font-weight: 500; padding: 4px 0; border-bottom: 1px dotted #e5e7eb; }

          /* Table */
          table { width: 100%; border-collapse: collapse; font-size: 11pt; }
          thead tr { background: #f0f4f8; }
          thead th { padding: 10px 12px; text-align: left; font-size: 10pt; font-weight: 700; color: #1f3864; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #1f3864; }

          /* Additional info */
          .add-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 18px; }
          .add-info li { margin-bottom: 8px; font-size: 11pt; color: #374151; margin-left: 18px; }


          /* Footer */
          .footer { text-align: center; margin-top: 36px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 9pt; color: #9ca3af; font-family: Arial, sans-serif; }

          /* Print button */
          .print-btn {
            display: block; margin: 0 auto 24px; padding: 10px 28px;
            background: #1f3864; color: #fff; border: none; border-radius: 8px;
            font-size: 13pt; font-weight: 600; cursor: pointer; font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="page">

          <button class="print-btn no-print" onclick="window.print()">🖨 Print / Save as PDF</button>

          <!-- HEADER -->
          <div class="header">
            <p class="uni-name">Caraga State University</p>
            <p class="office">Office of the Vice President for Research, Innovation &amp; Extension</p>
            <h1 class="doc-title">${form.title || "Untitled Proposal"}</h1>
            <p class="ref-date">Date Generated: ${today}</p>
            <span class="badge">${form.scholarly_work_type || "Research"}</span>
          </div>

          <!-- SECTION I: BASIC INFORMATION -->
          <div class="section">
            <div class="section-title"><span class="num">I</span> Basic Information</div>
            <div class="info-grid">
              <span class="info-label">Title</span>
              <span class="info-value">${form.title || "—"}</span>

              <span class="info-label">Type of Scholarly Work</span>
              <span class="info-value">${form.scholarly_work_type || "—"}</span>

              <span class="info-label">Total Proposed Budget</span>
              <span class="info-value">${form.total_budget ? "₱" + Number(form.total_budget).toLocaleString() : "—"}</span>

              <span class="info-label">Proposed Start Date</span>
              <span class="info-value">${fmtDate(form.start_date)}</span>

              <span class="info-label">Proposed End Date</span>
              <span class="info-value">${fmtDate(form.end_date)}</span>

              ${form.submitted_elsewhere ? `
              <span class="info-label">Other Agency</span>
              <span class="info-value">${form.other_agency_name || "—"}</span>
              <span class="info-label">Agency Amount</span>
              <span class="info-value">₱${Number(form.other_agency_amount || 0).toLocaleString()}</span>
              ` : ""}
            </div>
          </div>

          <!-- SECTION II: PROPONENTS -->
          <div class="section">
            <div class="section-title"><span class="num">II</span> Proponents</div>
            ${(form.proponents || []).length === 0
              ? `<p style="color:#9ca3af;font-style:italic;font-size:11pt;">No proponents added.</p>`
              : `<table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Department / Position</th>
                      <th>Role</th>
                      <th style="text-align:center;">Signature</th>
                    </tr>
                  </thead>
                  <tbody>${proponentRows}</tbody>
                </table>`
            }
          </div>

          <!-- SECTION III: ADDITIONAL INFORMATION -->
          ${additionalInfo.length > 0 ? `
          <div class="section">
            <div class="section-title"><span class="num">III</span> Additional Information</div>
            <div class="add-info">
              <ul>${additionalInfo.join("")}</ul>
            </div>
          </div>` : ""}

          <!-- SECTION IV: ATTACHED DOCUMENTS -->
          <div class="section">
            <div class="section-title"><span class="num">${additionalInfo.length > 0 ? "IV" : "III"}</span> Attached Documents</div>
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Status / File Name</th>
                </tr>
              </thead>
              <tbody>${fileList}</tbody>
            </table>
          </div>


          <!-- FOOTER -->
          <div class="footer">
            This document was generated by the Research Project Management System<br/>
            Caraga State University — ${today}
          </div>

        </div>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #1f7a1f" }}>
        <Icon size={16} color="#1f7a1f" />
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1f7a1f", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "sans-serif" }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, value }) => (
    <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", gap: 8, marginBottom: 8, fontSize: 13 }}>
      <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#111827", fontWeight: 500 }}>{value || <span style={{ color: "#d1d5db", fontStyle: "italic" }}>Not provided</span>}</span>
    </div>
  );

  const fileRows = [
    { label: "Project Proposal Form", file: form.proposal_form,  existing: existingFiles.proposal_form },
    { label: "Curriculum Vitae",      file: form.cv_files?.[0],  existing: existingFiles.cv_files },
    { label: "Work Plan",             file: workPlanFile,         existing: existingFiles.work_plan_file },
    { label: "Project Framework",     file: frameworkFile,        existing: existingFiles.framework_file },
    { label: "References",            file: referencesFile,       existing: existingFiles.references_file },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Review Proposal Document</h3>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>Read-only preview. All entered information is compiled here.</p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 9, border: "none", background: "#1f7a1f", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
        >
          <Printer size={15} /> Print / Save PDF
        </button>
      </div>

      {/* On-screen preview */}
      <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: "40px 36px",
            maxWidth: 900,
            width: "100%",
            margin: "0 auto",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            fontFamily: "Georgia, serif",
            overflow: "hidden",
          }}
        >
        <div style={{ textAlign: "center", marginBottom: 32, paddingBottom: 24, borderBottom: "3px double #1f7a1f" }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "sans-serif" }}>
            Caraga State University — Research Project Proposal Management System
          </p>
          <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.35 }}>
            {form.title || <span style={{ color: "#d1d5db" }}>Untitled Proposal</span>}
          </h1>
          <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", fontSize: 12, fontWeight: 600, fontFamily: "sans-serif" }}>
            {form.scholarly_work_type || "Research"}
          </span>
        </div>

        <Section icon={BookOpen} title="I. Basic Information">
          <Row label="Title"                value={form.title} />
          <Row label="Type of Scholarly Work" value={form.scholarly_work_type} />
          <Row label="Total Proposed Budget" value={form.total_budget ? `₱${Number(form.total_budget).toLocaleString()}` : null} />
          <Row label="Proposed Start Date"  value={form.start_date} />
          <Row label="Proposed End Date"    value={form.end_date} />
          {form.submitted_elsewhere && (
            <>
              <Row label="Other Agency"       value={form.other_agency_name} />
              <Row label="Agency Amount"      value={form.other_agency_amount ? `₱${Number(form.other_agency_amount).toLocaleString()}` : null} />
            </>
          )}
        </Section>

        <Section icon={Users} title="II. Proponents">
            {(!form.proponents || form.proponents.length === 0) ? (
              <p style={{ color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>
                No proponents added.
              </p>
            ) : (
              <div style={{ width: "100%", overflow: "hidden" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                    tableLayout: "fixed",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "28%" }} />
                    <col style={{ width: "32%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "22%" }} />
                  </colgroup>

                  <thead>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <th
                        style={{
                          padding: "6px 8px",
                          textAlign: "left",
                          color: "#6b7280",
                          fontWeight: 600,
                          fontFamily: "sans-serif",
                          fontSize: 11,
                        }}
                      >
                        Name
                      </th>

                      <th
                        style={{
                          padding: "6px 8px",
                          textAlign: "left",
                          color: "#6b7280",
                          fontWeight: 600,
                          fontFamily: "sans-serif",
                          fontSize: 11,
                        }}
                      >
                        Department / Position
                      </th>

                      <th
                        style={{
                          padding: "6px 8px",
                          textAlign: "left",
                          color: "#6b7280",
                          fontWeight: 600,
                          fontFamily: "sans-serif",
                          fontSize: 11,
                        }}
                      >
                        Role
                      </th>

                      <th
                        style={{
                          padding: "6px 8px",
                          textAlign: "center",
                          color: "#6b7280",
                          fontWeight: 600,
                          fontFamily: "sans-serif",
                          fontSize: 11,
                        }}
                      >
                        Signature
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {form.proponents.map((p) => {
                      const signature = form.signatures?.[p.id];

                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: 600,
                              verticalAlign: "middle",
                              wordBreak: "break-word",
                            }}
                          >
                            {p.name}
                          </td>

                          <td
                            style={{
                              padding: "12px 8px",
                              color: "#6b7280",
                              verticalAlign: "middle",
                              wordBreak: "break-word",
                            }}
                          >
                            {[p.department, p.position].filter(Boolean).join(" - ") || "—"}
                          </td>

                          <td
                            style={{
                              padding: "12px 8px",
                              verticalAlign: "middle",
                              wordBreak: "break-word",
                            }}
                          >
                            Proponent
                          </td>

                          <td
                            style={{
                              padding: "8px 6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            {signature ? (
                              <div
                                style={{
                                  width: "100%",
                                  height: 46,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                }}
                              >
                                <img
                                  src={signature}
                                  alt={`${p.name} signature`}
                                  style={{
                                    maxHeight: 38,
                                    maxWidth: 90,
                                    objectFit: "contain",
                                    display: "block",
                                  }}
                                />
                              </div>
                            ) : (
                              <span
                                style={{
                                  color: "#dc2626",
                                  fontSize: 10,
                                  fontStyle: "italic",
                                }}
                              >
                                No signature
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

        <Section icon={FileText} title="III. Attached Documents">
          {fileRows.map(({ label, file, existing }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #f9fafb", fontSize: 13 }}>
              {file || existing ? (
                <>
                  <FileCheck size={14} color="#15803d" />
                  <span style={{ color: "#111827" }}>{label}: <span style={{ color: "#15803d", fontWeight: 600 }}>{file?.name || "Uploaded"}</span></span>
                </>
              ) : (
                <>
                  <X size={14} color="#d1d5db" />
                  <span style={{ color: "#9ca3af", fontStyle: "italic" }}>{label}: not uploaded</span>
                </>
              )}
            </div>
          ))}
        </Section>

        <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #e5e7eb", textAlign: "center", fontSize: 11, color: "#9ca3af", fontFamily: "sans-serif" }}>
          Generated by Research PMS — {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>
    </div>
  );
} 

function getCompletion({ form, workPlanFile, frameworkFile, referencesFile, existingFiles }) {
  const agencyComplete =
    !form.submitted_elsewhere ||
    (form.other_agency_name && form.other_agency_amount && form.agency_difference_extent);

  const pastWorksOk =
    form.is_first_time ||
    (form.past_works?.length > 0 &&
      form.past_works.every((pw) => pw.title && pw.status));

  const hasProponents = form.proponents?.length > 0;

  const signaturesOk =
    hasProponents &&
    form.proponents.every((p) => !!form.signatures?.[p.id]);

  return {
    Overview: !!(
      form.title &&
      form.scholarly_work_type &&
      form.total_budget &&
      form.start_date &&
      form.end_date &&
      hasProponents &&
      signaturesOk &&
      (form.proposal_form || existingFiles.proposal_form) &&
      agencyComplete &&
      pastWorksOk
    ),
    "Work Plan": !!(workPlanFile || existingFiles.work_plan_file),
    Framework: !!(frameworkFile || existingFiles.framework_file),
    References: !!(referencesFile || existingFiles.references_file),
    Review: true,
  };
}

export default function Proposals() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get("project_id");

  const [activeTab, setActiveTab] = useState("Overview");
  const [proponentsList, setProponentsList] = useState([]);
  const [evaluatorsList, setEvaluatorsList] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);

  const [preferredEvaluators, setPreferredEvaluators] = useState([]);

  const [workPlanFile, setWorkPlanFile] = useState(null);
  const [frameworkFile, setFrameworkFile] = useState(null);
  const [referencesFile, setReferencesFile] = useState(null);

  const [existingFiles, setExistingFiles] = useState({
    proposal_form: null,
    cv_files: null,
    work_plan_file: null,
    framework_file: null,
    references_file: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/faculty")
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        setProponentsList(data);
      })
      .catch(() => setProponentsList([]));

    api
      .get("/admin/evaluators")
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        setEvaluatorsList(data);
      })
      .catch(() => setEvaluatorsList([]));
  }, []);

  useEffect(() => {
    if (!projectId) return;

    setLoadingDraft(true);
    setError("");

    api
      .get(`/proposals/${projectId}`)
      .then((res) => {
        const project = res.data?.project || res.data || {};
        const proposal = res.data?.proposal || {};

        const parsedPastWorks = normalizeJsonArray(proposal.past_works);
        const parsedPreferredEvaluators = normalizeJsonArray(proposal.preferred_evaluators);
        
        const rawSigs = {
          ...normalizeJsonObject(project.signatures),
          ...normalizeJsonObject(proposal.signatures),
        };
        // Normalize all keys to strings
        const loadedSignatures = Object.fromEntries(
          Object.entries(rawSigs).map(([k, v]) => [String(k), v])
        );

        const loadedProponents =
          Array.isArray(project.proponents)
            ? project.proponents
            : Array.isArray(proposal.proponents)
            ? proposal.proponents
            : [];

        setForm((current) => ({
          ...current,
          title: project.title || "",
          scholarly_work_type:
            project.scholarly_work_type ||
            project.type ||
            proposal.scholarly_work_type ||
            "Research",
          total_budget: project.total_budget || project.budget || "",
          start_date: project.start_date || "",
          end_date: project.end_date || "",

          proponents: loadedProponents,
          signatures: loadedSignatures,

          similar_work_elsewhere: !!proposal.similar_work_elsewhere,
          similar_work_details: proposal.similar_work_details || "",

          is_first_time: proposal.is_first_time !== false,
          past_works: parsedPastWorks,

          has_external_collab: !!proposal.has_external_collab,
          external_collab_details: proposal.external_collab_details || "",

          submitted_elsewhere: !!proposal.submitted_elsewhere,
          other_agency_name: proposal.other_agency_name || "",
          other_agency_amount: proposal.other_agency_amount || "",
          agency_difference_extent:
            proposal.agency_difference_extent ||
            proposal.difference_explanation ||
            "",
        }));

        setExistingFiles({
          proposal_form:
            project.proposal_form_path ||
            project.proposal_form ||
            proposal.proposal_form_path ||
            proposal.proposal_form ||
            null,
          cv_files:
            project.cv_paths ||
            project.cv_files ||
            proposal.cv_paths ||
            proposal.cv_files ||
            null,
          work_plan_file:
            project.work_plan_path ||
            project.work_plan_file ||
            proposal.work_plan_path ||
            proposal.work_plan_file ||
            null,
          framework_file:
            project.framework_path ||
            project.framework_file ||
            proposal.framework_path ||
            proposal.framework_file ||
            null,
          references_file:
            project.references_path ||
            project.references_file ||
            proposal.references_path ||
            proposal.references_file ||
            null,
        });

        if (parsedPreferredEvaluators.length > 0) {
          const matched = evaluatorsList.filter((e) =>
            parsedPreferredEvaluators.includes(e.id)
          );
          setPreferredEvaluators(matched);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load draft. Please try again.");
      })
      .finally(() => setLoadingDraft(false));
  }, [projectId]);

  const INPUT_TABS = ["Overview", "Work Plan", "Framework", "References"];

  const completion = getCompletion({
    form,
    workPlanFile,
    frameworkFile,
    referencesFile,
    existingFiles,
  });

  const allComplete = INPUT_TABS.every((t) => completion[t]);
  const incompleteTabs = INPUT_TABS.filter((t) => !completion[t]);

  const buildPayload = () => {
    const fd = new FormData();

    if (projectId) {
      fd.append("project_id", projectId);
    }

    [
      "title",
      "scholarly_work_type",
      "total_budget",
      "start_date",
      "end_date",
      "similar_work_elsewhere",
      "similar_work_details",
      "is_first_time",
      "has_external_collab",
      "external_collab_details",
      "submitted_elsewhere",
      "other_agency_name",
      "other_agency_amount",
      "agency_difference_extent",
    ].forEach((k) => fd.append(k, form[k] ?? ""));

    fd.append("proponents", JSON.stringify((form.proponents || []).map((p) => p.id)));
    fd.append("past_works", JSON.stringify(form.past_works || []));

    fd.append("signatures", JSON.stringify(form.signatures || {}));

    fd.append(
      "preferred_evaluators",
      JSON.stringify(preferredEvaluators.map((e) => e.id))
    );

    form.cv_files?.forEach((f) => fd.append("cv_files", f));

    if (form.proposal_form) fd.append("proposal_form", form.proposal_form);
    if (workPlanFile) fd.append("work_plan_file", workPlanFile);
    if (frameworkFile) fd.append("framework_file", frameworkFile);
    if (referencesFile) fd.append("references_file", referencesFile);

    return fd;
  };

  const handleSaveDraft = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.post("/proposals/draft", buildPayload(), {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Draft saved successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save draft. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(""), 3500);
    }
  };

  const handleSubmit = async () => {
    if (!allComplete) {
      setError(`Complete these sections first: ${incompleteTabs.join(", ")}.`);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await api.post("/proposals", buildPayload(), {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Proposal submitted successfully!");
      setActiveTab("Review");

      setTimeout(() => {
        navigate("/researcher/projects");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <OverviewTab
            form={form}
            setForm={setForm}
            preferredEvaluators={preferredEvaluators}
            setPreferredEvaluators={setPreferredEvaluators}
            proponentsList={proponentsList}
            evaluatorsList={evaluatorsList}
            existingFiles={existingFiles}
          />
        );

      case "Work Plan":
        return (
          <WorkPlanTab
            file={workPlanFile}
            setFile={setWorkPlanFile}
            existingFile={existingFiles.work_plan_file}
          />
        );

      case "Framework":
        return (
          <UploadTab
            title="Project Framework"
            subtitle="Upload your project framework document"
            fieldLabel="Project Framework Document"
            accept=".pdf,.doc,.docx"
            file={frameworkFile}
            setFile={setFrameworkFile}
            existingFile={existingFiles.framework_file}
          />
        );

      case "References":
        return (
          <UploadTab
            title="References and Citations"
            subtitle="Upload your references document"
            fieldLabel="References Document"
            accept=".pdf,.doc,.docx"
            note="Include all references and citations in proper academic format."
            file={referencesFile}
            setFile={setReferencesFile}
            existingFile={existingFiles.references_file}
          />
        );

      case "Review":
        return (
          <OutputsTab
            form={form}
            workPlanFile={workPlanFile}
            frameworkFile={frameworkFile}
            referencesFile={referencesFile}
            existingFiles={existingFiles}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="main-content">
        <Topbar title={projectId ? "Continue Research Proposal" : "Create Research Proposal"} />

        <div className="dashboard-content">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
              Complete the project details, add proponents, upload required documents, then save as draft or submit for review.
            </h3>
          </div>

          {loadingDraft && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#f9fafb",
                color: "#6b7280",
                padding: "12px 16px",
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              Loading draft...
            </div>
          )}

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: "#fef2f2",
                color: "#dc2626",
                padding: "12px 16px",
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#dcfce7",
                color: "#15803d",
                padding: "12px 16px",
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 18,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <AlertCircle size={18} color="#15803d" style={{ flexShrink: 0, marginTop: 2 }} />

            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#14532d" }}>
                Fill everything here before submitting.
              </p>

              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#166534", lineHeight: 1.5 }}>
                You can add proponents and upload the proposal form, CVs, work plan, framework, and references on this page.
                Use Save as Draft only if the proposal is not complete yet. Use Submit Proposal once all sections are complete.
              </p>
            </div>
          </div>

          {projectId && (
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
                padding: "10px 14px",
                borderRadius: 10,
                marginBottom: 16,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              You are continuing an existing draft. Saving or submitting will update this draft.
            </div>
          )}

          {activeTab !== "Review" && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                  {INPUT_TABS.filter((t) => completion[t]).length} / {INPUT_TABS.length} sections completed
                </span>

                {allComplete && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={13} /> All sections complete
                  </span>
                )}
              </div>

              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(INPUT_TABS.filter((t) => completion[t]).length / INPUT_TABS.length) * 100}%`,
                    background: "#1f7a1f",
                    borderRadius: 99,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          )}

          <div className="cp-tab-bar" style={{ flexWrap: "wrap", gap: 4 }}>
            {TABS.map((tab) => {
              const done = completion[tab] && tab !== "Review";
              const active = activeTab === tab;
              const isOut = tab === "Review";

              return (
                <button
                  key={tab}
                  type="button"
                  className={`cp-tab-btn ${active ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    ...(isOut && !active
                      ? {
                          borderStyle: "dashed",
                          color: "#6d28d9",
                          borderColor: "#ddd6fe",
                        }
                      : {}),
                  }}
                >
                  {done && !active && <CheckCircle2 size={13} color="#15803d" style={{ flexShrink: 0 }} />}
                  {isOut && <FileText size={13} style={{ flexShrink: 0 }} />}
                  {tab}

                  {!done && !active && !isOut && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#d1d5db",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {renderTab()}

          {activeTab !== "Review" && (
            <div className="cp-form-actions">
              <button
                type="button"
                className="cp-btn"
                style={{ display: "flex", alignItems: "center", gap: 7 }}
                onClick={handleSaveDraft}
                disabled={saving || loadingDraft}
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save as Draft"}
              </button>

              <div className="cp-actions-right">
                {!allComplete && (
                  <span style={{ fontSize: 12, color: "#c2410c", display: "flex", alignItems: "center", gap: 5 }}>
                    <AlertCircle size={13} />
                    Incomplete: {incompleteTabs.join(", ")}
                  </span>
                )}

                <button
                  type="button"
                  className="cp-btn primary"
                  style={{
                    background: allComplete ? "#1f7a1f" : "#9ca3af",
                    borderColor: allComplete ? "#1f7a1f" : "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    cursor: allComplete ? "pointer" : "not-allowed",
                  }}
                  onClick={handleSubmit}
                  disabled={submitting || !allComplete || loadingDraft}
                  title={!allComplete ? `Complete first: ${incompleteTabs.join(", ")}` : "Submit proposal"}
                >
                  <Send size={14} />
                  {submitting ? "Submitting..." : "Submit Proposal"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "Review" && (
            <div className="cp-form-actions">
              <button
                type="button"
                className="cp-btn"
                onClick={() => setActiveTab("Overview")}
              >
                Back to Edit
              </button>

              <button
                type="button"
                className="cp-btn primary"
                style={{
                  background: allComplete ? "#1f7a1f" : "#9ca3af",
                  borderColor: allComplete ? "#1f7a1f" : "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  cursor: allComplete ? "pointer" : "not-allowed",
                }}
                onClick={handleSubmit}
                disabled={submitting || !allComplete || loadingDraft}
              >
                <Send size={14} />
                {submitting ? "Submitting..." : "Submit Proposal"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}