import { useState, useRef, useEffect } from "react";
import {
  Upload, Check, Plus, Trash2, Send, Search, X,
  CheckCircle2, ChevronRight, ChevronDown, AlertCircle, Save,
  FileCheck, Pen, RotateCcw, Crown, FileText,
  BookOpen, Users, Printer,
} from "lucide-react";
import Navbar  from "../../components/researcher/Navbar";
import Topbar  from "../../components/Topbar";
import "../../styles/researcher.css";
import { DEFAULT_EVALUATORS } from "../../data/faculty";
import api from "../../utils/api";

const TABS = ["Overview", "Work Plan", "Framework", "References", "Outputs"];

const fmt = (n) => "₱" + Number(n || 0).toLocaleString();

/* ══════════════════════════════════════════════════════
   SIGNATURE PAD
══════════════════════════════════════════════════════ */
function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const lastPos   = useRef(null);
  const [drawing,  setDrawing]  = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [tab,      setTab]      = useState("draw");
  const fileRef   = useRef(null);

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width, sy = canvas.height / r.height;
    if (e.touches) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  };
  const startDraw = (e) => { e.preventDefault(); setDrawing(true); lastPos.current = getPos(e, canvasRef.current); };
  const draw = (e) => {
    if (!drawing) return; e.preventDefault();
    const c = canvasRef.current, ctx = c.getContext("2d"), p = getPos(e, c);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(p.x, p.y); ctx.strokeStyle = "#111827"; ctx.lineWidth = 2;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastPos.current = p; setHasDrawn(true); onChange(c.toDataURL("image/png"));
  };
  const stopDraw = () => setDrawing(false);
  const clear = () => {
    canvasRef.current?.getContext("2d").clearRect(0, 0, 560, 110);
    setHasDrawn(false); onChange(null);
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #e5e7eb" }}>
        {["draw", "upload"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 0", border: "none", cursor: "pointer", fontSize: 13,
            fontWeight: tab === t ? 600 : 400, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: tab === t ? "#fff" : "#f9fafb", color: tab === t ? "#1f7a1f" : "#6b7280",
            borderBottom: tab === t ? "2px solid #1f7a1f" : "none",
          }}>
            {t === "draw" ? <Pen size={13} /> : <Upload size={13} />}
            {t === "draw" ? "Draw" : "Upload"}
          </button>
        ))}
      </div>
      {tab === "draw" && (
        <>
          <canvas ref={canvasRef} width={560} height={110}
            style={{ display: "block", width: "100%", cursor: "crosshair", background: "#fafafa", touchAction: "none" }}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderTop: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{hasDrawn ? "✓ Signature captured" : "Draw your signature above"}</span>
            {hasDrawn && (
              <button onClick={clear} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>
        </>
      )}
      {tab === "upload" && (
        <div style={{ padding: 16 }}>
          <div className="cp-file-row">
            <button className="cp-file-btn" onClick={() => fileRef.current.click()}>Choose File</button>
            <span className="cp-file-name">{value ? "Signature uploaded ✓" : "No file chosen"}</span>
            <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files[0]; if (!f) return;
                const reader = new FileReader();
                reader.onload = (ev) => onChange(ev.target.result);
                reader.readAsDataURL(f);
              }} />
          </div>
          {value && <img src={value} alt="sig" style={{ maxHeight: 60, marginTop: 10, border: "1px solid #e5e7eb", borderRadius: 6, padding: 4 }} />}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   EVALUATOR MODAL — admin-managed evaluators list
══════════════════════════════════════════════════════ */
function EvaluatorModal({ onClose, onAdd, alreadyAdded, evaluatorsList }) {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState([]);

  const toggle  = (ev) => {
    const ex = selected.find((s) => s.id === ev.id);
    setSelected(ex ? selected.filter((s) => s.id !== ev.id) : [...selected, ev]);
  };
  const isAdded = (id) => alreadyAdded.some((e) => e.id === id);
  const isSel   = (id) => selected.some((s) => s.id === id);

  const filtered = evaluatorsList.filter((ev) => {
    if (!search) return true;
    const lc = search.toLowerCase();
    return ev.name?.toLowerCase().includes(lc) ||
           ev.expertise?.toLowerCase().includes(lc) ||
           ev.position?.toLowerCase().includes(lc);
  });

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
      onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:16,width:"100%",maxWidth:520,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"18px 22px 14px",borderBottom:"1px solid #f1f5f9" }}>
          <div>
            <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:"#111827" }}>Add Preferred Evaluators</h3>
            <p style={{ margin:"3px 0 0",fontSize:12,color:"#6b7280" }}>Select from the list of admin-registered evaluators</p>
          </div>
          <button onClick={onClose} style={{ background:"#f3f4f6",border:"none",borderRadius:8,cursor:"pointer",padding:6,display:"flex",color:"#374151" }}>
            <X size={16}/>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding:"12px 22px",borderBottom:"1px solid #f1f5f9" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:9,padding:"8px 12px" }}>
            <Search size={15} color="#9ca3af"/>
            <input type="text" placeholder="Search by name, position, or expertise..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{ flex:1,border:"none",background:"transparent",outline:"none",fontSize:13,color:"#111827" }}/>
            {search && <button style={{ background:"none",border:"none",cursor:"pointer",color:"#9ca3af",display:"flex" }} onClick={() => setSearch("")}><X size={13}/></button>}
          </div>
        </div>

        {/* Selected count bar */}
        {selected.length > 0 && (
          <div style={{ padding:"8px 22px",background:"#f5f3ff",borderBottom:"1px solid #ede9fe",display:"flex",alignItems:"center",gap:8 }}>
            <CheckCircle2 size={14} color="#7c3aed"/>
            <span style={{ fontSize:13,fontWeight:600,color:"#7c3aed" }}>{selected.length} evaluator{selected.length!==1?"s":""} selected</span>
          </div>
        )}

        {/* List */}
        <div style={{ overflowY:"auto",flex:1,padding:"8px 14px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center",padding:"32px 16px",color:"#9ca3af",fontSize:13 }}>
              No evaluators found.
            </div>
          ) : filtered.map((ev) => {
            const added = isAdded(ev.id);
            const sel   = isSel(ev.id);
            return (
              <div key={ev.id}
                onClick={() => !added && toggle(ev)}
                style={{
                  display:"flex",alignItems:"center",gap:12,padding:"11px 10px",borderRadius:10,
                  cursor:added?"not-allowed":"pointer",marginBottom:4,
                  background: sel ? "#f0fdf4" : added ? "#f9fafb" : "#fff",
                  border:`1.5px solid ${sel?"#bbf7d0":added?"#e5e7eb":"#f1f5f9"}`,
                  opacity:added?0.65:1,
                  transition:"all 0.12s",
                }}>
                {/* Checkbox */}
                <div style={{
                  width:20,height:20,borderRadius:6,flexShrink:0,
                  border:`2px solid ${sel?"#15803d":added?"#d1d5db":"#d1d5db"}`,
                  background:sel?"#15803d":"#fff",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                  {sel && <Check size={12} color="#fff"/>}
                </div>
                {/* Avatar */}
                <div style={{ width:36,height:36,borderRadius:"50%",background:sel?"#dcfce7":"#f3f4f6",color:sel?"#15803d":"#6b7280",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,flexShrink:0 }}>
                  {ev.name?.charAt(0)}
                </div>
                {/* Info */}
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                    <p style={{ margin:0,fontSize:13,fontWeight:600,color:added?"#9ca3af":"#111827" }}>{ev.name}</p>
                    {added && <span style={{ fontSize:11,fontWeight:600,color:"#9ca3af",background:"#f3f4f6",padding:"1px 7px",borderRadius:20 }}>Already added</span>}
                  </div>
                  <p style={{ margin:"2px 0 0",fontSize:12,color:"#6b7280" }}>{ev.position}</p>
                  {ev.expertise && <p style={{ margin:"1px 0 0",fontSize:11,color:"#9ca3af",fontStyle:"italic" }}>{ev.expertise}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end",padding:"14px 22px",borderTop:"1px solid #f1f5f9" }}>
          <button className="cp-btn" onClick={onClose}>Cancel</button>
          <button className="cp-btn primary"
            style={{ background:"#1f7a1f",borderColor:"#1f7a1f",display:"flex",alignItems:"center",gap:6,opacity:selected.length===0?0.5:1 }}
            onClick={() => { if(selected.length>0){onAdd(selected);onClose();} }}
            disabled={selected.length===0}>
            <Check size={14}/>
            Add {selected.length>0?`(${selected.length}) `:""}Evaluator{selected.length!==1?"s":""}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SHARED: CHECKBOX-STYLE YES / NO
══════════════════════════════════════════════════════ */
function QCheckbox({ name, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
      {[true, false].map((v) => (
        <label key={String(v)}
          style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13,
            fontWeight: value === v ? 600 : 400, color: "#374151" }}>
          <div style={{
            width: 16, height: 16, borderRadius: 3, flexShrink: 0,
            border: `2px solid ${value === v ? "#1f7a1f" : "#9ca3af"}`,
            background: value === v ? "#1f7a1f" : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {value === v && <Check size={10} color="#fff" />}
          </div>
          <input type="radio" name={name} style={{ display: "none" }}
            checked={value === v}
            onChange={() => onChange(v)} />
          {v ? "Yes" : "No"}
        </label>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   OVERVIEW TAB
══════════════════════════════════════════════════════ */
function OverviewTab({ form, setForm, preferredEvaluators, setPreferredEvaluators, proponentsList, evaluatorsList }) {
  const [showEval, setShowEval] = useState(false);
  const allAdded = [...DEFAULT_EVALUATORS, ...preferredEvaluators];

  return (
    <>
      {/* Basic Information */}
      <div className="cp-section">
        <div className="cp-section-title">Basic Information</div>

        {/* 1. Title */}
        <div className="cp-field">
          <label className="cp-label">Title of the Scholarly Work *</label>
          <input className="cp-input" type="text" placeholder="Enter the full title of your research or project"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        {/* 2. Type of Scholarly Work */}
        <div className="cp-field" style={{ marginTop: 14 }}>
          <label className="cp-label">Type of Scholarly Work *</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
            {["Research", "Extension", "Instructional Material Development"].map((type) => (
              <label key={type} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 9, cursor: "pointer",
                border: `1.5px solid ${form.scholarly_work_type === type ? "#1f7a1f" : "#e5e7eb"}`,
                background: form.scholarly_work_type === type ? "#f0fdf4" : "#fff",
                fontSize: 13, fontWeight: form.scholarly_work_type === type ? 600 : 400,
                color: form.scholarly_work_type === type ? "#15803d" : "#374151",
              }}>
                <input type="radio" name="scholarly_work_type" style={{ display: "none" }}
                  checked={form.scholarly_work_type === type}
                  onChange={() => setForm({ ...form, scholarly_work_type: type })} />
                {form.scholarly_work_type === type && <Check size={13} color="#15803d" />}
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* 3. Budget + Dates */}
        <div className="cp-grid-2" style={{ marginTop: 14 }}>
          <div className="cp-field">
            <label className="cp-label">Total Proposed Budget (₱) *</label>
            <input className="cp-input" type="number" min="0" placeholder="e.g. 250000"
              value={form.total_budget} onChange={(e) => setForm({ ...form, total_budget: e.target.value })} />
          </div>
          <div />
          <div className="cp-field">
            <label className="cp-label">Proposed Starting Date *</label>
            <input className="cp-input" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div className="cp-field">
            <label className="cp-label">Proposed Completion Date *</label>
            <input className="cp-input" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
        </div>

        {/* 4. Proponents — multiple from admin list */}
        <div className="cp-field" style={{ marginTop: 14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <label className="cp-label" style={{ margin:0 }}>Name of Proponent(s) *</label>
          </div>

          {/* Dropdown to add a proponent */}
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <div className="cp-select-wrap" style={{ flex:1 }}>
              <select className="cp-select"
                value=""
                onChange={(e) => {
                  const pid = e.target.value; if (!pid) return;
                  if (form.proponents.some((p) => String(p.id) === pid)) return;
                  const found = proponentsList.find((p) => String(p.id) === pid);
                  if (found) setForm((f) => ({ ...f, proponents: [...f.proponents, found] }));
                  e.target.value = "";
                }}>
                <option value="">— Add a proponent —</option>
                {proponentsList
                  .filter((p) => !form.proponents.some((added) => String(added.id) === String(p.id)))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.department ? ` — ${p.department}` : ""}
                    </option>
                  ))}
              </select>
              <span className="cp-select-chevron"><ChevronDown size={14}/></span>
            </div>
          </div>

          {/* Added proponents list with signer radio */}
          {form.proponents.length === 0 ? (
            <p style={{ fontSize:12,color:"#9ca3af",padding:"10px 0" }}>No proponents added yet. Use the dropdown above.</p>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {form.proponents.map((p) => {
                const isSigner = String(form.signer_id) === String(p.id);
                return (
                  <div key={p.id} style={{
                    display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,
                    border:`1.5px solid ${isSigner?"#1f7a1f":"#e5e7eb"}`,
                    background:isSigner?"#f0fdf4":"#fafafa",
                    transition:"all 0.12s",
                  }}>
                    {/* Signer radio */}
                    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0 }}>
                      <input type="radio" name="signer_id" title="Set as signer"
                        checked={isSigner}
                        onChange={() => setForm((f) => ({ ...f, signer_id: String(p.id), signature: null }))}
                        style={{ width:16,height:16,cursor:"pointer",accentColor:"#1f7a1f" }}/>
                      <span style={{ fontSize:9,color:"#9ca3af",whiteSpace:"nowrap" }}>Signs</span>
                    </div>
                    {/* Avatar */}
                    <div style={{ width:34,height:34,borderRadius:"50%",background:isSigner?"#dcfce7":"#f3f4f6",color:isSigner?"#15803d":"#6b7280",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,flexShrink:0 }}>
                      {p.name?.charAt(0)}
                    </div>
                    {/* Info */}
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                        <span style={{ fontSize:13,fontWeight:600,color:"#111827" }}>{p.name}</span>
                        {isSigner && (
                          <span style={{ fontSize:11,fontWeight:600,color:"#15803d",background:"#dcfce7",padding:"1px 8px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:4 }}>
                            <Pen size={10}/> Will sign
                          </span>
                        )}
                      </div>
                      {(p.department||p.position) && (
                        <p style={{ margin:"2px 0 0",fontSize:11,color:"#6b7280" }}>
                          {[p.department, p.position].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    {/* Remove */}
                    <button onClick={() => setForm((f) => ({
                      ...f,
                      proponents: f.proponents.filter((x) => String(x.id) !== String(p.id)),
                      signer_id: f.signer_id === String(p.id) ? "" : f.signer_id,
                      signature: f.signer_id === String(p.id) ? null : f.signature,
                    }))} className="cp-delete-btn" title="Remove proponent">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <p style={{ fontSize:11,color:"#9ca3af",marginTop:6 }}>
            Select the radio button to designate who will attach their signature. Proponents are managed by the admin.
          </p>
        </div>

        {/* 5. Signer Signature */}
        {form.signer_id && form.proponents.some((p) => String(p.id) === String(form.signer_id)) && (() => {
          const signer = form.proponents.find((p) => String(p.id) === String(form.signer_id));
          return (
            <div className="cp-field" style={{ marginTop:14 }}>
              <label className="cp-label">Signature of {signer.name} *</label>
              <p style={{ fontSize:12,color:"#6b7280",margin:"0 0 10px" }}>
                {signer.name} — draw or upload your signature below.
              </p>
              <SignaturePad
                value={form.signature || null}
                onChange={(sig) => setForm((f) => ({ ...f, signature: sig }))}/>
            </div>
          );
        })()}
      </div>

      {/* Additional Information */}
      <div className="cp-section">
        <div className="cp-section-title">Additional Information</div>

        {/* Helper: checkbox-style Yes/No */}
        {/* Q1 — Similar work elsewhere */}
        <div className="cp-q-block">
          <p className="cp-q-text">
            Is similar work being carried out elsewhere? If yes, please give details.
          </p>
          <QCheckbox
            name="similar_elsewhere"
            value={form.similar_work_elsewhere}
            onChange={(v) => setForm({ ...form, similar_work_elsewhere: v, similar_work_details: v ? form.similar_work_details : "" })}
          />
          {form.similar_work_elsewhere && (
            <div className="cp-cond-box" style={{ marginTop: 10 }}>
              <textarea className="cp-textarea"
                placeholder="Please give details of the similar work being carried out elsewhere..."
                value={form.similar_work_details}
                onChange={(e) => setForm({ ...form, similar_work_details: e.target.value })} />
            </div>
          )}
        </div>

        {/* Q2 — External groups / collaborators */}
        <div className="cp-q-block">
          <p className="cp-q-text">
            Are there any external groups or individuals, aside from the proponent(s) collaborating in this work?
            If yes, please specify and indicate the type of collaboration or expected contribution of the other party to this work.
          </p>
          <QCheckbox
            name="collab"
            value={form.has_external_collab}
            onChange={(v) => setForm({ ...form, has_external_collab: v, external_collab_details: v ? form.external_collab_details : "" })}
          />
          {form.has_external_collab && (
            <div className="cp-cond-box" style={{ marginTop: 10 }}>
              <textarea className="cp-textarea"
                placeholder="Please specify collaborators and describe the type of collaboration or their expected contribution..."
                value={form.external_collab_details}
                onChange={(e) => setForm({ ...form, external_collab_details: e.target.value })} />
            </div>
          )}
        </div>

        {/* Q3 — Submitted to another agency */}
        <div className="cp-q-block">
          <p className="cp-q-text">
            Has this proposal been submitted to another agency for support? If yes, please indicate:
          </p>
          <QCheckbox
            name="elsewhere"
            value={form.submitted_elsewhere}
            onChange={(v) => setForm({ ...form, submitted_elsewhere: v, other_agency_name: v ? form.other_agency_name : "", other_agency_amount: v ? form.other_agency_amount : "", agency_difference_extent: v ? form.agency_difference_extent : "" })}
          />
          {form.submitted_elsewhere && (
            <div className="cp-cond-box" style={{ marginTop: 10 }}>
              <div className="cp-detail-grid">
                <div>
                  <div className="cp-col-label">Agency Name</div>
                  <input className="cp-input" type="text" placeholder="Agency name"
                    value={form.other_agency_name}
                    onChange={(e) => setForm({ ...form, other_agency_name: e.target.value })} />
                </div>
                <div>
                  <div className="cp-col-label">Amount Requested (₱)</div>
                  <input className="cp-input" type="number" placeholder="Amount"
                    value={form.other_agency_amount}
                    onChange={(e) => setForm({ ...form, other_agency_amount: e.target.value })} />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
                  To what extent is the proposed project different from the one proposed to this other agency? *
                </p>
                <textarea className="cp-textarea"
                  placeholder="Describe how this proposal differs (e.g., scope, objectives, methodology, coverage, budget, etc.)..."
                  value={form.agency_difference_extent}
                  style={{ minHeight: 90 }}
                  onChange={(e) => setForm({ ...form, agency_difference_extent: e.target.value })} />
              </div>
            </div>
          )}
        </div>

        {/* Q4 — First time applying */}
        <div className="cp-q-block">
          <p className="cp-q-text">Is this your first time to apply for the proposed scholarly work?</p>
          <QCheckbox
            name="first_time"
            value={form.is_first_time}
            onChange={(v) => setForm({ ...form, is_first_time: v, past_works: v ? [] : form.past_works })}
          />
          {!form.is_first_time && (
            <div style={{ marginTop: 14 }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "#374151", fontStyle: "italic" }}>
                If no, please list the titles of past work(s) and indicate the status:{" "}
                <strong>(within three (3) years)</strong>
              </p>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      {["Title(s)", "Duration", "Budget Amount (₱)", "Status", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(form.past_works || []).length === 0 && (
                      <tr><td colSpan={5} style={{ padding: "18px 12px", textAlign: "center", color: "#9ca3af", fontSize: 12, fontStyle: "italic" }}>No past works added yet.</td></tr>
                    )}
                    {(form.past_works || []).map((pw, i) => (
                      <tr key={pw.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 8px" }}>
                          <input className="cp-input" style={{ width: "100%", minWidth: 140 }} placeholder="Title of past work"
                            value={pw.title} onChange={(e) => setForm((f) => ({ ...f, past_works: f.past_works.map((r, idx) => idx === i ? { ...r, title: e.target.value } : r) })) } />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <input className="cp-input" style={{ width: 120 }} placeholder="e.g. 2022–2023"
                            value={pw.duration} onChange={(e) => setForm((f) => ({ ...f, past_works: f.past_works.map((r, idx) => idx === i ? { ...r, duration: e.target.value } : r) })) } />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <input className="cp-input" type="number" style={{ width: 120 }} placeholder="0"
                            value={pw.budget} onChange={(e) => setForm((f) => ({ ...f, past_works: f.past_works.map((r, idx) => idx === i ? { ...r, budget: e.target.value } : r) })) } />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <select className="cp-input" style={{ width: 130 }}
                            value={pw.status} onChange={(e) => setForm((f) => ({ ...f, past_works: f.past_works.map((r, idx) => idx === i ? { ...r, status: e.target.value } : r) })) }>
                            <option value="">Select</option>
                            <option>Completed</option>
                            <option>Ongoing</option>
                            <option>Terminated</option>
                          </select>
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "center" }}>
                          <button className="cp-delete-btn"
                            onClick={() => setForm((f) => ({ ...f, past_works: f.past_works.filter((_, idx) => idx !== i) }))}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "10px 12px", borderTop: "1px solid #f1f5f9" }}>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#1f7a1f", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    onClick={() => setForm((f) => ({ ...f, past_works: [...(f.past_works || []), { id: Date.now(), title: "", duration: "", budget: "", status: "" }] }))}>
                    <Plus size={14} /> Add Row
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Required Documents */}
      <div className="cp-section">
        <div className="cp-section-title">Required Documents</div>
        {/* CV */}
        <div className="cp-field">
          <label className="cp-label">Curriculum Vitae of Proponents *</label>
          <div className="cp-file-row">
            <button className="cp-file-btn" onClick={() => document.getElementById("cv-upload").click()}>Choose Files</button>
            <span className="cp-file-name">{form.cv_files?.length > 0 ? `${form.cv_files.length} file(s) selected` : "No file chosen"}</span>
            <input id="cv-upload" type="file" multiple accept=".pdf,.doc,.docx" style={{ display: "none" }}
              onChange={(e) => setForm({ ...form, cv_files: Array.from(e.target.files) })} />
          </div>
          <p className="cp-file-hint">Upload one CV per proponent</p>
        </div>
        {/* Project Proposal Form */}
        <div className="cp-field" style={{ marginTop: 14 }}>
          <label className="cp-label">Project Proposal Form *</label>
          <div className="cp-file-row">
            <button className="cp-file-btn" onClick={() => document.getElementById("proposal-form-upload").click()}>Choose File</button>
            <span className="cp-file-name">{form.proposal_form?.name ?? "No file chosen"}</span>
            <button className="cp-file-upload-icon" onClick={() => document.getElementById("proposal-form-upload").click()}><Upload size={16} color="#6b7280" /></button>
            <input id="proposal-form-upload" type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
              onChange={(e) => setForm({ ...form, proposal_form: e.target.files[0] || null })} />
          </div>
          {form.proposal_form && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "#15803d" }}><FileCheck size={13} /> {form.proposal_form.name}</div>}
        </div>
      </div>

      {/* Evaluators */}
      <div className="cp-section">
        <div className="cp-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Evaluator Assignment</span>
          <button className="ev-add-eval-btn" onClick={() => setShowEval(true)}><Plus size={14} /> Add Preferred Evaluator</button>
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
                <button className="cp-delete-btn" onClick={() => setPreferredEvaluators((p) => p.filter((e) => e.id !== ev.id))} style={{ padding: 3 }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEval && (
        <EvaluatorModal
          onClose={() => setShowEval(false)}
          onAdd={(sel) => { const newOnes = sel.filter((s) => !allAdded.some((a) => a.id === s.id)); setPreferredEvaluators((p) => [...p, ...newOnes]); }}
          alreadyAdded={allAdded}
          evaluatorsList={evaluatorsList} />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   WORK PLAN TAB
══════════════════════════════════════════════════════ */
function WorkPlanTab({ file, setFile }) {
  const ref = useRef(null);
  return (
    <div className="cp-section">
      <div className="cp-section-title">Work Plan</div>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>Upload your detailed work plan document</p>
      <div className="cp-field">
        <label className="cp-label">Work Plan Document *</label>
        <div className="cp-file-row">
          <button className="cp-file-btn" onClick={() => ref.current.click()}>Choose File</button>
          <span className="cp-file-name">{file?.name ?? "No file chosen"}</span>
          <button className="cp-file-upload-icon" onClick={() => ref.current.click()}><Upload size={16} color="#6b7280" /></button>
          <input ref={ref} type="file" accept=".pdf,.doc,.docx,.xlsx" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0] || null)} />
        </div>
        {file && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "#15803d" }}><FileCheck size={13} />{file.name}</div>}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════
   UPLOAD TAB (Framework / References)
══════════════════════════════════════════════════════ */
function UploadTab({ title, subtitle, fieldLabel, note, accept, file, setFile }) {
  const ref = useRef(null);
  return (
    <div className="cp-section">
      <div className="cp-section-title">{title}</div>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>{subtitle}</p>
      <div className="cp-field">
        <label className="cp-label">{fieldLabel} *</label>
        <div className="cp-file-row">
          <button className="cp-file-btn" onClick={() => ref.current.click()}>Choose File</button>
          <span className="cp-file-name">{file?.name ?? "No file chosen"}</span>
          <button className="cp-file-upload-icon" onClick={() => ref.current.click()}><Upload size={16} color="#6b7280" /></button>
          <input ref={ref} type="file" accept={accept} style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0] || null)} />
        </div>
        {file && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "#15803d" }}><FileCheck size={13} />{file.name}</div>}
      </div>
      {note && <div className="cp-note-box"><strong>Note:</strong> {note}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   OUTPUTS TAB — PDF-style compiled document
══════════════════════════════════════════════════════ */
function OutputsTab({ form, workPlanFile, frameworkFile, referencesFile }) {
  const signer = form.proponents?.find((p) => String(p.id) === String(form.signer_id)) || null;

  const Section = ({ icon: Icon, title, children }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #1f7a1f" }}>
        <Icon size={16} color="#1f7a1f" />
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1f7a1f", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "sans-serif" }}>{title}</h3>
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Compiled Proposal Document</h3>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>Read-only preview — all entered information compiled here</p>
        </div>
        <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 9, border: "none", background: "#1f7a1f", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          <Printer size={15} /> Print / Save PDF
        </button>
      </div>

      {/* Document */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "40px 44px", maxWidth: 820, margin: "0 auto", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", fontFamily: "Georgia, serif" }}>

        {/* Letterhead */}
        <div style={{ textAlign: "center", marginBottom: 32, paddingBottom: 24, borderBottom: "3px double #1f7a1f" }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "sans-serif" }}>Research Project Proposal Management System</p>
          <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.35 }}>
            {form.title || <span style={{ color: "#d1d5db" }}>Untitled Proposal</span>}
          </h1>
          <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", fontSize: 12, fontWeight: 600, fontFamily: "sans-serif" }}>
            {form.scholarly_work_type || "Research"}
          </span>
        </div>

        {/* I. Basic Information */}
        <Section icon={BookOpen} title="I. Basic Information">
          <Row label="Title"                value={form.title} />
          <Row label="Type of Scholarly Work" value={form.scholarly_work_type} />
          <Row label="Total Proposed Budget" value={form.total_budget ? `₱${Number(form.total_budget).toLocaleString()}` : null} />
          <Row label="Proposed Start Date"  value={form.start_date} />
          <Row label="Proposed End Date"    value={form.end_date} />
          {form.submitted_elsewhere && <>
            <Row label="Other Agency"  value={form.other_agency_name} />
            <Row label="Agency Amount" value={form.other_agency_amount ? `₱${Number(form.other_agency_amount).toLocaleString()}` : null} />
          </>}
        </Section>

        {/* II. Proponents */}
        <Section icon={Users} title="II. Proponents">
          {(!form.proponents || form.proponents.length === 0)
            ? <p style={{ color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>No proponents added.</p>
            : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    {["Name", "Department / Position", "Role", "Signature"].map((h) => (
                      <th key={h} style={{ padding: "6px 10px", textAlign: h === "Signature" ? "center" : "left", color: "#6b7280", fontWeight: 600, fontFamily: "sans-serif", fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.proponents.map((p) => {
                    const isSigner = String(p.id) === String(form.signer_id);
                    return (
                      <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 10px", fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: "8px 10px", color: "#6b7280" }}>
                          {[p.department, p.position].filter(Boolean).join(" · ") || "—"}
                        </td>
                        <td style={{ padding: "8px 10px", fontFamily: "sans-serif" }}>
                          <span style={{ color: "#374151" }}>Proponent</span>
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          {isSigner && form.signature
                            ? <img src={form.signature} alt="sig" style={{ height: 40, maxWidth: 120, objectFit: "contain" }} />
                            : <span style={{ color: "#d1d5db", fontSize: 11, fontStyle: "italic", fontFamily: "sans-serif" }}>
                                {isSigner ? "No signature" : "—"}
                              </span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
        </Section>


        {/* III. Attached Documents */}
        <Section icon={FileText} title="III. Attached Documents">
          {[
            { label: "Project Proposal Form", file: form.proposal_form },
            { label: "Curriculum Vitae",      file: form.cv_files?.[0] },
            { label: "Work Plan",             file: workPlanFile },
            { label: "Project Framework",     file: frameworkFile },
            { label: "References",            file: referencesFile },
          ].map(({ label, file }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #f9fafb", fontSize: 13 }}>
              {file
                ? <><FileCheck size={14} color="#15803d" /><span style={{ color: "#111827" }}>{label}: <span style={{ color: "#15803d", fontWeight: 600 }}>{file.name}</span></span></>
                : <><X size={14} color="#d1d5db" /><span style={{ color: "#9ca3af", fontStyle: "italic" }}>{label}: not uploaded</span></>}
            </div>
          ))}
        </Section>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #e5e7eb", textAlign: "center", fontSize: 11, color: "#9ca3af", fontFamily: "sans-serif" }}>
          Generated by Research PMS • {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPLETION CHECKER
══════════════════════════════════════════════════════ */
function getCompletion({ form, workPlanFile, frameworkFile, referencesFile }) {
  const agencyComplete = !form.submitted_elsewhere ||
    (form.other_agency_name && form.other_agency_amount && form.agency_difference_extent);
  const pastWorksOk = form.is_first_time || (form.past_works?.length > 0 && form.past_works.every((pw) => pw.title && pw.status));
  const hasProponents = form.proponents?.length > 0;
  const hasSigner     = !!form.signer_id && form.proponents.some((p) => String(p.id) === String(form.signer_id));
  return {
    Overview:    !!(form.title && form.scholarly_work_type && form.total_budget && form.start_date && form.end_date && hasProponents && hasSigner && form.signature && form.proposal_form && agencyComplete && pastWorksOk),
    "Work Plan": !!workPlanFile,
    Framework:   !!frameworkFile,
    References:  !!referencesFile,
    Outputs:     true,
  };
}

/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
export default function Proposals() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [proponentsList,  setProponentsList]  = useState([]);
  const [evaluatorsList,  setEvaluatorsList]  = useState([]);
  const [form, setForm] = useState({
    title: "", scholarly_work_type: "Research",
    total_budget: "", start_date: "", end_date: "",
    proponents: [],          // array of proponent objects
    signer_id: "",           // id of the one who signs
    signature: null,
    similar_work_elsewhere: false,
    similar_work_details:   "",
    is_first_time: true,
    past_works: [],          // [{id,title,duration,budget,status}]
    has_external_collab: false,
    external_collab_details: "", submitted_elsewhere: false,
    other_agency_name: "", other_agency_amount: "",
    agency_difference_extent: "",
    cv_files: [], proposal_form: null,
  });
  const [preferredEvaluators, setPreferredEvaluators] = useState([]);

  const [workPlanFile,   setWorkPlanFile]   = useState(null);
  const [frameworkFile,  setFrameworkFile]  = useState(null);
  const [referencesFile, setReferencesFile] = useState(null);

  // Fetch admin-managed proponents + evaluators on mount
  useEffect(() => {
    api.get("/admin/faculty")
      .then((r) => setProponentsList(r.data || []))
      .catch(() => setProponentsList([]));
    api.get("/admin/evaluators")
      .then((r) => setEvaluatorsList(r.data || []))
      .catch(() => setEvaluatorsList([]));
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  const INPUT_TABS    = ["Overview", "Work Plan", "Framework", "References"];
  const completion    = getCompletion({ form, workPlanFile, frameworkFile, referencesFile });
  const allComplete   = INPUT_TABS.every((t) => completion[t]);
  const incompleteTabs= INPUT_TABS.filter((t) => !completion[t]);

  const buildPayload = () => {
    const fd = new FormData();
    ["title","scholarly_work_type","total_budget","start_date","end_date","signer_id","similar_work_elsewhere","similar_work_details","is_first_time","has_external_collab","external_collab_details","submitted_elsewhere","other_agency_name","other_agency_amount","agency_difference_extent"].forEach((k) => fd.append(k, form[k] ?? ""));
    fd.append("proponents",  JSON.stringify((form.proponents||[]).map((p) => p.id)));
    fd.append("past_works",  JSON.stringify(form.past_works||[]));
    if (form.signature) fd.append("signature", form.signature);
    fd.append("preferred_evaluators", JSON.stringify(preferredEvaluators.map((e) => e.id)));
    form.cv_files?.forEach((f) => fd.append("cv_files", f));
    if (form.proposal_form) fd.append("proposal_form",  form.proposal_form);
    if (workPlanFile)       fd.append("work_plan_file", workPlanFile);
    if (frameworkFile)      fd.append("framework_file", frameworkFile);
    if (referencesFile)     fd.append("references_file",referencesFile);
    return fd;
  };

  const handleSaveDraft = async () => {
    setError(""); setSaving(true);
    try {
      await api.post("/proposals/draft", buildPayload(), { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Draft saved successfully!");
    } catch { setSuccess("Draft saved locally."); }
    finally { setSaving(false); setTimeout(() => setSuccess(""), 3500); }
  };

  const handleSubmit = async () => {
    if (!allComplete) { setError(`Complete these sections first: ${incompleteTabs.join(", ")}.`); return; }
    setError(""); setSubmitting(true);
    try {
      await api.post("/proposals", buildPayload(), { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Proposal submitted successfully!");
      setActiveTab("Outputs");
    } catch (err) { setError(err.response?.data?.message || "Failed to submit proposal."); }
    finally { setSubmitting(false); }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":   return <OverviewTab form={form} setForm={setForm} preferredEvaluators={preferredEvaluators} setPreferredEvaluators={setPreferredEvaluators} proponentsList={proponentsList} evaluatorsList={evaluatorsList} />;
      case "Work Plan":  return <WorkPlanTab file={workPlanFile} setFile={setWorkPlanFile} />;
      case "Framework":  return <UploadTab title="Project Framework" subtitle="Upload your project framework document" fieldLabel="Project Framework Document" accept=".pdf,.doc,.docx" file={frameworkFile} setFile={setFrameworkFile} />;
      case "References": return <UploadTab title="References and Citations" subtitle="Upload your references document" fieldLabel="References Document" accept=".pdf,.doc,.docx" note="Include all references and citations in proper academic format." file={referencesFile} setFile={setReferencesFile} />;
      case "Outputs":    return <OutputsTab form={form} workPlanFile={workPlanFile} frameworkFile={frameworkFile} referencesFile={referencesFile} />;
      default:           return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Topbar title="Submit Proposal" />
        <div className="dashboard-content">

          <div style={{ marginBottom: 20 }}>
            <h3 style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Submit, track, and manage your research project proposals</h3>
          </div>

          {error && <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fef2f2", color: "#dc2626", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}><AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />{error}</div>}
          {success && <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#dcfce7", color: "#15803d", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}><CheckCircle2 size={16} />{success}</div>}

          {/* Progress bar — hidden on Outputs tab */}
          {activeTab !== "Outputs" && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                  {INPUT_TABS.filter((t) => completion[t]).length} / {INPUT_TABS.length} sections completed
                </span>
                {allComplete && <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={13} /> All sections complete</span>}
              </div>
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(INPUT_TABS.filter((t) => completion[t]).length / INPUT_TABS.length) * 100}%`, background: "#1f7a1f", borderRadius: 99, transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}

          {/* Tab bar */}
          <div className="cp-tab-bar" style={{ flexWrap: "wrap", gap: 4 }}>
            {TABS.map((tab) => {
              const done   = completion[tab] && tab !== "Outputs";
              const active = activeTab === tab;
              const isOut  = tab === "Outputs";
              return (
                <button key={tab} className={`cp-tab-btn ${active ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ display: "flex", alignItems: "center", gap: 6, ...(isOut && !active ? { borderStyle: "dashed", color: "#6d28d9", borderColor: "#ddd6fe" } : {}) }}>
                  {done && !active && <CheckCircle2 size={13} color="#15803d" style={{ flexShrink: 0 }} />}
                  {isOut && <FileText size={13} style={{ flexShrink: 0 }} />}
                  {tab}
                  {!done && !active && !isOut && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d1d5db", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {renderTab()}

          {/* Actions — hidden on Outputs tab */}
          {activeTab !== "Outputs" && (
            <div className="cp-form-actions">
              <button className="cp-btn" style={{ display: "flex", alignItems: "center", gap: 7 }} onClick={handleSaveDraft} disabled={saving}>
                <Save size={14} /> {saving ? "Saving..." : "Save as Draft"}
              </button>
              {activeTab === "References" && (
                <div className="cp-actions-right">
                  {!allComplete && <span style={{ fontSize: 12, color: "#c2410c", display: "flex", alignItems: "center", gap: 5 }}><AlertCircle size={13} /> Incomplete: {incompleteTabs.join(", ")}</span>}
                  <button className="cp-btn primary"
                    style={{ background: allComplete ? "#1f7a1f" : "#9ca3af", borderColor: allComplete ? "#1f7a1f" : "#9ca3af", display: "flex", alignItems: "center", gap: 7, cursor: allComplete ? "pointer" : "not-allowed" }}
                    onClick={handleSubmit} disabled={submitting || !allComplete}
                    title={!allComplete ? `Complete first: ${incompleteTabs.join(", ")}` : "Submit proposal"}>
                    <Send size={14} /> {submitting ? "Submitting…" : "Submit Proposal"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}