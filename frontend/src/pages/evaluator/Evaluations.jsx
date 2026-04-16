import { useState, useRef } from "react";
import {
  FileText, Star, Upload, Trash2, Pen, X,
} from "lucide-react";
import EvaluatorNavbar from "../../components/evaluator/Navbar";
import Topbar from "../../components/Topbar";
import "../../styles/evaluator.css";

// ── Data ──────────────────────────────────────────────────────────────────────
const PENDING = [
  {
    id: "PRJ-002",
    title: "AI-Driven Healthcare Diagnosis System",
    dept: "Computer Science",
    status: "Under Evaluation",
  },
  {
    id: "PRJ-004",
    title: "Quantum Computing for Cryptography",
    dept: "Physics",
    status: "Submitted",
  },
];

const CRITERIA = [
  { key: "presentation", label: "Presentation & Clarity",         max: 30 },
  { key: "relevance",    label: "Research Relevance & Innovation", max: 35 },
  { key: "impact",       label: "Expected Benefits & Impact",      max: 35 },
];

const STATUS_STYLES = {
  "Under Evaluation": { bg: "#fef3c7", color: "#d97706" },
  "Submitted":        { bg: "#fef3c7", color: "#d97706" },
};

// ── View Details Modal ────────────────────────────────────────────────────────
function ViewDetailsModal({ item, onClose }) {
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div
        className="tm-modal"
        style={{ maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tm-modal-header">
          <div>
            <h3 className="tm-modal-title">Evaluation Details</h3>
            <p className="tm-modal-subtitle">
              {item.id} — {item.title}
            </p>
          </div>
          <button className="tm-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Score Summary */}
        <div
          style={{
            background: "#f5f3ff",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>
                Final Score
              </p>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#7c3aed",
                  margin: 0,
                }}
              >
                {item.score}
                <span style={{ fontSize: 16, color: "#9ca3af" }}>/100</span>
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>
                Evaluator
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                }}
              >
                {item.evaluator}
              </p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                {item.date}
              </p>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 10,
          }}
        >
          Score Breakdown
        </p>
        {CRITERIA.map((c) => {
          const val = Math.round((item.score / 100) * c.max);
          const pct = (val / c.max) * 100;
          return (
            <div key={c.key} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 5,
                }}
              >
                <span style={{ fontSize: 13, color: "#374151" }}>
                  {c.label}
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed" }}
                >
                  {val}/{c.max}
                </span>
              </div>
              <div className="ev-progress-bg">
                <div
                  className="ev-progress-bar"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Comments */}
        <div style={{ marginTop: 16 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              margin: "0 0 6px",
            }}
          >
            Evaluation Comments
          </p>
          <div
            style={{
              background: "#fafafa",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 13,
              color: "#6b7280",
              lineHeight: 1.6,
            }}
          >
            The proposal demonstrates strong research methodology and clear
            objectives. The team has adequate expertise and the budget
            allocation is well-justified. Minor improvements needed in the
            dissemination plan and timeline specificity.
          </div>
        </div>

        <div className="tm-modal-actions">
          <button className="cp-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Evaluations() {
  const [selected, setSelected] = useState(null);
  const [scores, setScores] = useState({
    presentation: 0,
    relevance: 0,
    impact: 0,
  });
  const [comments, setComments] = useState("");
  const [evalName, setEvalName] = useState("");
  const [position, setPosition] = useState("");

  // Signature state
  const [sigTab, setSigTab] = useState("draw"); // "draw" | "upload"
  const [sigFile, setSigFile] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef(null);
  const lastPos = useRef(null);
  const sigRef = useRef(null);

  // Completed evaluations
  const [completed, setCompleted] = useState([
    {
      id: "PRJ-001",
      title: "Climate Change Impact on Coastal Ecosystems",
      evaluator: "Dr. Karen Smith",
      date: "2026-02-15",
      score: 95,
    },
    {
      id: "PRJ-002",
      title: "AI-Driven Healthcare Diagnosis System",
      evaluator: "Prof. David Wilson",
      date: "2026-03-28",
      score: 88,
    },
  ]);

  const [viewItem, setViewItem] = useState(null);

  // ── Canvas drawing helpers ──
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasDrawn(true);
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // ── Scoring ──
  const totalScore =
    scores.presentation + scores.relevance + scores.impact;
  const scoreColor =
    totalScore >= 80
      ? "#15803d"
      : totalScore >= 60
      ? "#d97706"
      : "#dc2626";

  const handleSelect = (proj) => {
    setSelected(proj);
    setScores({ presentation: 0, relevance: 0, impact: 0 });
    setComments("");
    clearCanvas();
    setSigFile(null);
    setSigTab("draw");
  };

  const handleSubmit = () => {
    if (!evalName) return;
    const newEntry = {
      id: selected.id,
      title: selected.title,
      evaluator: evalName,
      date: new Date().toISOString().split("T")[0],
      score: totalScore,
    };
    setCompleted((p) => [...p, newEntry]);
    setSelected(null);
    setScores({ presentation: 0, relevance: 0, impact: 0 });
    setComments("");
    setEvalName("");
    setPosition("");
    clearCanvas();
    setSigFile(null);
  };

  return (
    <div className="dashboard-layout">
      <EvaluatorNavbar />
      <div className="main-content">
        <Topbar title="Evaluations" role="Evaluator" userName="Rosebellaaa" />

        <div className="dashboard-content">
          {/* Page Header */}
          <div style={{ marginBottom: 20 }}>
            <h2 className="page-title">Project Evaluations</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Review and score submitted research proposals
            </p>
          </div>

          {/* Top Split */}
          <div className="ev-split">
            {/* ── Left: Pending List ── */}
            <div className="ev-pending-panel">
              <h4 className="ev-panel-title">Pending Evaluations</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PENDING.map((p) => {
                  const s = STATUS_STYLES[p.status];
                  const isSel = selected?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`ev-pending-card ${isSel ? "selected" : ""}`}
                      onClick={() => handleSelect(p)}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <FileText
                          size={18}
                          color={isSel ? "#7c3aed" : "#9ca3af"}
                          style={{ marginTop: 2, flexShrink: 0 }}
                        />
                        <div>
                          <p className="ev-pending-title">{p.title}</p>
                          <p className="ev-pending-id">{p.id}</p>
                          <span
                            className="badge"
                            style={{
                              background: s.bg,
                              color: s.color,
                              marginTop: 6,
                              display: "inline-block",
                            }}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Right: Evaluation Form ── */}
            <div className="ev-form-panel">
              <h4 className="ev-panel-title">Evaluation Form</h4>

              {!selected ? (
                <div className="ev-empty-state">
                  <FileText size={40} color="#d1d5db" />
                  <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
                    Select a project from the list to begin evaluation
                  </p>
                </div>
              ) : (
                <div>
                  {/* Project Info */}
                  <div style={{ marginBottom: 20 }}>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#111827",
                        margin: "0 0 4px",
                      }}
                    >
                      {selected.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                      {selected.dept}
                    </p>
                  </div>

                  {/* Scoring Criteria */}
                  {CRITERIA.map((c) => {
                    const val = scores[c.key];
                    const pct = (val / c.max) * 100;
                    return (
                      <div key={c.key} style={{ marginBottom: 20 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <label
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#374151",
                            }}
                          >
                            {c.label}{" "}
                            <span
                              style={{
                                color: "#9ca3af",
                                fontWeight: 400,
                              }}
                            >
                              (Max: {c.max})
                            </span>
                          </label>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#7c3aed",
                            }}
                          >
                            {val}/{c.max}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={c.max}
                          value={val}
                          onChange={(e) =>
                            setScores((p) => ({
                              ...p,
                              [c.key]: parseInt(e.target.value),
                            }))
                          }
                          className="ev-slider"
                        />
                        <div
                          className="ev-progress-bg"
                          style={{ marginTop: 6 }}
                        >
                          <div
                            className="ev-progress-bar"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Total Score */}
                  <div className="ev-total-score">
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Total Score:
                    </span>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: scoreColor,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Star size={18} fill={scoreColor} color={scoreColor} />
                      {totalScore}/100
                    </span>
                  </div>

                  {/* Comments */}
                  <div style={{ marginBottom: 16 }}>
                    <label
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#374151",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Evaluation Comments
                    </label>
                    <textarea
                      className="cp-textarea"
                      style={{ minHeight: 90 }}
                      placeholder="Provide detailed feedback and recommendations..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    />
                  </div>

                  {/* ── Evaluator Credentials ── */}
                  <div className="ev-credentials">
                    <h4
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#7c3aed",
                        margin: "0 0 14px",
                      }}
                    >
                      Evaluator Credentials
                    </h4>

                    <div
                      className="cp-grid-2"
                      style={{ marginBottom: 14 }}
                    >
                      <div className="cp-field">
                        <label className="cp-label">Evaluator Name *</label>
                        <input
                          className="cp-input"
                          type="text"
                          placeholder="Enter your full name"
                          value={evalName}
                          onChange={(e) => setEvalName(e.target.value)}
                        />
                      </div>
                      <div className="cp-field">
                        <label className="cp-label">Position *</label>
                        <input
                          className="cp-input"
                          type="text"
                          placeholder="e.g., Senior Research Evaluator"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="cp-field">
                      <label className="cp-label">Signature *</label>

                      {/* Tab Switcher */}
                      <div className="ev-sig-tabs">
                        <button
                          className={`ev-sig-tab ${
                            sigTab === "draw" ? "active" : ""
                          }`}
                          onClick={() => setSigTab("draw")}
                        >
                          <Pen size={14} /> Draw
                        </button>
                        <button
                          className={`ev-sig-tab ${
                            sigTab === "upload" ? "active" : ""
                          }`}
                          onClick={() => setSigTab("upload")}
                        >
                          <Upload size={14} /> Upload
                        </button>
                      </div>

                      {/* Draw Tab */}
                      {sigTab === "draw" && (
                        <div className="ev-canvas-wrapper">
                          <canvas
                            ref={canvasRef}
                            width={560}
                            height={130}
                            className="ev-sig-canvas"
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={stopDraw}
                            onMouseLeave={stopDraw}
                            onTouchStart={startDraw}
                            onTouchMove={draw}
                            onTouchEnd={stopDraw}
                          />
                          <div className="ev-canvas-footer">
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>
                              {hasDrawn
                                ? "✓ Signature captured"
                                : "Draw your signature above"}
                            </span>
                            {hasDrawn && (
                              <button
                                className="ev-clear-btn"
                                onClick={clearCanvas}
                              >
                                <Trash2 size={13} /> Clear
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Upload Tab */}
                      {sigTab === "upload" && (
                        <div className="ev-sig-upload">
                          <div className="cp-file-row">
                            <button
                              className="cp-file-btn"
                              onClick={() => sigRef.current.click()}
                            >
                              Choose File
                            </button>
                            <span className="cp-file-name">
                              {sigFile ? sigFile.name : "No file chosen"}
                            </span>
                            <button
                              className="cp-file-upload-icon"
                              onClick={() => sigRef.current.click()}
                            >
                              <Upload size={15} color="#6b7280" />
                            </button>
                            <input
                              ref={sigRef}
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              style={{ display: "none" }}
                              onChange={(e) =>
                                setSigFile(e.target.files[0])
                              }
                            />
                          </div>
                          {sigFile && (
                            <div style={{ marginTop: 10 }}>
                              <img
                                src={URL.createObjectURL(sigFile)}
                                alt="signature preview"
                                style={{
                                  maxHeight: 80,
                                  border: "1px solid #e5e7eb",
                                  borderRadius: 6,
                                  padding: 4,
                                }}
                              />
                            </div>
                          )}
                          <p
                            style={{
                              fontSize: 12,
                              color: "#9ca3af",
                              margin: "6px 0 0",
                            }}
                          >
                            Upload your digital signature image (PNG, JPG)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 10,
                      marginTop: 16,
                    }}
                  >
                    <button
                      className="cp-btn"
                      onClick={() => setSelected(null)}
                    >
                      Save Draft
                    </button>
                    <button
                      className="ev-submit-btn"
                      onClick={handleSubmit}
                      disabled={!evalName}
                    >
                      Submit Evaluation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Completed Evaluations Table ── */}
          <div className="table-wrapper" style={{ marginTop: 20 }}>
            <h4 className="table-title">Completed Evaluations</h4>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Project ID</th>
                    <th>Project Title</th>
                    <th>Evaluator</th>
                    <th>Date</th>
                    <th>Total Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {completed.map((item, i) => {
                    const sc =
                      item.score >= 80
                        ? { bg: "#dcfce7", color: "#15803d" }
                        : item.score >= 60
                        ? { bg: "#fef3c7", color: "#d97706" }
                        : { bg: "#fef2f2", color: "#dc2626" };
                    return (
                      <tr key={i}>
                        <td>{item.id}</td>
                        <td>
                          <strong>{item.title}</strong>
                        </td>
                        <td>{item.evaluator}</td>
                        <td>{item.date}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: sc.bg,
                              color: sc.color,
                            }}
                          >
                            {item.score}/100
                          </span>
                        </td>
                        <td>
                          <span
                            className="action"
                            onClick={() => setViewItem(item)}
                          >
                            View Details
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {viewItem && (
        <ViewDetailsModal
          item={viewItem}
          onClose={() => setViewItem(null)}
        />
      )}
    </div>
  );
}
