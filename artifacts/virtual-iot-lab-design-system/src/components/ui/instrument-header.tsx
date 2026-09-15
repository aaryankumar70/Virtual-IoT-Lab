import { FilePlus2, FolderOpen, Play, RotateCw, Save, Square } from 'lucide-react';

export type InstrumentHeaderProps = {
  projectName?: string;
  running?: boolean;
  dirty?: boolean;
  onRun?: () => void;
};

export function InstrumentHeader({
  projectName = 'Blink Demo',
  running = false,
  dirty = false,
  onRun,
}: InstrumentHeaderProps) {
  return (
    <header className="vil-command-bar">
      <div className="vil-brand-mark">VIL</div>
      <div className="vil-project-title">
        <strong>{projectName}</strong>
        <span>{dirty ? 'UNSAVED CHANGES' : 'LOCAL PROJECT · v1.0'}</span>
      </div>
      <div className="vil-command-actions">
        <button className="vil-command-btn" type="button"><FilePlus2 size={14} /> <span>New</span></button>
        <button className="vil-command-btn" type="button"><FolderOpen size={14} /> <span>Load</span></button>
        <button className="vil-command-btn" type="button"><Save size={14} /> <span>Save</span></button>
        <button className="vil-command-btn vil-command-icon" type="button" aria-label="Reset"><RotateCw size={14} /></button>
        <button className="vil-command-btn vil-run-btn" type="button" onClick={onRun} disabled={running}><Play size={13} fill="currentColor" /> <span>RUN</span></button>
        <button className="vil-command-btn vil-stop-btn" type="button" disabled={!running}><Square size={12} fill="currentColor" /> <span>STOP</span></button>
      </div>
      <div className="vil-status-chip"><i className={`vil-status-dot ${running ? 'live' : ''}`} />{running ? 'SIMULATION RUNNING' : 'READY'}</div>
    </header>
  );
}