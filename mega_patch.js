const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

// ── 1. Hot-reload engine ──────────────────────────────────────────────────────
const hotReloadEngine = `
// ─── Hot Reload Engine ────────────────────────────────────────────────────────
// The app checks GitHub for a new bundle every 5 min and reloads without reinstall
const GITHUB_BUNDLE_URL = "https://raw.githubusercontent.com/AllMostCoin/bus-os/main/public/bundle.js";
const BUNDLE_VERSION_KEY = "busOS_bundleVersion";

function useHotReload() {
  const [updateReady, setUpdateReady] = useState(false);
  const [newVersion, setNewVersion] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(GITHUB_BUNDLE_URL + "?t=" + Date.now());
        if (!res.ok) return;
        const text = await res.text();
        const match = text.match(/\\/\\/ BUNDLE_VERSION: ([\\d.]+)/);
        if (!match) return;
        const remote = match[1];
        const local = localStorage.getItem(BUNDLE_VERSION_KEY) || "0";
        if (remote !== local) { setUpdateReady(true); setNewVersion(remote); }
      } catch {}
    };
    check();
    const id = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const applyUpdate = async () => {
    try {
      const res = await fetch(GITHUB_BUNDLE_URL + "?t=" + Date.now());
      const text = await res.text();
      const match = text.match(/\\/\\/ BUNDLE_VERSION: ([\\d.]+)/);
      if (match) {
        localStorage.setItem(BUNDLE_VERSION_KEY, match[1]);
        localStorage.setItem("busOS_hotBundle", text);
        window.location.reload();
      }
    } catch {}
  };

  return { updateReady, newVersion, applyUpdate };
}

`;

// ── 2. Conversation History & Projects ───────────────────────────────────────
const historyEngine = `
// ─── Conversation History & Projects ─────────────────────────────────────────
const HISTORY_KEY = "busOS_history";
const PROJECTS_KEY = "busOS_projects";

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-500))); } catch {} // keep last 500 msgs
}
function loadProjects() {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]"); } catch { return []; }
}
function saveProjects(p) {
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(p)); } catch {}
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel({ onLoadConversation }) {
  const [projects, setProjects] = useState(loadProjects);
  const [history, setHistory] = useState(loadHistory);
  const [activeProject, setActiveProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [view, setView] = useState("projects"); // projects | messages

  const projectMsgs = activeProject
    ? history.filter(m => m.project === activeProject)
    : history;

  const grouped = projectMsgs.reduce((acc, m) => {
    const date = new Date(m.ts).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(m);
    return acc;
  }, {});

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const p = [...projects, { id: Date.now(), name: newProjectName.trim(), color: ["#4ade80","#fb923c","#c084fc","#00d4ff","#f87171"][projects.length % 5] }];
    saveProjects(p); setProjects(p); setNewProjectName("");
  };

  const deleteProject = (id) => {
    const p = projects.filter(x => x.id !== id);
    saveProjects(p); setProjects(p);
  };

  const clearHistory = () => {
    if (window.confirm("Clear all history?")) { saveHistory([]); setHistory([]); }
  };

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader icon={Icon.history} label="History & Projects" color={C.purple} />

      <div style={{ display: "flex", gap: 6 }}>
        {["projects", "messages"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ padding: "5px 14px", borderRadius: 8, border: \`1px solid \${view === v ? C.accent : C.border}\`, background: view === v ? \`\${C.accent}15\` : C.surface, color: view === v ? C.accent : C.muted, cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>{v.toUpperCase()}</button>
        ))}
        <button onClick={clearHistory} style={{ marginLeft: "auto", padding: "5px 10px", borderRadius: 8, border: \`1px solid \${C.border}\`, background: C.surface, color: C.muted, cursor: "pointer", fontSize: 11 }}>Clear All</button>
      </div>

      {view === "projects" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} onKeyDown={e => e.key === "Enter" && addProject()} placeholder="New project name..." style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: \`1px solid \${C.border}\`, background: C.surface, color: C.text, fontSize: 12, outline: "none" }} />
            <Btn small onClick={addProject} color={C.accent}>+</Btn>
          </div>
          <div onClick={() => { setActiveProject(null); setView("messages"); }} style={{ padding: "10px 12px", borderRadius: 10, background: C.surface, border: \`1px solid \${C.border}\`, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.text, fontSize: 13 }}>📋 All Conversations</span>
            <span style={{ color: C.muted, fontSize: 11 }}>{history.length} msgs</span>
          </div>
          {projects.map(p => (
            <div key={p.id} style={{ padding: "10px 12px", borderRadius: 10, background: C.surface, border: \`1px solid \${C.border}\`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              onClick={() => { setActiveProject(p.name); setView("messages"); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                <span style={{ color: C.text, fontSize: 13 }}>{p.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.muted, fontSize: 11 }}>{history.filter(m => m.project === p.name).length} msgs</span>
                <button onClick={e => { e.stopPropagation(); deleteProject(p.id); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "messages" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 420, overflowY: "auto" }}>
          {activeProject && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <button onClick={() => setView("projects")} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>←</button>
              <span style={{ color: C.accent, fontSize: 13, fontWeight: 700 }}>{activeProject}</span>
            </div>
          )}
          {Object.keys(grouped).length === 0 && <div style={{ color: C.muted, fontSize: 12, textAlign: "center", padding: 20 }}>No messages yet</div>}
          {Object.entries(grouped).reverse().map(([date, msgs]) => (
            <div key={date}>
              <div style={{ color: C.muted, fontSize: 10, fontFamily: "monospace", padding: "6px 0 3px", textTransform: "uppercase" }}>{date}</div>
              {msgs.map((m, i) => (
                <div key={i} onClick={() => onLoadConversation && onLoadConversation(m)} style={{ padding: "7px 10px", borderRadius: 8, background: m.role === "user" ? \`\${C.accent}08\` : C.surface, marginBottom: 3, cursor: "pointer", borderLeft: \`2px solid \${m.role === "user" ? C.accent : C.border}\` }}>
                  <div style={{ color: m.role === "user" ? C.accent : C.muted, fontSize: 10, fontFamily: "monospace", marginBottom: 2 }}>{m.role.toUpperCase()} · {new Date(m.ts).toLocaleTimeString()}{m.project ? \` · \${m.project}\` : ""}</div>
                  <div style={{ color: C.text, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.text}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

`;

// ── 3. Insert engines before Diff Viewer ─────────────────────────────────────
c = c.replace('// ─── Diff Viewer', hotReloadEngine + historyEngine + '// ─── Diff Viewer');

// ── 4. Add history icon ───────────────────────────────────────────────────────
c = c.replace(
  'settings: () => <svg',
  `history: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  settings: () => <svg`
);

// ── 5. Add history tab ────────────────────────────────────────────────────────
c = c.replace(
  '    { id: "settings", label: "Setup", icon: Icon.settings },',
  `    { id: "history", label: "History", icon: Icon.history },
    { id: "settings", label: "Setup", icon: Icon.settings },`
);

// ── 6. Render history panel ───────────────────────────────────────────────────
c = c.replace(
  '{activeTab === "settings" && <SettingsPanel',
  `{activeTab === "history" && <HistoryPanel onLoadConversation={(m) => { setActiveTab("ai"); }} />}
      {activeTab === "settings" && <SettingsPanel`
);

// ── 7. Add useHotReload to main app ───────────────────────────────────────────
c = c.replace(
  '  const { updateAvailable, updating, setUpdating, markUpdated } = useAutoUpdate();',
  `  const { updateAvailable, updating, setUpdating, markUpdated } = useAutoUpdate();
  const { updateReady, newVersion, applyUpdate } = useHotReload();`
);

// ── 8. Add update banner for hot-reload ───────────────────────────────────────
c = c.replace(
  '{updateAvailable && (',
  `{updateReady && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#c084fc22", border: "1px solid #c084fc", borderRadius: 10, marginBottom: 8 }}>
          <span style={{ color: "#c084fc", fontSize: 12 }}>⚡ Hot update v{newVersion} ready</span>
          <button onClick={applyUpdate} style={{ color: "#c084fc", fontSize: 11, background: "none", border: "1px solid #c084fc", padding: "3px 8px", borderRadius: 6, cursor: "pointer" }}>Apply Now</button>
        </div>
      )}
      {updateAvailable && (`
);

// ── 9. Add project selector to AIPanel ───────────────────────────────────────
c = c.replace(
  'function AIPanel({ busState, appSource, versions, onApply, onApplyUpdate, aiConfig = {} }) {',
  'function AIPanel({ busState, appSource, versions, onApply, onApplyUpdate, aiConfig = {}, projects = [] }) {'
);

// ── 10. Persist messages to history storage in AIPanel ───────────────────────
c = c.replace(
  "setMessages(prev => [...prev, { role: 'assistant', text: displayText }]);",
  `setMessages(prev => {
        const updated = [...prev, { role: 'assistant', text: displayText }];
        const h = loadHistory();
        h.push({ role: 'user', text: userMsg, ts: Date.now(), project: currentProject });
        h.push({ role: 'assistant', text: displayText, ts: Date.now(), project: currentProject });
        saveHistory(h);
        return updated;
      });`
);

// ── 11. Add currentProject state to AIPanel ───────────────────────────────────
c = c.replace(
  '  const [loading, setLoading] = useState(false);',
  `  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(() => { try { return localStorage.getItem("busOS_currentProject") || "General"; } catch { return "General"; } });
  const allProjects = ["General", ...loadProjects().map(p => p.name)];`
);

// ── 12. Add project selector UI in AIPanel ────────────────────────────────────
c = c.replace(
  '{/* Chips */}',
  `{/* Project Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ color: C.muted, fontSize: 11 }}>Project:</span>
        <select value={currentProject} onChange={e => { setCurrentProject(e.target.value); localStorage.setItem("busOS_currentProject", e.target.value); }} style={{ flex: 1, padding: "4px 8px", borderRadius: 8, border: \`1px solid \${C.border}\`, background: C.surface, color: C.accent, fontSize: 12, outline: "none" }}>
          {allProjects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {/* Chips */}`
);

// ── 13. Pass projects to AIPanel ──────────────────────────────────────────────
c = c.replace(
  '<AIPanel busState={busState} appSource={appSource} versions={versions} onApply={applyChanges} onApplyUpdate={applyUpdate} aiConfig={aiConfig} />',
  '<AIPanel busState={busState} appSource={appSource} versions={versions} onApply={applyChanges} onApplyUpdate={applyUpdate} aiConfig={aiConfig} projects={loadProjects()} />'
);

// ── 14. Add loadProjects/saveHistory/loadHistory imports at top ───────────────
c = c.replace(
  'const GITHUB_BUNDLE_URL',
  `// Storage helpers accessible globally
const loadHistory = () => { try { return JSON.parse(localStorage.getItem("busOS_history") || "[]"); } catch { return []; } };
const saveHistory = (h) => { try { localStorage.setItem("busOS_history", JSON.stringify(h.slice(-500))); } catch {} };
const loadProjects = () => { try { return JSON.parse(localStorage.getItem("busOS_projects") || "[]"); } catch { return []; } };
const saveProjects = (p) => { try { localStorage.setItem("busOS_projects", JSON.stringify(p)); } catch {} };

const GITHUB_BUNDLE_URL`
);

// Remove duplicate declarations inside HistoryPanel
c = c.replace(
  `function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-500))); } catch {} // keep last 500 msgs
}
function loadProjects() {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]"); } catch { return []; }
}
function saveProjects(p) {
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(p)); } catch {}
}`,
  ''
);

fs.writeFileSync('src/App.js', c);
console.log('Mega patch done! Length:', c.length);
