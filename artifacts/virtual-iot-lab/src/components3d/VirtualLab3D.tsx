import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Grid, OrbitControls, TransformControls } from '@react-three/drei';
import type { Group } from 'three';
import { getComponentWorldPosition, getComponentSize, getPinWorldPosition3D } from '../lib/component-registry';
import type { LabComponent, Project } from '../lib/lab-types';
import { ArduinoUno3D } from './ArduinoUno3D';
import { Breadboard3D } from './Breadboard3D';
import { LED3D } from './LED3D';
import { Potentiometer3D } from './Potentiometer3D';
import { PushButton3D } from './PushButton3D';
import { Resistor3D } from './Resistor3D';
import { Wire3D } from './Wire3D';
import type { Component3DProps, PinTarget } from './types';

export type WorkspaceMode = 'select' | 'move' | 'rotate' | 'wire';
const WORLD_UNIT_PX = 24;

function CameraSetup() {
  const { camera } = useThree();
  useMemo(() => {
    camera.lookAt(5, 0, 4);
  }, [camera]);
  return null;
}

function ComponentVisual(props: Component3DProps) {
  if (props.component.type === 'arduino-uno') return <ArduinoUno3D {...props} />;
  if (props.component.type === 'breadboard') return <Breadboard3D {...props} />;
  if (props.component.type === 'led') return <LED3D {...props} />;
  if (props.component.type === 'resistor') return <Resistor3D {...props} />;
  if (props.component.type === 'pushbutton') return <PushButton3D {...props} />;
  return <Potentiometer3D {...props} />;
}

function ComponentObject(props: Component3DProps) {
  const groupRef = useRef<Group>(null);
  const position = getComponentWorldPosition(props.component);
  const isTransforming = props.selected && !props.component.locked && (props.mode === 'move' || props.mode === 'rotate');
  const handleTransform = () => {
    const group = groupRef.current;
    if (!group) return;
    const size = getComponentSize(props.component.type);
    props.onTransform(
      group.position.x * WORLD_UNIT_PX - size.width / 2,
      group.position.z * WORLD_UNIT_PX - size.height / 2,
      ((group.rotation.y * 180) / Math.PI + 360) % 360,
    );
  };

  const object = (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, (props.component.rotation * Math.PI) / 180, 0]}
      onClick={(event) => {
        event.stopPropagation();
        props.onSelect(event.shiftKey || event.metaKey || event.ctrlKey);
      }}
    >
      <ComponentVisual {...props} />
    </group>
  );

  if (!isTransforming) return object;
  return (
    <TransformControls
      mode={props.mode === 'rotate' ? 'rotate' : 'translate'}
      showY={false}
      onMouseDown={props.onBeginHistory}
      onMouseUp={props.onEndHistory}
      onObjectChange={handleTransform}
      onClick={(event) => event.stopPropagation()}
    >
      {object}
    </TransformControls>
  );
}

function Scene({
  project,
  selectedIds,
  selectedWireId,
  ledOn,
  mode,
  snapToGrid,
  snapStep,
  wireStart,
  onSelect,
  onSelectWire,
  onBeginHistory,
  onEndHistory,
  onTransform,
  onPinSelect,
  onPointerPosition,
}: {
  project: Project;
  selectedIds: string[];
  selectedWireId: string | null;
  ledOn: boolean;
  mode: WorkspaceMode;
  snapToGrid: boolean;
  snapStep: number;
  wireStart: PinTarget | null;
  onSelect: (id: string | null, additive?: boolean) => void;
  onSelectWire: (id: string) => void;
  onBeginHistory: () => void;
  onEndHistory: () => void;
  onTransform: (id: string, x: number, y: number, rotation: number) => void;
  onPinSelect: (componentId: string, pin: string) => void;
  onPointerPosition: (point: [number, number, number]) => void;
}) {
  const source = wireStart ? project.components.find((item) => item.id === wireStart.componentId) : undefined;
  const sourcePosition = source && wireStart ? getPinWorldPosition3D(source, wireStart.pin) : null;
  const [pointerTarget, setPointerTarget] = useState<[number, number, number]>([5, 0.3, 4]);
  const snap = (value: number) => snapToGrid ? Math.round(value / (snapStep / WORLD_UNIT_PX)) * (snapStep / WORLD_UNIT_PX) : value;
  const handlePointerMove = (event: { point: { x: number; y: number; z: number } }) => {
    const point: [number, number, number] = [snap(event.point.x), 0.3, snap(event.point.z)];
    setPointerTarget(point);
    onPointerPosition(point);
  };
  const renderComponent = (component: LabComponent) => (
    <ComponentObject
      key={component.id}
      component={component}
      selected={selectedIds.includes(component.id)}
      ledOn={ledOn}
      mode={mode}
      wireStart={wireStart}
      onSelect={(additive) => onSelect(component.id, additive)}
      onPinSelect={(pin) => onPinSelect(component.id, pin)}
      onBeginHistory={onBeginHistory}
      onEndHistory={onEndHistory}
      onTransform={(x, y, rotation) => onTransform(component.id, x, y, rotation)}
    />
  );
  return (
    <>
      <ambientLight intensity={1.25} />
      <directionalLight position={[5, 10, 4]} intensity={2.2} castShadow />
      <directionalLight position={[-4, 6, -3]} intensity={0.65} color="#b4dfe0" />
      <Grid args={[100, 100]} position={[5, -0.02, 4]} cellSize={1} cellThickness={0.55} cellColor="#c4d5d4" sectionSize={6} sectionThickness={0.9} sectionColor="#90aaa9" fadeDistance={48} infiniteGrid />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[5, -0.08, 4]}
        onPointerMove={handlePointerMove}
        onClick={(event) => {
          event.stopPropagation();
          if (!wireStart) onSelect(null);
        }}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {project.wires.map((wire) => {
        const startComponent = project.components.find((item) => item.id === wire.from.componentId);
        const endComponent = project.components.find((item) => item.id === wire.to.componentId);
        if (!startComponent || !endComponent) return null;
        return (
          <Wire3D
            key={wire.id}
            wire={wire}
            start={getPinWorldPosition3D(startComponent, wire.from.pin)}
            end={getPinWorldPosition3D(endComponent, wire.to.pin)}
            active={ledOn && wire.signal === 'signal'}
            selected={selectedWireId === wire.id}
            onSelect={() => onSelectWire(wire.id)}
          />
        );
      })}
      {sourcePosition && wireStart && <Wire3D wire={{ id: 'preview', from: wireStart, to: wireStart, signal: 'signal' }} start={sourcePosition} end={pointerTarget} active={false} selected={false} onSelect={() => undefined} />}
      {project.components.map(renderComponent)}
    </>
  );
}

export function VirtualLab3D(props: {
  project: Project;
  selectedIds: string[];
  selectedWireId: string | null;
  ledOn: boolean;
  mode: WorkspaceMode;
  snapToGrid: boolean;
  snapStep: number;
  wireStart: PinTarget | null;
  onSelect: (id: string | null, additive?: boolean) => void;
  onSelectWire: (id: string) => void;
  onBeginHistory: () => void;
  onEndHistory: () => void;
  onTransform: (id: string, x: number, y: number, rotation: number) => void;
  onPinSelect: (componentId: string, pin: string) => void;
}) {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    setWebglAvailable(Boolean(context));
  }, []);

  if (webglAvailable === null) {
    return <div className="workspace-3d-status" role="status">INITIALIZING 3D WORKSPACE…</div>;
  }

  if (!webglAvailable) {
    return (
      <div className="workspace-3d-status unavailable" role="status" data-testid="3d-unavailable">
        <strong>3D renderer unavailable</strong>
        <span>This browser preview does not expose WebGL. Open the lab in a WebGL-enabled browser to use the interactive 3D workspace.</span>
        <small>Project state, code, pins, wires, and simulation controls remain available.</small>
      </div>
    );
  }

  return (
    <Canvas
      shadows
      camera={{ position: [11, 10, 13], fov: 42 }}
      onPointerMissed={() => props.onSelect(null)}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.6]}
    >
      <CameraSetup />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.15} minDistance={5} maxDistance={28} target={[5, 0, 4]} />
      <Scene {...props} onPointerPosition={() => undefined} />
    </Canvas>
  );
}