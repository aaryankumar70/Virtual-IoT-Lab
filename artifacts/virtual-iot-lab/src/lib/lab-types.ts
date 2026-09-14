export type ComponentKind = 'board' | 'basic' | 'actuator' | 'sensor';
export type PinMode = 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';

export interface LabComponent {
  id: string;
  type: string;
  name: string;
  kind: ComponentKind;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, string>;
}

export interface Wire {
  id: string;
  from: { componentId: string; pin: string };
  to: { componentId: string; pin: string };
  signal: 'power' | 'signal';
}

export interface Project {
  version: 1;
  name: string;
  components: LabComponent[];
  wires: Wire[];
  code: string;
}

export interface SerialLine {
  id: string;
  time: string;
  message: string;
  tone: 'system' | 'data' | 'error';
}