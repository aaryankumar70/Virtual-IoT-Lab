import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/error-boundary';
import {
  Box,
  Check,
  CircleDot,
  Code2,
  Copy,
  Cpu,
  FilePlus2,
  FolderOpen,
  GripVertical,
  HardDrive,
  Lightbulb,
  Lock,
  Minus,
  MousePointer2,
  Move3d,
  PanelTop,
  Play,
  Plus,
  Redo2,
  Rotate3d,
  RotateCw,
  Save,
  ScanLine,
  Settings2,
  Square,
  Trash2,
  Unlock,
  Waves,
} from 'lucide-react';
import { COMPONENT_REGISTRY, getComponentSize, getDefinition, getPinOffset, getPinWorldPosition, makeComponent } from './lib/component-registry';
import { DEFAULT_CODE, createInitialRuntime, resetRuntime, tickRuntime, validateSketch } from './lib/runtime';
import { loadProject, saveProject } from './lib/project-storage';
import type { LabComponent, Project, SerialLine, Wire } from './lib/lab-types';
import { VirtualLab3D } from './components3d/VirtualLab3D';
import './index.css';

const queryClient = new QueryClient();
type WorkspaceMode = 'select' | 'move' | 'rotate' | 'wire';
type MoveTarget = { id: string; x: number; y: number };

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

function CommandBar({ projectName, running, dirty, canUndo, canRedo, onNew, onSave, onLoad, onUndo, onRedo, onRun, onStop, onReset }: {
  projectName: string;
  running: boolean;
  dirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onNew: () => void;
  onSave: () => void;
  onLoad: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
}) {
  return <header className="command-bar">
    <div className="brand-mark">VIL</div>
    <div className="project-title"><strong>{projectName}</strong><span>{dirty ? 'UNSAVED CHANGES' : 'LOCAL PROJECT · v1.0'}</span></div>
    <div className="cmd-group">
      <button className="cmd-btn" onClick={onNew} data-testid="button-new"><FilePlus2 size={14} /><span>New</span></button>
      <button className="cmd-btn" onClick={onLoad} data-testid="button-load"><FolderOpen size={14} /><span>Load</span></button>
      <button className="cmd-btn" onClick={onSave} data-testid="button-save"><Save size={14} /><span>Save</span></button>
      <button className="cmd-btn icon-only" disabled={!canUndo} onClick={onUndo} title="Undo (Ctrl/Cmd+Z)" data-testid="button-undo"><Redo2 size={14} className="flip-x" /></button>
      <button className="cmd-btn icon-only" disabled={!canRedo} onClick={onRedo} title="Redo (Ctrl/Cmd+Shift+Z)" data-testid="button-redo"><Redo2 size={14} /></button>
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
    <div className="panel-header"><span>Component palette</span><span className="subtle">{COMPONENT_REGISTRY.length.toString().padStart(2, '0')} parts</span></div>
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

function NodeShape({ component, selected, ledOn, mode, wireStart, onSelect, onDragStart, onRotate, onDelete, onPinSelect }: {
  component: LabComponent;
  selected: boolean;
  ledOn: boolean;
  mode: WorkspaceMode;
  wireStart: { componentId: string; pin: string } | null;
  onSelect: (additive: boolean) => void;
  onDragStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  onRotate: () => void;
  onDelete: () => void;
  onPinSelect: (pin: string) => void;
}) {
  const def = getDefinition(component.type);
  const size = getComponentSize(component.type);
  const shapeClass = component.type === 'arduino-uno' ? 'uno-board' : component.type === 'breadboard' ? 'breadboard' : component.type === 'resistor' ? 'resistor-node' : component.type === 'led' ? 'led-node' : component.type === 'pushbutton' ? 'button-node' : 'pot-node';
  return <div
    className={`component-node ${selected ? 'selected' : ''} ${component.locked ? 'locked' : ''}`}
    style={{ left: component.x, top: component.y, width: size.width, height: size.height, transform: `rotate(${component.rotation}deg)` }}
    onPointerDown={(event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      onSelect(event.metaKey || event.ctrlKey);
      if (mode === 'rotate' && !component.locked) onRotate();
      else if (mode !== 'wire' && !component.locked) onDragStart(event);
    }}
    data-testid={`component-${component.id}`}
  >
    <div className="node-label">{component.name}</div>
    <div className={`${shapeClass} ${component.type === 'led' && ledOn ? 'on' : ''}`}>
      {component.type === 'arduino-uno' && <><div className="usb" /><div className="chip" /><div className="pin-strip">{Array.from({ length: 8 }).map((_, i) => <i className="uno-pin" key={i} />)}</div><div className="pin-strip bottom">{Array.from({ length: 7 }).map((_, i) => <i className="uno-pin" key={i} />)}</div></>}
      {component.type === 'breadboard' && <div className="holes" />}
      {component.type === 'resistor' && <><i className="lead left" /><div className="resistor-body" /><i className="lead right" /></>}
      {component.type === 'led' && <div className="led-bulb" />}
      {component.type === 'pushbutton' && <div className="switch-cap" />}
      {component.type === 'potentiometer' && <div className="pot-knob" />}
    </div>
    {selected && <><div className="selection-box" /><div className="node-controls">
      <button onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onRotate(); }} title="Rotate 90°"><RotateCw size={11} /></button>
      <button onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onDelete(); }} title="Delete"><Trash2 size={11} /></button>
    </div></>}
    {component.locked && <span className="lock-badge"><Lock size={10} /></span>}
    {def?.pins.map((pin) => {
      const offset = getPinOffset(component.type, pin);
      const active = wireStart?.componentId === component.id && wireStart.pin === pin;
      return <button
        key={pin}
        className={`pin-dot ${active ? 'active' : ''}`}
        style={{ left: offset.x - 4, top: offset.y - 4 }}
        title={`${component.name} · ${pin}`}
        onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); onPinSelect(pin); }}
      />;
    })}
  </div>;
}

function LegacyWorkspace({ project, selectedIds, selectedWireId, ledOn, mode, snapToGrid, snapStep, wireStart, onSelect, onSelectWire, onBeginHistory, onEndHistory, onMove, onRotate, onDelete, onPinSelect, onCreateWire, onModeChange, onSnapChange, onSnapStepChange }: {
  project: Project;
  selectedIds: string[];
  selectedWireId: string | null;
  ledOn: boolean;
  mode: WorkspaceMode;
  snapToGrid: boolean;
  snapStep: number;
  wireStart: { componentId: string; pin: string } | null;
  onSelect: (id: string | null, additive?: boolean) => void;
  onSelectWire: (id: string) => void;
  onBeginHistory: () => void;
  onEndHistory: () => void;
  onMove: (targets: MoveTarget[]) => void;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onPinSelect: (componentId: string, pin: string) => void;
  onCreateWire: (from: { componentId: string; pin: string }, to: { componentId: string; pin: string }) => void;
  onModeChange: (mode: WorkspaceMode) => void;
  onSnapChange: (enabled: boolean) => void;
  onSnapStepChange: (step: number) => void;
}) {
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; origins: Array<{ component: LabComponent; x: number; y: number }> } | null>(null);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const targets = drag.origins.map(({ component, x, y }) => ({
        id: component.id,
        x: snapToGrid ? Math.max(12, Math.round((x + dx) / snapStep) * snapStep) : Math.max(12, x + dx),
        y: snapToGrid ? Math.max(30, Math.round((y + dy) / snapStep) * snapStep) : Math.max(30, y + dy),
      }));
      onMove(targets);
    };
    const up = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      onEndHistory();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [onEndHistory, onMove, snapStep, snapToGrid]);

  const startDrag = (id: string, event: React.PointerEvent<HTMLDivElement>) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];
    const origins = project.components.filter((component) => ids.includes(component.id) && !component.locked).map((component) => ({ component, x: component.x, y: component.y }));
    if (!origins.length) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origins };
    onBeginHistory();
  };

  const pointFor = (id: string, pin: string) => {
    const component = project.components.find((item) => item.id === id);
    return component ? getPinWorldPosition(component, pin) : { x: 0, y: 0 };
  };

  return <section className="workspace-panel">
    <div className="workspace-topline">
      <div className="workspace-toolbar" onClick={(event) => event.stopPropagation()}>
        {([
          ['select', <MousePointer2 size={12} />, 'Select'],
          ['move', <Move3d size={12} />, 'Move'],
          ['rotate', <Rotate3d size={12} />, 'Rotate'],
          ['wire', <CircleDot size={12} />, 'Wire'],
        ] as const).map(([value, icon, label]) => <button key={value} className={`mode-btn ${mode === value ? 'active' : ''}`} onClick={() => onModeChange(value)} title={`${label} mode`}>{icon}<span>{label}</span></button>)}
        <span className="toolbar-divider" />
        <button className={`mode-btn snap-btn ${snapToGrid ? 'active' : ''}`} onClick={() => onSnapChange(!snapToGrid)} title="Toggle grid snapping"><ScanLine size={12} /><span>Snap</span></button>
        <select className="snap-select" value={snapStep} onChange={(event) => onSnapStepChange(Number(event.target.value))} aria-label="Snap spacing">
          <option value="6">0.25u</option><option value="12">0.5u</option><option value="24">1u</option>
        </select>
      </div>
      <span className="coord-readout">TOP VIEW · 1u = 24px · GRID {snapStep}</span>
    </div>
    <div className="workspace-canvas" onClick={() => onSelect(null)}>
      <svg className="wire-layer">
        {project.wires.map((wire) => {
          const start = pointFor(wire.from.componentId, wire.from.pin);
          const end = pointFor(wire.to.componentId, wire.to.pin);
          const mid = (start.x + end.x) / 2;
          const curve = `M ${start.x} ${start.y} C ${mid} ${start.y}, ${mid} ${end.y}, ${end.x} ${end.y}`;
          return <g key={wire.id} onClick={(event) => { event.stopPropagation(); onSelectWire(wire.id); }}>
            <path className="wire-hit" d={curve} />
            <path className={`wire ${wire.signal} ${ledOn && wire.signal === 'signal' ? 'active' : ''} ${selectedWireId === wire.id ? 'selected' : ''}`} d={curve} />
          </g>;
        })}
      </svg>
      {project.components.map((component) => <NodeShape
        key={component.id}
        component={component}
        selected={selectedIds.includes(component.id)}
        ledOn={ledOn}
        mode={mode}
        wireStart={wireStart}
        onSelect={(additive) => onSelect(component.id, additive)}
        onDragStart={(event) => startDrag(component.id, event)}
        onRotate={() => onRotate(component.id)}
        onDelete={() => onDelete(component.id)}
        onPinSelect={(pin) => onPinSelect(component.id, pin)}
      />)}
      {wireStart && <div className="wire-instruction"><CircleDot size={12} /> Select a destination pin</div>}
      <div className="minimap" title="Workspace overview"><div className="mini-board" /><div className="mini-bread" /><div className="mini-led" /></div>
    </div>
  </section>;
}

function Workspace({ project, selectedIds, selectedWireId, ledOn, mode, snapToGrid, snapStep, wireStart, onSelect, onSelectWire, onBeginHistory, onEndHistory, onTransform, onPinSelect, onModeChange, onSnapChange, onSnapStepChange }: {
  project: Project;
  selectedIds: string[];
  selectedWireId: string | null;
  ledOn: boolean;
  mode: WorkspaceMode;
  snapToGrid: boolean;
  snapStep: number;
  wireStart: { componentId: string; pin: string } | null;
  onSelect: (id: string | null, additive?: boolean) => void;
  onSelectWire: (id: string) => void;
  onBeginHistory: () => void;
  onEndHistory: () => void;
  onTransform: (id: string, x: number, y: number, rotation: number) => void;
  onPinSelect: (componentId: string, pin: string) => void;
  onModeChange: (mode: WorkspaceMode) => void;
  onSnapChange: (enabled: boolean) => void;
  onSnapStepChange: (step: number) => void;
}) {
  return <section className="workspace-panel workspace-3d-panel">
    <div className="workspace-topline">
      <div className="workspace-toolbar" onClick={(event) => event.stopPropagation()}>
        {([
          ['select', <MousePointer2 size={12} />, 'Select'],
          ['move', <Move3d size={12} />, 'Move'],
          ['rotate', <Rotate3d size={12} />, 'Rotate'],
          ['wire', <CircleDot size={12} />, 'Wire'],
        ] as const).map(([value, icon, label]) => <button key={value} className={`mode-btn ${mode === value ? 'active' : ''}`} onClick={() => onModeChange(value)} title={`${label} mode`}>{icon}<span>{label}</span></button>)}
        <span className="toolbar-divider" />
        <button className={`mode-btn snap-btn ${snapToGrid ? 'active' : ''}`} onClick={() => onSnapChange(!snapToGrid)} title="Toggle grid snapping"><ScanLine size={12} /><span>Snap</span></button>
        <select className="snap-select" value={snapStep} onChange={(event) => onSnapStepChange(Number(event.target.value))} aria-label="Snap spacing">
          <option value="6">0.25u</option><option value="12">0.5u</option><option value="24">1u</option>
        </select>
      </div>
      <span className="coord-readout">3D WORKSPACE · X/Z PLANE · 1u = 24px · GRID {snapStep}</span>
    </div>
    <div className="workspace-canvas workspace-3d-canvas">
      <VirtualLab3D
        project={project}
        selectedIds={selectedIds}
        selectedWireId={selectedWireId}
        ledOn={ledOn}
        mode={mode}
        snapToGrid={snapToGrid}
        snapStep={snapStep}
        wireStart={wireStart}
        onSelect={onSelect}
        onSelectWire={onSelectWire}
        onBeginHistory={onBeginHistory}
        onEndHistory={onEndHistory}
        onTransform={onTransform}
        onPinSelect={onPinSelect}
      />
      {wireStart && <div className="wire-instruction"><CircleDot size={12} /> Select a destination pin</div>}
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

function Inspector({ component, multiCount, onChange, onToggleLock }: { component?: LabComponent; multiCount: number; onChange: (id: string, field: string, value: string) => void; onToggleLock: (id: string) => void }) {
  if (!component && multiCount < 2) return <div className="inspector"><div className="panel-header"><span>Property inspector</span></div><div className="empty-inspector">Select a component in the workspace to inspect its pins and properties.</div></div>;
  if (multiCount > 1) return <div className="inspector"><div className="panel-header"><span>Property inspector</span><span className="subtle">{multiCount} SELECTED</span></div><div className="empty-inspector"><strong>{multiCount} components selected</strong><br />Drag to move the group. Ctrl/Cmd+D duplicates without copying wires.</div></div>;
  if (!component) return null;
  const definition = getDefinition(component.type);
  return <div className="inspector"><div className="panel-header"><span>Property inspector</span><span className="subtle">LIVE</span></div><div className="inspector-body"><div className="inspector-title"><span>{component.name}</span><span className="inspector-type">{component.type}</span></div>
    <div className="inspector-section-label">TRANSFORM · 1u = 24px</div>
    {([['x', component.x], ['y', component.y], ['z', component.z], ['rotation', component.rotation]] as const).map(([key, value]) => <label className="field-row" key={key}><span>{key}</span><input type="number" step="1" value={value} onChange={(event) => onChange(component.id, key, event.target.value)} data-testid={`input-transform-${key}`} /></label>)}
    <button className={`lock-toggle ${component.locked ? 'locked' : ''}`} onClick={() => onToggleLock(component.id)}>{component.locked ? <Lock size={12} /> : <Unlock size={12} />}{component.locked ? 'Unlock object' : 'Lock object'}</button>
    <div className="inspector-section-label">PROPERTIES</div>
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
  const [selectedIds, setSelectedIds] = useState<string[]>(['led-1']);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [wireStart, setWireStart] = useState<{ componentId: string; pin: string } | null>(null);
  const [mode, setMode] = useState<WorkspaceMode>('select');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapStep, setSnapStep] = useState(12);
  const [runtime, setRuntime] = useState(createInitialRuntime);
  const [toast, setToast] = useState('');
  const [dirty, setDirty] = useState(false);
  const [past, setPast] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);
  const sequence = useRef(10);
  const dragHistoryRef = useRef(false);
  const selected = useMemo(() => selectedIds.length === 1 ? project.components.find((item) => item.id === selectedIds[0]) : undefined, [project.components, selectedIds]);

  useEffect(() => {
    if (!runtime.running) return;
    const timer = window.setInterval(() => setRuntime((previous) => tickRuntime(project.code, previous)), 250);
    return () => window.clearInterval(timer);
  }, [runtime.running, project.code]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2200); return () => window.clearTimeout(timer); }, [toast]);

  const notify = useCallback((message: string) => setToast(message), []);
  const replaceProject = (next: Project, message: string) => { setProject(next); setRuntime(createInitialRuntime()); setSelectedIds(next.components[0] ? [next.components[0].id] : []); setSelectedWireId(null); setWireStart(null); setPast([]); setFuture([]); setDirty(false); notify(message); };
  const commitProject = useCallback((recipe: (current: Project) => Project) => {
    setProject((current) => {
      const next = recipe(current);
      if (next !== current) setPast((history) => [...history.slice(-39), current]);
      return next;
    });
    setFuture([]);
    setDirty(true);
  }, []);
  const updateProjectLive = useCallback((recipe: (current: Project) => Project) => setProject(recipe), []);

  const addComponent = (type: string) => {
    const def = getDefinition(type);
    const component = makeComponent(type, 100 + (sequence.current % 4) * 55, 120 + (sequence.current % 5) * 44, sequence.current++);
    commitProject((current) => ({ ...current, components: [...current.components, component] }));
    setSelectedIds([component.id]); setSelectedWireId(null); notify(`${def?.label ?? 'Component'} added to workspace`);
  };
  const onSave = () => { saveProject(project); setDirty(false); notify('Project saved to local storage'); };
  const onLoad = () => { const loaded = loadProject(); loaded ? replaceProject(loaded, 'Project loaded from local storage') : notify('No saved project found'); };
  const onNew = () => { if (window.confirm('Start a new blank project? Unsaved changes will be discarded.')) replaceProject({ ...freshProject(), name: 'Untitled Circuit', components: [], wires: [] }, 'New project ready'); };
  const onUndo = () => {
    const previous = past[past.length - 1];
    if (!previous) return;
    setPast((history) => history.slice(0, -1)); setFuture((history) => [project, ...history]); setProject(previous); setSelectedIds([]); setSelectedWireId(null); setDirty(true); notify('Undo');
  };
  const onRedo = () => {
    const next = future[0];
    if (!next) return;
    setFuture((history) => history.slice(1)); setPast((history) => [...history, project]); setProject(next); setSelectedIds([]); setSelectedWireId(null); setDirty(true); notify('Redo');
  };
  const onRun = () => { const error = validateSketch(project.code); if (error) { setRuntime((previous) => ({ ...previous, error, output: [...previous.output, { id: `${Date.now()}`, time: '000.000s', message: `ERROR: ${error}`, tone: 'error' }] })); notify(error); return; } setRuntime((previous) => ({ ...previous, running: true, error: undefined, output: [...previous.output, { id: `${Date.now()}`, time: `${(previous.elapsed / 1000).toFixed(3)}s`, message: 'setup() complete · loop() started', tone: 'system' }] })); notify('Simulation running'); };
  const onStop = () => { setRuntime((previous) => ({ ...previous, running: false, output: [...previous.output, { id: `${Date.now()}`, time: `${(previous.elapsed / 1000).toFixed(3)}s`, message: 'Simulation stopped by user', tone: 'system' }] })); notify('Simulation stopped'); };
  const onReset = () => { setRuntime(resetRuntime(project.code)); notify('Runtime reset'); };
  const onSelect = (id: string | null, additive = false) => {
    if (!id) { setSelectedIds([]); setSelectedWireId(null); setWireStart(null); return; }
    setSelectedWireId(null);
    setSelectedIds((current) => additive ? current.includes(id) ? current.filter((item) => item !== id) : [...current, id] : [id]);
  };
  const onSelectWire = (id: string) => { setSelectedWireId(id); setSelectedIds([]); setWireStart(null); };
  const onDelete = (id: string) => { commitProject((current) => ({ ...current, components: current.components.filter((item) => item.id !== id), wires: current.wires.filter((wire) => wire.from.componentId !== id && wire.to.componentId !== id) })); setSelectedIds((current) => current.filter((item) => item !== id)); notify('Component removed'); };
  const deleteSelection = useCallback(() => {
    if (selectedWireId) {
      commitProject((current) => ({ ...current, wires: current.wires.filter((wire) => wire.id !== selectedWireId) }));
      setSelectedWireId(null); notify('Wire removed'); return;
    }
    if (!selectedIds.length) return;
    commitProject((current) => ({ ...current, components: current.components.filter((item) => !selectedIds.includes(item.id)), wires: current.wires.filter((wire) => !selectedIds.includes(wire.from.componentId) && !selectedIds.includes(wire.to.componentId)) }));
    setSelectedIds([]); notify(`${selectedIds.length} component${selectedIds.length === 1 ? '' : 's'} removed`);
  }, [commitProject, notify, selectedIds, selectedWireId]);
  const onMove = (targets: MoveTarget[]) => updateProjectLive((current) => ({ ...current, components: current.components.map((item) => { const target = targets.find((entry) => entry.id === item.id); return target && !item.locked ? { ...item, x: target.x, y: target.y } : item; }) }));
  const onTransform = (id: string, x: number, y: number, rotation: number) => updateProjectLive((current) => ({ ...current, components: current.components.map((item) => item.id === id && !item.locked ? { ...item, x, y, rotation } : item) }));
  const onBeginHistory = () => { if (!dragHistoryRef.current) { setPast((history) => [...history.slice(-39), project]); setFuture([]); setDirty(true); dragHistoryRef.current = true; } };
  const onEndHistory = () => { dragHistoryRef.current = false; };
  const onRotate = (id: string) => commitProject((current) => ({ ...current, components: current.components.map((item) => item.id === id && !item.locked ? { ...item, rotation: (item.rotation + 90) % 360 } : item) }));
  const onPropertyChange = (id: string, field: string, value: string) => {
    const numericFields = new Set(['x', 'y', 'z', 'rotation']);
    commitProject((current) => ({ ...current, components: current.components.map((item) => item.id === id ? numericFields.has(field) ? { ...item, [field]: Number(value) || 0, rotation: field === 'rotation' ? ((Number(value) || 0) % 360 + 360) % 360 : item.rotation } : { ...item, properties: { ...item.properties, [field]: value } } : item) }));
  };
  const onToggleLock = (id: string) => commitProject((current) => ({ ...current, components: current.components.map((item) => item.id === id ? { ...item, locked: !item.locked } : item) }));
  const duplicateSelection = useCallback(() => {
    if (!selectedIds.length) return;
    const duplicates = project.components.filter((component) => selectedIds.includes(component.id)).map((component) => ({ ...component, id: `${component.type}-${sequence.current++}`, x: component.x + 24, y: component.y + 24, locked: false }));
    if (!duplicates.length) return;
    commitProject((current) => ({ ...current, components: [...current.components, ...duplicates] }));
    setSelectedIds(duplicates.map((component) => component.id)); setSelectedWireId(null); notify(`${duplicates.length} component${duplicates.length === 1 ? '' : 's'} duplicated without wires`);
  }, [commitProject, notify, project.components, selectedIds]);
  const onPinSelect = (componentId: string, pin: string) => {
    if (!wireStart) { setWireStart({ componentId, pin }); setMode('wire'); notify('Pin selected · choose a destination'); return; }
    if (wireStart.componentId === componentId && wireStart.pin === pin) { setWireStart(null); return; }
    onCreateWire(wireStart, { componentId, pin });
    setWireStart(null);
  };
  const onCreateWire = (from: { componentId: string; pin: string }, to: { componentId: string; pin: string }) => {
    const exists = project.wires.some((wire) => (wire.from.componentId === from.componentId && wire.from.pin === from.pin && wire.to.componentId === to.componentId && wire.to.pin === to.pin) || (wire.from.componentId === to.componentId && wire.from.pin === to.pin && wire.to.componentId === from.componentId && wire.to.pin === from.pin));
    if (exists) { notify('Connection already exists'); return; }
    const newWire: Wire = { id: `wire-${sequence.current++}`, from, to, signal: from.pin === 'GND' || to.pin === 'GND' ? 'power' : 'signal' };
    commitProject((current) => ({ ...current, wires: [...current.wires, newWire] }));
    notify('Wire connected');
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const editing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (event.key === 'Escape') { setSelectedIds([]); setSelectedWireId(null); setWireStart(null); setMode('select'); return; }
      if (editing) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? onRedo() : onUndo(); return; }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicateSelection(); return; }
      if (event.key.toLowerCase() === 'r' && selectedIds.length === 1) { event.preventDefault(); onRotate(selectedIds[0]); return; }
      if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); deleteSelection(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteSelection, duplicateSelection, onRedo, onRotate, onUndo, selectedIds]);
  const loadExample = () => replaceProject(freshProject(), 'Blink Demo loaded');

  return <div className="lab-shell">
    <CommandBar projectName={project.name} running={runtime.running} dirty={dirty} canUndo={past.length > 0} canRedo={future.length > 0} onNew={onNew} onSave={onSave} onLoad={onLoad} onUndo={onUndo} onRedo={onRedo} onRun={onRun} onStop={onStop} onReset={onReset} />
    <main className="main-grid">
      <Palette onAdd={addComponent} onExample={loadExample} />
       <Workspace project={project} selectedIds={selectedIds} selectedWireId={selectedWireId} ledOn={runtime.ledOn} mode={mode} snapToGrid={snapToGrid} snapStep={snapStep} wireStart={wireStart} onSelect={onSelect} onSelectWire={onSelectWire} onBeginHistory={onBeginHistory} onEndHistory={onEndHistory} onTransform={onTransform} onPinSelect={onPinSelect} onModeChange={setMode} onSnapChange={setSnapToGrid} onSnapStepChange={setSnapStep} />
      <aside className="right-panel"><CodeEditor code={project.code} error={runtime.error} onChange={(code) => { commitProject((current) => ({ ...current, code })); if (runtime.error) setRuntime((previous) => ({ ...previous, error: undefined })); }} /><Inspector component={selected} multiCount={selectedIds.length} onChange={onPropertyChange} onToggleLock={onToggleLock} /></aside>
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