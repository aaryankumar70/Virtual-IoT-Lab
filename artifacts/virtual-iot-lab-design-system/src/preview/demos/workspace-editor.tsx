import { WorkspaceEditor } from '../../components/ui/workspace-editor';
import { Guidelines } from '../parts';

export function WorkspaceEditorDemo() {
  return <div className="vil-foundation-grid">
    <WorkspaceEditor mode="wire" />
    <section className="vil-foundation-card"><h2>Workspace rules</h2><Guidelines items={[
      { kind: 'do', text: 'Use the grid as the persistent visual reference for movement and alignment.' },
      { kind: 'do', text: 'Render wires from logical endpoints and make active signal movement visible.' },
      { kind: 'dont', text: 'Do not use a large floating toolbar that hides the circuit canvas.' },
    ]} /></section>
  </div>;
}