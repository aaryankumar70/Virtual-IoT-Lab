export type SerialMessage = { time: string; message: string; tone?: 'system' | 'data' | 'error' };

export function SerialMonitor({ lines = [
  { time: '000.000s', message: 'Runtime idle · press RUN to execute setup()', tone: 'system' },
  { time: '001.001s', message: 'LED ON', tone: 'data' },
  { time: '002.002s', message: 'LED OFF', tone: 'data' },
] }: { lines?: SerialMessage[] }) {
  return (
    <section className="vil-serial">
      <div className="vil-serial-header"><strong>Serial monitor</strong><span>9600 baud · virtual USB</span><div className="vil-serial-actions"><button type="button">CLEAR</button><button type="button">COPY</button></div></div>
      <div className="vil-serial-output">{lines.map((line) => <div className={`vil-serial-line ${line.tone ?? ''}`} key={`${line.time}-${line.message}`}><span>{line.time}</span><strong>{line.message}</strong></div>)}</div>
    </section>
  );
}