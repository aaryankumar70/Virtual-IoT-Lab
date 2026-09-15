import { InstrumentHeader } from '../../components/ui/instrument-header';
import { Guidelines } from '../parts';

export function InstrumentHeaderDemo() {
  return <div className="vil-foundation-grid">
    <InstrumentHeader running />
    <section className="vil-foundation-card"><h2>Usage</h2><Guidelines items={[
      { kind: 'do', text: 'Keep file actions grouped before simulation actions.' },
      { kind: 'do', text: 'Pair a compact status chip with a visible runtime state.' },
      { kind: 'dont', text: 'Do not hide RUN and STOP in an overflow menu on desktop.' },
    ]} /></section>
  </div>;
}