import { CircleDot, MousePointer2, Move3d, Rotate3d, ScanLine } from 'lucide-react';

export type WorkspaceMode = 'select' | 'move' | 'rotate' | 'wire';

export function WorkspaceEditor({ mode = 'select', ledOn = true }: { mode?: WorkspaceMode; ledOn?: boolean }) {
  return (
    <section className="vil-workspace">
      <div className="vil-workspace-toolbar">
        {([
          ['select', <MousePointer2 size={12} />, 'Select'],
          ['move', <Move3d size={12} />, 'Move'],
          ['rotate', <Rotate3d size={12} />, 'Rotate'],
          ['wire', <CircleDot size={12} />, 'Wire'],
        ] as const).map(([value, icon, label]) => <button className={`vil-mode-btn ${mode === value ? 'active' : ''}`} type="button" key={value}>{icon}<span>{label}</span></button>)}
        <span className="vil-toolbar-divider" />
        <button className="vil-mode-btn active" type="button"><ScanLine size={12} /><span>Snap</span></button>
        <select className="vil-snap-select" defaultValue="0.5u" aria-label="Snap spacing"><option>0.25u</option><option>0.5u</option><option>1u</option></select>
      </div>
      <span className="vil-coord-readout">TOP VIEW · 1u = 24px · GRID 12</span>
      <div className="vil-canvas">
        <svg className="vil-wire-layer" viewBox="0 0 620 300" aria-label="Connected circuit wires">
          <path className="vil-wire vil-wire-signal" d="M190 108 C260 108, 285 125, 360 125" />
          <path className="vil-wire vil-wire-power" d="M190 135 C285 135, 365 155, 424 155" />
          <path className={`vil-wire vil-wire-signal ${ledOn ? 'active' : ''}`} d="M390 125 C410 125, 420 140, 435 140" />
        </svg>
        <div className="vil-node vil-uno"><span className="vil-node-label">Arduino Uno R3</span><span className="vil-usb" /><span className="vil-chip">ATmega</span><span className="vil-pin-strip" /></div>
        <div className="vil-node vil-resistor"><span className="vil-node-label">Resistor</span><span className="vil-lead vil-lead-left" /><span className="vil-resistor-body" /><span className="vil-lead vil-lead-right" /></div>
        <div className={`vil-node vil-led ${ledOn ? 'on' : ''}`}><span className="vil-node-label">LED · 5mm</span><span className="vil-led-bulb" /></div>
        <div className="vil-selection-box" />
      </div>
      <div className="vil-wire-instruction"><CircleDot size={12} /> Select a destination pin</div>
    </section>
  );
}