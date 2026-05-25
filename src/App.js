import { useState, useEffect, useRef, useCallback } from "react";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#000000", surface: "#0a0a0a", card: "#111111", border: "#1f1f1f",
  accent: "#ffffff", accentDim: "#aaaaaa", green: "#4ade80", orange: "#fb923c",
  red: "#f87171", yellow: "#facc15", purple: "#c084fc", text: "#f5f5f5",
  muted: "#525252", panel: "rgba(255,255,255,0.04)",
};

// ─── Utility ──────────────────────────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
function useInterval(cb, ms) {
  const ref = useRef(cb);
  useEffect(() => { ref.current = cb; }, [cb]);
  useEffect(() => { const id = setInterval(() => ref.current(), ms); return () => clearInterval(id); }, [ms]);
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  bulb: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.2 4.16-3 5.2V17a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-2.8C7.2 13.16 6 11.22 6 9a6 6 0 0 1 6-6z"/></svg>,
  thermo: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>,
  door: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="3" y="2" width="18" height="20" rx="1"/><path d="M9 12h.01"/></svg>,
  music: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  power: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg>,
  ai: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><path d="M3 14l1 3h1l1-3m14 0-1 3h-1l-1-3M9 14v5a3 3 0 0 0 6 0v-5"/></svg>,
  send: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  wifi: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  battery: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/><rect x="3" y="8" width="12" height="8" rx="1" fill="currentColor" stroke="none"/></svg>,
  code: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>,
  undo: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>,
  eye: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  git: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>,
  download: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

// ─── Primitives ───────────────────────────────────────────────────────────────
function Slider({ value, onChange, min = 0, max = 100, color = C.accent, label }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {label && <span style={{ color: C.muted, fontSize: 12, width: 28, textAlign: "right" }}>{label}</span>}
      <div style={{ flex: 1, position: "relative", height: 24, display: "flex", alignItems: "center", cursor: "pointer" }}
        onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); onChange(Math.round(min + clamp((e.clientX - rect.left) / rect.width, 0, 1) * (max - min))); }}>
        <div style={{ width: "100%", height: 4, borderRadius: 2, background: C.border, position: "relative" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: color, transition: "width 0.1s" }} />
          <div style={{ position: "absolute", top: "50%", left: `${pct}%`, transform: "translate(-50%,-50%)", width: 14, height: 14, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, border: "2px solid #fff", transition: "left 0.1s" }} />
        </div>
      </div>
      <span style={{ color: C.text, fontSize: 13, width: 32, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function Toggle({ on, onChange, color = C.green }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: 42, height: 24, borderRadius: 12, cursor: "pointer", background: on ? color : C.border, position: "relative", transition: "background 0.25s", boxShadow: on ? `0 0 12px ${color}55` : "none" }}>
      <div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
    </div>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, ...style }}>{children}</div>;
}

function SectionHeader({ icon: IC, label, color = C.accent, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <span style={{ color }}><IC /></span>
      <span style={{ color: C.text, fontWeight: 700, fontSize: 15, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "monospace", flex: 1 }}>{label}</span>
      {right}
    </div>
  );
}

function Btn({ children, onClick, color = C.accent, small, danger }) {
  const [hov, setHov] = useState(false);
  const bg = danger ? (hov ? C.red : `${C.red}22`) : (hov ? `${color}33` : `${color}11`);
  const bc = danger ? C.red : color;
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: small ? "4px 10px" : "7px 14px", borderRadius: 10, border: `1px solid ${bc}`, background: bg, color: hov && danger ? "#fff" : bc, cursor: "pointer", fontSize: small ? 11 : 13, fontWeight: 600, fontFamily: "monospace", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5 }}>
      {children}
    </button>
  );
}

// ─── Bus Panels ───────────────────────────────────────────────────────────────
const ZONES = ["Driver", "Front Cabin", "Mid Cabin", "Rear Cabin", "Exterior", "Underglow"];
const ZONE_COLORS = [C.accent, C.green, C.green, C.green, C.yellow, C.purple];
const DOORS = ["Front Door", "Rear Door", "Emergency Exit", "Luggage Bay L", "Luggage Bay R"];

function LightingPanel({ state, setState }) {
  return (
    <Card>
      <SectionHeader icon={Icon.bulb} label="Lighting" color={C.yellow} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ZONES.map((zone, i) => (
          <div key={zone}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ color: state.zones[i].on ? C.text : C.muted, fontSize: 13 }}>{zone}</span>
              <Toggle on={state.zones[i].on} onChange={v => setState(s => { const z = [...s.zones]; z[i] = { ...z[i], on: v }; return { ...s, zones: z }; })} color={ZONE_COLORS[i]} />
            </div>
            {state.zones[i].on && <Slider value={state.zones[i].brightness} color={ZONE_COLORS[i]} label="Br" onChange={v => setState(s => { const z = [...s.zones]; z[i] = { ...z[i], brightness: v }; return { ...s, zones: z }; })} />}
          </div>
        ))}
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Auto", "Party", "Night", "Off All"].map(m => (
            <Btn key={m} small onClick={() => {
              if (m === "Off All") setState(s => ({ ...s, zones: s.zones.map(z => ({ ...z, on: false })) }));
              else if (m === "Party") setState(s => ({ ...s, zones: s.zones.map(z => ({ ...z, on: true, brightness: 100 })) }));
              else if (m === "Night") setState(s => ({ ...s, zones: s.zones.map((z, i) => ({ ...z, on: i < 2, brightness: 20 })) }));
              else setState(s => ({ ...s, zones: s.zones.map(z => ({ ...z, on: true, brightness: 70 })) }));
            }}>{m}</Btn>
          ))}
        </div>
      </div>
    </Card>
  );
}

function HVACPanel({ state, setState }) {
  const modes = ["Auto", "Heat", "Cool", "Fan", "Off"];
  const modeColors = { Auto: C.accent, Heat: C.orange, Cool: C.accent, Fan: C.green, Off: C.muted };
  return (
    <Card>
      <SectionHeader icon={Icon.thermo} label="Climate" color={C.orange} />
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {modes.map(m => (
          <button key={m} onClick={() => setState(s => ({ ...s, mode: m }))} style={{ padding: "7px 14px", borderRadius: 10, border: `1px solid ${state.mode === m ? modeColors[m] : C.border}`, background: state.mode === m ? `${modeColors[m]}22` : C.surface, color: state.mode === m ? modeColors[m] : C.muted, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "monospace", transition: "all 0.2s" }}>{m}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <button onClick={() => setState(s => ({ ...s, target: clamp(s.target - 1, 60, 90) }))} style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 20, cursor: "pointer" }}>−</button>
        <div style={{ textAlign: "center", margin: "0 20px" }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: modeColors[state.mode] || C.accent, fontFamily: "monospace", letterSpacing: -2 }}>{state.target}°</span>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>TARGET (°F)</div>
        </div>
        <button onClick={() => setState(s => ({ ...s, target: clamp(s.target + 1, 60, 90) }))} style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 20, cursor: "pointer" }}>+</button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        {[{ label: "Interior", val: state.interior + "°F" }, { label: "Exterior", val: state.exterior + "°F" }, { label: "Humidity", val: state.humidity + "%" }].map(({ label, val }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ color: C.accent, fontSize: 18, fontWeight: 700, fontFamily: "monospace" }}>{val}</div>
            <div style={{ color: C.muted, fontSize: 10 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 8 }}><div style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>Fan Speed</div><Slider value={state.fanSpeed} onChange={v => setState(s => ({ ...s, fanSpeed: v }))} color={C.green} /></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: C.muted, fontSize: 12 }}>Defroster</span>
        <Toggle on={state.defroster} onChange={v => setState(s => ({ ...s, defroster: v }))} color={C.orange} />
      </div>
    </Card>
  );
}

function DoorsPanel({ state, setState }) {
  return (
    <Card>
      <SectionHeader icon={Icon.door} label="Doors & Security" color={C.green} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DOORS.map((d, i) => (
          <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 10, background: C.surface, border: `1px solid ${state.doors[i] ? C.green + "55" : C.border}` }}>
            <span style={{ color: C.text, fontSize: 13 }}>{d}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: state.doors[i] ? C.green : C.red, fontSize: 11, fontFamily: "monospace" }}>{state.doors[i] ? "OPEN" : "LOCKED"}</span>
              <Toggle on={state.doors[i]} onChange={v => setState(s => { const doors = [...s.doors]; doors[i] = v; return { ...s, doors }; })} color={state.doors[i] ? C.orange : C.green} />
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Btn onClick={() => setState(s => ({ ...s, doors: s.doors.map(() => false) }))} color={C.green}>LOCK ALL</Btn>
          <Btn onClick={() => setState(s => ({ ...s, doors: s.doors.map(() => true) }))} color={C.orange}>UNLOCK ALL</Btn>
        </div>
      </div>
    </Card>
  );
}

function PowerPanel({ state }) {
  const battPct = Math.round(state.battery);
  const battColor = battPct > 50 ? C.green : battPct > 20 ? C.yellow : C.red;
  return (
    <Card>
      <SectionHeader icon={Icon.power} label="Power & Systems" color={C.purple} />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[{ label: "Battery", val: `${battPct}%`, color: battColor, sub: "House Bank" }, { label: "Alternator", val: state.altVolts + "V", color: C.accent, sub: "Charging" }, { label: "Solar", val: Math.round(state.solar) + "W", color: C.yellow, sub: "Input" }, { label: "Load", val: Math.round(state.load) + "A", color: C.orange, sub: "Draw" }].map(({ label, val, color, sub }) => (
          <div key={label} style={{ flex: "1 1 100px", textAlign: "center", padding: "12px 8px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}` }}>
            <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: "monospace" }}>{val}</div>
            <div style={{ color: C.text, fontSize: 12 }}>{label}</div>
            <div style={{ color: C.muted, fontSize: 10 }}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: C.muted, fontSize: 11 }}>BATTERY LEVEL</span>
          <span style={{ color: battColor, fontSize: 11, fontFamily: "monospace" }}>{battPct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: C.border }}>
          <div style={{ width: `${battPct}%`, height: "100%", borderRadius: 4, background: battColor, boxShadow: `0 0 8px ${battColor}88`, transition: "width 1s" }} />
        </div>
      </div>
    </Card>
  );
}

function EntPanel({ state, setState }) {
  return (
    <Card>
      <SectionHeader icon={Icon.music} label="Entertainment" color={C.purple} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {["Interior Speakers", "Exterior PA", "TV Screens", "WiFi Hotspot", "USB Chargers"].map((item, i) => (
          <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: state.ent[i] ? C.text : C.muted, fontSize: 13 }}>{item}</span>
            <Toggle on={state.ent[i]} onChange={v => setState(s => { const ent = [...s.ent]; ent[i] = v; return { ...s, ent }; })} color={C.purple} />
          </div>
        ))}
        {state.ent[0] && <div style={{ marginTop: 4 }}><div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>MASTER VOLUME</div><Slider value={state.volume} onChange={v => setState(s => ({ ...s, volume: v }))} color={C.purple} /></div>}
      </div>
    </Card>
  );
}

// ─── Diff Viewer ──────────────────────────────────────────────────────────────
function DiffViewer({ oldCode, newCode }) {
  const oldLines = oldCode.split("\n");
  const newLines = newCode.split("\n");
  const maxLen = Math.max(oldLines.length, newLines.length);

  const lines = [];
  let i = 0, j = 0;
  while (i < oldLines.length || j < newLines.length) {
    const o = oldLines[i], n = newLines[j];
    if (o === n) { lines.push({ type: "same", text: n }); i++; j++; }
    else if (o !== undefined && (n === undefined || !newLines.includes(o))) {
      lines.push({ type: "removed", text: o }); i++;
    } else if (n !== undefined) {
      lines.push({ type: "added", text: n }); j++;
      if (o !== undefined && oldLines[i] !== newLines[j]) i++;
    } else { i++; j++; }
    if (lines.length > 300) break;
  }

  return (
    <div style={{ fontFamily: "monospace", fontSize: 11, overflowY: "auto", maxHeight: 260, background: "#0d1117", borderRadius: 8, padding: 8, border: `1px solid ${C.border}` }}>
      {lines.map((l, i) => (
        <div key={i} style={{ padding: "1px 8px", borderRadius: 3, background: l.type === "added" ? "#00ff8822" : l.type === "removed" ? "#ff3b3b22" : "transparent", color: l.type === "added" ? C.green : l.type === "removed" ? C.red : C.muted, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          <span style={{ userSelect: "none", marginRight: 8, opacity: 0.5 }}>{l.type === "added" ? "+" : l.type === "removed" ? "−" : " "}</span>{l.text}
        </div>
      ))}
    </div>
  );
}

// ─── Dev / Update Panel ───────────────────────────────────────────────────────
const INITIAL_SOURCE = `// BUS·OS App Source — editable by AI
// Current version loaded from storage`;

function DevPanel({ appSource, versions, onApplyUpdate, onRollback }) {
  const [tab, setTab] = useState("history");
  const [editCode, setEditCode] = useState(appSource);
  const [diffTarget, setDiffTarget] = useState(null);

  useEffect(() => { setEditCode(appSource); }, [appSource]);

  const charCount = appSource.length;
  const lineCount = appSource.split("\n").length;

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader icon={Icon.code} label="Dev Console" color={C.accent}
        right={<span style={{ color: C.muted, fontSize: 10, fontFamily: "monospace" }}>{lineCount}L · {charCount}c</span>}
      />

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
        {[["history", Icon.git, "History"], ["editor", Icon.code, "Editor"]].map(([id, Ic, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${tab === id ? C.accent : C.border}`, background: tab === id ? `${C.accent}15` : C.surface, color: tab === id ? C.accent : C.muted, cursor: "pointer", fontSize: 11, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 5 }}>
            <Ic />{label}
          </button>
        ))}
        <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(appSource)}`} download="BusOS_latest.jsx" style={{ marginLeft: "auto", padding: "5px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, cursor: "pointer", fontSize: 11, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
          <Icon.download />Export
        </a>
      </div>

      {tab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto" }}>
          {versions.length === 0 && <div style={{ color: C.muted, fontSize: 12, textAlign: "center", padding: 20 }}>No update history yet.<br/>Ask the AI to upgrade the app.</div>}
          {[...versions].reverse().map((v, i) => (
            <div key={v.id} style={{ padding: 12, borderRadius: 10, background: C.surface, border: `1px solid ${i === 0 ? C.accent + "55" : C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <span style={{ color: i === 0 ? C.accent : C.text, fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>v{v.version}</span>
                  {i === 0 && <span style={{ marginLeft: 8, color: C.green, fontSize: 10, fontFamily: "monospace" }}>● LIVE</span>}
                </div>
                <span style={{ color: C.muted, fontSize: 10, fontFamily: "monospace" }}>{v.timestamp}</span>
              </div>
              <p style={{ color: C.muted, fontSize: 12, margin: "0 0 8px 0", lineHeight: 1.4 }}>{v.description}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {v.changes.map((c, ci) => (
                  <span key={ci} style={{ padding: "2px 8px", borderRadius: 10, background: `${C.accent}15`, color: C.accent, fontSize: 10, fontFamily: "monospace" }}>{c}</span>
                ))}
              </div>
              {diffTarget === v.id ? (
                <div style={{ marginTop: 10 }}>
                  <DiffViewer oldCode={v.previousSource || ""} newCode={v.source} />
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <Btn small onClick={() => setDiffTarget(null)}>Close Diff</Btn>
                    {i !== 0 && <Btn small color={C.orange} onClick={() => { onRollback(v); setDiffTarget(null); }}>Rollback to this</Btn>}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <Btn small onClick={() => setDiffTarget(v.id)}><Icon.eye />Diff</Btn>
                  {i !== 0 && <Btn small color={C.orange} onClick={() => onRollback(v)}><Icon.undo />Rollback</Btn>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "editor" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: C.muted, fontSize: 11 }}>Manual code editor — changes applied immediately on save</div>
          <textarea
            value={editCode}
            onChange={e => setEditCode(e.target.value)}
            style={{ width: "100%", height: 280, background: "#0d1117", color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, fontFamily: "monospace", fontSize: 11, resize: "vertical", outline: "none", lineHeight: 1.5 }}
            spellCheck={false}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn small onClick={() => setEditCode(appSource)} color={C.muted}>Reset</Btn>
            <Btn small onClick={() => onApplyUpdate({ source: editCode, description: "Manual editor update", changes: ["manual-edit"], auto: false })} color={C.green}><Icon.check />Apply</Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── AI Panel (with self-modification) ───────────────────────────────────────
function AIPanel({ busState, appSource, versions, onApply, onApplyUpdate }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    text: "Bus AI online. I control all onboard systems AND can upgrade this app itself.\n\nTry: \"add a water tank panel\", \"change the theme to green\", \"add a fuel gauge\", or just ask me to control the bus."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(null); // { source, description, changes, diff }
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, pending]);

  const buildSystemPrompt = () => `You are the AI brain of a converted skoolie bus (BUS·OS). You have TWO modes:

MODE 1 — SYSTEM CONTROL: Control bus systems (lighting, HVAC, doors, power, entertainment).
MODE 2 — APP SELF-MODIFICATION: Modify the React app source code to add features, fix bugs, change UI.

Current Bus State:
- Lighting: ${busState.lighting.zones.map((z, i) => `${["Driver","Front","Mid","Rear","Exterior","Underglow"][i]}: ${z.on ? "ON@" + z.brightness + "%" : "OFF"}`).join(", ")}
- Climate: Mode=${busState.hvac.mode}, Target=${busState.hvac.target}°F, Interior=${busState.hvac.interior}°F
- Doors: ${busState.doors.doors.map((o, i) => `${["Front","Rear","Exit","BayL","BayR"][i]}:${o ? "open" : "locked"}`).join(" ")}
- Power: Battery=${Math.round(busState.power.battery)}%, Solar=${Math.round(busState.power.solar)}W
- Entertainment: Volume=${busState.ent.volume}%, WiFi=${busState.ent.ent[3] ? "ON" : "OFF"}

VERSION HISTORY: ${versions.map(v => `v${v.version}: ${v.description}`).join(" | ") || "none yet"}

─── FOR SYSTEM CONTROL, respond with JSON:
\`\`\`json
{"type":"control","lighting":{"zones":[...or null]},"hvac":{...},"doors":{"doors":[...]},"ent":{...}}
\`\`\`

─── FOR APP MODIFICATIONS, respond with the COMPLETE new React JSX source code:
\`\`\`update
{"description":"what changed","changes":["tag1","tag2"]}
\`\`\`
\`\`\`jsx
[COMPLETE FULL JSX SOURCE CODE — must be self-contained, no imports except React hooks]
\`\`\`

IMPORTANT RULES FOR APP MODIFICATION:
- Return the COMPLETE file, not just the changed parts
- Keep ALL existing functionality unless asked to remove it
- Imports must stay as: import { useState, useEffect, useRef, useCallback } from "react";
- No external imports — inline everything
- The default export must be named BusAIControl
- Keep the DevPanel, AIPanel, and self-modification system intact always
- Make meaningful, working changes that actually improve the app
- Be creative and add real value

If the user asks for both (e.g. "turn off lights AND add a water tank panel"), do the system control AND code update.`;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          system: buildSystemPrompt(),
          messages: [...history, { role: "user", content: userMsg }]
        })
      });
      const data = await res.json();
      const rawText = data.content?.[0]?.text || "No response.";

      // Extract control JSON
      const controlMatch = rawText.match(/```json\s*([\s\S]*?)```/);
      // Extract update metadata
      const updateMetaMatch = rawText.match(/```update\s*([\s\S]*?)```/);
      // Extract JSX source
      const jsxMatch = rawText.match(/```jsx\s*([\s\S]*?)```/);

      let displayText = rawText
        .replace(/```json[\s\S]*?```/g, "")
        .replace(/```update[\s\S]*?```/g, "")
        .replace(/```jsx[\s\S]*?```/g, "")
        .trim();
      if (!displayText) displayText = "Systems updated.";

      setMessages(prev => [...prev, { role: "assistant", text: displayText }]);

      // Apply system control
      if (controlMatch) {
        try {
          const c = JSON.parse(controlMatch[1]);
          if (c.type === "control") onApply(c);
        } catch {}
      }

      // Stage code update for preview + confirmation
      if (jsxMatch && jsxMatch[1].trim().length > 200) {
        let meta = { description: "AI upgrade", changes: ["update"] };
        if (updateMetaMatch) {
          try { meta = JSON.parse(updateMetaMatch[1]); } catch {}
        }
        setPending({ source: jsxMatch[1].trim(), description: meta.description, changes: meta.changes });
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error. Check API access." }]);
    } finally {
      setLoading(false);
    }
  };

  const confirmUpdate = () => {
    if (!pending) return;
    onApplyUpdate({ source: pending.source, description: pending.description, changes: pending.changes });
    setPending(null);
    setMessages(prev => [...prev, { role: "assistant", text: `✓ Update applied. The app has been upgraded. Check the Dev tab for the full diff and history.` }]);
  };

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <SectionHeader icon={Icon.ai} label="AI Assistant" color={C.accent} />

      {/* Chips */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        {["Night mode", "Add water tank panel", "Change accent to green", "Add fuel gauge", "Lock all doors", "Movie time"].map(s => (
          <button key={s} onClick={() => setInput(s)}
            style={{ padding: "3px 9px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, fontSize: 10, cursor: "pointer", fontFamily: "monospace", transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent; }}
            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}
          >{s}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ height: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 2, marginBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "88%", padding: "8px 12px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? `${C.accent}22` : C.surface, border: `1px solid ${m.role === "user" ? C.accent + "44" : C.border}`, color: C.text, fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "8px 12px" }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Pending update preview */}
      {pending && (
        <div style={{ border: `1px solid ${C.yellow}55`, borderRadius: 12, padding: 12, background: `${C.yellow}08`, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: C.yellow, fontSize: 12 }}>⚡</span>
            <span style={{ color: C.yellow, fontWeight: 700, fontSize: 12, fontFamily: "monospace" }}>APP UPDATE READY</span>
          </div>
          <p style={{ color: C.text, fontSize: 12, margin: "0 0 6px 0" }}>{pending.description}</p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            {pending.changes.map((c, i) => <span key={i} style={{ padding: "2px 8px", borderRadius: 10, background: `${C.yellow}20`, color: C.yellow, fontSize: 10, fontFamily: "monospace" }}>{c}</span>)}
          </div>
          <DiffViewer oldCode={appSource} newCode={pending.source} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Btn onClick={() => setPending(null)} color={C.muted} small>Discard</Btn>
            <Btn onClick={confirmUpdate} color={C.green} small><Icon.check />Apply Update</Btn>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Control bus or ask AI to upgrade the app…"
          style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }}
          onFocus={e => e.target.style.borderColor = C.accent}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        <button onClick={sendMessage} disabled={loading} style={{ width: 42, height: 42, borderRadius: 12, border: "none", background: loading ? C.border : C.accent, color: C.bg, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon.send />
        </button>
      </div>
    </Card>
  );
}

// ─── Status Bar ───────────────────────────────────────────────────────────────
function StatusBar({ power, version }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px", marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: C.text, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", fontFamily: "monospace" }}>BUS·OS</span>
        <span style={{ color: C.accent, fontSize: 10, fontFamily: "monospace", background: `${C.accent}15`, padding: "1px 6px", borderRadius: 10 }}>v{version}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: C.muted, fontSize: 11, fontFamily: "monospace" }}>{time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
        <span style={{ color: C.green }}><Icon.wifi /></span>
        <span style={{ color: power.battery > 20 ? C.green : C.red }}><Icon.battery /></span>
      </div>
    </div>
  );
}

function Alerts({ power, hvac }) {
  const alerts = [];
  if (power.battery < 20) alerts.push({ text: "Low battery — connect to shore power", color: C.red });
  if (hvac.interior > hvac.target + 5) alerts.push({ text: `Interior ${hvac.interior}°F — AC running`, color: C.orange });
  if (hvac.interior < hvac.target - 5) alerts.push({ text: `Interior ${hvac.interior}°F — Heat running`, color: C.yellow });
  if (!alerts.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
      {alerts.map((a, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: `${a.color}15`, border: `1px solid ${a.color}55`, color: a.color, fontSize: 12 }}>
          <Icon.alert />{a.text}
        </div>
      ))}
    </div>
  );
}

// ─── Version storage key ──────────────────────────────────────────────────────
const STORAGE_KEY = "busOS_versions";

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function BusAIControl() {
  const [lighting, setLighting] = useState({ zones: ZONES.map((_, i) => ({ on: i < 4, brightness: i === 0 ? 90 : 70 })) });
  const [hvac, setHvac] = useState({ mode: "Auto", target: 72, interior: 74, exterior: 65, humidity: 45, fanSpeed: 40, defroster: false });
  const [doors, setDoors] = useState({ doors: [false, false, false, false, false] });
  const [power, setPower] = useState({ battery: 78, altVolts: 13.8, solar: 320, load: 42 });
  const [ent, setEnt] = useState({ ent: [true, false, false, true, true], volume: 55 });
  const [activeTab, setActiveTab] = useState("ai");

  // Version / source management
  const [versions, setVersions] = useState(() => {
    try {
      const stored = window.storage ? null : null; // use in-memory
      return [];
    } catch { return []; }
  });
  const [appSource, setAppSource] = useState("// BUS·OS v1.0 — current source loaded in memory");
  const currentVersion = versions.length > 0 ? versions[versions.length - 1].version : "1.0";

  // Load versions from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result?.value) {
          const saved = JSON.parse(result.value);
          if (Array.isArray(saved) && saved.length > 0) {
            setVersions(saved);
            setAppSource(saved[saved.length - 1].source);
          }
        }
      } catch {}
    })();
  }, []);

  // Save versions to storage
  const saveVersions = async (newVersions) => {
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(newVersions)); } catch {}
    setVersions(newVersions);
  };

  const applyChanges = useCallback((changes) => {
    if (changes.lighting?.zones) setLighting(s => ({ ...s, zones: s.zones.map((z, i) => changes.lighting.zones[i] ? { ...z, ...changes.lighting.zones[i] } : z) }));
    if (changes.hvac) setHvac(s => ({ ...s, ...changes.hvac }));
    if (changes.doors?.doors) setDoors(s => ({ ...s, doors: changes.doors.doors }));
    if (changes.ent) setEnt(s => ({ ...s, ...changes.ent }));
  }, []);

  const applyUpdate = useCallback(async ({ source, description, changes }) => {
    const versionNum = versions.length === 0 ? "1.1" : (() => {
      const last = versions[versions.length - 1].version;
      const parts = last.split(".").map(Number);
      parts[1] = (parts[1] || 0) + 1;
      return parts.join(".");
    })();

    const newEntry = {
      id: Date.now(),
      version: versionNum,
      timestamp: new Date().toLocaleString(),
      description,
      changes,
      source,
      previousSource: appSource,
    };

    const newVersions = [...versions, newEntry];
    await saveVersions(newVersions);
    setAppSource(source);
  }, [versions, appSource]);

  const rollback = useCallback(async (targetVersion) => {
    const idx = versions.findIndex(v => v.id === targetVersion.id);
    if (idx < 0) return;
    const newVersions = versions.slice(0, idx + 1);
    await saveVersions(newVersions);
    setAppSource(targetVersion.source);
  }, [versions]);

  useInterval(() => {
    setHvac(s => ({ ...s, interior: Math.round(lerp(s.interior, s.mode === "Off" ? s.exterior : s.target, 0.05) + (Math.random() - 0.5) * 0.4), exterior: Math.round(s.exterior + (Math.random() - 0.5) * 0.3) }));
    setPower(s => ({ ...s, battery: clamp(s.battery + (s.solar > 0 ? 0.05 : -0.08) + (Math.random() - 0.5) * 0.1, 0, 100), solar: clamp(s.solar + (Math.random() - 0.5) * 10, 0, 600), load: clamp(s.load + (Math.random() - 0.5) * 2, 20, 80) }));
  }, 2000);

  const busState = { lighting, hvac, doors, power, ent };

  const tabs = [
    { id: "ai", label: "AI", icon: Icon.ai },
    { id: "lights", label: "Lights", icon: Icon.bulb },
    { id: "climate", label: "Climate", icon: Icon.thermo },
    { id: "doors", label: "Doors", icon: Icon.door },
    { id: "power", label: "Power", icon: Icon.power },
    { id: "ent", label: "Media", icon: Icon.music },
    { id: "dev", label: "Dev", icon: Icon.code },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Helvetica Neue', 'Arial', sans-serif", maxWidth: 480, margin: "0 auto", padding: "12px 14px 80px" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        input::placeholder { color: ${C.muted}; }
        textarea { outline: none; }
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
      `}</style>

      <StatusBar power={power} version={currentVersion} />
      <Alerts power={power} hvac={hvac} />

      {activeTab === "ai" && <AIPanel busState={busState} appSource={appSource} versions={versions} onApply={applyChanges} onApplyUpdate={applyUpdate} />}
      {activeTab === "lights" && <LightingPanel state={lighting} setState={setLighting} />}
      {activeTab === "climate" && <HVACPanel state={hvac} setState={setHvac} />}
      {activeTab === "doors" && <DoorsPanel state={doors} setState={setDoors} />}
      {activeTab === "power" && <PowerPanel state={power} />}
      {activeTab === "ent" && <EntPanel state={ent} setState={setEnt} />}
      {activeTab === "dev" && <DevPanel appSource={appSource} versions={versions} onApplyUpdate={applyUpdate} onRollback={rollback} />}

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", padding: "6px 0 8px" }}>
        {tabs.map(t => {
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "none", cursor: "pointer", color: active ? (t.id === "dev" ? C.purple : C.accent) : C.muted, transition: "color 0.2s", padding: "4px 0", position: "relative" }}>
              <t.icon />
              <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.04em" }}>{t.label.toUpperCase()}</span>
              {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: t.id === "dev" ? C.purple : C.accent, boxShadow: `0 0 6px ${t.id === "dev" ? C.purple : C.accent}` }} />}
              {t.id === "dev" && versions.length > 0 && !active && (
                <div style={{ position: "absolute", top: 2, right: 8, width: 6, height: 6, borderRadius: "50%", background: C.purple }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
