const BOARD_WIDTH = 2200;
const BOARD_HEIGHT = 1400;
const STORAGE_KEY = "webshark-designer-state-v2";
const DEFAULT_BACKGROUND = "#0b1220";
const MAX_LOG_ENTRIES = 1500;
const MAX_AI_LOG_BUFFER = 120;

const ROLE_PRESETS = {
  architect: {
    label: "Architect",
    summary: "Architecture-first layout with AI, exports, logs, and workspace orchestration.",
    panels: ["panel-library", "panel-custom", "panel-workspaces", "panel-properties", "panel-board-style", "panel-exports", "panel-ddl", "panel-ai"],
  },
  engineer: {
    label: "Engineer",
    summary: "Implementation-focused layout with technical blocks, properties, AI, and diagnostics.",
    panels: ["panel-library", "panel-custom", "panel-workspaces", "panel-properties", "panel-board-style", "panel-ddl", "panel-ai"],
  },
  designer: {
    label: "Designer",
    summary: "Visual-first layout with custom elements, styling, exports, and elegant motion.",
    panels: ["panel-library", "panel-custom", "panel-workspaces", "panel-properties", "panel-board-style", "panel-exports", "panel-ai"],
  },
  analyst: {
    label: "Analyst",
    summary: "Insight-oriented layout emphasizing logs, exports, workspaces, and AI interpretation.",
    panels: ["panel-workspaces", "panel-exports", "panel-ddl", "panel-ai"],
  },
};

const DEFAULT_SETTINGS = {
  theme: "dark",
  role: "architect",
  animations: "subtle",
  autosaveSeconds: 20,
  defaultExport: "png",
  logLevel: "trace",
  compactMode: false,
  showGrid: true,
  snapToGrid: true,
  panelSnap: true,
  hints: true,
  aiLogAccess: true,
  aiLiveLogs: true,
  glassPanels: true,
};

const LOG_LEVEL_RANK = {
  trace: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_UI = {
  leftWidth: 290,
  rightWidth: 340,
  logHeight: 260,
  panelOrder: {
    leftDock: ["panel-library", "panel-custom", "panel-workspaces"],
    rightDock: ["panel-properties", "panel-board-style", "panel-exports", "panel-ddl", "panel-ai"],
  },
};

const state = {
  users: [],
  workspaces: [],
  currentUserId: null,
  currentWorkspaceId: null,
  settings: structuredClone(DEFAULT_SETTINGS),
  ui: structuredClone(DEFAULT_UI),
  board: createEmptyBoard(),
  customPackages: [],
  logs: [],
  selectedLogId: null,
  nextId: 1,
  activeTool: "select",
  aiLogBuffer: [],
};

const dom = {
  body: document.body,
  authOverlay: document.querySelector("#authOverlay"),
  authUsername: document.querySelector("#authUsername"),
  authPassword: document.querySelector("#authPassword"),
  authRole: document.querySelector("#authRole"),
  authMessage: document.querySelector("#authMessage"),
  signInBtn: document.querySelector("#signInBtn"),
  registerBtn: document.querySelector("#registerBtn"),
  settingsModal: document.querySelector("#settingsModal"),
  closeSettingsBtn: document.querySelector("#closeSettingsBtn"),
  openSettingsBtn: document.querySelector("#openSettingsBtn"),
  appShell: document.querySelector("#appShell"),
  themeToggleBtn: document.querySelector("#themeToggleBtn"),
  roleSummary: document.querySelector("#roleSummary"),
  currentUserDisplay: document.querySelector("#currentUserDisplay"),
  currentRoleDisplay: document.querySelector("#currentRoleDisplay"),
  workspaceSelect: document.querySelector("#workspaceSelect"),
  workspaceList: document.querySelector("#workspaceList"),
  newWorkspaceBtn: document.querySelector("#newWorkspaceBtn"),
  saveWorkspaceBtn: document.querySelector("#saveWorkspaceBtn"),
  duplicateWorkspaceBtn: document.querySelector("#duplicateWorkspaceBtn"),
  deleteWorkspaceBtn: document.querySelector("#deleteWorkspaceBtn"),
  newBoardBtn: document.querySelector("#newBoardBtn"),
  sampleBoardBtn: document.querySelector("#sampleBoardBtn"),
  importJsonBtn: document.querySelector("#importJsonBtn"),
  importJsonInput: document.querySelector("#importJsonInput"),
  exportCurrentBtn: document.querySelector("#exportCurrentBtn"),
  exportAllBtn: document.querySelector("#exportAllBtn"),
  exportFormatSelect: document.querySelector("#exportFormatSelect"),
  deleteSelectionBtn: document.querySelector("#deleteSelectionBtn"),
  duplicateSelectionBtn: document.querySelector("#duplicateSelectionBtn"),
  selectionTitle: document.querySelector("#selectionTitle"),
  selectionSubtitle: document.querySelector("#selectionSubtitle"),
  boardStatus: document.querySelector("#boardStatus"),
  boardScroll: document.querySelector("#boardScroll"),
  boardContent: document.querySelector("#boardContent"),
  boardSurface: document.querySelector("#boardSurface"),
  connectorLayer: document.querySelector("#connectorLayer"),
  nodeLayer: document.querySelector("#nodeLayer"),
  zoomInBtn: document.querySelector("#zoomInBtn"),
  zoomOutBtn: document.querySelector("#zoomOutBtn"),
  zoomRange: document.querySelector("#zoomRange"),
  zoomPercent: document.querySelector("#zoomPercent"),
  leftDock: document.querySelector("#leftDock"),
  rightDock: document.querySelector("#rightDock"),
  leftSplitter: document.querySelector("#leftSplitter"),
  rightSplitter: document.querySelector("#rightSplitter"),
  logSplitter: document.querySelector("#logSplitter"),
  logConsole: document.querySelector("#logConsole"),
  logQueryInput: document.querySelector("#logQueryInput"),
  logLevelFilter: document.querySelector("#logLevelFilter"),
  logList: document.querySelector("#logList"),
  logDetails: document.querySelector("#logDetails"),
  logCount: document.querySelector("#logCount"),
  clearLogsBtn: document.querySelector("#clearLogsBtn"),
  exportLogsBtn: document.querySelector("#exportLogsBtn"),
  propertiesForm: document.querySelector("#propertiesForm"),
  propLabel: document.querySelector("#propLabel"),
  propFill: document.querySelector("#propFill"),
  propStroke: document.querySelector("#propStroke"),
  propTextColor: document.querySelector("#propTextColor"),
  propOpacity: document.querySelector("#propOpacity"),
  propStrokeWidth: document.querySelector("#propStrokeWidth"),
  propFontSize: document.querySelector("#propFontSize"),
  propRadius: document.querySelector("#propRadius"),
  propShadow: document.querySelector("#propShadow"),
  propDash: document.querySelector("#propDash"),
  boardBackground: document.querySelector("#boardBackground"),
  gridToggle: document.querySelector("#gridToggle"),
  customPackageName: document.querySelector("#customPackageName"),
  customElementName: document.querySelector("#customElementName"),
  customShapeType: document.querySelector("#customShapeType"),
  customFill: document.querySelector("#customFill"),
  customStroke: document.querySelector("#customStroke"),
  createCustomElementBtn: document.querySelector("#createCustomElementBtn"),
  saveSelectedElementBtn: document.querySelector("#saveSelectedElementBtn"),
  customPackagesList: document.querySelector("#customPackagesList"),
  ddlEngineSelect: document.querySelector("#ddlEngineSelect"),
  ddlSchemaName: document.querySelector("#ddlSchemaName"),
  ddlIncludeAudit: document.querySelector("#ddlIncludeAudit"),
  generateDdlBtn: document.querySelector("#generateDdlBtn"),
  copyDdlBtn: document.querySelector("#copyDdlBtn"),
  downloadDdlBtn: document.querySelector("#downloadDdlBtn"),
  ddlOutput: document.querySelector("#ddlOutput"),
  aiModelSelect: document.querySelector("#aiModelSelect"),
  downloadModelBtn: document.querySelector("#downloadModelBtn"),
  aiStatus: document.querySelector("#aiStatus"),
  aiProgressBar: document.querySelector("#aiProgressBar"),
  aiPrompt: document.querySelector("#aiPrompt"),
  runAiBtn: document.querySelector("#runAiBtn"),
  aiOutput: document.querySelector("#aiOutput"),
  aiUseLogsToggle: document.querySelector("#aiUseLogsToggle"),
  aiLogSyncStatus: document.querySelector("#aiLogSyncStatus"),
  toastStack: document.querySelector("#toastStack"),
  settingsTheme: document.querySelector("#settingsTheme"),
  settingsRole: document.querySelector("#settingsRole"),
  settingsAnimations: document.querySelector("#settingsAnimations"),
  settingsAutosave: document.querySelector("#settingsAutosave"),
  settingsDefaultExport: document.querySelector("#settingsDefaultExport"),
  settingsLogLevel: document.querySelector("#settingsLogLevel"),
  settingsCompactMode: document.querySelector("#settingsCompactMode"),
  settingsShowGrid: document.querySelector("#settingsShowGrid"),
  settingsSnapToGrid: document.querySelector("#settingsSnapToGrid"),
  settingsPanelSnap: document.querySelector("#settingsPanelSnap"),
  settingsHints: document.querySelector("#settingsHints"),
  settingsAiLogAccess: document.querySelector("#settingsAiLogAccess"),
  settingsAiLiveLogs: document.querySelector("#settingsAiLiveLogs"),
  settingsGlassPanels: document.querySelector("#settingsGlassPanels"),
  applySettingsBtn: document.querySelector("#applySettingsBtn"),
};

const AI_RUNTIME = {
  module: null,
  generator: null,
  modelId: null,
  pdfModule: null,
};

let autosaveTimer = null;
let activeDragPanelId = null;

function createEmptyBoard() {
  return {
    nodes: [],
    connectors: [],
    nextId: 1,
    zoom: 1,
    showGrid: true,
    background: DEFAULT_BACKGROUND,
    selection: null,
    pendingConnectionFrom: null,
  };
}

function uid(prefix) {
  const value = `${prefix}-${Date.now().toString(36)}-${state.nextId}`;
  state.nextId += 1;
  return value;
}

function clone(value) {
  return structuredClone(value);
}

function currentUser() {
  return state.users.find((user) => user.id === state.currentUserId) ?? null;
}

function userWorkspaces() {
  return state.workspaces
    .filter((workspace) => workspace.ownerId === state.currentUserId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function currentWorkspace() {
  return state.workspaces.find((workspace) => workspace.id === state.currentWorkspaceId) ?? null;
}

function boardState() {
  return state.board;
}

function createDefaultNode(type, x, y, overrides = {}) {
  const presets = {
    rectangle: { label: "Process", width: 180, height: 96 },
    rounded: { label: "Service", width: 190, height: 92, radius: 22 },
    ellipse: { label: "Data", width: 182, height: 96, radius: 999 },
    diamond: { label: "Decision", width: 168, height: 168 },
    triangle: { label: "Alert", width: 180, height: 150 },
    note: { label: "Note", width: 190, height: 124, fill: "#fff7cf", stroke: "#d8b04a", textColor: "#2c2414" },
    database: { label: "Database", width: 186, height: 118 },
    text: { label: "Heading", width: 196, height: 72, fill: "#10192a", stroke: "#6fc2ff", textColor: "#f5f7ff" },
  };
  const preset = presets[type] ?? presets.rectangle;
  return {
    kind: "node",
    id: uid("node"),
    type,
    label: preset.label,
    x,
    y,
    width: preset.width,
    height: preset.height,
    fill: preset.fill ?? "#18243a",
    stroke: preset.stroke ?? "#6fc2ff",
    textColor: preset.textColor ?? "#f5f7ff",
    opacity: 100,
    strokeWidth: 2,
    fontSize: 15,
    radius: preset.radius ?? 18,
    shadow: 12,
    ...overrides,
  };
}

function createConnector(fromId, toId, overrides = {}) {
  return {
    kind: "connector",
    id: uid("connector"),
    from: fromId,
    to: toId,
    label: "",
    stroke: "#6fc2ff",
    strokeWidth: 3,
    dash: "solid",
    opacity: 100,
    ...overrides,
  };
}

function buildSampleBoard() {
  const nodes = [
    createDefaultNode("rounded", 180, 140, { label: "Client Apps" }),
    createDefaultNode("rectangle", 470, 140, { label: "API Gateway" }),
    createDefaultNode("diamond", 780, 110, { label: "Policy OK?" }),
    createDefaultNode("database", 1120, 142, { label: "Core Data" }),
    createDefaultNode("note", 490, 360, { label: "Keep interface surfaces minimal\nand observable." }),
    createDefaultNode("ellipse", 160, 390, { label: "Telemetry" }),
  ];
  const connectors = [
    createConnector(nodes[0].id, nodes[1].id),
    createConnector(nodes[1].id, nodes[2].id, { label: "evaluates" }),
    createConnector(nodes[2].id, nodes[3].id, { label: "writes" }),
    createConnector(nodes[1].id, nodes[4].id, { dash: "dashed" }),
    createConnector(nodes[0].id, nodes[5].id),
  ];

  return {
    nodes,
    connectors,
    nextId: state.nextId,
    zoom: 1,
    showGrid: true,
    background: DEFAULT_BACKGROUND,
    selection: { kind: "node", id: nodes[0].id },
    pendingConnectionFrom: null,
  };
}

function createDefaultWorkspace(name = "Main workspace") {
  return {
    id: uid("workspace"),
    ownerId: state.currentUserId,
    name,
    role: state.settings.role,
    board: buildSampleBoard(),
    packages: [],
    updatedAt: new Date().toISOString(),
  };
}

function loadPersistentState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    savePersistentState();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.users = Array.isArray(parsed.users) ? parsed.users : [];
    state.workspaces = Array.isArray(parsed.workspaces) ? parsed.workspaces : [];
    state.currentUserId = parsed.currentUserId ?? null;
    state.currentWorkspaceId = parsed.currentWorkspaceId ?? null;
    state.settings = { ...structuredClone(DEFAULT_SETTINGS), ...(parsed.settings ?? {}) };
    state.ui = {
      ...structuredClone(DEFAULT_UI),
      ...(parsed.ui ?? {}),
      panelOrder: {
        ...structuredClone(DEFAULT_UI.panelOrder),
        ...(parsed.ui?.panelOrder ?? {}),
      },
    };
    state.board = { ...createEmptyBoard(), ...(parsed.board ?? {}) };
    state.customPackages = Array.isArray(parsed.customPackages) ? parsed.customPackages : [];
    state.logs = Array.isArray(parsed.logs) ? parsed.logs : [];
    state.selectedLogId = parsed.selectedLogId ?? null;
    state.nextId = typeof parsed.nextId === "number" ? parsed.nextId : 1;
    state.aiLogBuffer = Array.isArray(parsed.aiLogBuffer) ? parsed.aiLogBuffer : [];
  } catch {
    savePersistentState();
  }
}

function savePersistentState() {
  const payload = {
    users: state.users,
    workspaces: state.workspaces,
    currentUserId: state.currentUserId,
    currentWorkspaceId: state.currentWorkspaceId,
    settings: state.settings,
    ui: state.ui,
    board: state.board,
    customPackages: state.customPackages,
    logs: state.logs,
    selectedLogId: state.selectedLogId,
    nextId: state.nextId,
    aiLogBuffer: state.aiLogBuffer,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function syncUserProfile() {
  const user = currentUser();
  if (!user) {
    return;
  }
  user.role = state.settings.role;
  user.settings = clone(state.settings);
  user.ui = clone(state.ui);
  user.lastWorkspaceId = state.currentWorkspaceId;
}

function startSession(user) {
  state.currentUserId = user.id;
  state.settings = { ...structuredClone(DEFAULT_SETTINGS), ...(user.settings ?? {}), role: user.role };
  state.ui = {
    ...structuredClone(DEFAULT_UI),
    ...(user.ui ?? {}),
    panelOrder: {
      ...structuredClone(DEFAULT_UI.panelOrder),
      ...(user.ui?.panelOrder ?? {}),
    },
  };

  const mine = userWorkspaces();
  if (mine.length === 0) {
    const workspace = createDefaultWorkspace(`${ROLE_PRESETS[user.role].label} workspace`);
    state.workspaces.push(workspace);
    state.currentWorkspaceId = workspace.id;
    state.board = clone(workspace.board);
    state.customPackages = clone(workspace.packages);
  } else {
    const preferred = mine.find((workspace) => workspace.id === user.lastWorkspaceId) ?? mine[0];
    loadWorkspace(preferred.id, false);
  }

  syncAiLogBufferFromLogs();
  applySettingsToDocument();
  applyPanelLayout();
  syncSettingsForm();
  dom.authOverlay.classList.add("hidden");
  dom.appShell.classList.remove("hidden");
  render();
  queueAutosave();
  addLog("info", "auth", "Session started", { user: user.username, role: user.role });
}

function signIn() {
  const username = dom.authUsername.value.trim();
  const password = dom.authPassword.value;
  const user = state.users.find((candidate) => candidate.username === username && candidate.password === password);
  if (!user) {
    dom.authMessage.textContent = "Username or password did not match a local account.";
    return;
  }
  dom.authMessage.textContent = "";
  startSession(user);
}

function register() {
  const username = dom.authUsername.value.trim();
  const password = dom.authPassword.value;
  const role = dom.authRole.value;
  if (!username || !password) {
    dom.authMessage.textContent = "Enter both a username and password.";
    return;
  }
  if (state.users.some((candidate) => candidate.username === username)) {
    dom.authMessage.textContent = "That username already exists locally.";
    return;
  }
  const user = {
    id: uid("user"),
    username,
    password,
    role,
    settings: { ...structuredClone(DEFAULT_SETTINGS), role },
    ui: clone(DEFAULT_UI),
    lastWorkspaceId: null,
  };
  state.users.push(user);
  savePersistentState();
  dom.authMessage.textContent = "";
  startSession(user);
}

function applySettingsToDocument() {
  dom.body.dataset.theme = state.settings.theme;
  dom.body.dataset.animations = state.settings.animations;
  dom.body.dataset.density = state.settings.compactMode ? "compact" : "comfortable";
  dom.body.dataset.glass = state.settings.glassPanels ? "true" : "false";
  dom.body.style.setProperty("--left-width", `${state.ui.leftWidth}px`);
  dom.body.style.setProperty("--right-width", `${state.ui.rightWidth}px`);
  dom.body.style.setProperty("--log-height", `${state.ui.logHeight}px`);
}

function syncSettingsForm() {
  dom.settingsTheme.value = state.settings.theme;
  dom.settingsRole.value = state.settings.role;
  dom.settingsAnimations.value = state.settings.animations;
  dom.settingsAutosave.value = String(state.settings.autosaveSeconds);
  dom.settingsDefaultExport.value = state.settings.defaultExport;
  dom.settingsLogLevel.value = state.settings.logLevel;
  dom.settingsCompactMode.checked = state.settings.compactMode;
  dom.settingsShowGrid.checked = boardState().showGrid;
  dom.settingsSnapToGrid.checked = state.settings.snapToGrid;
  dom.settingsPanelSnap.checked = state.settings.panelSnap;
  dom.settingsHints.checked = state.settings.hints;
  dom.settingsAiLogAccess.checked = state.settings.aiLogAccess;
  dom.settingsAiLiveLogs.checked = state.settings.aiLiveLogs;
  dom.settingsGlassPanels.checked = state.settings.glassPanels;
}

function applySettings() {
  state.settings = {
    ...state.settings,
    theme: dom.settingsTheme.value,
    role: dom.settingsRole.value,
    animations: dom.settingsAnimations.value,
    autosaveSeconds: clamp(Number(dom.settingsAutosave.value) || 20, 5, 180),
    defaultExport: dom.settingsDefaultExport.value,
    logLevel: dom.settingsLogLevel.value,
    compactMode: dom.settingsCompactMode.checked,
    snapToGrid: dom.settingsSnapToGrid.checked,
    panelSnap: dom.settingsPanelSnap.checked,
    hints: dom.settingsHints.checked,
    aiLogAccess: dom.settingsAiLogAccess.checked,
    aiLiveLogs: dom.settingsAiLiveLogs.checked,
    glassPanels: dom.settingsGlassPanels.checked,
  };
  boardState().showGrid = dom.settingsShowGrid.checked;
  if (currentWorkspace()) {
    currentWorkspace().role = state.settings.role;
  }
  state.activeTool = "select";
  updateToolButtons();
  syncUserProfile();
  syncAiLogBufferFromLogs();
  applySettingsToDocument();
  renderRoleView();
  queueAutosave();
  savePersistentState();
  addLog("info", "settings", "Settings applied", clone(state.settings));
  setStatus("Workspace options updated.");
  showToast("Settings updated");
  closeSettings();
  render();
}

function openSettings() {
  syncSettingsForm();
  dom.settingsModal.classList.remove("hidden");
}

function closeSettings() {
  dom.settingsModal.classList.add("hidden");
}

function renderRoleView() {
  const preset = ROLE_PRESETS[state.settings.role] ?? ROLE_PRESETS.architect;
  dom.roleSummary.textContent = preset.summary;
  dom.currentRoleDisplay.textContent = preset.label;
  dom.currentUserDisplay.textContent = currentUser()?.username ?? "Guest";

  document.querySelectorAll("[data-visible-roles]").forEach((panel) => {
    const allowed = panel.dataset.visibleRoles.split(",");
    const roleVisible = preset.panels.includes(panel.id) && allowed.includes(state.settings.role);
    panel.dataset.hidden = roleVisible ? "false" : "true";
  });
}

function applyPanelLayout() {
  const allPanels = Array.from(document.querySelectorAll(".panel-section[data-panel-id]"));
  const lookup = Object.fromEntries(allPanels.map((panel) => [panel.id, panel]));
  ["leftDock", "rightDock"].forEach((dockId) => {
    const dock = document.querySelector(`#${dockId}`);
    dock.innerHTML = "";
    const order = state.ui.panelOrder[dockId] ?? [];
    order.forEach((panelId) => {
      if (lookup[panelId]) {
        dock.appendChild(lookup[panelId]);
      }
    });
  });
  for (const panel of allPanels) {
    if (!dom.leftDock.contains(panel) && !dom.rightDock.contains(panel)) {
      if (!state.ui.panelOrder.rightDock.includes(panel.id)) {
        state.ui.panelOrder.rightDock.push(panel.id);
      }
      dom.rightDock.appendChild(panel);
    }
  }
  renderRoleView();
}

function persistPanelLayout() {
  state.ui.panelOrder = {
    leftDock: Array.from(dom.leftDock.children).map((panel) => panel.id),
    rightDock: Array.from(dom.rightDock.children).map((panel) => panel.id),
  };
  syncUserProfile();
  savePersistentState();
}

function serializeBoard() {
  return clone({
    nodes: boardState().nodes,
    connectors: boardState().connectors,
    nextId: boardState().nextId,
    zoom: boardState().zoom,
    showGrid: boardState().showGrid,
    background: boardState().background,
    selection: boardState().selection,
    pendingConnectionFrom: null,
  });
}

function loadWorkspace(workspaceId, shouldLog = true) {
  const workspace = state.workspaces.find((item) => item.id === workspaceId && item.ownerId === state.currentUserId);
  if (!workspace) {
    return;
  }
  state.currentWorkspaceId = workspace.id;
  state.board = { ...createEmptyBoard(), ...clone(workspace.board) };
  state.customPackages = clone(workspace.packages ?? []);
  syncUserProfile();
  savePersistentState();
  render();
  if (shouldLog) {
    addLog("info", "workspace", "Workspace loaded", { workspace: workspace.name });
    setStatus(`Loaded ${workspace.name}.`);
  }
}

function saveCurrentWorkspace(shouldNotify = true, category = "workspace") {
  const workspace = currentWorkspace();
  if (!workspace) {
    return;
  }
  workspace.board = serializeBoard();
  workspace.packages = clone(state.customPackages);
  workspace.role = state.settings.role;
  workspace.updatedAt = new Date().toISOString();
  syncUserProfile();
  savePersistentState();
  renderWorkspaceSelectors();
  if (shouldNotify) {
    addLog("info", category, "Workspace saved", { workspace: workspace.name, nodes: boardState().nodes.length, connectors: boardState().connectors.length });
    showToast(`Saved ${workspace.name}`);
    setStatus("Workspace saved.");
  }
}

function createWorkspaceFromPrompt() {
  const name = window.prompt("Workspace name", `Workspace ${userWorkspaces().length + 1}`);
  if (!name) {
    return;
  }
  const workspace = createDefaultWorkspace(name.trim());
  state.workspaces.push(workspace);
  loadWorkspace(workspace.id, false);
  savePersistentState();
  render();
  addLog("info", "workspace", "Workspace created", { workspace: workspace.name });
  showToast(`Created ${workspace.name}`);
}

function duplicateWorkspace() {
  const source = currentWorkspace();
  if (!source) {
    return;
  }
  const workspace = {
    id: uid("workspace"),
    ownerId: state.currentUserId,
    name: `${source.name} copy`,
    role: state.settings.role,
    board: serializeBoard(),
    packages: clone(state.customPackages),
    updatedAt: new Date().toISOString(),
  };
  state.workspaces.push(workspace);
  loadWorkspace(workspace.id, false);
  savePersistentState();
  render();
  addLog("info", "workspace", "Workspace duplicated", { from: source.name, to: workspace.name });
  showToast(`Duplicated ${source.name}`);
}

function deleteWorkspace() {
  const mine = userWorkspaces();
  const workspace = currentWorkspace();
  if (!workspace || mine.length <= 1) {
    setStatus("At least one workspace must remain.");
    return;
  }
  state.workspaces = state.workspaces.filter((item) => item.id !== workspace.id);
  const next = userWorkspaces()[0];
  loadWorkspace(next.id, false);
  savePersistentState();
  render();
  addLog("warn", "workspace", "Workspace deleted", { workspace: workspace.name });
  showToast(`Deleted ${workspace.name}`);
}

function renderWorkspaceSelectors() {
  const workspaces = userWorkspaces();
  dom.workspaceSelect.innerHTML = "";
  dom.workspaceList.innerHTML = "";

  workspaces.forEach((workspace) => {
    const option = document.createElement("option");
    option.value = workspace.id;
    option.textContent = workspace.name;
    option.selected = workspace.id === state.currentWorkspaceId;
    dom.workspaceSelect.appendChild(option);

    const card = document.createElement("button");
    card.type = "button";
    card.className = "workspace-card";
    card.classList.toggle("active", workspace.id === state.currentWorkspaceId);
    card.innerHTML = `<strong>${workspace.name}</strong><div class="log-meta">${ROLE_PRESETS[workspace.role]?.label ?? "Role"} · ${formatTime(workspace.updatedAt)}</div>`;
    card.addEventListener("click", () => loadWorkspace(workspace.id));
    dom.workspaceList.appendChild(card);
  });
}

function addNode(type, overrides = {}) {
  const center = getVisibleCenter();
  const sanitizedOverrides = clone(overrides);
  delete sanitizedOverrides.id;
  delete sanitizedOverrides.x;
  delete sanitizedOverrides.y;
  delete sanitizedOverrides.kind;
  const node = createDefaultNode(type, center.x - 90, center.y - 48, sanitizedOverrides);
  boardState().nodes.push(node);
  boardState().selection = { kind: "node", id: node.id };
  setStatus(`${node.label} added.`);
  saveCurrentWorkspace(false, "board");
  addLog("info", "board", "Node added", { type: node.type, label: node.label, position: { x: node.x, y: node.y } });
  render();
}

function newBoard() {
  state.board = createEmptyBoard();
  boardState().showGrid = state.settings.showGrid;
  boardState().background = DEFAULT_BACKGROUND;
  saveCurrentWorkspace(false, "board");
  addLog("warn", "board", "Board reset", { workspace: currentWorkspace()?.name });
  setStatus("New board created.");
  render();
}

function loadSampleBoard() {
  state.board = buildSampleBoard();
  saveCurrentWorkspace(false, "board");
  addLog("info", "board", "Sample board loaded", { workspace: currentWorkspace()?.name });
  setStatus("Sample board loaded.");
  render();
}

function getVisibleCenter() {
  const rect = dom.boardScroll.getBoundingClientRect();
  const x = (dom.boardScroll.scrollLeft + rect.width / 2) / boardState().zoom;
  const y = (dom.boardScroll.scrollTop + rect.height / 2) / boardState().zoom;
  return { x: clamp(x, 120, BOARD_WIDTH - 120), y: clamp(y, 120, BOARD_HEIGHT - 120) };
}

function getNode(id) {
  return boardState().nodes.find((node) => node.id === id) ?? null;
}

function getConnector(id) {
  return boardState().connectors.find((connector) => connector.id === id) ?? null;
}

function getSelectedEntity() {
  const selection = boardState().selection;
  if (!selection) {
    return null;
  }
  return selection.kind === "node" ? getNode(selection.id) : getConnector(selection.id);
}

function isSelected(kind, id) {
  return boardState().selection?.kind === kind && boardState().selection.id === id;
}

function getNodeCenter(node) {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

function render() {
  applySettingsToDocument();
  renderRoleView();
  renderWorkspaceSelectors();
  renderPackages();
  renderBoard();
  renderTooling();
  renderLogs();
  renderAiStatus();
  renderPanelButtons();
  savePersistentState();
}

function renderTooling() {
  const board = boardState();
  dom.zoomPercent.textContent = `${Math.round(board.zoom * 100)}%`;
  dom.zoomRange.value = String(Math.round(board.zoom * 100));
  dom.boardBackground.value = normalizeColor(board.background);
  dom.gridToggle.checked = board.showGrid;
  dom.exportFormatSelect.value = state.settings.defaultExport;
}

function renderBoard() {
  const board = boardState();
  dom.boardContent.style.setProperty("--zoom-scale", board.zoom);
  dom.boardSurface.style.setProperty("--board-bg", board.background);
  dom.boardSurface.classList.toggle("is-grid-hidden", !board.showGrid);
  dom.connectorLayer.setAttribute("viewBox", `0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`);
  dom.connectorLayer.setAttribute("width", String(BOARD_WIDTH));
  dom.connectorLayer.setAttribute("height", String(BOARD_HEIGHT));
  renderNodes();
  renderConnectors();
  syncInspector();
}

function renderNodes() {
  dom.nodeLayer.innerHTML = "";
  for (const node of boardState().nodes) {
    const wrapper = document.createElement("div");
    wrapper.className = "node";
    wrapper.dataset.id = node.id;
    wrapper.dataset.type = node.type;
    wrapper.style.left = `${node.x}px`;
    wrapper.style.top = `${node.y}px`;
    wrapper.style.width = `${node.width}px`;
    wrapper.style.height = `${node.height}px`;
    wrapper.style.opacity = String(node.opacity / 100);
    wrapper.style.zIndex = String(boardState().nodes.indexOf(node) + 1);
    wrapper.style.setProperty("--radius", `${node.radius}px`);
    wrapper.classList.toggle("is-selected", isSelected("node", node.id));

    const shape = document.createElement("div");
    shape.className = "node-shape";
    shape.style.background = node.fill;
    shape.style.borderColor = node.stroke;
    shape.style.borderWidth = `${node.strokeWidth}px`;
    shape.style.boxShadow = `0 ${Math.max(4, node.shadow)}px ${Math.max(10, node.shadow * 2)}px rgba(7, 12, 21, 0.32)`;

    const label = document.createElement("div");
    label.className = "node-label";
    label.textContent = node.label;
    label.style.color = node.textColor;
    label.style.fontSize = `${node.fontSize}px`;

    wrapper.append(shape, label);

    if (isSelected("node", node.id)) {
      const resizeHandle = document.createElement("div");
      resizeHandle.className = "resize-handle";
      wrapper.appendChild(resizeHandle);
    }

    wrapper.addEventListener("pointerdown", (event) => handleNodePointerDown(event, node.id));
    wrapper.addEventListener("dblclick", () => quickEditNodeLabel(node.id));
    dom.nodeLayer.appendChild(wrapper);
  }
}

function renderConnectors() {
  const defs = dom.connectorLayer.querySelector("defs");
  dom.connectorLayer.innerHTML = "";
  if (defs) {
    dom.connectorLayer.appendChild(defs);
  }

  for (const connector of boardState().connectors) {
    const fromNode = getNode(connector.from);
    const toNode = getNode(connector.to);
    if (!fromNode || !toNode) {
      continue;
    }
    const from = getNodeCenter(fromNode);
    const to = getNodeCenter(toNode);
    const dashArray = connector.dash === "dashed" ? "12 8" : "";
    const hit = createSvgElement("line", {
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      class: "connector-hit",
    });
    const line = createSvgElement("line", {
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      class: `connector-line${isSelected("connector", connector.id) ? " connector-selected" : ""}`,
      stroke: connector.stroke,
      "stroke-width": connector.strokeWidth,
      "stroke-dasharray": dashArray,
      "marker-end": "url(#connectorArrow)",
      opacity: connector.opacity / 100,
    });
    hit.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      boardState().selection = { kind: "connector", id: connector.id };
      setStatus("Connector selected.");
      addLog("trace", "selection", "Connector selected", { connector: connector.id });
      render();
    });
    dom.connectorLayer.append(hit, line);
    if (connector.label) {
      const text = createSvgElement("text", {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2 - 10,
        class: "connector-label",
      });
      text.textContent = connector.label;
      dom.connectorLayer.appendChild(text);
    }
  }
}

function syncInspector() {
  const selected = getSelectedEntity();
  if (!selected) {
    dom.selectionTitle.textContent = "Nothing selected";
    dom.selectionSubtitle.textContent = state.settings.hints
      ? "Build diagrams, wireframes, flows, and visual concepts."
      : "Choose or add an element.";
    setInspectorDisabled(true);
    dom.propLabel.value = "";
    return;
  }

  setInspectorDisabled(false);
  if (selected.kind === "node") {
    setFieldAvailability("node");
    dom.selectionTitle.textContent = selected.label;
    dom.selectionSubtitle.textContent = `${selected.type} · ${Math.round(selected.x)}, ${Math.round(selected.y)} · drag to move, double-click to edit.`;
    dom.propLabel.value = selected.label;
    dom.propFill.value = normalizeColor(selected.fill);
    dom.propStroke.value = normalizeColor(selected.stroke);
    dom.propTextColor.value = normalizeColor(selected.textColor);
    dom.propOpacity.value = String(selected.opacity);
    dom.propStrokeWidth.value = String(selected.strokeWidth);
    dom.propFontSize.value = String(selected.fontSize);
    dom.propRadius.value = String(selected.radius);
    dom.propShadow.value = String(selected.shadow);
    dom.propDash.value = "solid";
  } else {
    setFieldAvailability("connector");
    dom.selectionTitle.textContent = "Connector";
    dom.selectionSubtitle.textContent = `${selected.from} -> ${selected.to}`;
    dom.propLabel.value = selected.label;
    dom.propFill.value = "#18243a";
    dom.propStroke.value = normalizeColor(selected.stroke);
    dom.propTextColor.value = "#f5f7ff";
    dom.propOpacity.value = String(selected.opacity);
    dom.propStrokeWidth.value = String(selected.strokeWidth);
    dom.propFontSize.value = "15";
    dom.propRadius.value = "18";
    dom.propShadow.value = "12";
    dom.propDash.value = selected.dash;
  }
}

function setInspectorDisabled(disabled) {
  dom.propertiesForm.querySelectorAll("input, textarea, select").forEach((element) => {
    element.disabled = disabled;
  });
}

function setFieldAvailability(kind) {
  const connectorOnly = kind === "connector";
  dom.propFill.disabled = connectorOnly;
  dom.propTextColor.disabled = connectorOnly;
  dom.propFontSize.disabled = connectorOnly;
  dom.propRadius.disabled = connectorOnly;
  dom.propShadow.disabled = connectorOnly;
}

function handleNodePointerDown(event, nodeId) {
  event.stopPropagation();
  event.preventDefault();
  const resizeTarget = event.target.closest(".resize-handle");
  if (resizeTarget) {
    startNodeResize(event, nodeId);
    return;
  }
  if (state.activeTool === "connect") {
    handleConnectModeClick(nodeId);
    return;
  }
  boardState().selection = { kind: "node", id: nodeId };
  startNodeDrag(event, nodeId);
}

function startNodeDrag(event, nodeId) {
  const node = getNode(nodeId);
  if (!node) {
    return;
  }
  const dragTarget = event.currentTarget;
  if (dragTarget?.setPointerCapture) {
    dragTarget.setPointerCapture(event.pointerId);
  }
  const startPointer = getBoardCoordinates(event);
  const startX = node.x;
  const startY = node.y;
  let moved = false;
  setStatus(`Moving ${node.label}...`);

  const onMove = (moveEvent) => {
    const current = getBoardCoordinates(moveEvent);
    const nextX = clamp(maybeSnap(startX + (current.x - startPointer.x)), 0, BOARD_WIDTH - node.width);
    const nextY = clamp(maybeSnap(startY + (current.y - startPointer.y)), 0, BOARD_HEIGHT - node.height);
    moved = moved || nextX !== node.x || nextY !== node.y;
    node.x = nextX;
    node.y = nextY;
    node.x = clamp(node.x, 0, BOARD_WIDTH - node.width);
    node.y = clamp(node.y, 0, BOARD_HEIGHT - node.height);
    renderBoard();
  };

  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (dragTarget?.releasePointerCapture) {
      dragTarget.releasePointerCapture(event.pointerId);
    }
    if (moved) {
      saveCurrentWorkspace(false, "board");
      addLog("info", "board", "Node moved", {
        node: node.label,
        from: { x: startX, y: startY },
        to: { x: node.x, y: node.y },
      });
      setStatus(`${node.label} moved.`);
    } else {
      setStatus(`${node.label} selected.`);
    }
    render();
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function startNodeResize(event, nodeId) {
  const node = getNode(nodeId);
  if (!node) {
    return;
  }
  const resizeTarget = event.currentTarget;
  if (resizeTarget?.setPointerCapture) {
    resizeTarget.setPointerCapture(event.pointerId);
  }
  const startPointer = getBoardCoordinates(event);
  const startWidth = node.width;
  const startHeight = node.height;
  setStatus(`Resizing ${node.label}...`);

  const onMove = (moveEvent) => {
    const current = getBoardCoordinates(moveEvent);
    node.width = clamp(maybeSnap(startWidth + (current.x - startPointer.x)), 90, 480);
    node.height = clamp(maybeSnap(startHeight + (current.y - startPointer.y)), 56, 340);
    renderBoard();
  };

  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (resizeTarget?.releasePointerCapture) {
      resizeTarget.releasePointerCapture(event.pointerId);
    }
    saveCurrentWorkspace(false, "board");
    addLog("info", "board", "Node resized", {
      node: node.label,
      from: { width: startWidth, height: startHeight },
      to: { width: node.width, height: node.height },
    });
    setStatus(`${node.label} resized.`);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function handleConnectModeClick(nodeId) {
  const board = boardState();
  if (!board.pendingConnectionFrom) {
    board.pendingConnectionFrom = nodeId;
    board.selection = { kind: "node", id: nodeId };
    setStatus("Select a second shape to create a connector.");
    addLog("trace", "board", "Connector source selected", { node: nodeId });
    render();
    return;
  }
  if (board.pendingConnectionFrom === nodeId) {
    board.pendingConnectionFrom = null;
    setStatus("Connection cancelled.");
    addLog("trace", "board", "Connector creation cancelled", { node: nodeId });
    render();
    return;
  }
  const connector = createConnector(board.pendingConnectionFrom, nodeId);
  board.connectors.push(connector);
  board.selection = { kind: "connector", id: connector.id };
  board.pendingConnectionFrom = null;
  saveCurrentWorkspace(false, "board");
  addLog("info", "board", "Connector created", { connector: connector.id, from: connector.from, to: connector.to });
  setStatus("Connector created.");
  render();
}

function getBoardCoordinates(event) {
  const rect = dom.boardSurface.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / boardState().zoom,
    y: (event.clientY - rect.top) / boardState().zoom,
  };
}

function quickEditNodeLabel(nodeId) {
  const node = getNode(nodeId);
  if (!node) {
    return;
  }
  const nextLabel = window.prompt("Edit text", node.label);
  if (nextLabel === null) {
    return;
  }
  const previous = node.label;
  node.label = nextLabel;
  saveCurrentWorkspace(false, "board");
  addLog("info", "board", "Node label updated", { from: previous, to: nextLabel });
  render();
}

function updateSelectionProperty(key, value) {
  const entity = getSelectedEntity();
  if (!entity) {
    return;
  }
  entity[key] = value;
  saveCurrentWorkspace(false, "board");
  addLog("trace", "properties", "Selection property updated", { selection: entity.id, key, value });
  render();
}

function deleteSelection() {
  const selection = boardState().selection;
  if (!selection) {
    return;
  }
  if (selection.kind === "node") {
    boardState().nodes = boardState().nodes.filter((node) => node.id !== selection.id);
    boardState().connectors = boardState().connectors.filter((connector) => connector.from !== selection.id && connector.to !== selection.id);
  } else {
    boardState().connectors = boardState().connectors.filter((connector) => connector.id !== selection.id);
  }
  addLog("warn", "board", "Selection deleted", { selection });
  boardState().selection = null;
  saveCurrentWorkspace(false, "board");
  setStatus("Selection deleted.");
  render();
}

function duplicateSelection() {
  const selected = getSelectedEntity();
  if (!selected || selected.kind !== "node") {
    return;
  }
  const cloneNode = clone(selected);
  cloneNode.id = uid("node");
  cloneNode.x += 40;
  cloneNode.y += 40;
  cloneNode.label = `${cloneNode.label} copy`;
  boardState().nodes.push(cloneNode);
  boardState().selection = { kind: "node", id: cloneNode.id };
  saveCurrentWorkspace(false, "board");
  addLog("info", "board", "Node duplicated", { source: selected.id, duplicate: cloneNode.id });
  setStatus(`${cloneNode.label} duplicated.`);
  render();
}

function applyQuickAction(action) {
  const entity = getSelectedEntity();
  if (action === "toggle-grid") {
    boardState().showGrid = !boardState().showGrid;
    state.settings.showGrid = boardState().showGrid;
    syncUserProfile();
    saveCurrentWorkspace(false, "board");
    addLog("info", "board", "Grid visibility changed", { showGrid: boardState().showGrid });
    render();
    return;
  }
  if (!entity || entity.kind !== "node") {
    setStatus("Select a node for that action.");
    return;
  }
  if (action === "align-left") {
    entity.x = 56;
  } else if (action === "center-board") {
    entity.x = Math.round((BOARD_WIDTH - entity.width) / 2);
  } else if (action === "middle-board") {
    entity.y = Math.round((BOARD_HEIGHT - entity.height) / 2);
  } else if (action === "bring-front") {
    boardState().nodes = boardState().nodes.filter((node) => node.id !== entity.id);
    boardState().nodes.push(entity);
  } else if (action === "send-back") {
    boardState().nodes = boardState().nodes.filter((node) => node.id !== entity.id);
    boardState().nodes.unshift(entity);
  }
  saveCurrentWorkspace(false, "board");
  addLog("info", "board", "Quick action applied", { action, target: entity.id });
  setStatus("Quick action applied.");
  render();
}

function setZoom(percent) {
  boardState().zoom = clamp(percent / 100, 0.5, 1.8);
  saveCurrentWorkspace(false, "board");
  addLog("trace", "board", "Zoom changed", { zoom: boardState().zoom });
  renderTooling();
  renderBoard();
}

function importJson(text) {
  const parsed = JSON.parse(text);
  if (parsed.board && Array.isArray(parsed.board.nodes)) {
    state.board = { ...createEmptyBoard(), ...parsed.board };
    if (Array.isArray(parsed.packages)) {
      state.customPackages = parsed.packages;
    }
  } else if (Array.isArray(parsed.nodes) && Array.isArray(parsed.connectors)) {
    state.board = { ...createEmptyBoard(), ...parsed };
  } else {
    throw new Error("Unsupported design format.");
  }
  saveCurrentWorkspace(false, "workspace");
  addLog("info", "import", "Design imported", {
    nodes: boardState().nodes.length,
    connectors: boardState().connectors.length,
    packages: state.customPackages.length,
  });
  setStatus("Design imported.");
  render();
}

async function exportCurrent(format) {
  state.settings.defaultExport = format;
  syncUserProfile();
  if (format === "json") {
    const payload = {
      workspace: currentWorkspace()?.name,
      board: serializeBoard(),
      packages: clone(state.customPackages),
    };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `${slug(currentWorkspace()?.name ?? "workspace")}.json`);
  } else if (format === "txt") {
    const lines = [];
    lines.push(`Workspace: ${currentWorkspace()?.name ?? "Untitled"}`);
    lines.push(`Role: ${ROLE_PRESETS[state.settings.role]?.label ?? state.settings.role}`);
    lines.push(`Theme: ${state.settings.theme}`);
    lines.push(`Nodes: ${boardState().nodes.length}`);
    lines.push(`Connectors: ${boardState().connectors.length}`);
    lines.push("");
    lines.push("Nodes:");
    boardState().nodes.forEach((node) => lines.push(`- ${node.label} [${node.type}] @ (${node.x}, ${node.y}) size ${node.width}x${node.height}`));
    lines.push("");
    lines.push("Connectors:");
    boardState().connectors.forEach((connector) => lines.push(`- ${connector.from} -> ${connector.to} ${connector.label ? `(${connector.label})` : ""}`));
    downloadBlob(new Blob([lines.join("\n")], { type: "text/plain" }), `${slug(currentWorkspace()?.name ?? "workspace")}.txt`);
  } else if (format === "svg") {
    const svg = buildSvgMarkup();
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${slug(currentWorkspace()?.name ?? "workspace")}.svg`);
  } else if (["png", "jpg", "webp"].includes(format)) {
    await exportRaster(format);
  } else if (format === "pdf") {
    await exportPdf();
  }
  addLog("info", "export", "Export completed", { format, workspace: currentWorkspace()?.name });
  setStatus(`${format.toUpperCase()} exported.`);
  showToast(`${format.toUpperCase()} exported`);
}

function exportAll() {
  const payload = {
    exportedAt: new Date().toISOString(),
    user: currentUser()?.username,
    workspaces: userWorkspaces(),
  };
  downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `${slug(currentUser()?.username ?? "user")}-workspaces.json`);
  addLog("info", "export", "All workspaces exported", { count: userWorkspaces().length });
  setStatus("All workspaces exported as JSON.");
}

function generateDdl() {
  const engine = dom.ddlEngineSelect.value;
  const schemaName = sanitizeSqlIdentifier(dom.ddlSchemaName.value || "webshark_app");
  const includeAudit = dom.ddlIncludeAudit.checked;
  const tableNodes = getDdlTableNodes();
  if (tableNodes.length === 0) {
    dom.ddlOutput.value = "-- Add database, process, service, or data nodes to generate DDL.";
    setStatus("No table candidates found for DDL generation.");
    return dom.ddlOutput.value;
  }

  const lines = [];
  lines.push(`-- Generated by WebShark Designer for ${engine}`);
  lines.push(`-- Source workspace: ${currentWorkspace()?.name ?? "Untitled"}`);
  lines.push("");
  lines.push(...buildEnginePrelude(engine, schemaName));
  lines.push("");

  const tableLookup = new Map(tableNodes.map((node) => [node.id, sanitizeSqlIdentifier(node.label)]));
  tableNodes.forEach((node) => {
    const tableName = tableLookup.get(node.id);
    const columns = buildTableColumns(node, tableLookup, includeAudit, engine, schemaName);
    lines.push(`CREATE TABLE ${qualifyTableName(engine, schemaName, tableName)} (`);
    lines.push(columns.map((column) => `  ${column}`).join(",\n"));
    lines.push(");");
    lines.push("");
  });

  dom.ddlOutput.value = lines.join("\n").trim();
  addLog("info", "ddl", "DDL generated", { engine, schemaName, tables: tableNodes.length });
  setStatus(`Generated ${engine} DDL.`);
  return dom.ddlOutput.value;
}

function getDdlTableNodes() {
  const allowedTypes = new Set(["database", "rectangle", "rounded", "ellipse"]);
  return boardState().nodes.filter((node) => allowedTypes.has(node.type));
}

function buildEnginePrelude(engine, schemaName) {
  if (engine === "postgresql") {
    return [`CREATE SCHEMA IF NOT EXISTS ${schemaName};`, `SET search_path TO ${schemaName};`];
  }
  if (engine === "mysql") {
    return [`CREATE DATABASE IF NOT EXISTS \`${schemaName}\`;`, `USE \`${schemaName}\`;`];
  }
  if (engine === "sqlserver") {
    return [`IF DB_ID(N'${schemaName}') IS NULL CREATE DATABASE [${schemaName}];`, "GO", `USE [${schemaName}];`];
  }
  return ["-- SQLite uses the current database file."];
}

function qualifyTableName(engine, schemaName, tableName) {
  if (engine === "postgresql") {
    return `${schemaName}.${tableName}`;
  }
  if (engine === "mysql") {
    return `\`${schemaName}\`.\`${tableName}\``;
  }
  if (engine === "sqlserver") {
    return `[dbo].[${tableName}]`;
  }
  return tableName;
}

function buildTableColumns(node, tableLookup, includeAudit, engine, schemaName) {
  const columns = [primaryKeyForEngine(engine)];
  columns.push(defaultTextColumn(engine));

  const connectedNotes = getConnectedNodes(node.id, "note");
  connectedNotes.forEach((note) => {
    parseColumnsFromNote(note.label, engine).forEach((column) => {
      if (!columns.includes(column)) {
        columns.push(column);
      }
    });
  });

  const relatedTables = boardState().connectors
    .map((connector) => {
      if (connector.from === node.id && tableLookup.has(connector.to)) {
        return tableLookup.get(connector.to);
      }
      if (connector.to === node.id && tableLookup.has(connector.from)) {
        return tableLookup.get(connector.from);
      }
      return null;
    })
    .filter(Boolean);

  relatedTables.forEach((tableName) => {
    columns.push(foreignKeyColumn(tableName, engine, schemaName));
  });

  if (includeAudit) {
    columns.push(...auditColumnsForEngine(engine));
  }

  return Array.from(new Set(columns));
}

function getConnectedNodes(nodeId, type) {
  const ids = boardState().connectors
    .flatMap((connector) => {
      if (connector.from === nodeId) {
        return [connector.to];
      }
      if (connector.to === nodeId) {
        return [connector.from];
      }
      return [];
    });
  return boardState().nodes.filter((node) => ids.includes(node.id) && (!type || node.type === type));
}

function parseColumnsFromNote(label, engine) {
  return label
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([a-zA-Z0-9_]+)\s*[:|-]\s*([a-zA-Z0-9()_ ]+)$/);
      if (!match) {
        return null;
      }
      const columnName = sanitizeSqlIdentifier(match[1]);
      const type = normalizeSqlType(match[2], engine);
      return sqlQuote(columnName, engine) + " " + type;
    })
    .filter(Boolean);
}

function primaryKeyForEngine(engine) {
  if (engine === "postgresql") {
    return "id BIGSERIAL PRIMARY KEY";
  }
  if (engine === "mysql") {
    return "id BIGINT AUTO_INCREMENT PRIMARY KEY";
  }
  if (engine === "sqlserver") {
    return "id BIGINT IDENTITY(1,1) PRIMARY KEY";
  }
  return "id INTEGER PRIMARY KEY AUTOINCREMENT";
}

function defaultTextColumn(engine) {
  return `${sqlQuote("name", engine)} ${engine === "sqlite" ? "TEXT" : "VARCHAR(255)"} NOT NULL`;
}

function foreignKeyColumn(tableName, engine, schemaName) {
  const column = `${tableName}_id`;
  const target = qualifyTableName(engine, schemaName, tableName);
  if (engine === "sqlserver") {
    return `${sqlQuote(column, engine)} BIGINT REFERENCES ${target}(id)`;
  }
  return `${sqlQuote(column, engine)} BIGINT REFERENCES ${target}(id)`;
}

function auditColumnsForEngine(engine) {
  if (engine === "sqlite") {
    return ["created_at TEXT DEFAULT CURRENT_TIMESTAMP", "updated_at TEXT DEFAULT CURRENT_TIMESTAMP"];
  }
  if (engine === "sqlserver") {
    return ["created_at DATETIME2 DEFAULT SYSUTCDATETIME()", "updated_at DATETIME2 DEFAULT SYSUTCDATETIME()"];
  }
  return ["created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP", "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"];
}

function normalizeSqlType(raw, engine) {
  const value = raw.trim().toLowerCase();
  if (value.startsWith("int")) {
    return engine === "sqlite" ? "INTEGER" : "INTEGER";
  }
  if (value.startsWith("bigint")) {
    return "BIGINT";
  }
  if (value.startsWith("bool")) {
    return engine === "sqlite" ? "INTEGER" : "BOOLEAN";
  }
  if (value.startsWith("date")) {
    return engine === "sqlite" ? "TEXT" : "DATE";
  }
  if (value.startsWith("timestamp") || value.startsWith("datetime")) {
    return engine === "sqlserver" ? "DATETIME2" : engine === "sqlite" ? "TEXT" : "TIMESTAMP";
  }
  if (value.startsWith("uuid")) {
    return engine === "sqlite" ? "TEXT" : "UUID";
  }
  if (value.startsWith("decimal")) {
    return "DECIMAL(12,2)";
  }
  return value.toUpperCase().includes("CHAR") ? raw.toUpperCase() : (engine === "sqlite" ? "TEXT" : "VARCHAR(255)");
}

function sanitizeSqlIdentifier(value) {
  return String(value || "item")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    || "item";
}

function sqlQuote(identifier, engine) {
  if (engine === "mysql") {
    return `\`${identifier}\``;
  }
  if (engine === "sqlserver") {
    return `[${identifier}]`;
  }
  return identifier;
}

function buildSvgMarkup() {
  const connectorMarkup = boardState().connectors.map((connector) => renderConnectorSvg(connector)).join("");
  const nodeMarkup = boardState().nodes.map((node) => renderNodeSvg(node)).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${BOARD_WIDTH}" height="${BOARD_HEIGHT}" viewBox="0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}">
  <defs>
    <marker id="arrowHead" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
      <path d="M 0 0 L 12 6 L 0 12 z" fill="#6fc2ff" />
    </marker>
    <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#061018" flood-opacity="0.35" />
    </filter>
  </defs>
  <rect x="0" y="0" width="${BOARD_WIDTH}" height="${BOARD_HEIGHT}" fill="${escapeXml(boardState().background)}" />
  ${connectorMarkup}
  ${nodeMarkup}
</svg>`;
}

function renderConnectorSvg(connector) {
  const fromNode = getNode(connector.from);
  const toNode = getNode(connector.to);
  if (!fromNode || !toNode) {
    return "";
  }
  const from = getNodeCenter(fromNode);
  const to = getNodeCenter(toNode);
  const dash = connector.dash === "dashed" ? `stroke-dasharray="12 8"` : "";
  const labelMarkup = connector.label
    ? `<text x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 - 12}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#f5f7ff">${escapeXml(connector.label)}</text>`
    : "";
  return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${escapeXml(connector.stroke)}" stroke-width="${connector.strokeWidth}" ${dash} marker-end="url(#arrowHead)" opacity="${(connector.opacity / 100).toFixed(2)}" />${labelMarkup}`;
}

function renderNodeSvg(node) {
  const fill = escapeXml(node.fill);
  const stroke = escapeXml(node.stroke);
  const opacity = (node.opacity / 100).toFixed(2);
  const centerX = node.x + node.width / 2;
  const centerY = node.y + node.height / 2;
  const textMarkup = renderSvgTextBlock(node, centerX, centerY);
  let shapeMarkup = "";

  if (node.type === "rounded") {
    shapeMarkup = `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${node.radius}" ry="${node.radius}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />`;
  } else if (node.type === "ellipse") {
    shapeMarkup = `<ellipse cx="${centerX}" cy="${centerY}" rx="${node.width / 2}" ry="${node.height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />`;
  } else if (node.type === "diamond") {
    shapeMarkup = `<polygon points="${centerX},${node.y} ${node.x + node.width},${centerY} ${centerX},${node.y + node.height} ${node.x},${centerY}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />`;
  } else if (node.type === "triangle") {
    shapeMarkup = `<polygon points="${centerX},${node.y} ${node.x + node.width},${node.y + node.height} ${node.x},${node.y + node.height}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />`;
  } else if (node.type === "note") {
    shapeMarkup = `<path d="M ${node.x} ${node.y} H ${node.x + node.width * 0.78} L ${node.x + node.width} ${node.y + node.height * 0.22} V ${node.y + node.height} H ${node.x} Z" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />`;
  } else if (node.type === "database") {
    const rx = node.width / 2;
    const ry = 14;
    shapeMarkup = `<rect x="${node.x}" y="${node.y + ry}" width="${node.width}" height="${node.height - ry * 2}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />
<ellipse cx="${centerX}" cy="${node.y + ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />
<ellipse cx="${centerX}" cy="${node.y + node.height - ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />`;
  } else {
    shapeMarkup = `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${node.type === "text" ? 12 : 0}" ry="${node.type === "text" ? 12 : 0}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />`;
  }
  return `<g opacity="${opacity}" filter="url(#nodeShadow)">${shapeMarkup}${textMarkup}</g>`;
}

function renderSvgTextBlock(node, centerX, centerY) {
  const lines = String(node.label).split("\n");
  const lineHeight = node.fontSize * 1.24;
  const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
  const tspans = lines
    .map((line, index) => `<tspan x="${centerX}" y="${startY + index * lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");
  return `<text text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${node.fontSize}" fill="${escapeXml(node.textColor)}">${tspans}</text>`;
}

async function exportRaster(format) {
  const svgMarkup = buildSvgMarkup();
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = BOARD_WIDTH;
  canvas.height = BOARD_HEIGHT;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  URL.revokeObjectURL(url);

  const mime = format === "jpg" ? "image/jpeg" : `image/${format}`;
  const outBlob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.92));
  if (!outBlob) {
    throw new Error(`Unable to export ${format.toUpperCase()}.`);
  }
  downloadBlob(outBlob, `${slug(currentWorkspace()?.name ?? "workspace")}.${format === "jpg" ? "jpg" : format}`);
}

async function exportPdf() {
  if (!AI_RUNTIME.pdfModule) {
    AI_RUNTIME.pdfModule = await import("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm");
  }
  const svgMarkup = buildSvgMarkup();
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = BOARD_WIDTH;
  canvas.height = BOARD_HEIGHT;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  URL.revokeObjectURL(url);

  const dataUrl = canvas.toDataURL("image/png");
  const { jsPDF } = AI_RUNTIME.pdfModule;
  const pdf = new jsPDF({
    orientation: BOARD_WIDTH >= BOARD_HEIGHT ? "landscape" : "portrait",
    unit: "px",
    format: [BOARD_WIDTH, BOARD_HEIGHT],
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  pdf.save(`${slug(currentWorkspace()?.name ?? "workspace")}.pdf`);
}

function renderPackages() {
  dom.customPackagesList.innerHTML = "";
  if (state.customPackages.length === 0) {
    dom.customPackagesList.innerHTML = `<div class="package-card"><strong>No custom packages yet</strong><div class="log-meta">Create an element from the form above or save the current selection as a reusable element.</div></div>`;
    return;
  }
  state.customPackages.forEach((pack) => {
    const card = document.createElement("div");
    card.className = "package-card";
    const elements = document.createElement("div");
    elements.className = "package-elements";
    pack.elements.forEach((element) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = element.name;
      button.addEventListener("click", () => addNode(element.template.type, clone(element.template)));
      elements.appendChild(button);
    });
    card.innerHTML = `<strong>${pack.name}</strong><div class="log-meta">${pack.elements.length} reusable elements</div>`;
    card.appendChild(elements);
    dom.customPackagesList.appendChild(card);
  });
}

function ensurePackage(name) {
  let pack = state.customPackages.find((candidate) => candidate.name.toLowerCase() === name.toLowerCase());
  if (!pack) {
    pack = { id: uid("package"), name, elements: [] };
    state.customPackages.push(pack);
    addLog("info", "packages", "Custom package created", { package: name });
  }
  return pack;
}

function createCustomElement() {
  const packageName = dom.customPackageName.value.trim();
  const elementName = dom.customElementName.value.trim();
  if (!packageName || !elementName) {
    setStatus("Enter a package and element name.");
    return;
  }
  const template = createDefaultNode(dom.customShapeType.value, 0, 0, {
    label: elementName,
    fill: dom.customFill.value,
    stroke: dom.customStroke.value,
  });
  template.id = "template";
  template.x = 0;
  template.y = 0;
  const pack = ensurePackage(packageName);
  pack.elements.push({
    id: uid("element"),
    name: elementName,
    template,
  });
  saveCurrentWorkspace(false, "packages");
  addLog("info", "packages", "Custom element created", { package: packageName, element: elementName, type: template.type });
  showToast(`Saved ${elementName}`);
  renderPackages();
}

function saveSelectedElement() {
  const selected = getSelectedEntity();
  const packageName = dom.customPackageName.value.trim();
  const elementName = dom.customElementName.value.trim();
  if (!selected || selected.kind !== "node") {
    setStatus("Select a node to save it as a reusable element.");
    return;
  }
  if (!packageName || !elementName) {
    setStatus("Enter a package and element name.");
    return;
  }
  const template = clone(selected);
  template.id = "template";
  template.x = 0;
  template.y = 0;
  const pack = ensurePackage(packageName);
  pack.elements.push({ id: uid("element"), name: elementName, template });
  saveCurrentWorkspace(false, "packages");
  addLog("info", "packages", "Selected node saved as reusable element", { package: packageName, element: elementName, source: selected.label });
  showToast(`Saved ${elementName}`);
  renderPackages();
}

function updateToolButtons() {
  document.querySelectorAll(".tool-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tool === state.activeTool);
  });
}

function renderPanelButtons() {
  updateToolButtons();
}

function addLog(level, category, message, details = {}) {
  const entry = {
    id: uid("log"),
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    details,
    user: currentUser()?.username ?? "guest",
    workspace: currentWorkspace()?.name ?? "none",
    role: state.settings.role,
  };
  state.logs.unshift(entry);
  if (state.logs.length > MAX_LOG_ENTRIES) {
    state.logs = state.logs.slice(0, MAX_LOG_ENTRIES);
  }
  if (!state.selectedLogId) {
    state.selectedLogId = entry.id;
  }
  if (state.settings.aiLogAccess && state.settings.aiLiveLogs && dom.aiUseLogsToggle.checked && meetsLogThreshold(level)) {
    state.aiLogBuffer.unshift(serializeLogEntry(entry));
    state.aiLogBuffer = state.aiLogBuffer.slice(0, MAX_AI_LOG_BUFFER);
  }
  renderLogs();
  renderAiStatus();
  savePersistentState();
}

function serializeLogEntry(entry) {
  return `[${entry.timestamp}] level=${entry.level} category=${entry.category} user=${entry.user} workspace=${entry.workspace} message=${entry.message} details=${JSON.stringify(entry.details)}`;
}

function syncAiLogBufferFromLogs() {
  if (!state.settings.aiLogAccess || !dom.aiUseLogsToggle.checked) {
    state.aiLogBuffer = [];
    return;
  }
  state.aiLogBuffer = state.logs
    .filter((entry) => meetsLogThreshold(entry.level))
    .slice(0, MAX_AI_LOG_BUFFER)
    .map(serializeLogEntry);
}

function renderLogs() {
  const query = dom.logQueryInput.value.trim();
  const levelFilter = dom.logLevelFilter.value;
  const entries = queryLogs(query, levelFilter);
  dom.logList.innerHTML = "";
  dom.logCount.textContent = `${entries.length} entries`;
  if (entries.length === 0) {
    dom.logList.innerHTML = `<div class="log-entry"><strong>No logs match</strong><div class="log-meta">Try removing filters or changing the query.</div></div>`;
    dom.logDetails.textContent = "No matching log details.";
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "log-entry";
    item.classList.toggle("active", entry.id === state.selectedLogId);
    item.innerHTML = `<strong>${entry.message}</strong><div class="log-meta">${entry.level.toUpperCase()} · ${entry.category} · ${formatTime(entry.timestamp)}</div>`;
    item.addEventListener("click", () => {
      state.selectedLogId = entry.id;
      renderLogs();
      savePersistentState();
    });
    dom.logList.appendChild(item);
  });

  const selected = entries.find((entry) => entry.id === state.selectedLogId) ?? entries[0];
  state.selectedLogId = selected.id;
  dom.logDetails.textContent = JSON.stringify(selected, null, 2);
}

function queryLogs(query, levelFilter) {
  const terms = query.split(/\s+/).filter(Boolean);
  return state.logs.filter((entry) => {
    if (levelFilter !== "all" && entry.level !== levelFilter) {
      return false;
    }
    return terms.every((term) => {
      const [key, ...rest] = term.split(":");
      const value = rest.join(":");
      const haystack = `${entry.message} ${entry.category} ${entry.level} ${entry.user} ${entry.workspace} ${JSON.stringify(entry.details)}`.toLowerCase();
      if (!value) {
        return haystack.includes(key.toLowerCase());
      }
      if (key === "level") {
        return entry.level.toLowerCase().includes(value.toLowerCase());
      }
      if (key === "category") {
        return entry.category.toLowerCase().includes(value.toLowerCase());
      }
      if (key === "user") {
        return entry.user.toLowerCase().includes(value.toLowerCase());
      }
      if (key === "workspace") {
        return entry.workspace.toLowerCase().includes(value.toLowerCase());
      }
      return haystack.includes(`${key}:${value}`.toLowerCase()) || haystack.includes(value.toLowerCase());
    });
  });
}

function clearLogs() {
  state.logs = [];
  state.selectedLogId = null;
  state.aiLogBuffer = [];
  savePersistentState();
  renderLogs();
  renderAiStatus();
  showToast("Logs cleared");
}

function renderAiStatus() {
  dom.aiLogSyncStatus.textContent = `AI log buffer: ${state.aiLogBuffer.length} entries · threshold ${state.settings.logLevel}`;
}

async function loadAiModel() {
  const modelId = dom.aiModelSelect.value;
  dom.aiStatus.textContent = `Loading ${modelId}...`;
  dom.aiProgressBar.style.width = "0%";
  addLog("info", "ai", "AI model load requested", { modelId });

  if (!AI_RUNTIME.module) {
    AI_RUNTIME.module = await import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2");
    AI_RUNTIME.module.env.allowLocalModels = false;
    AI_RUNTIME.module.env.allowRemoteModels = true;
    AI_RUNTIME.module.env.useBrowserCache = true;
  }
  if (AI_RUNTIME.generator && AI_RUNTIME.modelId === modelId) {
    dom.aiStatus.textContent = `${modelId} is ready.`;
    dom.aiProgressBar.style.width = "100%";
    return;
  }
  const device = navigator.gpu ? "webgpu" : "wasm";
  AI_RUNTIME.generator = await AI_RUNTIME.module.pipeline("text2text-generation", modelId, {
    device,
    quantized: true,
    progress_callback(progress) {
      if (typeof progress.progress === "number") {
        dom.aiProgressBar.style.width = `${Math.round(progress.progress)}%`;
      }
      if (progress.status) {
        dom.aiStatus.textContent = `${progress.status}${progress.file ? ` - ${progress.file}` : ""}`;
      }
    },
  });
  AI_RUNTIME.modelId = modelId;
  dom.aiProgressBar.style.width = "100%";
  dom.aiStatus.textContent = `${modelId} ready on ${device}.`;
  addLog("info", "ai", "AI model ready", { modelId, device });
}

async function runLocalAi() {
  const prompt = dom.aiPrompt.value.trim();
  if (!prompt) {
    dom.aiOutput.value = "Enter a prompt for the local AI copilot.";
    return;
  }
  const commandResult = await executeAiActions(prompt);
  if (commandResult.executed.length > 0 && !commandResult.remainingPrompt) {
    dom.aiOutput.value = commandResult.executed.join("\n");
    dom.aiStatus.textContent = "AI command actions completed locally.";
    addLog("info", "ai", "AI command actions completed", { actions: commandResult.executed.length });
    return;
  }

  if (!AI_RUNTIME.generator) {
    await loadAiModel();
  }

  const boardSummary = boardState().nodes.map((node) => `${node.label} (${node.type})`).join(", ") || "Board is empty.";
  const logSummary = state.settings.aiLogAccess && dom.aiUseLogsToggle.checked
    ? state.aiLogBuffer.slice(0, 20).join("\n")
    : "Log access disabled.";
  const request = [
    "You are a concise technical diagramming and visual design copilot.",
    `Role context: ${ROLE_PRESETS[state.settings.role]?.label ?? state.settings.role}.`,
    commandResult.executed.length > 0 ? `Actions already completed locally: ${commandResult.executed.join(" | ")}` : "",
    "Current board elements:",
    boardSummary,
    "Recent app logs:",
    logSummary,
    `User request: ${commandResult.remainingPrompt || prompt}`,
    "If the user asks for instructions, answer directly. If the user asks for design help, give concrete steps.",
  ].filter(Boolean).join("\n");

  dom.aiStatus.textContent = "Running local inference...";
  dom.aiOutput.value = "Generating...";
  addLog("info", "ai", "AI inference started", { promptLength: prompt.length, usesLogs: dom.aiUseLogsToggle.checked });

  const result = await AI_RUNTIME.generator(request, {
    max_new_tokens: 220,
    temperature: 0.55,
    top_k: 40,
  });

  const output = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text;
  dom.aiOutput.value = output?.trim() || "The model did not return text.";
  dom.aiStatus.textContent = `${AI_RUNTIME.modelId} completed locally.`;
  addLog("info", "ai", "AI inference completed", { modelId: AI_RUNTIME.modelId, outputLength: dom.aiOutput.value.length });
}

async function executeAiActions(prompt) {
  const normalized = prompt.trim();
  const lower = normalized.toLowerCase();
  const executed = [];
  let remainingPrompt = normalized;
  let boardChanged = false;

  const shapeMap = {
    process: "rectangle",
    rectangle: "rectangle",
    service: "rounded",
    rounded: "rounded",
    ellipse: "ellipse",
    circle: "ellipse",
    data: "ellipse",
    decision: "diamond",
    diamond: "diamond",
    triangle: "triangle",
    alert: "triangle",
    note: "note",
    database: "database",
    db: "database",
    text: "text",
  };

  const addMatch = normalized.match(/\b(?:add|create|insert)\s+(?:a|an)?\s*(process|rectangle|service|rounded|ellipse|circle|data|decision|diamond|triangle|alert|note|database|db|text)\b(?:.*?(?:called|named|labelled|labeled)\s+["“]?([^"\n]+?)["”]?(?:$|[,.]))?/i);
  if (addMatch) {
    const type = shapeMap[addMatch[1].toLowerCase()];
    const label = addMatch[2]?.trim();
    addNode(type, label ? { label } : {});
    executed.push(`Added ${label ? `"${label}" ` : ""}${type}.`);
    remainingPrompt = remainingPrompt.replace(addMatch[0], "").trim();
    boardChanged = true;
  }

  const connectMatch = normalized.match(/\bconnect\s+["“]?(.+?)["”]?\s+(?:to|with|->)\s+["“]?(.+?)["”]?(?:$|[,.])/i);
  if (connectMatch) {
    const fromNode = findNodeByLabel(connectMatch[1]);
    const toNode = findNodeByLabel(connectMatch[2]);
    if (fromNode && toNode) {
      const connector = createConnector(fromNode.id, toNode.id);
      boardState().connectors.push(connector);
      boardState().selection = { kind: "connector", id: connector.id };
      executed.push(`Connected "${fromNode.label}" to "${toNode.label}".`);
      addLog("info", "ai", "AI connected nodes", { from: fromNode.label, to: toNode.label });
      remainingPrompt = remainingPrompt.replace(connectMatch[0], "").trim();
      boardChanged = true;
    }
  }

  if (/\b(?:show|display|turn on)\s+grid\b/i.test(normalized)) {
    boardState().showGrid = true;
    executed.push("Turned the grid on.");
    remainingPrompt = remainingPrompt.replace(/\b(?:show|display|turn on)\s+grid\b/i, "").trim();
    boardChanged = true;
  }
  if (/\b(?:hide|turn off)\s+grid\b/i.test(normalized)) {
    boardState().showGrid = false;
    executed.push("Turned the grid off.");
    remainingPrompt = remainingPrompt.replace(/\b(?:hide|turn off)\s+grid\b/i, "").trim();
    boardChanged = true;
  }

  const themeMatch = normalized.match(/\b(?:set|switch|change)\s+(?:the\s+)?theme\s+(?:to\s+)?(light|dark)\b/i);
  if (themeMatch) {
    state.settings.theme = themeMatch[1].toLowerCase();
    syncUserProfile();
    applySettingsToDocument();
    executed.push(`Switched the theme to ${state.settings.theme}.`);
    remainingPrompt = remainingPrompt.replace(themeMatch[0], "").trim();
  }

  const roleMatch = normalized.match(/\b(?:set|switch|change)\s+(?:my\s+)?role\s+(?:to\s+)?(architect|engineer|designer|analyst)\b/i);
  if (roleMatch) {
    state.settings.role = roleMatch[1].toLowerCase();
    if (currentWorkspace()) {
      currentWorkspace().role = state.settings.role;
    }
    syncUserProfile();
    renderRoleView();
    executed.push(`Switched the role to ${ROLE_PRESETS[state.settings.role].label}.`);
    remainingPrompt = remainingPrompt.replace(roleMatch[0], "").trim();
  }

  const workspaceMatch = normalized.match(/\b(?:create|new)\s+workspace(?:\s+(?:called|named))?\s+["“]?([^"\n]+?)["”]?(?:$|[,.])/i);
  if (workspaceMatch) {
    const workspace = createDefaultWorkspace(workspaceMatch[1].trim());
    state.workspaces.push(workspace);
    loadWorkspace(workspace.id, false);
    executed.push(`Created workspace "${workspace.name}".`);
    remainingPrompt = remainingPrompt.replace(workspaceMatch[0], "").trim();
    boardChanged = true;
  }

  if (/\b(?:save|store)\s+(?:the\s+)?workspace\b/i.test(lower) || /\b(?:save|store)\s+(?:the\s+)?work\b/i.test(lower)) {
    saveCurrentWorkspace(false, "ai");
    executed.push("Saved the current workspace.");
    remainingPrompt = remainingPrompt.replace(/\b(?:save|store)\s+(?:the\s+)?workspace\b/i, "").replace(/\b(?:save|store)\s+(?:the\s+)?work\b/i, "").trim();
  }

  if (/\bload\s+sample\b/i.test(lower)) {
    loadSampleBoard();
    executed.push("Loaded the sample board.");
    remainingPrompt = remainingPrompt.replace(/\bload\s+sample\b/i, "").trim();
    boardChanged = true;
  }

  const exportMatch = normalized.match(/\bexport(?:\s+(?:the\s+)?(?:current\s+)?)?(?:as|to)?\s+(png|svg|pdf|jpg|webp|json|txt)\b/i);
  if (exportMatch) {
    await exportCurrent(exportMatch[1].toLowerCase());
    executed.push(`Exported the current workspace as ${exportMatch[1].toUpperCase()}.`);
    remainingPrompt = remainingPrompt.replace(exportMatch[0], "").trim();
  }

  if (/\b(?:generate|create)\s+ddl\b/i.test(lower) || /\bdatabase\s+ddl\b/i.test(lower)) {
    const ddl = generateDdl();
    executed.push(`Generated DDL (${ddl.split("\n").length} lines).`);
    remainingPrompt = remainingPrompt.replace(/\b(?:generate|create)\s+ddl\b/i, "").replace(/\bdatabase\s+ddl\b/i, "").trim();
  }

  if (boardChanged) {
    saveCurrentWorkspace(false, "ai");
    render();
  } else if (executed.length > 0) {
    render();
    savePersistentState();
  }

  return {
    executed,
    remainingPrompt: remainingPrompt.replace(/^[,.;\s]+|[,.;\s]+$/g, ""),
  };
}

function findNodeByLabel(input) {
  const needle = input.trim().replace(/^["“]|["”]$/g, "").toLowerCase();
  return boardState().nodes.find((node) => node.label.toLowerCase() === needle)
    ?? boardState().nodes.find((node) => node.label.toLowerCase().includes(needle));
}

function queueAutosave() {
  if (autosaveTimer) {
    clearInterval(autosaveTimer);
  }
  autosaveTimer = window.setInterval(() => {
    if (!currentUser()) {
      return;
    }
    saveCurrentWorkspace(false, "autosave");
    addLog("trace", "autosave", "Workspace autosaved", { workspace: currentWorkspace()?.name });
  }, state.settings.autosaveSeconds * 1000);
}

function setStatus(message) {
  dom.boardStatus.textContent = message;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  dom.toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 2600);
}

function normalizeColor(color) {
  return typeof color === "string" && color.startsWith("#") ? color : "#6fc2ff";
}

function meetsLogThreshold(level) {
  return (LOG_LEVEL_RANK[level] ?? 0) >= (LOG_LEVEL_RANK[state.settings.logLevel] ?? 0);
}

function maybeSnap(value) {
  return state.settings.snapToGrid ? Math.round(value / 8) * 8 : value;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createSvgElement(name, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== "") {
      element.setAttribute(key, String(value));
    }
  });
  return element;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "webshark-design";
}

function formatTime(value) {
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function beginResize(element, axis) {
  element.addEventListener("pointerdown", (event) => {
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = state.ui.leftWidth;
    const startRight = state.ui.rightWidth;
    const startLog = state.ui.logHeight;

    const onMove = (moveEvent) => {
      if (axis === "left") {
        state.ui.leftWidth = clamp(startLeft + (moveEvent.clientX - startX), 220, 460);
      } else if (axis === "right") {
        state.ui.rightWidth = clamp(startRight - (moveEvent.clientX - startX), 260, 480);
      } else if (axis === "log") {
        state.ui.logHeight = clamp(startLog - (moveEvent.clientY - startY), 170, 420);
      }
      applySettingsToDocument();
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      syncUserProfile();
      savePersistentState();
      addLog("trace", "layout", "Panel size adjusted", clone(state.ui));
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  });
}

function bindPanelDragging() {
  document.querySelectorAll(".panel-section[data-panel-id]").forEach((panel) => {
    panel.addEventListener("dragstart", () => {
      activeDragPanelId = panel.id;
      panel.classList.add("dragging");
    });
    panel.addEventListener("dragend", () => {
      activeDragPanelId = null;
      panel.classList.remove("dragging");
      dom.leftDock.classList.remove("drag-target");
      dom.rightDock.classList.remove("drag-target");
      persistPanelLayout();
    });
    panel.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!activeDragPanelId || activeDragPanelId === panel.id) {
        return;
      }
      const dragging = document.querySelector(`#${activeDragPanelId}`);
      const rect = panel.getBoundingClientRect();
      const insertBefore = event.clientY < rect.top + rect.height / 2;
      panel.parentElement.insertBefore(dragging, insertBefore ? panel : panel.nextSibling);
    });
  });

  [dom.leftDock, dom.rightDock].forEach((dock) => {
    dock.addEventListener("dragover", (event) => {
      event.preventDefault();
      dock.classList.add("drag-target");
    });
    dock.addEventListener("dragleave", () => dock.classList.remove("drag-target"));
    dock.addEventListener("drop", (event) => {
      event.preventDefault();
      dock.classList.remove("drag-target");
      if (!activeDragPanelId) {
        return;
      }
      const panel = document.querySelector(`#${activeDragPanelId}`);
      dock.appendChild(panel);
      persistPanelLayout();
      addLog("info", "layout", "Panel dock updated", { panel: activeDragPanelId, dock: dock.id });
    });
  });
}

function bindEvents() {
  dom.signInBtn.addEventListener("click", signIn);
  dom.registerBtn.addEventListener("click", register);
  dom.openSettingsBtn.addEventListener("click", openSettings);
  dom.closeSettingsBtn.addEventListener("click", closeSettings);
  dom.applySettingsBtn.addEventListener("click", applySettings);
  dom.themeToggleBtn.addEventListener("click", () => {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    syncUserProfile();
    applySettingsToDocument();
    savePersistentState();
    addLog("info", "settings", "Theme toggled", { theme: state.settings.theme });
    render();
  });

  dom.newWorkspaceBtn.addEventListener("click", createWorkspaceFromPrompt);
  dom.saveWorkspaceBtn.addEventListener("click", () => saveCurrentWorkspace(true));
  dom.duplicateWorkspaceBtn.addEventListener("click", duplicateWorkspace);
  dom.deleteWorkspaceBtn.addEventListener("click", deleteWorkspace);
  dom.workspaceSelect.addEventListener("change", () => loadWorkspace(dom.workspaceSelect.value));

  dom.newBoardBtn.addEventListener("click", newBoard);
  dom.sampleBoardBtn.addEventListener("click", loadSampleBoard);
  dom.importJsonBtn.addEventListener("click", () => dom.importJsonInput.click());
  dom.importJsonInput.addEventListener("change", async () => {
    const file = dom.importJsonInput.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    importJson(text);
    dom.importJsonInput.value = "";
  });
  dom.exportCurrentBtn.addEventListener("click", () => exportCurrent(dom.exportFormatSelect.value).catch(handleError));
  dom.exportAllBtn.addEventListener("click", exportAll);
  document.querySelectorAll("[data-export]").forEach((button) => {
    button.addEventListener("click", () => exportCurrent(button.dataset.export).catch(handleError));
  });

  document.querySelectorAll(".shape-card").forEach((button) => {
    button.addEventListener("click", () => addNode(button.dataset.shape));
  });
  document.querySelectorAll(".tool-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTool = button.dataset.tool;
      boardState().pendingConnectionFrom = null;
      updateToolButtons();
      addLog("trace", "tools", "Tool changed", { tool: state.activeTool });
      setStatus(state.activeTool === "connect" ? "Select two shapes to connect them." : "Selection tool active.");
    });
  });
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => applyQuickAction(button.dataset.action));
  });

  dom.deleteSelectionBtn?.addEventListener("click", deleteSelection);
  dom.duplicateSelectionBtn?.addEventListener("click", duplicateSelection);
  dom.zoomInBtn?.addEventListener("click", () => setZoom(Math.round(boardState().zoom * 100) + 10));
  dom.zoomOutBtn?.addEventListener("click", () => setZoom(Math.round(boardState().zoom * 100) - 10));
  dom.zoomRange.addEventListener("input", () => setZoom(Number(dom.zoomRange.value)));

  dom.boardSurface.addEventListener("pointerdown", () => {
    boardState().selection = null;
    render();
  });

  dom.propLabel.addEventListener("input", () => updateSelectionProperty("label", dom.propLabel.value));
  dom.propFill.addEventListener("input", () => updateSelectionProperty("fill", dom.propFill.value));
  dom.propStroke.addEventListener("input", () => updateSelectionProperty("stroke", dom.propStroke.value));
  dom.propTextColor.addEventListener("input", () => updateSelectionProperty("textColor", dom.propTextColor.value));
  dom.propOpacity.addEventListener("input", () => updateSelectionProperty("opacity", Number(dom.propOpacity.value)));
  dom.propStrokeWidth.addEventListener("input", () => updateSelectionProperty("strokeWidth", Number(dom.propStrokeWidth.value)));
  dom.propFontSize.addEventListener("input", () => updateSelectionProperty("fontSize", Number(dom.propFontSize.value)));
  dom.propRadius.addEventListener("input", () => updateSelectionProperty("radius", Number(dom.propRadius.value)));
  dom.propShadow.addEventListener("input", () => updateSelectionProperty("shadow", Number(dom.propShadow.value)));
  dom.propDash.addEventListener("change", () => updateSelectionProperty("dash", dom.propDash.value));
  dom.boardBackground.addEventListener("input", () => {
    boardState().background = dom.boardBackground.value;
    saveCurrentWorkspace(false, "board");
    addLog("trace", "board", "Board background updated", { background: dom.boardBackground.value });
    render();
  });
  dom.gridToggle.addEventListener("change", () => {
    boardState().showGrid = dom.gridToggle.checked;
    state.settings.showGrid = dom.gridToggle.checked;
    syncUserProfile();
    saveCurrentWorkspace(false, "board");
    addLog("trace", "board", "Board grid toggled", { showGrid: boardState().showGrid });
    render();
  });

  dom.createCustomElementBtn.addEventListener("click", createCustomElement);
  dom.saveSelectedElementBtn.addEventListener("click", saveSelectedElement);
  dom.generateDdlBtn.addEventListener("click", generateDdl);
  dom.copyDdlBtn.addEventListener("click", async () => {
    const ddl = dom.ddlOutput.value || generateDdl();
    await navigator.clipboard.writeText(ddl);
    addLog("info", "ddl", "DDL copied to clipboard", { length: ddl.length });
    showToast("DDL copied");
  });
  dom.downloadDdlBtn.addEventListener("click", () => {
    const ddl = dom.ddlOutput.value || generateDdl();
    downloadBlob(new Blob([ddl], { type: "text/sql" }), `${sanitizeSqlIdentifier(dom.ddlSchemaName.value || "webshark_app")}.sql`);
    addLog("info", "ddl", "DDL downloaded", { length: ddl.length });
    showToast("DDL downloaded");
  });

  dom.logQueryInput.addEventListener("input", renderLogs);
  dom.logLevelFilter.addEventListener("change", renderLogs);
  dom.clearLogsBtn.addEventListener("click", clearLogs);
  dom.exportLogsBtn.addEventListener("click", () => {
    downloadBlob(new Blob([JSON.stringify(state.logs, null, 2)], { type: "application/json" }), "webshark-logs.json");
    addLog("info", "logs", "Logs exported", { entries: state.logs.length });
  });

  dom.downloadModelBtn.addEventListener("click", () => loadAiModel().catch(handleError));
  dom.runAiBtn.addEventListener("click", () => runLocalAi().catch(handleError));
  dom.aiUseLogsToggle.addEventListener("change", () => {
    syncAiLogBufferFromLogs();
    renderAiStatus();
    addLog("info", "ai", "AI log access toggled", { enabled: dom.aiUseLogsToggle.checked });
  });

  document.addEventListener("keydown", (event) => {
    if ((event.key === "Delete" || event.key === "Backspace") && !event.target.closest("textarea, input")) {
      event.preventDefault();
      deleteSelection();
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === "d") {
      event.preventDefault();
      duplicateSelection();
      return;
    }
    const entity = getSelectedEntity();
    if (!entity || entity.kind !== "node") {
      return;
    }
    const delta = event.shiftKey ? 16 : 8;
    if (event.key === "ArrowLeft") {
      entity.x = clamp(entity.x - delta, 0, BOARD_WIDTH - entity.width);
    } else if (event.key === "ArrowRight") {
      entity.x = clamp(entity.x + delta, 0, BOARD_WIDTH - entity.width);
    } else if (event.key === "ArrowUp") {
      entity.y = clamp(entity.y - delta, 0, BOARD_HEIGHT - entity.height);
    } else if (event.key === "ArrowDown") {
      entity.y = clamp(entity.y + delta, 0, BOARD_HEIGHT - entity.height);
    } else {
      return;
    }
    event.preventDefault();
    saveCurrentWorkspace(false, "board");
    addLog("trace", "board", "Node nudged", { node: entity.id, x: entity.x, y: entity.y });
    render();
  });

  beginResize(dom.leftSplitter, "left");
  beginResize(dom.rightSplitter, "right");
  beginResize(dom.logSplitter, "log");
  bindPanelDragging();
}

function handleError(error) {
  const message = error instanceof Error ? error.message : String(error);
  setStatus(message);
  showToast(message);
  addLog("error", "runtime", "Operation failed", { message });
}

loadPersistentState();
applySettingsToDocument();
bindEvents();

if (state.currentUserId && currentUser()) {
  startSession(currentUser());
} else {
  dom.authOverlay.classList.remove("hidden");
  dom.appShell.classList.add("hidden");
  addLog("trace", "boot", "App initialized without authenticated session");
}


document.addEventListener("click", (event) => {
  document.querySelectorAll("details.menu[open]").forEach((menu) => {
    if (!menu.contains(event.target)) menu.removeAttribute("open");
  });
  const toggle = event.target.closest(".panel-toggle");
  if (toggle) {
    const section = toggle.closest(".panel-section");
    const collapsed = section.classList.toggle("is-collapsed");
    toggle.textContent = collapsed ? "+" : "–";
  }
});

document.querySelectorAll(".panel-section > .panel-header").forEach((header) => {
  if (header.querySelector(".panel-toggle")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "ghost-btn panel-toggle";
  btn.title = "Collapse or expand panel";
  btn.textContent = "–";
  header.appendChild(btn);
});
