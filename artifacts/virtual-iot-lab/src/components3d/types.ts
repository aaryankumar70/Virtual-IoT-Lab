import type { LabComponent, Wire } from '../lib/lab-types';
import type { WorkspaceMode } from './VirtualLab3D';

export type PinTarget = { componentId: string; pin: string };

export interface Component3DProps {
  component: LabComponent;
  selected: boolean;
  ledOn: boolean;
  mode: WorkspaceMode;
  wireStart: PinTarget | null;
  onSelect: (additive: boolean) => void;
  onPinSelect: (pin: string) => void;
  onTransform: (x: number, y: number, rotation: number) => void;
  onBeginHistory: () => void;
  onEndHistory: () => void;
}

export interface Wire3DProps {
  wire: Wire;
  start: [number, number, number];
  end: [number, number, number];
  active: boolean;
  selected: boolean;
  onSelect: () => void;
}