import { useState, useEffect, useRef } from "react";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import { getSession } from "../../utils/auth";
import { FileText, CheckCircle2, XCircle, RotateCcw, Pen, Upload, Trash2, Star } from "lucide-react";

const ROLE_LABELS = {
  rde_division_chief: "RDE Division Chief",
  campus_director:    "Campus Director",
  vprie:              "Vice President for RIES",
  president:          "University President",
};

const ROLE_ACTIONS = {
  rde_division_chief: { approve: "Endorse",    color: "#1f7a1f" },
  campus_director:    { approve: "Recommend",  color: "#1d4ed8" },
  vprie:              { approve: "Forward",    color: "#7c3aed" },
  president:          { approve: "Approve",    color: "#15803d" },
};

const STATUS_BADGE = {
  "Evaluated":    { bg: "#f5f3ff", color: "#6d28d9" },
  "Endorsed":     { bg: "#dcfce7", color: "#15803d" },
  "Recommended":  { bg: "#dbeafe", color: "#1d4ed8" },
  "Forwarded":    { bg: "#fef9c3", color: "#a16207" },
  "Approved":     { bg: "#dcfce7", color: "#15803d" },
};

export default function ApproverDashboard() {
  const session    = getSession();
  const role       = session?.role;
  const roleLabel  = ROLE_LABELS[role] || "Approver";
  const roleAction = ROLE_ACTIONS[role] || { approve: "Approve", color: "#1f7a1f" };

  const [proposals,  setProposals]  = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  // Signature state
  const [sigTab,    setSigTab]    = useState("draw");
  const [sigFile,   setSigFile]   = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn,  setHasDrawn]  = useState(false);
  const canvasRef = useRef(null);
  const lastPos   = useRef(null);
  const sigRef    = useRef(null);

  const [form, setForm] = useState({
    remarks:      "",
    reference_no: "",
  });

  useEffect(() => {
    api.get("/approval/pending")
      .then((res) => setProposals(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Canvas drawing
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => { e.preventDefault(); const canvas = canvasRef.current; if (!canvas) return; setIsDrawing(true); lastPos.current = getPos(e, canvas); };
  const draw = (e) => {
    if (!isDrawing) return; e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y); ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastPos.current = pos; setHasDrawn(true);
  };
  const stopDraw = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSelect = (p) => {
    setSelected(p);
    setForm({ remarks: "", reference_no: "" });
    setError(""); setSuccess("");
    clearCanvas(); setSigFile(null); setSigTab("draw");
  };

  const handleAct = async (action) => {
    setError(""); setSubmitting(true);
    try {
      let signatureImage = null;
      if (sigTab === "draw" && hasDrawn) signatureImage = canvasRef.current?.toDataURL("image/png");
      if (sigTab === "upload" && sigFile) {
        signatureImage = await new Promise((res) => {
          const r = new FileReader();
          r.onload = (e) => res(e.target.result);
          r.readAsDataURL(sigFile);
        });
      }

      await api.post("/approval/act", {
        research_project_id: selected.id,
        action,
        remarks:         form.remarks,
        reference_no:    form.reference_no,
        signature_image: signatureImage,
        signature_type:  sigTab,
      });

      setSuccess(`Proposal ${action === "approve" ? roleAction.approve + "d" : action === "reject" ? "Rejected" : "Returned"} successfully!`);
      setSelected(null);

      // Refresh list
      const res = await api.get("/approval/pending");
      setProposals(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="main-content" style={{ marginLeft: 0 }}>
        <Topbar title={roleLabel} />
        <div className="dashboard-content">

          <div style={{ marginBottom: 20 }}>
            <h2 className="page-title">{roleLabel} — Approval Queue</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Review and act on proposals assigned to your approval level
            </p>
          </div>

          {success && (
            <div style={{ background: "#dcfce7", color: "#15803d", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {success}
            </div>
          )}

          <div className="ev-split">
            {/* Left — Pending Proposals */}
            <div className="ev-pending-panel">
              <h4 className="ev-panel-title">Pending Proposals ({proposals.length})</h4>
              {loading && <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading...</p>}
              {!loading && proposals.length === 0 && (
                <p style={{ color: "#9ca3af", fontSize: 13 }}>No proposals pending your action.</p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {proposals.map((p) => {
                  const isSel = selected?.id === p.id;
                  const sb = STATUS_BADGE[p.status] || { bg: "#f3f4f6", color: "#6b7280" };
                  return (
                    <div key={p.id}
                      className={`ev-pending-card ${isSel ? "selected" : ""}`}
                      onClick={() => handleSelect(p)}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <FileText size={18} color={isSel ? "#7c3aed" : "#9ca3af"} style={{ marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <p className="ev-pending-title">{p.title}</p>
                          <p className="ev-pending-id">{p.reference_no}</p>
                          <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                            By: {p.submitted_by}
                          </p>
                          {p.average_score && (
                            <p style={{ fontSize: 12, color: "#7c3aed", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                              <Star size={11} fill="#7c3aed" color="#7c3aed" /> Score: {p.average_score}/100
                            </p>
                          )}
                          <span className="badge" style={{ background: sb.bg, color: sb.color, marginTop: 6, display: "inline-block" }}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Action Form */}
            <div className="ev-form-panel">
              <h4 className="ev-panel-title">Action Form</h4>

              {!selected ? (
                <div className="ev-empty-state">
                  <FileText size={40} color="#d1d5db" />
                  <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
                    Select a proposal to take action
                  </p>
                </div>
              ) : (
                <div>
                  {/* Proposal Info */}
                  <div style={{ marginBottom: 20, padding: "14px 16px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>{selected.title}</h3>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>Ref: {selected.reference_no}</p>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>Submitted by: {selected.submitted_by}</p>
                    {selected.average_score && (
                      <p style={{ fontSize: 13, color: "#7c3aed", margin: 0 }}>
                        Evaluation Score: <strong>{selected.average_score}/100</strong>
                      </p>
                    )}
                    {selected.budget && (
                      <p style={{ fontSize: 13, color: "#374151", margin: "4px 0 0" }}>
                        Budget: ₱{Number(selected.budget).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                      {error}
                    </div>
                  )}

                  {/* Reference No */}
                  <div className="cp-field">
                    <label className="cp-label">Reference No (optional)</label>
                    <input className="cp-input" type="text" placeholder="e.g., 1-485"
                      value={form.reference_no}
                      onChange={(e) => setForm({ ...form, reference_no: e.target.value })} />
                  </div>

                  {/* Remarks */}
                  <div className="cp-field">
                    <label className="cp-label">Remarks</label>
                    <textarea className="cp-textarea" style={{ minHeight: 80 }}
                      placeholder="Add any remarks or notes..."
                      value={form.remarks}
                      onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
                  </div>

                  {/* E-Signature */}
                  <div className="ev-credentials">
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: "0 0 14px" }}>E-Signature</h4>
                    <div className="cp-field">
                      <div className="ev-sig-tabs">
                        <button className={`ev-sig-tab ${sigTab === "draw" ? "active" : ""}`} onClick={() => setSigTab("draw")}>
                          <Pen size={14} /> Draw
                        </button>
                        <button className={`ev-sig-tab ${sigTab === "upload" ? "active" : ""}`} onClick={() => setSigTab("upload")}>
                          <Upload size={14} /> Upload
                        </button>
                      </div>

                      {sigTab === "draw" && (
                        <div className="ev-canvas-wrapper">
                          <canvas ref={canvasRef} width={560} height={130} className="ev-sig-canvas"
                            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
                          <div className="ev-canvas-footer">
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>
                              {hasDrawn ? "✓ Signature captured" : "Draw your signature above"}
                            </span>
                            {hasDrawn && (
                              <button className="ev-clear-btn" onClick={clearCanvas}>
                                <Trash2 size={13} /> Clear
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {sigTab === "upload" && (
                        <div className="ev-sig-upload">
                          <div className="cp-file-row">
                            <button className="cp-file-btn" onClick={() => sigRef.current.click()}>Choose File</button>
                            <span className="cp-file-name">{sigFile ? sigFile.name : "No file chosen"}</span>
                            <input ref={sigRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: "none" }}
                              onChange={(e) => setSigFile(e.target.files[0])} />
                          </div>
                          {sigFile && (
                            <img src={URL.createObjectURL(sigFile)} alt="signature preview"
                              style={{ maxHeight: 80, border: "1px solid #e5e7eb", borderRadius: 6, padding: 4, marginTop: 10 }} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                    <button
                      style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: roleAction.color, color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      onClick={() => handleAct("approve")} disabled={submitting}>
                      <CheckCircle2 size={16} />
                      {submitting ? "Processing..." : roleAction.approve}
                    </button>
                    <button
                      style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: "#fef9c3", color: "#a16207", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      onClick={() => handleAct("return")} disabled={submitting}>
                      <RotateCcw size={16} />
                      Return for Revision
                    </button>
                    <button
                      style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: "#fef2f2", color: "#dc2626", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      onClick={() => handleAct("reject")} disabled={submitting}>
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}