import { Lock, Unlock } from 'lucide-react';

export type InspectorField = { label: string; value: string };

export function InspectorPanel({ locked = false, fields = [
  { label: 'x', value: '525' },
  { label: 'y', value: '170' },
  { label: 'z', value: '0' },
  { label: 'rotation', value: '0' },
] }: { locked?: boolean; fields?: InspectorField[] }) {
  return (
    <aside className="vil-inspector">
      <div className="vil-panel-header"><span>Property inspector</span><span className="vil-subtle">LIVE</span></div>
      <div className="vil-inspector-body">
        <div className="vil-inspector-title"><strong>LED · 5mm</strong><span>led</span></div>
        <div className="vil-inspector-section">TRANSFORM · 1u = 24px</div>
        {fields.map((field) => <label className="vil-field-row" key={field.label}><span>{field.label}</span><input value={field.value} readOnly /></label>)}
        <button className={`vil-lock-toggle ${locked ? 'locked' : ''}`} type="button">{locked ? <Lock size={12} /> : <Unlock size={12} />}{locked ? 'Unlock object' : 'Lock object'}</button>
        <div className="vil-inspector-section">PROPERTIES</div>
        <label className="vil-field-row"><span>color</span><input value="Red" readOnly /></label>
        <label className="vil-field-row"><span>forwardVoltage</span><input value="2.0 V" readOnly /></label>
        <div className="vil-field-row"><span>pins</span><output>A · K</output></div>
      </div>
    </aside>
  );
}