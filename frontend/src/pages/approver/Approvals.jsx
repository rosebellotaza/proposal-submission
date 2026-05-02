// src/pages/approver/ApprovePage.jsx
import { useState, useEffect, useRef } from "react";
import ApproverNavbar from "../../components/approver/navbar";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import { getSession } from "../../utils/auth";
import {
  FileText, CheckCircle2, XCircle, RotateCcw,
  Pen, Upload, Trash2, X, Calendar, Star, Bell,
} from "lucide-react";

/* ── status badge ────────────────────────────────────────── */
const SB = {
  "Under Evaluation": { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  Evaluated:          { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  Endorsed:           { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  Recommended:        { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  Forwarded:          { bg: "#fef9c3", color: "#a16207", border: "#fde68a" },
  Approved:           { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
};

const fmt = n => Number(n || 0).toLocaleString();

/* ── Review Modal ────────────────────────────────────────── */
function ReviewModal({ proposal, onClose, onAct, submitting, error }) {
  const [sigTab,    setSigTab]    = useState("upload");
  const [sigFile,   setSigFile]   = useState(null);
  const [hasDrawn,  setHasDrawn]  = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [remarks,   setRemarks]   = useState("");
  const [refNo,     setRefNo]     = useState("");
  const [approvalDate, setApprovalDate] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  });
  const canvasRef = useRef(null);
  const lastPos   = useRef(null);
  const fileRef   = useRef(null);

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width, sy = canvas.height / r.height;
    if (e.touches) return { x: (e.touches[0].clientX - r.left)*sx, y: (e.touches[0].clientY - r.top)*sy };
    return { x: (e.clientX - r.left)*sx, y: (e.clientY - r.top)*sy };
  };
  const startDraw = (e) => { e.preventDefault(); setIsDrawing(true); lastPos.current = getPos(e, canvasRef.current); };
  const draw = (e) => {
    if (!isDrawing) return; e.preventDefault();
    const c = canvasRef.current, ctx = c.getContext("2d"), p = getPos(e, c);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(p.x, p.y); ctx.strokeStyle = "#111827"; ctx.lineWidth = 2;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastPos.current = p; setHasDrawn(true);
  };
  const stopDraw    = () => setIsDrawing(false);
  const clearCanvas = () => { canvasRef.current?.getContext("2d").clearRect(0,0,560,130); setHasDrawn(false); };

  const buildSig = async () => {
    if (sigTab === "draw"   && hasDrawn) return canvasRef.current?.toDataURL("image/png");
    if (sigTab === "upload" && sigFile)  return new Promise(res => { const r = new FileReader(); r.onload = e => res(e.target.result); r.readAsDataURL(sigFile); });
    return null;
  };

  const act = async (action) => {
    const sig = await buildSig();
    onAct({ action, remarks, reference_no: refNo, signature_image: sig, signature_type: sigTab, approval_date: approvalDate });
  };

  return (
    <div style={MO.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={MO.modal}>

        {/* header */}
        <div style={MO.header}>
          <div style={{ minWidth: 0 }}>
            <h2 style={MO.title}>Review Proposal</h2>
            <p style={MO.sub}>{proposal.reference_no} — {proposal.title}</p>
          </div>
          <button style={MO.closeBtn} onClick={onClose}><X size={18}/></button>
        </div>

        <div style={MO.body}>

          {/* info card */}
          <div style={MO.infoCard}>
            <div style={MO.infoGrid}>
              <div><p style={MO.iL}>Researcher</p>    <p style={MO.iV}>{proposal.submitted_by}</p></div>
              <div><p style={MO.iL}>Department</p>    <p style={MO.iV}>{proposal.department || "—"}</p></div>
              <div><p style={MO.iL}>Budget</p>        <p style={MO.iV}>₱{fmt(proposal.budget)}</p></div>
              <div><p style={MO.iL}>Date Submitted</p><p style={MO.iV}>{proposal.date_submitted || proposal.created_at?.slice(0,10) || "—"}</p></div>
            </div>
            {proposal.average_score && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid #e5e7eb", display:"flex", alignItems:"center", gap:6 }}>
                <Star size={14} color="#7c3aed" fill="#7c3aed"/>
                <span style={{ fontSize:13, color:"#7c3aed", fontWeight:600 }}>Score: {proposal.average_score}/100</span>
              </div>
            )}
          </div>

          {error && <div style={MO.err}>{error}</div>}

          {/* reference */}
          <div style={MO.field}>
            <label style={MO.label}>Reference No <span style={{ color:"#9ca3af", fontWeight:400 }}>(optional)</span></label>
            <input style={MO.input} placeholder="e.g. 1-485" value={refNo} onChange={e => setRefNo(e.target.value)} />
          </div>

          {/* remarks */}
          <div style={MO.field}>
            <label style={MO.label}>Remarks</label>
            <textarea style={MO.textarea} placeholder="Add remarks or notes…" value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>

          {/* approval date */}
          <div style={MO.field}>
            <label style={{ ...MO.label, display:"flex", alignItems:"center", gap:5 }}>
              <Calendar size={14} color="#16a34a"/> Approval Date
            </label>
            <input style={MO.input} placeholder="DD/MM/YYYY" value={approvalDate} onChange={e => setApprovalDate(e.target.value)} />
          </div>

          {/* signature */}
          <div style={MO.field}>
            <label style={MO.label}>Signature</label>
            <div style={MO.sigTabs}>
              {["upload","draw"].map(t => (
                <button key={t} style={{ ...MO.sigTab, ...(sigTab===t ? MO.sigOn : {}) }} onClick={() => setSigTab(t)}>
                  {t === "upload" ? <Upload size={14}/> : <Pen size={14}/>}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {sigTab === "upload" && (
              <div style={MO.zone} onClick={() => fileRef.current.click()}>
                {sigFile
                  ? <img src={URL.createObjectURL(sigFile)} alt="sig" style={{ maxHeight:80, maxWidth:"100%", borderRadius:6 }}/>
                  : <><Upload size={26} color="#9ca3af"/><p style={{ margin:"8px 0 4px", fontSize:13, color:"#6b7280" }}>Click to upload your signature</p></>
                }
                <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" style={{ display:"none" }}
                  onChange={e => setSigFile(e.target.files[0])}/>
                {!sigFile && (
                  <button style={MO.chooseBtn} onClick={e => { e.stopPropagation(); fileRef.current.click(); }}>Choose File</button>
                )}
              </div>
            )}

            {sigTab === "draw" && (
              <div style={{ border:"1px solid #e5e7eb", borderRadius:10, overflow:"hidden" }}>
                <canvas ref={canvasRef} width={560} height={130}
                  style={{ display:"block", width:"100%", cursor:"crosshair", background:"#fafafa", touchAction:"none" }}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}/>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 10px" }}>
                  <span style={{ fontSize:12, color:"#9ca3af" }}>{hasDrawn ? "✓ Signature captured" : "Draw your signature above"}</span>
                  {hasDrawn && (
                    <button style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#dc2626", background:"none", border:"none", cursor:"pointer" }}
                      onClick={clearCanvas}><Trash2 size={12}/> Clear</button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* action buttons */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:4 }}>
            <button style={{ ...MO.actBtn, background:"#16a34a", color:"#fff" }}
              onClick={() => act("approve")} disabled={submitting}>
              <CheckCircle2 size={15}/> {submitting ? "Processing…" : "Approve"}
            </button>
            <button style={{ ...MO.actBtn, background:"#fef9c3", color:"#a16207" }}
              onClick={() => act("return")} disabled={submitting}>
              <RotateCcw size={15}/> Return
            </button>
            <button style={{ ...MO.actBtn, background:"#fef2f2", color:"#dc2626" }}
              onClick={() => act("reject")} disabled={submitting}>
              <XCircle size={15}/> Reject
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── modal styles ────────────────────────────────────────── */
const MO = {
  overlay:  { position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 },
  modal:    { background:"#fff", borderRadius:16, width:"100%", maxWidth:560, maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" },
  header:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"18px 22px 14px", borderBottom:"1px solid #f1f5f9", gap:10 },
  title:    { margin:0, fontSize:17, fontWeight:700, color:"#111827" },
  sub:      { margin:"3px 0 0", fontSize:12, color:"#6b7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  closeBtn: { background:"#f3f4f6", border:"none", borderRadius:8, cursor:"pointer", padding:6, display:"flex", color:"#374151", flexShrink:0 },
  body:     { overflowY:"auto", padding:"18px 22px 22px", display:"flex", flexDirection:"column", gap:14 },
  infoCard: { background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:12, padding:"14px 16px" },
  infoGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 20px" },
  iL:       { margin:0, fontSize:11, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.04em" },
  iV:       { margin:"2px 0 0", fontSize:13, fontWeight:600, color:"#111827" },
  err:      { background:"#fef2f2", color:"#dc2626", padding:"10px 14px", borderRadius:8, fontSize:13 },
  field:    { display:"flex", flexDirection:"column", gap:6 },
  label:    { fontSize:13, fontWeight:600, color:"#374151" },
  input:    { padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14, outline:"none", color:"#111827" },
  textarea: { padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14, outline:"none", color:"#111827", minHeight:68, resize:"vertical", fontFamily:"inherit" },
  sigTabs:  { display:"grid", gridTemplateColumns:"1fr 1fr", border:"1px solid #e5e7eb", borderRadius:10, overflow:"hidden" },
  sigTab:   { display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 0", border:"none", background:"#f9fafb", cursor:"pointer", fontSize:13, fontWeight:500, color:"#374151" },
  sigOn:    { background:"#fff", fontWeight:600, color:"#16a34a", boxShadow:"inset 0 -2px 0 #16a34a" },
  zone:     { border:"2px dashed #d1d5db", borderRadius:10, padding:"24px 16px", display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer", background:"#fafafa", gap:4 },
  chooseBtn:{ marginTop:8, padding:"7px 18px", border:"1px solid #d1d5db", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:13, color:"#374151" },
  actBtn:   { flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px 14px", borderRadius:9, border:"none", cursor:"pointer", fontSize:14, fontWeight:600, minWidth:90 },
};

/* ── ApprovePage ─────────────────────────────────────────── */
export default function ApprovePage() {
  const [proposals,    setProposals]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [reviewing,    setReviewing]    = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState("");
  const [error,        setError]        = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);

  const session  = getSession?.() || {};
  const userName = session?.name || "Approver";
  const initial  = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchProposals = () =>
    api.get("/approval/pending").then(r => setProposals(r.data)).finally(() => setLoading(false));

  useEffect(() => { fetchProposals(); }, []);

  const handleAct = async (payload) => {
    setError(""); setSubmitting(true);
    try {
      await api.post("/approval/act", { research_project_id: reviewing.id, ...payload });
      const label = payload.action === "approve" ? "Approved" : payload.action === "reject" ? "Rejected" : "Returned";
      setSuccess(`Proposal ${label} successfully!`);
      setReviewing(null);
      await fetchProposals();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    pending:  proposals.filter(p => !["Approved","Rejected"].includes(p.status)).length,
    approved: proposals.filter(p => p.status === "Approved").length,
    total:    proposals.length,
  };

  const ml = isMobile ? 0 : sidebarWidth;

  return (
    <>
      <style>{`
        .ap-stat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
        .ap-table { width:100%; border-collapse:collapse; }
        .ap-table th { padding:11px 14px; text-align:left; font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid #e5e7eb; background:#f9fafb; white-space:nowrap; }
        .ap-table td { padding:13px 14px; font-size:13px; color:#374151; vertical-align:middle; border-bottom:1px solid #f1f5f9; }
        .ap-table tr:last-child td { border-bottom:none; }
        .ap-table tr:hover td { background:#fafafa; }
        .ap-cards  { display:none; flex-direction:column; gap:12px; }
        @media(max-width:900px){ .ap-stat-grid { grid-template-columns:1fr 1fr; } }
        @media(max-width:600px){
          .ap-stat-grid  { grid-template-columns:1fr; }
          .ap-table-wrap { display:none; }
          .ap-cards      { display:flex; }
        }
      `}</style>

      <div style={{ display:"flex", minHeight:"100vh", background:"#f3f4f6" }}>
        <ApproverNavbar onWidthChange={setSidebarWidth} />

        <div style={{ marginLeft: ml, flex:1, display:"flex", flexDirection:"column", transition:"margin-left 0.22s ease", minWidth:0 }}>

          <Topbar title="Approvals" />
          {/* ── Body ── */}
          <div style={{ padding:"24px", flex:1 }}>

            {success && (
              <div style={{ background:"#dcfce7", color:"#15803d", padding:"12px 16px",
                borderRadius:10, marginBottom:20, fontSize:14, fontWeight:500 }}>
                {success}
              </div>
            )}

            {/* Stats */}
            <div className="ap-stat-grid">
              {[
                { label:"Pending Approval", value:stats.pending,  bg:"#fff7ed", border:"#fed7aa", color:"#c2410c" },
                { label:"Approved",         value:stats.approved, bg:"#f0fdf4", border:"#bbf7d0", color:"#15803d" },
                { label:"Total Proposals",  value:stats.total,    bg:"#eff6ff", border:"#bfdbfe", color:"#1d4ed8" },
              ].map(s => (
                <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:12, padding:"18px 22px" }}>
                  <p style={{ margin:0, fontSize:26, fontWeight:800, color:"#111827" }}>{s.value}</p>
                  <p style={{ margin:"4px 0 0", fontSize:13, color:"#6b7280" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", overflow:"hidden" }}>
              <div style={{ padding:"16px 22px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:"#111827" }}>Pending Proposals ({proposals.length})</h3>
              </div>

              {loading ? (
                <p style={{ padding:"24px", color:"#9ca3af", fontSize:14 }}>Loading…</p>
              ) : proposals.length === 0 ? (
                <div style={{ padding:"48px 24px", textAlign:"center" }}>
                  <FileText size={40} color="#d1d5db" style={{ margin:"0 auto 10px", display:"block" }}/>
                  <p style={{ color:"#9ca3af", fontSize:14, margin:0 }}>No proposals pending your action.</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="ap-table-wrap" style={{ overflowX:"auto" }}>
                    <table className="ap-table">
                      <thead>
                        <tr>
                          {["ID","Title","Researcher","Department","Date Submitted","Budget","Status","Actions"].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {proposals.map(p => {
                          const sb = SB[p.status] || { bg:"#f3f4f6", color:"#6b7280", border:"#e5e7eb" };
                          return (
                            <tr key={p.id}>
                              <td style={{ fontWeight:600, color:"#111827", whiteSpace:"nowrap" }}>
                                {p.reference_no || `PRJ-${String(p.id).padStart(3,"0")}`}
                              </td>
                              <td style={{ maxWidth:200 }}>
                                <p style={{ margin:0, fontWeight:500, color:"#111827" }}>{p.title}</p>
                                {p.average_score && (
                                  <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, color:"#7c3aed", marginTop:2 }}>
                                    <Star size={10} fill="#7c3aed" color="#7c3aed"/> {p.average_score}/100
                                  </span>
                                )}
                              </td>
                              <td>{p.submitted_by}</td>
                              <td>{p.department || "—"}</td>
                              <td style={{ whiteSpace:"nowrap" }}>{p.date_submitted || p.created_at?.slice(0,10) || "—"}</td>
                              <td style={{ whiteSpace:"nowrap" }}>₱{fmt(p.budget)}</td>
                              <td>
                                <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600,
                                  background:sb.bg, color:sb.color, border:`1px solid ${sb.border}`, whiteSpace:"nowrap" }}>
                                  {p.status}
                                </span>
                              </td>
                              <td>
                                <button onClick={() => { setError(""); setReviewing(p); }}
                                  style={{ display:"inline-flex", alignItems:"center", gap:6,
                                    padding:"7px 14px", borderRadius:8, border:"none",
                                    background:"#16a34a", color:"#fff",
                                    cursor:"pointer", fontSize:13, fontWeight:600 }}>
                                  <FileText size={14}/> Review
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="ap-cards" style={{ padding:"14px 16px" }}>
                    {proposals.map(p => {
                      const sb = SB[p.status] || { bg:"#f3f4f6", color:"#6b7280", border:"#e5e7eb" };
                      return (
                        <div key={p.id} style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:"14px 16px", background:"#fafafa" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, gap:10 }}>
                            <div style={{ minWidth:0 }}>
                              <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#111827", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title}</p>
                              <p style={{ margin:"2px 0 0", fontSize:12, color:"#6b7280" }}>{p.reference_no || `PRJ-${String(p.id).padStart(3,"0")}`}</p>
                            </div>
                            <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                              background:sb.bg, color:sb.color, border:`1px solid ${sb.border}`, whiteSpace:"nowrap", flexShrink:0 }}>
                              {p.status}
                            </span>
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px 12px", fontSize:12, color:"#6b7280", marginBottom:12 }}>
                            <span><b style={{ color:"#374151" }}>By:</b> {p.submitted_by}</span>
                            <span><b style={{ color:"#374151" }}>Dept:</b> {p.department || "—"}</span>
                            <span><b style={{ color:"#374151" }}>Budget:</b> ₱{fmt(p.budget)}</span>
                            <span><b style={{ color:"#374151" }}>Date:</b> {p.date_submitted || p.created_at?.slice(0,10) || "—"}</span>
                          </div>
                          <button onClick={() => { setError(""); setReviewing(p); }}
                            style={{ width:"100%", padding:"9px 0", borderRadius:9, border:"none",
                              background:"#16a34a", color:"#fff", fontWeight:600, fontSize:14,
                              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                            <FileText size={15}/> Review
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {reviewing && (
        <ReviewModal
          proposal={reviewing}
          onClose={() => setReviewing(null)}
          onAct={handleAct}
          submitting={submitting}
          error={error}
        />
      )}
    </>
  );
}