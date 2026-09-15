# Virtual IoT Lab component inventory

Source: `artifacts/virtual-iot-lab/src/App.tsx` and `artifacts/virtual-iot-lab/src/index.css`.

The source app is a focused engineering editor rather than a general-purpose component library. The inventory normalizes its reusable UI families and preserves the source terminology where it is product-facing.

| Family | Reference | Source evidence | Dependencies | Chunk | Status |
| --- | --- | --- | --- | --- | --- |
| Instrument header | `components/instrument-header.md` | `CommandBar`, lines 71–100; `.command-bar`, `.cmd-btn`, `.status-chip` | lucide icons, token theme | 1 | implemented |
| Component palette | `components/component-palette.md` | `Palette`, lines 103–117; `.palette-*`, `.example-card` | lucide icons, token theme | 1 | implemented |
| Workspace editor | `components/workspace-editor.md` | `Workspace`, `NodeShape`, lines 119–278; `.workspace-*`, `.component-node`, `.wire-*` | SVG wires, token theme | 1 | implemented |
| Inspector panel | `components/inspector-panel.md` | `Inspector`, lines 296–309; `.inspector-*`, `.field-row` | native form controls, token theme | 1 | implemented |
| Serial monitor | `components/serial-monitor.md` | `SerialMonitor`, lines 311–314; `.serial-*` | native output surface, token theme | 1 | implemented |

No standalone logo asset exists in the source app. The `VIL` mark is rendered as a CSS monogram inside the instrument header and is intentionally not retained as a separate brand asset.