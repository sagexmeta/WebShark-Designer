# WebShark Designer

WebShark Designer is a static browser app for technical diagramming and visual design work. It combines a Visio-style canvas with shape libraries, reusable custom element packages, role-aware workspaces, detailed logging, rich export tools, and a browser-local AI copilot that downloads a selected model to the user's machine and runs it locally in the browser.

## Included files

- `index.html` - application shell
- `styles.css` - visual styling, layout, and canvas presentation
- `app.js` - diagram editor, export/import logic, and local AI integration

## Features

- Technical diagram tools: process blocks, services, decisions, notes, databases, text, and connectors
- Graphic design conveniences: color controls, typography controls, opacity, shadow, z-order, board background, and quick alignment actions
- Light and dark mode, configurable animation density, compact mode, glass panels, grid controls, and role-aware options
- Local username/password sign-in stored entirely in the browser
- Workspaces with save, duplicate, delete, autosave, and role-specific layouts
- Custom element studio: create your own reusable elements, save selected nodes as templates, and organize them into packages
- Draggable dock panels and resizable left, right, and log regions
- Detailed app log with query filters, JSON export, and drill-in details
- Local AI copilot with optional automatic app-log context streaming
- Exports: JSON, TXT, SVG, PNG, JPG, WEBP, and PDF
- Imports: JSON board files
- Local persistence: app data, users, workspaces, settings, and logs are saved in browser storage

## Running it

This is a static app, so you can serve it with any lightweight local web server. For example:

```powershell
cd WebShark-Designer
python -m http.server 8080
```

Then open `http://localhost:8080` in a modern browser.

## Local AI notes

- The AI integration uses `@xenova/transformers` from a CDN.
- Models are downloaded by the browser and cached locally for reuse.
- WebGPU is used when available; otherwise the app falls back to WASM.
- Expect the smaller model to load and respond faster than the base model.
- The first model download can be large and may take a while depending on the connection and browser cache state.
- When AI log access is enabled, recent and live log entries are automatically collected into the AI context buffer.

## Authentication and persistence notes

- Username/password sign-in is local-only and intended for a static demo environment, not production security.
- Users, workspaces, settings, logs, and reusable packages are stored in browser local storage.
- Clearing local storage removes the locally saved accounts and workspace data.

## Usage notes

- Click a shape in the left panel to add it to the current viewport.
- Use **Select** to move or resize objects.
- Use **Connect** and then click two nodes to link them.
- Use **Options** for theme, role, AI log access, motion, density, autosave, and other settings.
- Use the custom element studio to build your own element packages or capture an existing node as a reusable template.
- Drag panels between docks and drag the splitters to resize the app layout.
- Use the log console query box with terms like `level:error`, `category:workspace`, or free text.
- Use the right panel to edit text, fills, strokes, typography, and connector style.
- Double-click a node for quick text editing.
- Export to common shareable formats from the top toolbar or export panel.
