// src/pages/admin/Projects.jsx
import { useEffect, useState } from "react";
import AdminNavbar from "../../components/admin/navbar";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import {
  Search, ChevronDown, FolderOpen, Eye, X,
  User, Calendar, BookOpen, FileText,
  CheckCircle2, AlertCircle, Trash2,
} from "lucide-react";

const STATUS_STYLE = {
  Submitted:                { bg:"#e0f2fe", color:"#0369a1", border:"#bae6fd" },
  "Presentation Scheduled": { bg:"#dbeafe", color:"#1d4ed8", border:"#bfdbfe" },
  "Under Evaluation":       { bg:"#ede9fe", color:"#6d28d9", border:"#ddd6fe" },
  Evaluated:                { bg:"#fef3c7", color:"#d97706", border:"#fde68a" },
  Endorsed:                 { bg:"#dcfce7", color:"#15803d", border:"#bbf7d0" },
  Recommended:              { bg:"#dcfce7", color:"#15803d", border:"#bbf7d0" },
  Forwarded:                { bg:"#e0f2fe", color:"#0369a1", border:"#bae6fd" },
  Approved:                 { bg:"#dcfce7", color:"#15803d", border:"#bbf7d0" },
  "In Progress":            { bg:"#d1fae5", color:"#065f46", border:"#a7f3d0" },
  Rejected:                 { bg:"#fef2f2", color:"#dc2626", border:"#fecaca" },
  "For Revision":           { bg:"#fef3c7", color:"#d97706", border:"#fde68a" },
};

const PROJECT_STATUSES = ["Submitted","Presentation Scheduled","Under Evaluation","Evaluated","Endorsed","Recommended","Forwarded","Approved","In Progress","Rejected","For Revision"];

const fmtMoney = v => { const a = Number(v||0); return a ? `₱${a.toLocaleString()}` : "—"; };
const fmtDate  = d => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"}); } catch { return d; } };
const getReference     = p => p?.reference_no || p?.project_id || `PRJ-${p?.id}`;
const getResearcherName= p => p?.creator?.name || p?.researcher || p?.created_by_name || "—";
const getDepartment    = p => p?.department_center?.name || p?.departmentCenter?.name || p?.department || p?.creator?.department || "—";
const getType          = p => p?.type || p?.scholarly_work_type || "—";
const getBudget        = p => p?.budget || p?.total_budget || 0;

function InfoRow({ icon, label, value }) {
  return (
    <div>
      <p style={{ margin:0, fontSize:11, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.04em", display:"flex", alignItems:"center", gap:5 }}>{icon}{label}</p>
      <p style={{ margin:"4px 0 0", fontSize:14, fontWeight:600, color:"#111827", lineHeight:1.4 }}>{value||"—"}</p>
    </div>
  );
}

function DetailModal({ project, onClose }) {
  const status = project?.status || "Submitted";
  const style  = STATUS_STYLE[status] || STATUS_STYLE.Submitted;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:620, maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"20px 24px 16px", borderBottom:"1px solid #f1f5f9", gap:12 }}>
          <div style={{ minWidth:0 }}>
            <p style={{ margin:0, fontSize:12, color:"#6b7280", fontWeight:500 }}>{getReference(project)}</p>
            <h2 style={{ margin:"4px 0 0", fontSize:18, fontWeight:800, color:"#111827", lineHeight:1.3 }}>{project?.title||"Untitled"}</h2>
          </div>
          <button onClick={onClose} style={{ background:"#f3f4f6", border:"none", borderRadius:8, cursor:"pointer", padding:7, display:"flex", color:"#374151", flexShrink:0 }}><X size={18} /></button>
        </div>
        <div style={{ overflowY:"auto", padding:"20px 24px 24px" }}>
          <div style={{ marginBottom:18 }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:20, background:style.bg, color:style.color, border:`1px solid ${style.border}`, fontSize:13, fontWeight:700 }}><CheckCircle2 size={14} />{status}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px 24px", marginBottom:22 }}>
            <InfoRow icon={<User size={14}/>}     label="Researcher"      value={getResearcherName(project)} />
            <InfoRow icon={<BookOpen size={14}/>}  label="Department"      value={getDepartment(project)} />
            <InfoRow icon={<FileText size={14}/>}  label="Type"            value={getType(project)} />
            <InfoRow icon={<Calendar size={14}/>}  label="Start Date"      value={fmtDate(project?.start_date)} />
            <InfoRow icon={<Calendar size={14}/>}  label="End Date"        value={fmtDate(project?.end_date)} />
            <InfoRow icon={<Calendar size={14}/>}  label="Submitted Date"  value={fmtDate(project?.submitted_at||project?.created_at)} />
          </div>
          <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
            <p style={{ margin:"0 0 4px", fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.04em" }}>Budget</p>
            <p style={{ margin:0, fontSize:20, fontWeight:800, color:"#111827" }}>{fmtMoney(getBudget(project))}</p>
          </div>
          <div>
            <p style={{ margin:"0 0 8px", fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.04em" }}>Description</p>
            <p style={{ margin:0, fontSize:14, color:"#374151", lineHeight:1.6 }}>{project?.description||project?.abstract||"No description available."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm Modal ─────────────────────────────────── */
function DeleteConfirmModal({ items, onClose, onConfirm, deleting }) {
  const isBulk = items.length > 1;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"18px 22px 14px", borderBottom:"1px solid #f1f5f9" }}>
          <div>
            <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:"#dc2626" }}>Delete {isBulk?`${items.length} Projects`:"Project"}</h2>
            <p style={{ margin:"4px 0 0", fontSize:12, color:"#6b7280" }}>This action cannot be undone.</p>
          </div>
          <button onClick={onClose} style={{ background:"#f3f4f6", border:"none", borderRadius:8, cursor:"pointer", padding:6, display:"flex", color:"#374151" }}><X size={18} /></button>
        </div>
        <div style={{ padding:"20px 22px 22px" }}>
          <p style={{ margin:"0 0 12px", fontSize:14, color:"#374151" }}>
            {isBulk
              ? <>Are you sure you want to delete <strong>{items.length} projects</strong>?</>
              : <>Are you sure you want to delete <strong>"{items[0]?.title}"</strong>?</>}
          </p>
          {isBulk && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 14px", marginBottom:16, maxHeight:140, overflowY:"auto" }}>
              {items.map(p => <p key={p.id} style={{ margin:"2px 0", fontSize:13, color:"#dc2626" }}>• {p.title||getReference(p)}</p>)}
            </div>
          )}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={onClose} style={{ padding:"9px 20px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer", fontSize:14, color:"#374151", fontWeight:500 }}>Cancel</button>
            <button onClick={onConfirm} disabled={deleting}
              style={{ padding:"9px 22px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", cursor:"pointer", fontSize:14, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
              <Trash2 size={15} /> {deleting?"Deleting…":"Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const [projects,     setProjects]     = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading,      setLoading]      = useState(true);
  const [viewing,      setViewing]      = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);
  const [selected,     setSelected]     = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [success,      setSuccess]      = useState("");

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/proposals");
      const all = Array.isArray(res.data) ? res.data : [];
      const data = all.filter(p => PROJECT_STATUSES.includes(p.status));
      setProjects(data); setFiltered(data);
    } catch { setProjects([]); setFiltered([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(projects.filter(p => {
      const status = p.status || "Submitted";
      return (statusFilter==="All Status" || status===statusFilter) &&
        (p.title?.toLowerCase().includes(q) || getReference(p)?.toLowerCase().includes(q) || getResearcherName(p)?.toLowerCase().includes(q) || getDepartment(p)?.toLowerCase().includes(q) || getType(p)?.toLowerCase().includes(q));
    }));
    setSelected(new Set());
  }, [search, statusFilter, projects]);

  const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));
  const toggleAll   = () => setSelected(allSelected ? new Set() : new Set(filtered.map(p => p.id)));
  const toggleOne   = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await Promise.all(deleteTarget.map(p => api.delete(`/admin/proposals/${p.id}`)));
      setProjects(prev => prev.filter(p => !deleteTarget.some(d => d.id === p.id)));
      setSelected(new Set()); setDeleteTarget(null);
      setSuccess(`${deleteTarget.length} project${deleteTarget.length>1?"s":""} deleted.`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) { setSuccess(err.response?.data?.message||"Failed to delete."); setTimeout(() => setSuccess(""), 4000); }
    finally { setDeleting(false); }
  };

  const ml = isMobile ? 0 : sidebarWidth;
  const totalBudget    = projects.reduce((s,p) => s + Number(getBudget(p)||0), 0);
  const approvedCount  = projects.filter(p => p.status==="Approved").length;
  const submittedCount = projects.filter(p => p.status==="Submitted").length;

  return (
    <>
      <style>{`
        .admin-project-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
        .admin-project-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:18px 20px; box-shadow:0 1px 3px rgba(0,0,0,0.04); }
        .admin-filter-bar { display:grid; grid-template-columns:1fr 240px; gap:12px; margin-bottom:18px; }
        .admin-search-box { background:#fff; border:1px solid #e5e7eb; border-radius:12px; display:flex; align-items:center; gap:10px; padding:0 14px; box-shadow:0 1px 3px rgba(0,0,0,0.04); }
        .admin-search-box input { flex:1; border:none; outline:none; padding:12px 0; font-size:14px; color:#111827; background:transparent; }
        .admin-select-wrap { position:relative; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.04); }
        .admin-select-wrap select { width:100%; appearance:none; border:none; outline:none; background:transparent; padding:12px 38px 12px 14px; font-size:14px; color:#374151; cursor:pointer; }
        .admin-select-wrap svg { position:absolute; right:14px; top:50%; transform:translateY(-50%); pointer-events:none; }
        .admin-table-card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
        .admin-table-scroll { overflow-x:auto; }
        .admin-project-table { width:100%; border-collapse:collapse; }
        .admin-project-table th { padding:10px 12px; text-align:center; font-size:12px; font-weight:800; color:#6b7280; text-transform:uppercase; letter-spacing:0.04em; border-bottom:1px solid #e5e7eb; background:#f9fafb; white-space:nowrap; }
        .admin-project-table td { padding:11px 12px; font-size:13px; color:#374151; border-bottom:1px solid #f1f5f9; vertical-align:middle; text-align:center; }
        .admin-project-table tr:last-child td { border-bottom:none; }
        .admin-project-table tr:hover td { background:#fafafa; }
        @media(max-width:1100px){ .admin-project-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:760px){ .admin-project-grid, .admin-filter-bar { grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display:"flex", minHeight:"100vh", background:"#f3f4f6" }}>
        <AdminNavbar onWidthChange={setSidebarWidth} />
        <div style={{ marginLeft:ml, flex:1, display:"flex", flexDirection:"column", transition:"margin-left 0.22s ease", minWidth:0 }}>
          <Topbar title="Projects Management" />
          <div style={{ padding:"24px", flex:1 }}>

            <div style={{ marginBottom:24 }}>
              <h3 style={{ margin:"4px 0 0", fontSize:13, color:"#6b7280" }}>Monitor submitted proposals, approved projects, and active research projects</h3>
            </div>

            {success && (
              <div style={{ background:success.includes("Failed")?"#fef2f2":"#dcfce7", color:success.includes("Failed")?"#dc2626":"#15803d", padding:"12px 16px", borderRadius:10, marginBottom:20, fontSize:14, fontWeight:500, display:"flex", alignItems:"center", gap:8 }}>
                <CheckCircle2 size={16} /> {success}
              </div>
            )}

            {/* Stat cards */}
            <div className="admin-project-grid">
              {[["Total Records","#111827",loading?"—":projects.length],["Submitted","#0369a1",loading?"—":submittedCount],["Approved","#15803d",loading?"—":approvedCount],["Total Budget","#111827",loading?"—":fmtMoney(totalBudget)]].map(([label,color,val]) => (
                <div key={label} className="admin-project-card">
                  <p style={{ margin:0, fontSize:12, color:"#6b7280", fontWeight:700, textTransform:"uppercase" }}>{label}</p>
                  <p style={{ margin:"6px 0 0", fontSize:label==="Total Budget"?20:26, fontWeight:800, color }}>{val}</p>
                </div>
              ))}
            </div>

            {/* Search + filter */}
            <div className="admin-filter-bar">
              <div className="admin-search-box">
                <Search size={18} color="#9ca3af" />
                <input type="text" placeholder="Search by title, reference number, researcher, department, or type..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="admin-select-wrap">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option>All Status</option>
                  {PROJECT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={15} color="#6b7280" />
              </div>
            </div>

            {/* Bulk delete button */}
            {selected.size > 0 && (
              <div style={{ marginBottom:14 }}>
                <button onClick={() => setDeleteTarget(filtered.filter(p => selected.has(p.id)))}
                  style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:9, border:"none", background:"#dc2626", color:"#fff", fontWeight:600, fontSize:14, cursor:"pointer", boxShadow:"0 2px 6px rgba(220,38,38,0.3)" }}>
                  <Trash2 size={16} /> Delete Selected ({selected.size})
                </button>
              </div>
            )}

            <div className="admin-table-card">
              <div style={{ padding:"16px 20px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <h4 style={{ margin:0, fontSize:15, fontWeight:800, color:"#111827", display:"flex", alignItems:"center", gap:8 }}>
                  <FolderOpen size={17} color="#f59e0b" /> Research Projects / Proposals
                </h4>
                <span style={{ fontSize:13, color:"#6b7280" }}>{loading?"Loading...":`${filtered.length} shown${selected.size>0?` · ${selected.size} selected`:""}`}</span>
              </div>

              <div className="admin-table-scroll">
                <table className="admin-project-table">
                  <thead>
                    <tr>
                      <th style={{ width:44 }}>
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ width:16, height:16, cursor:"pointer", accentColor:"#f59e0b" }} />
                      </th>
                      <th>Reference No</th><th>Title</th><th>Researcher</th><th>Department</th><th>Status</th><th style={{ textAlign:"center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && <tr><td colSpan={7} style={{ textAlign:"center", padding:28, color:"#9ca3af" }}>Loading records...</td></tr>}

                    {!loading && filtered.map(project => {
                      const status = project.status || "Submitted";
                      const style  = STATUS_STYLE[status] || STATUS_STYLE.Submitted;
                      const isSel  = selected.has(project.id);
                      return (
                        <tr key={project.id} style={{ background:isSel?"#fff7ed":undefined }}>
                          <td><input type="checkbox" checked={isSel} onChange={() => toggleOne(project.id)} style={{ width:16, height:16, cursor:"pointer", accentColor:"#f59e0b" }} /></td>
                          <td style={{ fontWeight:700 }}>{getReference(project)}</td>
                          <td><strong style={{ color:"#111827" }}>{project.title||"Untitled"}</strong></td>
                          <td>{getResearcherName(project)}</td>
                          <td>{getDepartment(project)}</td>
                          <td>
                            <span style={{ display:"inline-flex", alignItems:"center", padding:"4px 11px", borderRadius:999, background:style.bg, color:style.color, border:`1px solid ${style.border}`, fontSize:12, fontWeight:700, whiteSpace:"nowrap" }}>{status}</span>
                          </td>
                          <td>
                            <div style={{ display:"flex", justifyContent:"flex-end" }}>
                              <button onClick={() => setViewing(project)}
                                style={{ display:"inline-flex", alignItems:"center", gap:6, border:"none", background:"transparent", color:"#f59e0b", fontWeight:800, cursor:"pointer", padding:0, fontSize:13 }}>
                                <Eye size={15} /> View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {!loading && filtered.length === 0 && (
                      <tr><td colSpan={7} style={{ textAlign:"center", padding:34, color:"#9ca3af" }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                          <AlertCircle size={28} color="#d1d5db" /><span>No records found.</span>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewing     && <DetailModal project={viewing} onClose={() => setViewing(null)} />}
      {deleteTarget && <DeleteConfirmModal items={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} deleting={deleting} />}
    </>
  );
}