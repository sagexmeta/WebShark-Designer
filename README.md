# WebShark Designer

WebShark Designer is a static browser app for technical diagramming and visual design work. It combines a Visio-style canvas with shape libraries, connectors, styling controls, export tools, and a browser-local AI copilot that downloads a selected model to the user's machine and runs it locally in the browser.

## Included files

- `index.html` - application shell
- `styles.css` - visual styling, layout, and canvas presentation
- `app.js` - diagram editor, export/import logic, and local AI integration

## Features

- Technical diagram tools: process blocks, services, decisions, notes, databases, text, and connectors
- Graphic design conveniences: color controls, typography controls, opacity, shadow, z-order, board background, and quick alignment actions
- Exports: JSON, SVG, and PNG
- Imports: JSON board files
- Local persistence: the current board is saved in browser storage
- Local AI copilot: choose a supported model, download it in-browser, and run inference locally on the machine

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

## Usage notes

- Click a shape in the left panel to add it to the current viewport.
- Use **Select** to move or resize objects.
- Use **Connect** and then click two nodes to link them.
- Use the right panel to edit text, fills, strokes, typography, and connector style.
- Double-click a node for quick text editing.
- Export to SVG or PNG when you want a shareable graphic output.
