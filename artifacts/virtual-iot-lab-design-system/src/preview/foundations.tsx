import { Guidelines } from './parts';
import { ComponentPalette } from '../components/ui/component-palette';
import { InstrumentHeader } from '../components/ui/instrument-header';
import { InspectorPanel } from '../components/ui/inspector-panel';
import { SerialMonitor } from '../components/ui/serial-monitor';
import { WorkspaceEditor } from '../components/ui/workspace-editor';

const CORE_SWATCHES = [
  { name: 'Primary · signal teal', color: '#0d7777' },
  { name: 'Secondary · panel mist', color: '#e4eeee' },
  { name: 'Accent · hardware amber', color: '#e3a62f' },
];

const SUPPORTING_SWATCHES = [
  { name: 'Workspace', color: '#edf2f1' },
  { name: 'Instrument', color: '#172830' },
  { name: 'Card', color: '#f4f7f7' },
  { name: 'Muted', color: '#e9f3f1' },
  { name: 'Danger', color: '#7d3832' },
];

export function OverviewPage() {
  return (
    <div className="vil-foundation-grid">
      <section className="vil-foundation-card">
        <h2>Virtual IoT Lab visual language</h2>
        <p>Compact, high-signal controls for composing circuits, reading state, and moving between code and hardware without losing context.</p>
        <Guidelines items={[
          { kind: 'do', text: 'Use teal for signal, focus, active controls, and connected states.' },
          { kind: 'do', text: 'Use amber sparingly for run state, hardware detail, and attention.' },
          { kind: 'dont', text: 'Do not use soft dashboard decoration where an instrument state or control is expected.' },
        ]} />
      </section>
      <section className="vil-foundation-card">
        <h2>Core palette</h2>
        <div className="vil-swatch-grid">{CORE_SWATCHES.map((swatch) => <div className="vil-swatch" style={{ background: swatch.color }} key={swatch.name}><span>{swatch.name}</span></div>)}</div>
      </section>
      <section className="vil-foundation-card">
        <h2>At a glance</h2>
        <InstrumentHeader />
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 210px', gap: 10, marginTop: 12 }}>
          <ComponentPalette />
          <WorkspaceEditor />
          <InspectorPanel />
        </div>
        <div style={{ marginTop: 12 }}><SerialMonitor /></div>
      </section>
    </div>
  );
}

export function ColorsPage() {
  return (
    <div className="vil-foundation-grid">
      <section className="vil-foundation-card">
        <h2>Core roles</h2>
        <p>Primary, secondary, and accent are the stable semantic entry points for product surfaces.</p>
        <div className="vil-swatch-grid">{CORE_SWATCHES.map((swatch) => <div className="vil-swatch" style={{ background: swatch.color }} key={swatch.name}><span>{swatch.name}</span></div>)}</div>
      </section>
      <section className="vil-foundation-card">
        <h2>Supporting surfaces</h2>
        <div className="vil-swatch-grid">{SUPPORTING_SWATCHES.map((swatch) => <div className="vil-swatch" style={{ background: swatch.color }} key={swatch.name}><span style={{ color: swatch.color === '#172830' || swatch.color === '#7d3832' ? '#fff' : undefined }}>{swatch.name}</span></div>)}</div>
      </section>
      <section className="vil-foundation-card">
        <h2>Color guidance</h2>
        <Guidelines items={[
          { kind: 'do', text: 'Keep engineering surfaces cool and pale so colored wires and hardware remain legible.' },
          { kind: 'do', text: 'Reserve dark surfaces for command, code, and serial output regions.' },
          { kind: 'dont', text: 'Do not repurpose destructive red as a general attention color; amber is the hardware warning tone.' },
        ]} />
      </section>
    </div>
  );
}

export function FontsPage() {
  return (
    <div className="vil-foundation-grid">
      <section className="vil-foundation-card">
        <h2>Font families</h2>
        <div className="vil-type-row"><span className="vil-mono">sans</span><strong style={{ fontSize: 28 }}>Outfit</strong></div>
        <div className="vil-type-row"><span className="vil-mono">mono</span><strong className="vil-mono" style={{ fontSize: 22 }}>DM Mono</strong></div>
        <p style={{ marginTop: 14 }}>Outfit carries readable interface hierarchy. DM Mono marks technical metadata, code, coordinates, statuses, and serial messages.</p>
      </section>
      <section className="vil-foundation-card">
        <h2>Type scale</h2>
        <div className="vil-type-row"><span className="vil-mono">title</span><strong style={{ fontSize: 22 }}>Project title</strong></div>
        <div className="vil-type-row"><span className="vil-mono">label</span><strong style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>Panel header</strong></div>
        <div className="vil-type-row"><span className="vil-mono">meta</span><span className="vil-mono" style={{ fontSize: 11 }}>LOCAL PROJECT · v1.0</span></div>
      </section>
    </div>
  );
}

export function LayoutPage() {
  return (
    <div className="vil-foundation-grid">
      <section className="vil-foundation-card">
        <h2>Spacing and grid</h2>
        <p>The UI uses a four-pixel base rhythm. The workspace grid is explicit: 1u equals 24px, with selectable 0.25u, 0.5u, and 1u snapping.</p>
        <div style={{ display: 'flex', alignItems: 'end', gap: 12, marginTop: 18 }}>
          {[4, 8, 12, 16, 24].map((size) => <div key={size} style={{ width: size * 2, height: size * 2, background: '#0d7777', borderRadius: 3 }} title={`${size}px`} />)}
        </div>
      </section>
      <section className="vil-foundation-card">
        <h2>Surfaces and states</h2>
        <p>Panel borders are quiet, corners stay compact, and selection is expressed with teal outlines rather than large shadows.</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <div style={{ width: 76, height: 54, border: '1px solid #c7d3d5', borderRadius: 3, background: '#f4f7f7' }} />
          <div style={{ width: 76, height: 54, border: '1px solid #83b6b1', borderRadius: 3, background: '#d9ece8', boxShadow: 'inset 0 0 0 1px #edf8f5' }} />
          <div style={{ width: 76, height: 54, border: '1px solid #38545a', borderRadius: 3, background: '#213940' }} />
        </div>
      </section>
    </div>
  );
}