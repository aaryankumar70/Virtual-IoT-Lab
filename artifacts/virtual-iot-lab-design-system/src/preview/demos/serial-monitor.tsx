import { SerialMonitor } from '../../components/ui/serial-monitor';
import { Guidelines } from '../parts';

export function SerialMonitorDemo() {
  return <div className="vil-foundation-grid">
    <SerialMonitor />
    <section className="vil-foundation-card"><h2>Runtime output</h2><Guidelines items={[
      { kind: 'do', text: 'Keep timestamps in monospace and messages visually separated by tone.' },
      { kind: 'do', text: 'Use the dark instrument surface for code-adjacent runtime output.' },
      { kind: 'dont', text: 'Do not style normal serial data like an error or warning.' },
    ]} /></section>
  </div>;
}