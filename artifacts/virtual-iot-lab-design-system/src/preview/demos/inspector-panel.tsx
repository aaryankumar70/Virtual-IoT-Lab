import { InspectorPanel } from '../../components/ui/inspector-panel';
import { Guidelines } from '../parts';

export function InspectorPanelDemo() {
  return <div className="vil-foundation-grid" style={{ gridTemplateColumns: 'minmax(240px, 330px) 1fr' }}>
    <InspectorPanel locked />
    <section className="vil-foundation-card"><h2>Inspection hierarchy</h2><p>Show the selected component first, then transform, lock state, editable properties, and pin metadata.</p><div style={{ marginTop: 18 }}><Guidelines items={[
      { kind: 'do', text: 'Keep numeric transform fields aligned and easy to scan.' },
      { kind: 'do', text: 'Use LIVE metadata to reinforce that edits affect the workspace immediately.' },
      { kind: 'dont', text: 'Do not bury core position and rotation fields below secondary properties.' },
    ]} /></div></section>
  </div>;
}