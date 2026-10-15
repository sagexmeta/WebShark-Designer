const BOARD_WIDTH = 2000;
const BOARD_HEIGHT = 1200;
const STORAGE_KEY = "webshark-designer-state-v1";
const DEFAULT_BACKGROUND = "#0b1220";

const state = {
  zoom: 1,
  activeTool: "select",
  pendingConnectionFrom: null,
  selection: null,
  showGrid: true,
  canvasBackground: DEFAULT_BACKGROUND,
  nodes: [],
  connectors: [],
  nextId: 1,
};

const dom = {
  boardScroll: document.querySelector("#boardScroll"),
  boardContent: document.querySelector("#boardContent"),
  boardSurface: document.querySelector("#boardSurface"),
  nodeLayer: document.querySelector("#nodeLayer"),
  connectorLayer: document.querySelector("#connectorLayer"),
  zoomRange: document.querySelector("#zoomRange"),
  zoomPercent: document.querySelector("#zoomPercent"),
  boardStatus: document.querySelector("#boardStatus"),
  selectionTitle: document.querySelector("#selectionTitle"),
  selectionSubtitle: document.querySelector("#selectionSubtitle"),
  layersList: document.querySelector("#layersList"),
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
  importJsonInput: document.querySelector("#importJsonInput"),
  aiModelSelect: document.querySelector("#aiModelSelect"),
  downloadModelBtn: document.querySelector("#downloadModelBtn"),
  aiStatus: document.querySelector("#aiStatus"),
  aiProgressBar: document.querySelector("#aiProgressBar"),
  aiPrompt: document.querySelector("#aiPrompt"),
  runAiBtn: document.querySelector("#runAiBtn"),
  aiOutput: document.querySelector("#aiOutput"),
};

const AI_RUNTIME = {
  module: null,
  generator: null,
  modelId: null,
};

function createDefaultNode(type, x, y) {
  const presets = {
    rectangle: { label: "Process", width: 170, height: 96 },
    rounded: { label: "Service", width: 190, height: 92, radius: 22 },
    ellipse: { label: "Data", width: 180, height: 96, radius: 999 },
    diamond: { label: "Decision", width: 160, height: 160 },
    triangle: { label: "Alert", width: 170, height: 140 },
    note: { label: "Note", width: 190, height: 128, fill: "#fff7cf", stroke: "#d8b04a", textColor: "#2c2414" },
    database: { label: "Database", width: 180, height: 118 },
    text: { label: "Heading", width: 190, height: 72, fill: "#10192a", stroke: "#6fc2ff", textColor: "#f5f7ff" },
  };

  const preset = presets[type] ?? presets.rectangle;

  return {
    kind: "node",
    id: nextId("node"),
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
    shadow: 10,
  };
}

function createConnector(fromId, toId) {
  return {
    kind: "connector",
    id: nextId("connector"),
    from: fromId,
    to: toId,
    label: "",
    stroke: "#6fc2ff",
    strokeWidth: 3,
    dash: "solid",
    opacity: 100,
  };
}

function nextId(prefix) {
  const value = `${prefix}-${state.nextId}`;
  state.nextId += 1;
  return value;
}

function seedSampleBoard() {
  state.nodes = [
    createDefaultNode("rounded", 180, 120),
    createDefaultNode("rectangle", 470, 120),
    createDefaultNode("diamond", 790, 86),
    createDefaultNode("database", 1135, 120),
    createDefaultNode("note", 470, 335),
    createDefaultNode("ellipse", 180, 360),
  ];
  state.nodes[0].label = "API Gateway";
  state.nodes[1].label = "Auth Service";
  state.nodes[2].label = "Policy OK?";
  state.nodes[3].label = "Customer DB";
  state.nodes[4].label = "Design note:\nKeep dependencies grouped by domain.";
  state.nodes[5].label = "Telemetry";

  state.connectors = [
    createConnector(state.nodes[0].id, state.nodes[1].id),
    createConnector(state.nodes[1].id, state.nodes[2].id),
    createConnector(state.nodes[2].id, state.nodes[3].id),
    createConnector(state.nodes[1].id, state.nodes[4].id),
    createConnector(state.nodes[0].id, state.nodes[5].id),
  ];
  state.connectors[2].label = "writes";
  state.connectors[3].dash = "dashed";

  state.selection = { kind: "node", id: state.nodes[0].id };
  state.pendingConnectionFrom = null;
  updateStatus("Sample board loaded.");
  persistState();
  render();
}

function newBoard() {
  state.nodes = [];
  state.connectors = [];
  state.selection = null;
  state.pendingConnectionFrom = null;
  state.nextId = 1;
  updateStatus("New board created.");
  persistState();
  render();
}

function addNode(type) {
  const center = getVisibleCenter();
  const node = createDefaultNode(type, center.x - 90, center.y - 48);
  state.nodes.push(node);
  state.selection = { kind: "node", id: node.id };
  updateStatus(`${node.label} added.`);
  persistState();
  render();
}

function getVisibleCenter() {
  const rect = dom.boardScroll.getBoundingClientRect();
  const x = (dom.boardScroll.scrollLeft + rect.width / 2) / state.zoom;
  const y = (dom.boardScroll.scrollTop + rect.height / 2) / state.zoom;
  return { x: clamp(x, 80, BOARD_WIDTH - 80), y: clamp(y, 80, BOARD_HEIGHT - 80) };
}

function render() {
  dom.boardContent.style.setProperty("--zoom-scale", state.zoom);
  dom.boardSurface.style.setProperty("--board-bg", state.canvasBackground);
  dom.boardSurface.classList.toggle("is-grid-hidden", !state.showGrid);
  dom.zoomPercent.textContent = `${Math.round(state.zoom * 100)}%`;
  dom.zoomRange.value = String(Math.round(state.zoom * 100));
  dom.boardBackground.value = state.canvasBackground;
  dom.gridToggle.checked = state.showGrid;
  renderNodes();
  renderConnectors();
  renderLayers();
  syncInspector();
}

function renderNodes() {
  dom.nodeLayer.innerHTML = "";

  for (const node of state.nodes) {
    const wrapper = document.createElement("div");
    wrapper.className = "node";
    wrapper.dataset.id = node.id;
    wrapper.dataset.type = node.type;
    wrapper.style.left = `${node.x}px`;
    wrapper.style.top = `${node.y}px`;
    wrapper.style.width = `${node.width}px`;
    wrapper.style.height = `${node.height}px`;
    wrapper.style.opacity = String(node.opacity / 100);
    wrapper.style.zIndex = String(state.nodes.indexOf(node) + 1);
    wrapper.style.setProperty("--radius", `${node.radius}px`);
    wrapper.classList.toggle("is-selected", isSelected("node", node.id));

    const shape = document.createElement("div");
    shape.className = "node-shape";
    shape.style.background = node.fill;
    shape.style.borderColor = node.stroke;
    shape.style.borderWidth = `${node.strokeWidth}px`;
    shape.style.boxShadow = `0 ${Math.max(4, node.shadow)}px ${Math.max(10, node.shadow * 2)}px rgba(7, 12, 21, 0.36)`;

    const label = document.createElement("div");
    label.className = "node-label";
    label.textContent = node.label;
    label.style.color = node.textColor;
    label.style.fontSize = `${node.fontSize}px`;

    wrapper.append(shape, label);

    if (isSelected("node", node.id)) {
      const resizeHandle = document.createElement("div");
      resizeHandle.className = "resize-handle";
      resizeHandle.dataset.resizeFor = node.id;
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

  for (const connector of state.connectors) {
    const fromNode = getNode(connector.from);
    const toNode = getNode(connector.to);
    if (!fromNode || !toNode) {
      continue;
    }

    const from = getNodeCenter(fromNode);
    const to = getNodeCenter(toNode);
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dashArray = connector.dash === "dashed" ? "12 8" : "";

    const hit = createSvgElement("line", {
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      class: "connector-hit",
      "data-id": connector.id,
    });

    const line = createSvgElement("line", {
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      class: `connector-line${isSelected("connector", connector.id) ? " connector-selected" : ""}`,
      "data-id": connector.id,
      stroke: connector.stroke,
      "stroke-width": connector.strokeWidth,
      "stroke-dasharray": dashArray,
      "marker-end": "url(#connectorArrow)",
      opacity: connector.opacity / 100,
    });

    hit.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      state.selection = { kind: "connector", id: connector.id };
      updateStatus("Connector selected.");
      render();
    });

    dom.connectorLayer.append(hit, line);

    if (connector.label) {
      const label = createSvgElement("text", {
        x: midX,
        y: midY - 10,
        class: "connector-label",
      });
      label.textContent = connector.label;
      dom.connectorLayer.appendChild(label);
    }
  }
}

function renderLayers() {
  dom.layersList.innerHTML = "";
  [...state.nodes].reverse().forEach((node) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "layer-item";
    button.classList.toggle("is-selected", isSelected("node", node.id));
    button.textContent = `${node.label} - ${node.type}`;
    button.addEventListener("click", () => {
      state.selection = { kind: "node", id: node.id };
      render();
    });
    dom.layersList.appendChild(button);
  });
}

function syncInspector() {
  const selected = getSelectedEntity();

  if (!selected) {
    dom.selectionTitle.textContent = "Nothing selected";
    dom.selectionSubtitle.textContent = "Build diagrams, wireframes, flows, and visual concepts.";
    setInspectorDisabled(true);
    dom.propLabel.value = "";
    return;
  }

  setInspectorDisabled(false);

  if (selected.kind === "node") {
    setFieldAvailability("node");
    dom.selectionTitle.textContent = `${selected.label}`;
    dom.selectionSubtitle.textContent = `${selected.type} at ${Math.round(selected.x)}, ${Math.round(selected.y)} - drag to move, use handle to resize.`;
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
    dom.propShadow.value = "10";
    dom.propDash.value = selected.dash;
  }
}

function setInspectorDisabled(disabled) {
  for (const element of dom.propertiesForm.querySelectorAll("input, textarea, select")) {
    element.disabled = disabled;
  }
}

function setFieldAvailability(kind) {
  const connectorOnly = kind === "connector";
  dom.propFill.disabled = connectorOnly;
  dom.propTextColor.disabled = connectorOnly;
  dom.propFontSize.disabled = connectorOnly;
  dom.propRadius.disabled = connectorOnly;
  dom.propShadow.disabled = connectorOnly;
}

function isSelected(kind, id) {
  return state.selection?.kind === kind && state.selection.id === id;
}

function getSelectedEntity() {
  if (!state.selection) {
    return null;
  }
  return state.selection.kind === "node"
    ? getNode(state.selection.id)
    : getConnector(state.selection.id);
}

function getNode(id) {
  return state.nodes.find((node) => node.id === id) ?? null;
}

function getConnector(id) {
  return state.connectors.find((connector) => connector.id === id) ?? null;
}

function getNodeCenter(node) {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  };
}

function handleNodePointerDown(event, nodeId) {
  event.stopPropagation();

  const resizeTarget = event.target.closest(".resize-handle");
  if (resizeTarget) {
    startNodeResize(event, nodeId);
    return;
  }

  if (state.activeTool === "connect") {
    handleConnectModeClick(nodeId);
    return;
  }

  state.selection = { kind: "node", id: nodeId };
  render();
  startNodeDrag(event, nodeId);
}

function startNodeDrag(event, nodeId) {
  const node = getNode(nodeId);
  if (!node) {
    return;
  }

  const startPointer = getBoardCoordinates(event);
  const startX = node.x;
  const startY = node.y;

  const onMove = (moveEvent) => {
    const current = getBoardCoordinates(moveEvent);
    node.x = snapToGrid(startX + (current.x - startPointer.x));
    node.y = snapToGrid(startY + (current.y - startPointer.y));
    node.x = clamp(node.x, 0, BOARD_WIDTH - node.width);
    node.y = clamp(node.y, 0, BOARD_HEIGHT - node.height);
    render();
  };

  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    persistState();
    updateStatus(`${node.label} moved.`);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function startNodeResize(event, nodeId) {
  const node = getNode(nodeId);
  if (!node) {
    return;
  }

  const startPointer = getBoardCoordinates(event);
  const startWidth = node.width;
  const startHeight = node.height;

  const onMove = (moveEvent) => {
    const current = getBoardCoordinates(moveEvent);
    node.width = clamp(snapToGrid(startWidth + (current.x - startPointer.x)), 90, 420);
    node.height = clamp(snapToGrid(startHeight + (current.y - startPointer.y)), 56, 320);
    render();
  };

  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    persistState();
    updateStatus(`${node.label} resized.`);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function handleConnectModeClick(nodeId) {
  if (!state.pendingConnectionFrom) {
    state.pendingConnectionFrom = nodeId;
    state.selection = { kind: "node", id: nodeId };
    updateStatus("Select a second shape to create a connector.");
    render();
    return;
  }

  if (state.pendingConnectionFrom === nodeId) {
    state.pendingConnectionFrom = null;
    updateStatus("Connection cancelled.");
    render();
    return;
  }

  const connector = createConnector(state.pendingConnectionFrom, nodeId);
  state.connectors.push(connector);
  state.selection = { kind: "connector", id: connector.id };
  state.pendingConnectionFrom = null;
  updateStatus("Connector created.");
  persistState();
  render();
}

function getBoardCoordinates(event) {
  const rect = dom.boardSurface.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / state.zoom,
    y: (event.clientY - rect.top) / state.zoom,
  };
}

function updateSelectionProperty(key, value) {
  const entity = getSelectedEntity();
  if (!entity) {
    return;
  }
  entity[key] = value;
  persistState();
  render();
}

function deleteSelection() {
  if (!state.selection) {
    return;
  }

  if (state.selection.kind === "node") {
    const id = state.selection.id;
    state.nodes = state.nodes.filter((node) => node.id !== id);
    state.connectors = state.connectors.filter((connector) => connector.from !== id && connector.to !== id);
  } else {
    state.connectors = state.connectors.filter((connector) => connector.id !== state.selection.id);
  }

  state.selection = null;
  state.pendingConnectionFrom = null;
  updateStatus("Selection deleted.");
  persistState();
  render();
}

function duplicateSelection() {
  const entity = getSelectedEntity();
  if (!entity || entity.kind !== "node") {
    return;
  }

  const clone = structuredClone(entity);
  clone.id = nextId("node");
  clone.x += 36;
  clone.y += 36;
  clone.label = `${clone.label} copy`;
  state.nodes.push(clone);
  state.selection = { kind: "node", id: clone.id };
  updateStatus(`${clone.label} duplicated.`);
  persistState();
  render();
}

function applyQuickAction(action) {
  const entity = getSelectedEntity();

  if (action === "toggle-grid") {
    state.showGrid = !state.showGrid;
    updateStatus(state.showGrid ? "Grid shown." : "Grid hidden.");
    persistState();
    render();
    return;
  }

  if (!entity || entity.kind !== "node") {
    updateStatus("Select a node to use that action.");
    return;
  }

  if (action === "align-left") {
    entity.x = 48;
  } else if (action === "center-board") {
    entity.x = Math.round((BOARD_WIDTH - entity.width) / 2);
  } else if (action === "middle-board") {
    entity.y = Math.round((BOARD_HEIGHT - entity.height) / 2);
  } else if (action === "bring-front") {
    state.nodes = state.nodes.filter((node) => node.id !== entity.id);
    state.nodes.push(entity);
  } else if (action === "send-back") {
    state.nodes = state.nodes.filter((node) => node.id !== entity.id);
    state.nodes.unshift(entity);
  }

  updateStatus("Quick action applied.");
  persistState();
  render();
}

function setZoom(percent) {
  state.zoom = clamp(percent / 100, 0.5, 1.6);
  render();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(getSerializableState(), null, 2)], { type: "application/json" });
  downloadBlob(blob, "webshark-design.json");
  updateStatus("JSON exported.");
}

async function exportSvg() {
  const markup = buildSvgMarkup();
  const blob = new Blob([markup], { type: "image/svg+xml" });
  downloadBlob(blob, "webshark-design.svg");
  updateStatus("SVG exported.");
}

async function exportPng() {
  const svgMarkup = buildSvgMarkup();
  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
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

  canvas.toBlob((blob) => {
    if (!blob) {
      updateStatus("PNG export failed.");
      return;
    }
    downloadBlob(blob, "webshark-design.png");
    updateStatus("PNG exported.");
  }, "image/png");

  URL.revokeObjectURL(url);
}

function importJson(text) {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.connectors)) {
    throw new Error("Invalid design file.");
  }

  state.nodes = parsed.nodes;
  state.connectors = parsed.connectors;
  state.zoom = typeof parsed.zoom === "number" ? clamp(parsed.zoom, 0.5, 1.6) : 1;
  state.showGrid = parsed.showGrid !== false;
  state.canvasBackground = parsed.canvasBackground || DEFAULT_BACKGROUND;
  state.nextId = typeof parsed.nextId === "number"
    ? parsed.nextId
    : Math.max(1, parsed.nodes.length + parsed.connectors.length + 1);
  state.selection = null;
  state.pendingConnectionFrom = null;
  updateStatus("JSON imported.");
  persistState();
  render();
}

function buildSvgMarkup() {
  const connectorMarkup = state.connectors.map((connector) => renderConnectorSvg(connector)).join("");
  const nodeMarkup = state.nodes.map((node) => renderNodeSvg(node)).join("");

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
  <rect x="0" y="0" width="${BOARD_WIDTH}" height="${BOARD_HEIGHT}" fill="${escapeXml(state.canvasBackground)}" />
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
  const opacity = (connector.opacity / 100).toFixed(2);
  const labelMarkup = connector.label
    ? `<text x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 - 12}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#f5f7ff">${escapeXml(connector.label)}</text>`
    : "";

  return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${escapeXml(connector.stroke)}" stroke-width="${connector.strokeWidth}" ${dash} marker-end="url(#arrowHead)" opacity="${opacity}" />${labelMarkup}`;
}

function renderNodeSvg(node) {
  const fill = escapeXml(node.fill);
  const stroke = escapeXml(node.stroke);
  const opacity = (node.opacity / 100).toFixed(2);
  const fontSize = node.fontSize;
  const centerX = node.x + node.width / 2;
  const centerY = node.y + node.height / 2;
  const textBlock = renderSvgTextBlock(node, centerX, centerY, fontSize);

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
    shapeMarkup = `
      <rect x="${node.x}" y="${node.y + ry}" width="${node.width}" height="${node.height - ry * 2}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />
      <ellipse cx="${centerX}" cy="${node.y + ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />
      <ellipse cx="${centerX}" cy="${node.y + node.height - ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />
    `;
  } else {
    shapeMarkup = `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${node.type === "text" ? 12 : 0}" ry="${node.type === "text" ? 12 : 0}" fill="${fill}" stroke="${stroke}" stroke-width="${node.strokeWidth}" />`;
  }

  return `<g opacity="${opacity}" filter="url(#nodeShadow)">${shapeMarkup}${textBlock}</g>`;
}

function renderSvgTextBlock(node, centerX, centerY, fontSize) {
  const lines = String(node.label).split("\n");
  const lineHeight = fontSize * 1.25;
  const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
  const tspans = lines
    .map((line, index) => `<tspan x="${centerX}" y="${startY + index * lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");
  return `<text text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${fontSize}" fill="${escapeXml(node.textColor)}">${tspans}</text>`;
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getSerializableState()));
}

function restoreState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    seedSampleBoard();
    return;
  }

  try {
    importJson(saved);
  } catch {
    seedSampleBoard();
  }
}

function getSerializableState() {
  return {
    nodes: state.nodes,
    connectors: state.connectors,
    zoom: state.zoom,
    showGrid: state.showGrid,
    canvasBackground: state.canvasBackground,
    nextId: state.nextId,
  };
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
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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
  node.label = nextLabel;
  persistState();
  render();
}

function updateStatus(message) {
  dom.boardStatus.textContent = message;
}

function normalizeColor(color) {
  if (typeof color !== "string" || !color.startsWith("#")) {
    return "#6fc2ff";
  }
  return color;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function snapToGrid(value) {
  return Math.round(value / 8) * 8;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function loadAiModel() {
  const modelId = dom.aiModelSelect.value;
  dom.aiStatus.textContent = `Loading ${modelId}...`;
  dom.aiProgressBar.style.width = "0%";

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
}

async function runLocalAi() {
  if (!AI_RUNTIME.generator) {
    await loadAiModel();
  }

  const prompt = dom.aiPrompt.value.trim();
  if (!prompt) {
    dom.aiOutput.value = "Enter a prompt for the local design copilot.";
    return;
  }

  const canvasSummary = state.nodes
    .map((node) => `${node.label} (${node.type})`)
    .join(", ");
  const request = [
    "You are a concise technical diagram and visual design copilot.",
    "Recommend shapes, labels, layout, and any visual polish that would help.",
    "Current board elements:",
    canvasSummary || "The board is empty.",
    `User request: ${prompt}`,
  ].join("\n");

  dom.aiStatus.textContent = "Running local inference...";
  dom.aiOutput.value = "Generating...";

  const result = await AI_RUNTIME.generator(request, {
    max_new_tokens: 180,
    temperature: 0.6,
    top_k: 40,
  });

  const output = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text;
  dom.aiOutput.value = output?.trim() || "The model did not return text.";
  dom.aiStatus.textContent = `${AI_RUNTIME.modelId} completed locally.`;
}

function bindEvents() {
  document.querySelectorAll(".shape-card").forEach((button) => {
    button.addEventListener("click", () => addNode(button.dataset.shape));
  });

  document.querySelectorAll(".tool-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTool = button.dataset.tool;
      document.querySelectorAll(".tool-btn").forEach((candidate) => {
        candidate.classList.toggle("is-active", candidate === button);
      });
      state.pendingConnectionFrom = null;
      updateStatus(state.activeTool === "connect" ? "Select two shapes to connect them." : "Select and arrange objects.");
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => applyQuickAction(button.dataset.action));
  });

  document.querySelector("#deleteSelectionBtn").addEventListener("click", deleteSelection);
  document.querySelector("#duplicateSelectionBtn").addEventListener("click", duplicateSelection);
  document.querySelector("#newBoardBtn").addEventListener("click", newBoard);
  document.querySelector("#sampleBoardBtn").addEventListener("click", seedSampleBoard);
  document.querySelector("#exportJsonBtn").addEventListener("click", exportJson);
  document.querySelector("#exportSvgBtn").addEventListener("click", exportSvg);
  document.querySelector("#exportPngBtn").addEventListener("click", exportPng);
  document.querySelector("#importJsonBtn").addEventListener("click", () => dom.importJsonInput.click());
  document.querySelector("#zoomInBtn").addEventListener("click", () => setZoom(Math.round(state.zoom * 100) + 10));
  document.querySelector("#zoomOutBtn").addEventListener("click", () => setZoom(Math.round(state.zoom * 100) - 10));
  dom.zoomRange.addEventListener("input", () => setZoom(Number(dom.zoomRange.value)));

  dom.importJsonInput.addEventListener("change", async () => {
    const file = dom.importJsonInput.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    importJson(text);
    dom.importJsonInput.value = "";
  });

  dom.boardSurface.addEventListener("pointerdown", () => {
    state.selection = null;
    render();
  });

  dom.propLabel.addEventListener("input", () => {
    const entity = getSelectedEntity();
    if (!entity) {
      return;
    }
    entity.label = dom.propLabel.value;
    persistState();
    render();
  });
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
    state.canvasBackground = dom.boardBackground.value;
    persistState();
    render();
  });

  dom.gridToggle.addEventListener("change", () => {
    state.showGrid = dom.gridToggle.checked;
    persistState();
    render();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.key === "Delete" || event.key === "Backspace") && !event.target.closest("textarea, input")) {
      event.preventDefault();
      deleteSelection();
      return;
    }

    if (event.key.toLowerCase() === "d" && event.ctrlKey) {
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
    persistState();
    render();
  });

  dom.downloadModelBtn.addEventListener("click", () => {
    loadAiModel().catch((error) => {
      dom.aiStatus.textContent = `Model load failed: ${error.message}`;
      dom.aiOutput.value = "";
    });
  });

  dom.runAiBtn.addEventListener("click", () => {
    runLocalAi().catch((error) => {
      dom.aiStatus.textContent = `Inference failed: ${error.message}`;
      dom.aiOutput.value = "";
    });
  });
}

bindEvents();
restoreState();
