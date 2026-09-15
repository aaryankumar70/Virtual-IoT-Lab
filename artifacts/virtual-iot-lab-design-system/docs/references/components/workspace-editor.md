# Workspace editor

- **Source:** `artifacts/virtual-iot-lab/src/App.tsx`, `NodeShape` lines 119–177 and `Workspace` lines 179–278.
- **Styles:** `.workspace-panel`, `.workspace-toolbar`, `.component-node`, component geometry classes, `.wire-layer`, `.wire`, `.pin-dot`, `.wire-instruction`.
- **Behavior:** select/move/rotate/wire modes, grid snap, selected objects, logical wire rendering, and hardware-shaped nodes.
- **Port note:** the preview renders a deterministic circuit snapshot; product state and interaction callbacks remain in the consuming app.