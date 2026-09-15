import type { ComponentKind, LabComponent } from './lab-types';

export type Pin3DType = 'signal' | 'power';
export interface PinDefinition3D {
  id: string;
  type: Pin3DType;
  position: [number, number, number];
}

export interface ComponentDefinition {
  type: string;
  label: string;
  short: string;
  kind: ComponentKind;
  description: string;
  pins: string[];
  size: { width: number; height: number };
  pinOffsets: Record<string, { x: number; y: number }>;
  defaults: Record<string, string>;
}

export const COMPONENT_REGISTRY: ComponentDefinition[] = [
  {
    type: 'arduino-uno',
    label: 'Arduino Uno R3',
    short: 'MCU board',
    kind: 'board',
    description: 'ATmega328P · 16 MHz',
    pins: ['D13', 'GND', '5V'],
    size: { width: 192, height: 94 },
    pinOffsets: { D13: { x: 190, y: 8 }, GND: { x: 130, y: 95 }, '5V': { x: 145, y: 95 } },
    defaults: { board: 'Arduino Uno R3', port: 'Virtual USB' },
  },
  {
    type: 'breadboard',
    label: 'Half-size Breadboard',
    short: '830 tie points',
    kind: 'basic',
    description: 'Solderless prototyping',
    pins: ['rail+', 'rail-', 'row-a', 'row-b'],
    size: { width: 220, height: 108 },
    pinOffsets: { 'rail+': { x: 12, y: 18 }, 'rail-': { x: 12, y: 90 }, 'row-a': { x: 110, y: 18 }, 'row-b': { x: 110, y: 90 } },
    defaults: { rows: '30', rails: '2' },
  },
  {
    type: 'resistor',
    label: 'Resistor',
    short: 'Passive',
    kind: 'basic',
    description: 'Current limiting',
    pins: ['1', '2'],
    size: { width: 74, height: 32 },
    pinOffsets: { '1': { x: 0, y: 16 }, '2': { x: 74, y: 16 } },
    defaults: { resistance: '220 Ω', tolerance: '5%' },
  },
  {
    type: 'led',
    label: 'LED · 5mm',
    short: 'Actuator',
    kind: 'actuator',
    description: 'Red indicator diode',
    pins: ['A', 'K'],
    size: { width: 52, height: 57 },
    pinOffsets: { A: { x: 48, y: 20 }, K: { x: 6, y: 20 } },
    defaults: { color: 'Red', forwardVoltage: '2.0 V' },
  },
  {
    type: 'pushbutton',
    label: 'Push Button',
    short: 'Input',
    kind: 'sensor',
    description: 'Momentary switch',
    pins: ['1', '2'],
    size: { width: 68, height: 50 },
    pinOffsets: { '1': { x: 8, y: 25 }, '2': { x: 60, y: 25 } },
    defaults: { state: 'Open' },
  },
  {
    type: 'potentiometer',
    label: 'Potentiometer',
    short: 'Analog input',
    kind: 'sensor',
    description: '10 kΩ variable',
    pins: ['VCC', 'SIG', 'GND'],
    size: { width: 68, height: 50 },
    pinOffsets: { VCC: { x: 8, y: 25 }, SIG: { x: 34, y: 8 }, GND: { x: 60, y: 25 } },
    defaults: { resistance: '10 kΩ' },
  },
];

export const getDefinition = (type: string) => COMPONENT_REGISTRY.find((item) => item.type === type);

export const makeComponent = (type: string, x: number, y: number, sequence: number): LabComponent => {
  const definition = getDefinition(type) ?? COMPONENT_REGISTRY[0];
  return { id: `${type}-${sequence}`, type, name: definition.label, kind: definition.kind, x, y, z: 0, rotation: 0, locked: false, properties: { ...definition.defaults } };
};

export const getComponentSize = (type: string) => getDefinition(type)?.size ?? { width: 80, height: 40 };

export const getPinOffset = (type: string, pin: string) => getDefinition(type)?.pinOffsets[pin] ?? { x: 20, y: 20 };

export const getPinWorldPosition = (component: LabComponent, pin: string) => {
  const size = getComponentSize(component.type);
  const offset = getPinOffset(component.type, pin);
  const center = { x: size.width / 2, y: size.height / 2 };
  const radians = (component.rotation * Math.PI) / 180;
  const localX = offset.x - center.x;
  const localY = offset.y - center.y;
  return {
    x: component.x + center.x + localX * Math.cos(radians) - localY * Math.sin(radians),
    y: component.y + center.y + localX * Math.sin(radians) + localY * Math.cos(radians),
  };
};

const WORLD_UNIT_PX = 24;

export const getPinDefinition3D = (type: string, pin: string): PinDefinition3D => {
  const definition = getDefinition(type);
  const size = getComponentSize(type);
  const offset = getPinOffset(type, pin);
  return {
    id: pin,
    type: pin === 'GND' || pin.startsWith('rail') ? 'power' : 'signal',
    position: [
      (offset.x - size.width / 2) / WORLD_UNIT_PX,
      0.22,
      (offset.y - size.height / 2) / WORLD_UNIT_PX,
    ],
  };
};

export const getComponentWorldPosition = (component: LabComponent): [number, number, number] => {
  const size = getComponentSize(component.type);
  return [
    component.x / WORLD_UNIT_PX + size.width / (WORLD_UNIT_PX * 2),
    component.z / WORLD_UNIT_PX,
    component.y / WORLD_UNIT_PX + size.height / (WORLD_UNIT_PX * 2),
  ];
};

export const getPinWorldPosition3D = (component: LabComponent, pin: string): [number, number, number] => {
  const [originX, originY, originZ] = getComponentWorldPosition(component);
  const [localX, localY, localZ] = getPinDefinition3D(component.type, pin).position;
  const radians = (component.rotation * Math.PI) / 180;
  return [
    originX + localX * Math.cos(radians) - localZ * Math.sin(radians),
    originY + localY,
    originZ + localX * Math.sin(radians) + localZ * Math.cos(radians),
  ];
};