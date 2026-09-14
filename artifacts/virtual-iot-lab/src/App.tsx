import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/error-boundary';
import { Code2, Copy, Cpu, FilePlus2, FolderOpen, GripVertical, HardDrive, Lightbulb, Minus, Play, Plus, Redo2, RotateCw, Save, Settings2, Square, Trash2, Undo2, Waves } from 'lucide-react';
import { COMPONENT_REGISTRY, getDefinition, makeComponent } from './lib/component-registry';
import { DEFAULT_CODE, createInitialRuntime, resetRuntime, tickRuntime, validateSketch } from './lib/runtime';
import { loadProject, saveProject } from './lib/project-storage';
import type { LabComponent, Project, SerialLine } from './lib/lab-types';
import './index.css';

const queryClient = new QueryClient();
const freshProject = (): Project => ({
  version: 1,
  name: 'Blink Demo',
  code: DEFAULT_CODE,
  components: [
    { ...makeComponent('arduino-uno', 70, 122, 1), id: 'uno-1' },
    { ...makeComponent('breadboard', 315, 300, 2), id: 'breadboard-1' },
    { ...makeComponent('resistor', 390, 150, 3), id: 'resistor-1' },
    { ...makeComponent('led', 525, 170, 4), id: 'led-1' },
  ],
  wires: [
    { id: 'wire-1', from: { componentId: 'uno-1', pin: 'D13' }, to: { componentId: 'resistor-1', pin: '1' }, signal: 'signal' },
    { id: 'wire-2', from: { componentId: 'resistor-1', pin: '2' }, to: { componentId: 'led-1', pin: 'A' }, signal: 'signal' },
    { id: 'wire-3', from: { componentId: 'led-1', pin: 'K' }, to: { componentId: 'uno-1', pin: 'GND' }, signal: 'power' },
  ],
});

const iconFor = (type: string) => {
  if (type === 'arduino-uno') return <Cpu size={15} />;
  if (type === 'led') return <Lightbulb size={15} />;
  if (type === 'breadboard') return <GripVertical size={15} />;
  if (type === 'potentiometer') return <Waves size={15} />;
  return <Settings2 size={15} />;
};

function CommandBar({ projectName, running, dirty, onNew, onSave, onLoad, onRun, onStop, onReset }: {
  projectName: string; running: boolean; dirty: boolean; onNew: () => void; onSave: () => void; onLoad: () => void; onRun: () => void; onStop: () => void; onReset: () => void;
}) {
  return <header className="command-bar">
    <div className="brand-mark">VIL</div>
    <div className="project-title"><strong>{projectName}</strong><span>{dirty ? 'UNSAVED CHANGES' : 'LOCAL PROJECT · v1.0'}</span></div>
    <div className="cmd-group">
      <button className="cmd-btn" onClick={onNew} data-testid="button-new"><FilePlus2 size={14} /><span>New</span></button>
      <button className="cmd-btn" onClick={onLoad} data-testid="button-load"><FolderOpen size={14} /><span>Load</span></button>
      <button className="cmd-btn" onClick={onSave} data-testid="button-save"><Save size={14} /><span>Save</span></button>
      <button className="cmd-btn icon-only" disabled title="Undo history is empty" data-testid="button-undo"><Undo2 size={14} /></button>
      <button className="cmd-btn icon-only" disabled title="Redo history is empty" data-testid="button-redo"><Redo2 size={14} /></button>
      <button className="cmd-btn primary" onClick={onRun} disabled={running} data-testid="button-run"><Play size={13} fill="currentColor" /><span>RUN</span></button>
      <button className="cmd-btn stop" onClick={onStop} disabled={!running} data-testid="button-stop"><Square size={12} fill="currentColor" /><span>STOP</span></button>
      <button className="cmd-btn icon-only" onClick={onReset} title="Reset runtime" data-testid="button-reset"><RotateCw size={14} /></button>
    </div>
    <div className="status-chip"><i className={`status-dot ${running ? 'live' : ''}`} />{running ? 'SIMULATION RUNNING' : 'READY'}</div>
  </header>;
}

function Palette({ onAdd, onExample }: { onAdd: (type: string) => void; onExample: () => void }) {
  const groups = (['board', 'basic', 'actuator', 'sensor'] as const).map((kind) => ({ kind, label: kind === 'board' ? 'Boards' : kind === 'basic' ? 'Basic' : kind === 'actuator' ? 'Actuators' : 'Sensors', items: COMPONENT_REGISTRY.filter((item) => item.kind === kind) }));
  return <aside className="panel palette-panel">
    <div className="panel-header"><span>Component palette</span><span className="subtle">06 parts</span></div>
    <div className="palette">
      {groups.map((group) => <div className="palette-group" key={group.kind}>
        <div className="palette-label">{group.label}</div>
        {group.items.map((item) => <button className="palette-item" key={item.type} onClick={() => onAdd(item.type)} data-testid={`button-add-${item.type}`}>
          <span className="palette-icon">{iconFor(item.type)}</span><span className="palette-text">{item.label}<small>{item.description}</small></span><Plus size={13} className="add-icon" />
        </button>)}
      </div>)}
    </div>
    <div className="example-card"><strong>Example project</strong><span>Blink Demo · 4 parts · 3 wires</span><button onClick={onExample} data-testid="button-load-example">Load example</button></div>
  </aside>;
}

function NodeShape({ component, selected, ledOn, onSelect, onMove, onRotate, onDelete }: {
  component: LabComponent; selected: boolean; ledOn: boolean; onSelect: () => void; onMove: (dx: number, dy: number) => void; onRotate: () => void; onDelete: () => void;
}) {
  const def = getDefinition(component.type);
  const shapeClass = component.type === 'arduino-uno' ? 'uno-board' : component.type === 'breadboard' ? 'breadboard' : component.type === 'resistor' ? 'resistor-node' : 'led-node';
  return <div className={`component-node ${selected ? 'selected' : ''}`} style={{ left: component.x, top: component.y, transform: `rotate(${component.rotation}deg)` }} onClick={(event) => { event.stopPropagation(); onSelect(); }} data-testid={`component-${component.id}`}>
    <div className="node-label">{component.name}</div>
    <div className={`${shapeClass} ${component.type === 'led' && ledOn ? 'on' : ''}`}>
      {component.type === 'arduino-uno' && <><div className="usb" /><div className="chip" /><div className="pin-strip">{Array.from({ length: 8 }).map((_, i) => <i className="uno-pin" key={i} />)}</div><div className="pin-strip bottom">{Array.from({ length: 7 }).map((_, i) => <i className="uno-pin" key={i} />)}</div></>}
      {component.type === 'breadboard' && <div className="holes" />}
      {component.type === 'resistor' && <><i className="lead left" /><div className="resistor-body" /><i className="lead right" /></>}
      {component.type === 'led' && <div className="led-bulb" />}
    </div>
    {selected && <><div className="selection-box" /><div className="node-controls">
      <button onClick={(event) => { event.stopPropagation(); onMove(-8, 0); }} title="Move left"><Minus size={11} /></button>
      <button onClick={(event) => { event.stopPropagation(); onRotate(); }} title="Rotate"><RotateCw size={11} /></button>
      <button onClick={(event) => { event.stopPropagation(); onDelete(); }} title="Delete"><Trash2 size={11} /></button>
    </div></>}
    {def?.pins.slice(0, 2).map((pin, index) => <i key={pin} className="pin-dot" title={pin} style={{ right: index === 0 ? -5 : 'auto', left: index === 1 ? -5 : 'auto', top: 25 + index * 16 }} />)}
  </div>;
}

function Workspace({ project, selectedId, ledOn, onSelect, onMove, onRotate, onDelete }: {
  project: Project; selectedId: string | null; ledOn: boolean; onSelect: (id: string | null) => void; onMove: (id: string, dx: number, dy: number) => void; onRotate: (id: string) => void; onDelete: (id: string) => void;
}) {
  const pointFor = (id: string, pin: string) => {
    const component = project.components.find((item) => item.id === id);
    if (!component) return { x: 0, y: 0 };
    if (component.type === 'arduino-uno') return pin === 'GND' ? { x: component.x + 130, y: component.y + 95 } : { x: component.x + 154, y: component.y - 3 };
    if (component.type === 'resistor') return pin === '1' ? { x: component.x, y: component.y + 16 } : { x: component.x + 74, y: component.y + 16 };
    if (component.type === 'led') return pin === 'A' ? { x: component.x + 48, y: component.y + 20 } : { x: component.x + 6, y: component.y + 20 };
    return { x: component.x + 20, y: component.y + 20 };
  };
  return <section className="workspace-panel" onClick={() => onSelect(null)}>
    <div className="workspace-topline"><span className="workspace-tag">WORKSPACE / TOP VIEW</span><span className="coord-readout">X 048 · Y 026 · GRID 24</span></div>
    <div className="workspace-canvas">
      <svg className="wire-layer">
        {project.wires.map((wire) => { const start = pointFor(wire.from.componentId, wire.from.pin); const end = pointFor(wire.to.componentId, wire.to.pin); const mid = (start.x + end.x) / 2; return <path key={wire.id} className={`wire ${wire.signal} ${ledOn && wire.signal === 'signal' ? 'active' : ''}`} d={`M ${start.x} ${start.y} C ${mid} ${start.y}, ${mid} ${end.y}, ${end.x} ${end.y}`} />; })}
      </svg>
      {project.components.map((component) => <NodeShape key={component.id} component={component} selected={selectedId === component.id} ledOn={ledOn} onSelect={() => onSelect(component.id)} onMove={(dx, dy) => onMove(component.id, dx, dy)} onRotate={() => onRotate(component.id)} onDelete={() => onDelete(component.id)} />)}
      <div className="minimap" title="Workspace overview"><div className="mini-board" /><div className="mini-bread" /></div>
    </div>
  </section>;
}

function CodeEditor({ code, onChange, error }: { code: string; onChange: (code: string) => void; error?: string }) {
  const lines = code.split('\n').length;
  return <div className="editor-wrap">
    <div className="panel-header"><span><Code2 size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />Sketch editor</span><span className="subtle">Arduino C++</span></div>
    <div className="editor-meta"><span>blink_demo.ino</span><span>{error ? 'CHECK FAILED' : 'LOCAL BUFFER'}</span></div>
    <div className="editor"><div className="line-numbers">{Array.from({ length: lines }).map((_, i) => <div key={i}>{i + 1}</div>)}</div><textarea className="code-area" value={code} spellCheck={false} onChange={(event) => onChange(event.target.value)} data-testid="textarea-code" aria-label="Arduino code editor" /></div>
  </div>;
}

function Inspector({ component, onChange }: { component?: LabComponent; onChange: (id: string, field: string, value: string) => void }) {
  if (!component) return <div className="inspector"><div className="panel-header"><span>Property inspector</span></div><div className="empty-inspector">Select a component in the workspace to inspect its pins and properties.</div></div>;
  const definition = getDefinition(component.type);
  return <div className="inspector"><div className="panel-header"><span>Property inspector</span><span className="subtle">LIVE</span></div><div className="inspector-body"><div className="inspector-title"><span>{component.name}</span><span className="inspector-type">{component.type}</span></div>
    {Object.entries(component.properties).map(([key, value]) => <label className="field-row" key={key}><span>{key}</span><input value={value} onChange={(event) => onChange(component.id, key, event.target.value)} data-testid={`input-property-${key}`} /></label>)}
    <div className="field-row"><span>pins</span><output>{definition?.pins.join(' · ')}</output></div>
  </div></div>;
}

function SerialMonitor({ lines, onClear }: { lines: SerialLine[]; onClear: () => void }) {
  const outputRef = useRef<HTMLDivElement>(null);
  useEffect(() => { outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight }); }, [lines]);
  return <section className="serial-panel"><div className="serial-header"><strong>Serial monitor</strong><span>9600 baud · virtual USB</span><div className="serial-actions"><button onClick={onClear} data-testid="button-clear-serial">CLEAR</button><button onClick={() => navigator.clipboard?.writeText(lines.map((line) => `${line.time} ${line.message}`).join('\n'))} data-testid="button-copy-serial"><Copy size={12} style={{ verticalAlign: 'middle' }} /> COPY</button></div></div><div className="serial-output" ref={outputRef}>{lines.map((item) => <div className={`serial-line ${item.tone}`} key={item.id}><span className="serial-time">{item.time}</span><span className="serial-message">{item.message}</span></div>)}</div></section>;
}

function Home() {
  const [project, setProject] = useState<Project>(() => loadProject() ?? freshProject());
  const [selectedId, setSelectedId] = useState<string | null>('led-1');
  const [runtime, setRuntime] = useState(createInitialRuntime);
  const [toast, setToast] = useState('');
  const [dirty, setDirty] = useState(false);
  const sequence = useRef(10);
  const selected = useMemo(() => project.components.find((item) => item.id === selectedId), [project.components, selectedId]);

  useEffect(() => {
    if (!runtime.running) return;
    const timer = window.setInterval(() => setRuntime((previous) => tickRuntime(project.code, previous)), 250);
    return () => window.clearInterval(timer);
  }, [runtime.running, project.code]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2200); return () => window.clearTimeout(timer); }, [toast]);

  const notify = useCallback((message: string) => setToast(message), []);
  const replaceProject = (next: Project, message: string) => { setProject(next); setRuntime(createInitialRuntime()); setSelectedId(next.components[0]?.id ?? null); setDirty(false); notify(message); };
  const updateProject = (recipe: (current: Project) => Project) => { setProject((current) => recipe(current)); setDirty(true); };
  const addComponent = (type: string) => {
    const def = getDefinition(type);
    const component = makeComponent(type, 100 + (sequence.current % 4) * 55, 120 + (sequence.current % 5) * 44, sequence.current++);
    updateProject((current) => ({ ...current, components: [...current.components, component] }));
    setSelectedId(component.id); notify(`${def?.label ?? 'Component'} added to workspace`);
  };
  const onSave = () => { saveProject(project); setDirty(false); notify('Project saved to local storage'); };
  const onLoad = () => { const loaded = loadProject(); loaded ? replaceProject(loaded, 'Project loaded from local storage') : notify('No saved project found'); };
  const onNew = () => { if (window.confirm('Start a new blank project? Unsaved changes will be discarded.')) replaceProject({ ...freshProject(), name: 'Untitled Circuit', components: [], wires: [] }, 'New project ready'); };
  const onRun = () => { const error = validateSketch(project.code); if (error) { setRuntime((previous) => ({ ...previous, error, output: [...previous.output, { id: `${Date.now()}`, time: '000.000s', message: `ERROR: ${error}`, tone: 'error' }] })); notify(error); return; } setRuntime((previous) => ({ ...previous, running: true, error: undefined, output: [...previous.output, { id: `${Date.now()}`, time: `${(previous.elapsed / 1000).toFixed(3)}s`, message: 'setup() complete · loop() started', tone: 'system' }] })); notify('Simulation running'); };
  const onStop = () => { setRuntime((previous) => ({ ...previous, running: false, output: [...previous.output, { id: `${Date.now()}`, time: `${(previous.elapsed / 1000).toFixed(3)}s`, message: 'Simulation stopped by user', tone: 'system' }] })); notify('Simulation stopped'); };
  const onReset = () => { setRuntime(resetRuntime(project.code)); notify('Runtime reset'); };
  const onDelete = (id: string) => { updateProject((current) => ({ ...current, components: current.components.filter((item) => item.id !== id), wires: current.wires.filter((wire) => wire.from.componentId !== id && wire.to.componentId !== id) })); setSelectedId(null); notify('Component removed'); };
  const onMove = (id: string, dx: number, dy: number) => updateProject((current) => ({ ...current, components: current.components.map((item) => item.id === id ? { ...item, x: Math.max(12, item.x + dx), y: Math.max(30, item.y + dy) } : item) }));
  const onRotate = (id: string) => updateProject((current) => ({ ...current, components: current.components.map((item) => item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item) }));
  const onPropertyChange = (id: string, field: string, value: string) => updateProject((current) => ({ ...current, components: current.components.map((item) => item.id === id ? { ...item, properties: { ...item.properties, [field]: value } } : item) }));
  const loadExample = () => replaceProject(freshProject(), 'Blink Demo loaded');

  return <div className="lab-shell">
    <CommandBar projectName={project.name} running={runtime.running} dirty={dirty} onNew={onNew} onSave={onSave} onLoad={onLoad} onRun={onRun} onStop={onStop} onReset={onReset} />
    <main className="main-grid">
      <Palette onAdd={addComponent} onExample={loadExample} />
      <Workspace project={project} selectedId={selectedId} ledOn={runtime.ledOn} onSelect={setSelectedId} onMove={onMove} onRotate={onRotate} onDelete={onDelete} />
      <aside className="right-panel"><CodeEditor code={project.code} error={runtime.error} onChange={(code) => { updateProject((current) => ({ ...current, code })); if (runtime.error) setRuntime((previous) => ({ ...previous, error: undefined })); }} /><Inspector component={selected} onChange={onPropertyChange} /></aside>
      <SerialMonitor lines={runtime.output} onClear={() => setRuntime((previous) => ({ ...previous, output: [] }))} />
    </main>
    {toast && <div className="toast" role="status"><HardDrive size={13} style={{ verticalAlign: 'middle', marginRight: 7 }} />{toast}</div>}
  </div>;
}

function Router() {
  return <ErrorBoundary resetKey="home"><Home /></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><Router /><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;