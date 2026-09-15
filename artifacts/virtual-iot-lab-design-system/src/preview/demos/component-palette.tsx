import { ComponentPalette } from '../../components/ui/component-palette';
import { Guidelines } from '../parts';

export function ComponentPaletteDemo() {
  return <div className="vil-foundation-grid" style={{ gridTemplateColumns: 'minmax(220px, 310px) 1fr' }}>
    <ComponentPalette />
    <section className="vil-foundation-card"><h2>Palette behavior</h2><p>Group parts by hardware role, show the technical descriptor below the human label, and keep add affordances quiet until hover.</p><div style={{ marginTop: 18 }}><Guidelines items={[
      { kind: 'do', text: 'Use short group labels: Boards, Basic, Actuators, Sensors.' },
      { kind: 'do', text: 'Use a consistent icon tile to make scanning faster.' },
      { kind: 'dont', text: 'Do not overload the palette with implementation identifiers.' },
    ]} /></div></section>
  </div>;
}