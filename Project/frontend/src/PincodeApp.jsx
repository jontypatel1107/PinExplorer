import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#06060f;
  --s1:#0e0e1c;
  --s2:#161628;
  --s3:#1e1e36;
  --border:rgba(255,255,255,0.07);
  --border2:rgba(255,255,255,0.12);
  --a1:#7c6fff;
  --a2:#ff6b9d;
  --a3:#00e5b0;
  --a4:#ffc043;
  --text:#eeeef8;
  --muted:#6b6b90;
  --muted2:#9999bb;
  --radius:18px;
}
body{background:var(--bg);color:var(--text);font-family:'Cabinet Grotesk',sans-serif;min-height:100vh;overflow-x:hidden;}
h1,h2,h3,h4,.num{font-family:'Clash Display',sans-serif;}

/* scrollbar */
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--s3);border-radius:4px;}

/* ── layout ── */
.app{display:flex;min-height:100vh;}

/* ── sidebar ── */
.sidebar{
  width:240px;min-width:240px;background:var(--s1);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  padding:28px 16px;position:sticky;top:0;height:100vh;overflow-y:auto;
}
.logo{
  font-family:'Clash Display',sans-serif;font-size:20px;font-weight:700;
  padding:0 8px 28px;
  background:linear-gradient(135deg,#fff 30%,var(--a1));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.logo span{display:block;font-family:'Cabinet Grotesk',sans-serif;font-size:11px;font-weight:400;color:var(--muted);-webkit-text-fill-color:var(--muted);margin-top:2px;letter-spacing:.06em;text-transform:uppercase;}
.nav-item{
  display:flex;align-items:center;gap:10px;
  padding:11px 12px;border-radius:12px;
  border:none;background:transparent;color:var(--muted2);
  font-family:'Cabinet Grotesk',sans-serif;font-size:14px;font-weight:500;
  cursor:pointer;width:100%;text-align:left;transition:all .2s;margin-bottom:2px;
}
.nav-item:hover{background:var(--s2);color:var(--text);}
.nav-item.active{background:rgba(124,111,255,.15);color:#b8b0ff;border:1px solid rgba(124,111,255,.25);}
.nav-icon{font-size:16px;width:20px;text-align:center;}
.sidebar-footer{margin-top:auto;padding-top:24px;border-top:1px solid var(--border);}
.theme-toggle{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 12px;border-radius:12px;background:var(--s2);
  border:1px solid var(--border);font-size:13px;color:var(--muted2);cursor:pointer;width:100%;
}
.toggle-pill{
  width:36px;height:20px;border-radius:10px;
  background:var(--s3);border:1px solid var(--border2);
  position:relative;transition:.2s;
}
.toggle-pill.on{background:var(--a1);}
.toggle-dot{
  width:14px;height:14px;border-radius:50%;background:#fff;
  position:absolute;top:2px;left:2px;transition:.2s;
}
.toggle-pill.on .toggle-dot{left:18px;}

/* ── main ── */
.main{flex:1;overflow-y:auto;padding:40px 44px;}
.page-header{margin-bottom:36px;}
.page-title{font-size:30px;font-weight:700;letter-spacing:-.02em;margin-bottom:6px;}
.page-sub{color:var(--muted);font-size:14px;font-weight:400;}

/* ── cards ── */
.card{background:var(--s1);border:1px solid var(--border);border-radius:var(--radius);padding:24px;}
.card-sm{padding:18px 20px;}
.card-grid{display:grid;gap:16px;}
.card-grid-2{grid-template-columns:1fr 1fr;}
.card-grid-3{grid-template-columns:repeat(3,1fr);}
.card-grid-4{grid-template-columns:repeat(4,1fr);}

/* ── stat cards ── */
.stat-card{
  background:var(--s1);border:1px solid var(--border);border-radius:var(--radius);
  padding:20px 22px;position:relative;overflow:hidden;
}
.stat-card::before{
  content:'';position:absolute;top:-40px;right:-40px;
  width:100px;height:100px;border-radius:50%;
  background:var(--glow-color,rgba(124,111,255,.1));
  filter:blur(20px);pointer-events:none;
}
.stat-label{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:10px;font-weight:500;}
.stat-value{font-size:32px;font-weight:700;letter-spacing:-.02em;color:var(--text);line-height:1;}
.stat-sub{font-size:12px;color:var(--muted);margin-top:6px;}

/* ── search ── */
.search-bar{
  display:flex;gap:10px;margin-bottom:28px;
  background:var(--s1);border:1px solid var(--border);border-radius:16px;padding:8px;
  position:relative;
}
.search-input{
  flex:1;background:transparent;border:none;outline:none;
  font-family:'Cabinet Grotesk',sans-serif;font-size:16px;
  color:var(--text);padding:8px 14px;
}
.search-input::placeholder{color:var(--muted);}
.search-btn{
  background:var(--a1);color:#fff;border:none;border-radius:12px;
  padding:10px 22px;font-family:'Cabinet Grotesk',sans-serif;
  font-size:14px;font-weight:500;cursor:pointer;transition:.2s;white-space:nowrap;
  display:flex;align-items:center;gap:6px;
}
.search-btn:hover{filter:brightness(1.15);}
.search-btn:disabled{opacity:.45;cursor:not-allowed;}
.search-type-tabs{display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap;}
.type-tab{
  padding:6px 14px;border-radius:100px;border:1px solid var(--border2);
  background:transparent;color:var(--muted2);font-family:'Cabinet Grotesk',sans-serif;
  font-size:12px;cursor:pointer;transition:.2s;
}
.type-tab.active{background:var(--a1);color:#fff;border-color:var(--a1);}

/* autocomplete */
.autocomplete-wrap{position:relative;flex:1;}
.autocomplete-list{
  position:absolute;top:calc(100% + 8px);left:0;right:0;
  background:var(--s2);border:1px solid var(--border2);border-radius:14px;
  overflow:hidden;z-index:100;animation:fadeUp .15s ease;
}
.ac-item{
  padding:10px 16px;cursor:pointer;transition:.15s;
  display:flex;align-items:center;justify-content:space-between;font-size:14px;
}
.ac-item:hover{background:var(--s3);}
.ac-type{font-size:10px;text-transform:uppercase;letter-spacing:.08em;padding:3px 8px;border-radius:6px;background:var(--s3);color:var(--muted);}

/* ── result card ── */
.result-card{
  background:var(--s1);border:1px solid var(--border);border-radius:var(--radius);
  overflow:hidden;animation:fadeUp .35s ease;
}
.result-hero{
  background:linear-gradient(135deg,rgba(124,111,255,.15),rgba(255,107,157,.08));
  border-bottom:1px solid var(--border);padding:28px 28px 24px;
  display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;
}
.pin-big{font-size:52px;font-weight:700;letter-spacing:-.02em;
  background:linear-gradient(135deg,var(--a1),var(--a2));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;}
.city-big{font-size:24px;font-weight:700;margin-bottom:4px;}
.result-meta{font-size:13px;color:var(--muted);display:flex;gap:12px;flex-wrap:wrap;}
.result-meta span{display:flex;align-items:center;gap:4px;}
.badge{padding:6px 14px;border-radius:100px;font-size:12px;font-weight:500;}
.badge-green{background:rgba(0,229,176,.1);border:1px solid rgba(0,229,176,.2);color:var(--a3);}
.badge-orange{background:rgba(255,192,67,.1);border:1px solid rgba(255,192,67,.2);color:var(--a4);}
.result-body{padding:24px 28px;}
.info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px;}
.info-item{background:var(--s2);border-radius:12px;padding:14px 16px;border:1px solid var(--border);}
.info-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:5px;}
.info-val{font-size:14px;font-weight:600;color:var(--text);}
.offices-wrap h4{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:12px;}
.office-list{display:flex;flex-wrap:wrap;gap:8px;max-height:180px;overflow-y:auto;}
.office-tag{
  background:rgba(124,111,255,.08);border:1px solid rgba(124,111,255,.18);
  color:#c4bfff;border-radius:8px;padding:5px 11px;font-size:12px;
}
.office-tag.sub{background:rgba(255,192,67,.06);border-color:rgba(255,192,67,.18);color:var(--a4);}
.export-row{display:flex;gap:8px;margin-top:20px;padding-top:20px;border-top:1px solid var(--border);}
.btn-sm{
  padding:8px 16px;border-radius:10px;border:1px solid var(--border2);
  background:var(--s2);color:var(--muted2);font-family:'Cabinet Grotesk',sans-serif;
  font-size:13px;cursor:pointer;transition:.2s;display:flex;align-items:center;gap:6px;
}
.btn-sm:hover{background:var(--s3);color:var(--text);}

/* nearby */
.nearby-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;}
.nearby-card{
  background:var(--s2);border:1px solid var(--border);border-radius:14px;
  padding:14px 16px;cursor:pointer;transition:.2s;
}
.nearby-card:hover{border-color:var(--a1);transform:translateY(-2px);}
.nearby-pin{font-size:18px;font-weight:700;color:var(--a1);margin-bottom:4px;}
.nearby-city{font-size:13px;font-weight:500;color:var(--text);}
.nearby-meta{font-size:11px;color:var(--muted);margin-top:2px;}

/* ── map placeholder ── */
.map-wrap{
  border-radius:16px;overflow:hidden;border:1px solid var(--border);
  height:360px;background:var(--s2);position:relative;
  display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;
}
.map-placeholder-icon{font-size:48px;}
.map-label{font-size:14px;color:var(--muted);}
.map-embed{width:100%;height:100%;border:none;}

/* ── states ── */
.states-search-wrap{position:relative;margin-bottom:20px;}
.states-input{
  width:100%;background:var(--s2);border:1px solid var(--border);border-radius:14px;
  padding:12px 16px 12px 42px;color:var(--text);font-family:'Cabinet Grotesk',sans-serif;
  font-size:15px;outline:none;transition:.2s;
}
.states-input:focus{border-color:var(--a1);}
.states-input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:16px;}
.states-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;}
.state-card{
  background:var(--s1);border:1px solid var(--border);border-radius:14px;
  padding:16px 18px;cursor:pointer;transition:.2s;
  display:flex;align-items:center;justify-content:space-between;
}
.state-card:hover{border-color:var(--a1);background:var(--s2);transform:translateY(-2px);}
.state-name-txt{font-size:13px;font-weight:600;text-transform:capitalize;}
.state-arrow{color:var(--muted);font-size:14px;}

.district-card{background:var(--s1);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:10px;}
.district-hdr{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:.15s;}
.district-hdr:hover{background:var(--s2);}
.district-name{font-size:14px;font-weight:700;}
.district-meta{display:flex;align-items:center;gap:10px;}
.count-badge{font-size:11px;color:var(--muted);background:var(--s2);padding:3px 10px;border-radius:100px;}
.chevron{color:var(--muted);transition:.2s;}
.chevron.open{transform:rotate(180deg);}
.district-cities{padding:4px 20px 16px;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;gap:8px;padding-top:14px;}
.city-pill{background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:5px 12px;font-size:12px;}

/* ── bulk ── */
.bulk-input{
  width:100%;height:140px;background:var(--s2);border:1px solid var(--border);
  border-radius:14px;padding:16px;color:var(--text);
  font-family:'Cabinet Grotesk',sans-serif;font-size:15px;outline:none;resize:none;
  letter-spacing:.05em;
}
.bulk-input:focus{border-color:var(--a1);}
.bulk-results{margin-top:20px;}
.bulk-row{
  display:flex;align-items:center;gap:12px;padding:12px 16px;
  background:var(--s2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;
  animation:fadeUp .2s ease;
}
.bulk-pin{font-size:16px;font-weight:700;color:var(--a1);min-width:70px;}
.bulk-info{flex:1;}
.bulk-city{font-size:14px;font-weight:600;}
.bulk-state{font-size:12px;color:var(--muted);}
.bulk-not-found{
  padding:10px 16px;background:rgba(255,107,157,.06);
  border:1px solid rgba(255,107,157,.15);border-radius:10px;
  color:#ff8fa3;font-size:13px;margin-bottom:8px;
}

/* ── stats / charts ── */
.chart-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--radius);padding:24px;}
.chart-title{font-size:15px;font-weight:700;margin-bottom:6px;}
.chart-sub{font-size:12px;color:var(--muted);margin-bottom:20px;}
.recharts-tooltip-wrapper .recharts-default-tooltip{
  background:var(--s2)!important;border:1px solid var(--border2)!important;border-radius:10px!important;
  font-family:'Cabinet Grotesk',sans-serif!important;font-size:13px!important;
}

/* ── history ── */
.history-wrap{margin-bottom:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;}
.history-label{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-right:4px;}
.history-tag{
  background:var(--s2);border:1px solid var(--border);border-radius:8px;
  padding:5px 12px;font-size:13px;cursor:pointer;transition:.15s;display:flex;align-items:center;gap:6px;
}
.history-tag:hover{border-color:var(--a1);color:var(--a1);}
.history-del{color:var(--muted);font-size:12px;transition:.15s;}
.history-del:hover{color:var(--a2);}

/* ── compare ── */
.compare-grid{display:grid;grid-template-columns:1fr auto 1fr;gap:20px;align-items:start;}
.vs-badge{
  width:40px;height:40px;border-radius:50%;
  background:linear-gradient(135deg,var(--a1),var(--a2));
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;color:#fff;margin-top:60px;flex-shrink:0;
}
.compare-row{display:flex;gap:4px;margin-bottom:8px;}
.compare-item{
  flex:1;background:var(--s2);border-radius:10px;padding:10px 14px;
  border:1px solid var(--border);
}
.compare-item.match{border-color:rgba(0,229,176,.3);background:rgba(0,229,176,.04);}
.compare-item.diff{border-color:rgba(255,107,157,.3);background:rgba(255,107,157,.04);}
.compare-field{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:4px;}
.compare-val{font-size:13px;font-weight:600;}

/* ── utils ── */
.section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:14px;}
.back-btn{
  display:inline-flex;align-items:center;gap:8px;padding:9px 16px;
  border-radius:10px;border:1px solid var(--border);background:var(--s1);
  color:var(--muted2);font-size:13px;cursor:pointer;transition:.2s;margin-bottom:24px;
}
.back-btn:hover{color:var(--text);border-color:var(--border2);}
.loader{display:flex;align-items:center;justify-content:center;gap:10px;padding:60px;color:var(--muted);font-size:14px;}
.dots{display:flex;gap:5px;}
.dot{width:7px;height:7px;border-radius:50%;background:var(--a1);animation:bounce 1.2s infinite;}
.dot:nth-child(2){animation-delay:.2s;}
.dot:nth-child(3){animation-delay:.4s;}
.empty{text-align:center;padding:60px 20px;color:var(--muted);}
.empty-icon{font-size:44px;margin-bottom:16px;}
.empty h3{font-size:18px;font-weight:700;color:var(--text);margin-bottom:8px;}
.empty p{font-size:13px;font-weight:300;}
.error-bar{
  background:rgba(255,107,157,.07);border:1px solid rgba(255,107,157,.2);
  border-radius:12px;padding:14px 18px;color:#ff8fa3;font-size:13px;margin-bottom:16px;
}
.divider{height:1px;background:var(--border);margin:24px 0;}
.tag-row{display:flex;flex-wrap:wrap;gap:8px;}
.tag{background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:5px 12px;font-size:12px;color:var(--muted2);}
.share-toast{
  position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
  background:var(--a3);color:#000;border-radius:12px;padding:12px 24px;
  font-size:14px;font-weight:600;z-index:999;animation:toastIn .3s ease;pointer-events:none;
}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}

/* ── light theme ── */
.light{
  --bg:#f4f4fb;--s1:#ffffff;--s2:#f0f0fa;--s3:#e4e4f4;
  --border:rgba(0,0,0,0.08);--border2:rgba(0,0,0,0.13);
  --text:#1a1a2e;--muted:#8888aa;--muted2:#555577;
}

/* ── responsive ── */
@media(max-width:900px){
  .sidebar{width:200px;min-width:200px;}
  .main{padding:28px 24px;}
  .card-grid-4{grid-template-columns:1fr 1fr;}
  .compare-grid{grid-template-columns:1fr;gap:12px;}
  .vs-badge{margin:0 auto;}
}
@media(max-width:640px){
  .app{flex-direction:column;}
  .sidebar{width:100%;height:auto;position:relative;flex-direction:row;flex-wrap:wrap;gap:6px;padding:16px;}
  .logo{padding-bottom:0;margin-right:auto;}
  .nav-item{padding:8px 10px;font-size:12px;}
  .main{padding:20px 16px;}
  .card-grid-2,.card-grid-3,.card-grid-4{grid-template-columns:1fr;}
}
`;

/* ═══════════════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════════════ */
const useLocalStorage = (key, def) => {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
  });
  const set = useCallback((v) => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key]);
  return [val, set];
};

const Loader = ({ label = "Loading…" }) => (
  <div className="loader">
    <div className="dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>
    {label}
  </div>
);

const Empty = ({ icon = "🗺️", title, sub }) => (
  <div className="empty">
    <div className="empty-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{sub}</p>
  </div>
);

const exportCSV = (rows, filename) => {
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(","), ...rows.map(r => keys.map(k => `"${r[k] ?? ""}"`).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = filename;
  a.click();
};

/* ═══════════════════════════════════════════════════════════
   AUTOCOMPLETE INPUT
═══════════════════════════════════════════════════════════ */
function AutocompleteInput({ value, onChange, onSearch, placeholder, isNum }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const fetch_ = async (q) => {
    if (isNum || q.length < 2) return setSuggestions([]);
    const r = await fetch(`${API}/api/autocomplete?q=${encodeURIComponent(q)}`);
    const d = await r.json();
    setSuggestions(d.suggestions || []);
    setOpen(true);
  };

  const handleChange = (e) => {
    const v = isNum ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value;
    onChange(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fetch_(v), 280);
  };

  return (
    <div className="autocomplete-wrap">
      <input
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={e => e.key === "Enter" && (setOpen(false), onSearch())}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="autocomplete-list">
          {suggestions.map((s, i) => (
            <div className="ac-item" key={i}
              onMouseDown={() => { onChange(s.label); setOpen(false); onSearch(s.label); }}>
              <span>{s.label}</span>
              <span className="ac-type">{s.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAP VIEW (Leaflet via CDN iframe approach)
═══════════════════════════════════════════════════════════ */
function MapView({ pincode, city, district, state }) {
  const query = encodeURIComponent(`${city || ""} ${district || ""} ${state || ""} India`);
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=68,8,97,37&layer=mapnik&marker=0,0`;
  const searchURL = `https://www.openstreetmap.org/search?query=${query}`;

  return (
    <div className="map-wrap" style={{ flexDirection: "column", gap: 14 }}>
      <div className="map-placeholder-icon">🗺️</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          {city}, {district}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>{state} — Pincode {pincode}</div>
        <a href={searchURL} target="_blank" rel="noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 20px", background: "var(--a1)", color: "#fff",
            borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 500,
          }}>
          🔍 View on OpenStreetMap ↗
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PINCODE LOOKUP PAGE
═══════════════════════════════════════════════════════════ */
function PincodePage({ history, addHistory }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("details");
  const [toast, setToast] = useState(false);

  const doSearch = async (pin) => {
    const p = pin || code;
    if (!p || String(p).length !== 6) return;
    setLoading(true); setError(""); setResult(null); setNearby([]);
    try {
      const r = await fetch(`${API}/api/pincode?code=${p}`);
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      setResult(d.cityDetails);
      setCode(String(p));
      addHistory(String(p));
      // also fetch nearby
      const nr = await fetch(`${API}/api/nearby?pincode=${p}`);
      const nd = await nr.json();
      if (nd.success) setNearby(nd.nearby);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const share = () => {
    navigator.clipboard?.writeText(`${window.location.origin}?pin=${code}`).then(() => {
      setToast(true); setTimeout(() => setToast(false), 2000);
    });
  };

  const doExport = () => {
    if (!result) return;
    exportCSV([{
      pincode: result.pincode, city: result.city,
      district: result.district, state: result.state,
      region: result.region, division: result.division,
      totalOffices: result.totalOffices,
    }], `pincode_${result.pincode}.csv`);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Pincode Lookup</div>
        <div className="page-sub">Search any 6-digit Indian pincode for instant details</div>
      </div>

      {history.length > 0 && (
        <div className="history-wrap">
          <span className="history-label">Recent</span>
          {history.slice(0, 8).map(h => (
            <span className="history-tag" key={h} onClick={() => { setCode(h); doSearch(h); }}>
              📍 {h}
            </span>
          ))}
        </div>
      )}

      <div className="search-bar">
        <span style={{ paddingLeft: 8, color: "var(--muted)", fontSize: 20, alignSelf: "center" }}>📍</span>
        <AutocompleteInput
          value={code} onChange={setCode}
          onSearch={doSearch} placeholder="Enter 6-digit pincode" isNum
        />
        <button className="search-btn" onClick={() => doSearch()} disabled={loading || code.length !== 6}>
          {loading ? <><div className="dots"><div className="dot"/><div className="dot"/></div></> : "Search →"}
        </button>
      </div>

      {error && <div className="error-bar">⚠️ {error}</div>}
      {loading && <Loader label="Looking up pincode…" />}

      {result && !loading && (
        <>
          <div className="result-card">
            <div className="result-hero">
              <div>
                <div className="pin-big">{result.pincode}</div>
                <div className="city-big">{result.city}</div>
                <div className="result-meta">
                  <span>📍 {result.district}</span>
                  <span>🏛 {result.state}</span>
                  <span>🗺 {result.region}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <span className="badge badge-green">🏢 {result.totalOffices} Offices</span>
                <span className="badge badge-orange">📦 {result.division}</span>
              </div>
            </div>

            <div style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: 4, padding: "0 28px" }}>
              {["details", "offices", "nearby", "map"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    padding: "12px 16px", border: "none", background: "transparent",
                    color: tab === t ? "var(--a1)" : "var(--muted)",
                    fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", borderBottom: tab === t ? "2px solid var(--a1)" : "2px solid transparent",
                    textTransform: "capitalize",
                  }}>
                  {t === "details" ? "📋 Details" : t === "offices" ? "🏢 Offices" : t === "nearby" ? "📍 Nearby" : "🗺 Map"}
                </button>
              ))}
            </div>

            <div className="result-body">
              {tab === "details" && (
                <div className="info-grid">
                  {[
                    ["City / Taluk", result.city], ["District", result.district],
                    ["State", result.state], ["Region", result.region],
                    ["Division", result.division], ["Circle", result.circle],
                  ].map(([l, v]) => (
                    <div className="info-item" key={l}>
                      <div className="info-label">{l}</div>
                      <div className="info-val">{v || "—"}</div>
                    </div>
                  ))}
                </div>
              )}
              {tab === "offices" && (
                <div className="offices-wrap">
                  <h4>{result.totalOffices} Post Offices</h4>
                  <div className="office-list">
                    {result.offices.map((o, i) => (
                      <span key={i} className={`office-tag ${o.type === "Sub Post Office" ? "sub" : ""}`}>
                        {o.name}
                        {o.type && <span style={{ opacity: .6, marginLeft: 4, fontSize: 10 }}>({o.type})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tab === "nearby" && (
                nearby.length > 0 ? (
                  <div>
                    <div className="section-title">Pincodes in {result.district}</div>
                    <div className="nearby-grid">
                      {nearby.map(n => (
                        <div className="nearby-card" key={n.pincode} onClick={() => { setCode(String(n.pincode)); doSearch(n.pincode); setTab("details"); }}>
                          <div className="nearby-pin">{n.pincode}</div>
                          <div className="nearby-city">{n.city}</div>
                          <div className="nearby-meta">{n.officeCount} offices</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <Empty icon="📍" title="No nearby data" sub="Nearby pincodes not found" />
              )}
              {tab === "map" && (
                <MapView pincode={result.pincode} city={result.city} district={result.district} state={result.state} />
              )}
              <div className="export-row">
                <button className="btn-sm" onClick={doExport}>⬇️ Export CSV</button>
                <button className="btn-sm" onClick={share}>🔗 Copy Share Link</button>
              </div>
            </div>
          </div>
        </>
      )}

      {!result && !loading && !error && (
        <Empty icon="🗺️" title="Enter any Indian Pincode" sub="Get city, district, state, offices and nearby pincodes instantly" />
      )}

      {toast && <div className="share-toast">✅ Link copied to clipboard!</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CITY SEARCH PAGE
═══════════════════════════════════════════════════════════ */
function SearchPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doSearch = async (override) => {
    const query = override || q;
    if (!query || query.length < 2) return;
    setLoading(true); setError(""); setResults(null);
    try {
      const r = await fetch(`${API}/api/search?q=${encodeURIComponent(query)}&type=${type}`);
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      setResults(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const doExport = () => {
    if (!results?.results?.length) return;
    exportCSV(results.results, `search_${q}.csv`);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Search by City</div>
        <div className="page-sub">Find pincodes by city name, district or post office</div>
      </div>

      <div className="search-type-tabs">
        {["all", "city", "district", "office"].map(t => (
          <button key={t} className={`type-tab ${type === t ? "active" : ""}`} onClick={() => setType(t)}>
            {t === "all" ? "🔍 All" : t === "city" ? "🏙 City" : t === "district" ? "🗺 District" : "🏢 Office"}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <span style={{ paddingLeft: 8, color: "var(--muted)", fontSize: 20, alignSelf: "center" }}>🔍</span>
        <AutocompleteInput value={q} onChange={setQ} onSearch={doSearch} placeholder="Type city, district or office name…" />
        <button className="search-btn" onClick={() => doSearch()} disabled={loading || q.length < 2}>
          {loading ? <div className="dots"><div className="dot"/><div className="dot"/></div> : "Search →"}
        </button>
      </div>

      {error && <div className="error-bar">⚠️ {error}</div>}
      {loading && <Loader label="Searching…" />}

      {results && !loading && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Found <strong style={{ color: "var(--text)" }}>{results.total}</strong> results for "{results.query}"
            </div>
            {results.total > 0 && <button className="btn-sm" onClick={doExport}>⬇️ Export CSV</button>}
          </div>
          {results.results.length === 0
            ? <Empty icon="🔍" title="No results found" sub="Try a different search term or category" />
            : results.results.map(r => (
              <div className="bulk-row" key={r.pincode}>
                <div className="bulk-pin">{r.pincode}</div>
                <div className="bulk-info">
                  <div className="bulk-city">{r.city} · {r.district}</div>
                  <div className="bulk-state">{r.state} · {r.region}</div>
                </div>
                <span className="tag">{r.officeCount} offices</span>
              </div>
            ))
          }
        </div>
      )}

      {!results && !loading && !error && (
        <Empty icon="🔍" title="Search across all pincodes" sub="Type at least 2 characters to start searching" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BULK LOOKUP PAGE
═══════════════════════════════════════════════════════════ */
function BulkPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doLookup = async () => {
    const pincodes = input.split(/[\s,\n]+/).map(s => s.trim()).filter(s => /^\d{6}$/.test(s));
    if (pincodes.length === 0) return setError("Enter valid 6-digit pincodes separated by space, comma or newline");
    if (pincodes.length > 50) return setError("Maximum 50 pincodes per request");
    setLoading(true); setError(""); setResults(null);
    try {
      const r = await fetch(`${API}/api/bulk`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincodes }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      setResults(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const doExport = () => {
    if (!results?.found?.length) return;
    exportCSV(results.found.map(r => ({
      pincode: r.pincode, city: r.city, district: r.district,
      state: r.state, region: r.region, division: r.division, officeCount: r.officeCount,
    })), "bulk_pincodes.csv");
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Bulk Lookup</div>
        <div className="page-sub">Look up multiple pincodes at once — up to 50 per request</div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Enter Pincodes</div>
        <textarea
          className="bulk-input"
          placeholder={"400001, 110001, 600001\n560001\n700001 500001"}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
          <button className="search-btn" onClick={doLookup} disabled={loading}>
            {loading ? <div className="dots"><div className="dot"/><div className="dot"/></div> : "🔍 Lookup All"}
          </button>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {input.split(/[\s,\n]+/).filter(s => /^\d{6}$/.test(s.trim())).length} valid pincodes detected
          </span>
        </div>
      </div>

      {error && <div className="error-bar">⚠️ {error}</div>}
      {loading && <Loader label="Looking up pincodes…" />}

      {results && !loading && (
        <div className="bulk-results">
          <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
            <span className="badge badge-green">✅ {results.found.length} Found</span>
            {results.notFound.length > 0 && <span className="badge badge-orange">❌ {results.notFound.length} Not Found</span>}
            {results.found.length > 0 && <button className="btn-sm" style={{ marginLeft: "auto" }} onClick={doExport}>⬇️ Export CSV</button>}
          </div>
          {results.notFound.length > 0 && (
            <div className="bulk-not-found">❌ Not found: {results.notFound.join(", ")}</div>
          )}
          {results.found.map(r => (
            <div className="bulk-row" key={r.pincode}>
              <div className="bulk-pin">{r.pincode}</div>
              <div className="bulk-info">
                <div className="bulk-city">{r.city} · {r.district}</div>
                <div className="bulk-state">{r.state}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="tag">{r.officeCount} offices</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!results && !loading && !error && (
        <Empty icon="📋" title="Paste pincodes above" sub="Separate by commas, spaces, or new lines" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPARE PAGE
═══════════════════════════════════════════════════════════ */
function ComparePage() {
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [r1, setR1] = useState(null);
  const [r2, setR2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doCompare = async () => {
    if (pin1.length !== 6 || pin2.length !== 6) return setError("Enter two valid 6-digit pincodes");
    setLoading(true); setError(""); setR1(null); setR2(null);
    try {
      const [a, b] = await Promise.all([
        fetch(`${API}/api/pincode?code=${pin1}`).then(r => r.json()),
        fetch(`${API}/api/pincode?code=${pin2}`).then(r => r.json()),
      ]);
      if (!a.success) throw new Error(`Pincode ${pin1}: ${a.message}`);
      if (!b.success) throw new Error(`Pincode ${pin2}: ${b.message}`);
      setR1(a.cityDetails); setR2(b.cityDetails);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fields = [
    ["City / Taluk", "city"], ["District", "district"],
    ["State", "state"], ["Region", "region"], ["Division", "division"],
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Compare Pincodes</div>
        <div className="page-sub">Side-by-side comparison of two Indian pincodes</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div className="search-bar" style={{ marginBottom: 0 }}>
          <input className="search-input" placeholder="First pincode" value={pin1}
            onChange={e => setPin1(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={e => e.key === "Enter" && doCompare()} />
        </div>
        <div className="search-bar" style={{ marginBottom: 0 }}>
          <input className="search-input" placeholder="Second pincode" value={pin2}
            onChange={e => setPin2(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={e => e.key === "Enter" && doCompare()} />
        </div>
      </div>
      <button className="search-btn" style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}
        onClick={doCompare} disabled={loading}>
        {loading ? <div className="dots"><div className="dot"/><div className="dot"/></div> : "⚡ Compare Now"}
      </button>

      {error && <div className="error-bar">⚠️ {error}</div>}
      {loading && <Loader label="Comparing…" />}

      {r1 && r2 && !loading && (
        <div className="card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <div style={{ textAlign: "center", background: "var(--s2)", borderRadius: 14, padding: "16px 12px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--a1)", fontFamily: "'Clash Display',sans-serif" }}>{r1.pincode}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{r1.city}</div>
            </div>
            <div className="vs-badge" style={{ margin: 0 }}>VS</div>
            <div style={{ textAlign: "center", background: "var(--s2)", borderRadius: 14, padding: "16px 12px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--a2)", fontFamily: "'Clash Display',sans-serif" }}>{r2.pincode}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{r2.city}</div>
            </div>
          </div>

          {fields.map(([label, key]) => {
            const match = r1[key]?.toLowerCase() === r2[key]?.toLowerCase();
            return (
              <div className="compare-row" key={key}>
                <div className={`compare-item ${match ? "match" : "diff"}`}>
                  <div className="compare-field">{label}</div>
                  <div className="compare-val">{r1[key] || "—"}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", padding: "0 8px", fontSize: 16 }}>
                  {match ? "✅" : "❌"}
                </div>
                <div className={`compare-item ${match ? "match" : "diff"}`}>
                  <div className="compare-field">{label}</div>
                  <div className="compare-val">{r2[key] || "—"}</div>
                </div>
              </div>
            );
          })}

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, marginTop: 12 }}>
            <div className="compare-item">
              <div className="compare-field">Total Offices</div>
              <div className="compare-val">{r1.totalOffices}</div>
            </div>
            <div style={{ width: 36 }} />
            <div className="compare-item">
              <div className="compare-field">Total Offices</div>
              <div className="compare-val">{r2.totalOffices}</div>
            </div>
          </div>
        </div>
      )}

      {!r1 && !loading && !error && (
        <Empty icon="⚖️" title="Enter two pincodes to compare" sub="See how districts, states and regions differ" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATES PAGE
═══════════════════════════════════════════════════════════ */
function StatesPage() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [stateData, setStateData] = useState(null);
  const [stateLoading, setStateLoading] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetch(`${API}/states`).then(r => r.json()).then(d => {
      if (d.success) setStates(d.states);
    }).finally(() => setLoading(false));
  }, []);

  const selectState = async (state) => {
    setSelected(state); setStateData(null); setStateLoading(true); setExpanded({});
    const r = await fetch(`${API}/states/${encodeURIComponent(state)}`);
    const d = await r.json();
    if (d.success) setStateData(d);
    setStateLoading(false);
  };

  const filtered = states.filter(s => s.toLowerCase().includes(q.toLowerCase()));
  const toTitle = s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  if (selected) {
    return (
      <div>
        <button className="back-btn" onClick={() => { setSelected(null); setStateData(null); }}>← Back to States</button>
        <div className="page-title" style={{ marginBottom: 6 }}>{toTitle(selected)}</div>
        {stateData && <div className="page-sub" style={{ marginBottom: 24 }}>{stateData.totalDistricts} districts</div>}
        {stateLoading && <Loader label="Loading state data…" />}
        {stateData && stateData.districts.map(d => (
          <div className="district-card" key={d.district}>
            <div className="district-hdr" onClick={() => setExpanded(e => ({ ...e, [d.district]: !e[d.district] }))}>
              <span className="district-name">{d.district}</span>
              <div className="district-meta">
                <span className="count-badge">{d.cities.length} cities</span>
                <span className={`chevron ${expanded[d.district] ? "open" : ""}`}>▾</span>
              </div>
            </div>
            {expanded[d.district] && (
              <div className="district-cities">
                {d.cities.map(c => <span className="city-pill" key={c}>{c}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Browse by State</div>
        <div className="page-sub">Explore all {states.length} Indian states — districts and cities</div>
      </div>
      {loading ? <Loader label="Loading states…" /> : (
        <>
          <div className="states-search-wrap">
            <span className="states-input-icon">🔍</span>
            <input className="states-input" placeholder="Filter states…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="states-grid">
            {filtered.map(s => (
              <div className="state-card" key={s} onClick={() => selectState(s)}>
                <span className="state-name-txt">{toTitle(s)}</span>
                <span className="state-arrow">→</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATS PAGE
═══════════════════════════════════════════════════════════ */
const COLORS = ["#7c6fff", "#ff6b9d", "#00e5b0", "#ffc043", "#60a5fa", "#f87171", "#34d399", "#a78bfa"];

function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/stats`).then(r => r.json()).then(d => {
      if (d.success) setStats(d);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading statistics…" />;
  if (!stats) return <Empty icon="📊" title="Stats unavailable" sub="Could not load statistics" />;

  const topStates = stats.stateStats.slice(0, 15);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Analytics & Stats</div>
        <div className="page-sub">Aggregated insights across all Indian pincodes</div>
      </div>

      <div className="card-grid card-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Total Offices", value: stats.summary.totalOffices?.toLocaleString(), sub: "Post offices", color: "rgba(124,111,255,.15)" },
          { label: "Total Pincodes", value: stats.summary.totalPincodes?.toLocaleString(), sub: "Unique codes", color: "rgba(255,107,157,.12)" },
          { label: "States", value: stats.summary.totalStates, sub: "Covered", color: "rgba(0,229,176,.12)" },
          { label: "Districts", value: stats.summary.totalDistricts?.toLocaleString(), sub: "Across India", color: "rgba(255,192,67,.12)" },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ "--glow-color": s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card-grid card-grid-2" style={{ marginBottom: 20 }}>
        <div className="chart-card">
          <div className="chart-title">Offices per State (Top 15)</div>
          <div className="chart-sub">States with most post offices</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topStates} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fill: "#6b6b90", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="state" tick={{ fill: "#9999bb", fontSize: 10 }} width={90} axisLine={false} tickLine={false}
                tickFormatter={v => v?.length > 10 ? v.slice(0, 10) + "…" : v} />
              <Tooltip
                contentStyle={{ background: "#161628", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "#eeeef8" }} itemStyle={{ color: "#a89fff" }}
              />
              <Bar dataKey="totalOffices" fill="#7c6fff" radius={[0, 6, 6, 0]} name="Offices" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-grid" style={{ gap: 16 }}>
          <div className="chart-card">
            <div className="chart-title">Office Types</div>
            <div className="chart-sub">Distribution of office categories</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={stats.officeTypes} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={60} label={({ type, percent }) => `${type?.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false} fontSize={9}>
                  {stats.officeTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#161628", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-title">Delivery Status</div>
            <div className="chart-sub">Delivery vs non-delivery offices</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={stats.deliveryStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={60}
                  label={({ status, percent }) => `${status?.slice(0, 8)} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {stats.deliveryStatus.map((_, i) => <Cell key={i} fill={[COLORS[2], COLORS[1]][i % 2]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#161628", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-title">Pincodes per State (Top 15)</div>
        <div className="chart-sub">States with most unique pincodes</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={[...stats.stateStats].sort((a, b) => b.uniquePincodes - a.uniquePincodes).slice(0, 15)}
            margin={{ top: 0, right: 20, bottom: 40, left: 0 }}>
            <XAxis dataKey="state" tick={{ fill: "#9999bb", fontSize: 10 }} angle={-35} textAnchor="end" interval={0}
              tickFormatter={v => v?.length > 8 ? v.slice(0, 8) + "…" : v} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b6b90", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#161628", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: "#eeeef8" }} itemStyle={{ color: "#00e5b0" }} />
            <Bar dataKey="uniquePincodes" fill="#00e5b0" radius={[6, 6, 0, 0]} name="Unique Pincodes" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("pincode");
  const [light, setLight] = useLocalStorage("pincode_theme", false);
  const [history, setHistory] = useLocalStorage("pincode_history", []);

  const addHistory = (pin) => {
    setHistory(prev => [pin, ...prev.filter(p => p !== pin)].slice(0, 12));
  };

  const nav = [
    { id: "pincode", icon: "📍", label: "Pincode Lookup" },
    { id: "search", icon: "🔍", label: "Search by City" },
    { id: "bulk", icon: "📋", label: "Bulk Lookup" },
    { id: "compare", icon: "⚖️", label: "Compare" },
    { id: "states", icon: "🗺️", label: "Browse States" },
    { id: "stats", icon: "📊", label: "Analytics" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className={`app ${light ? "light" : ""}`}>
        <nav className="sidebar">
          <div className="logo">
            PinExplorer
            <span>India Pincode Intelligence</span>
          </div>
          {nav.map(n => (
            <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
          <div className="sidebar-footer">
            <button className="theme-toggle" onClick={() => setLight(l => !l)}>
              <span style={{ fontSize: 13 }}>{light ? "☀️ Light" : "🌙 Dark"}</span>
              <div className={`toggle-pill ${light ? "on" : ""}`}><div className="toggle-dot" /></div>
            </button>
          </div>
        </nav>

        <main className="main">
          {page === "pincode" && <PincodePage history={history} addHistory={addHistory} />}
          {page === "search" && <SearchPage />}
          {page === "bulk" && <BulkPage />}
          {page === "compare" && <ComparePage />}
          {page === "states" && <StatesPage />}
          {page === "stats" && <StatsPage />}
        </main>
      </div>
    </>
  );
}
