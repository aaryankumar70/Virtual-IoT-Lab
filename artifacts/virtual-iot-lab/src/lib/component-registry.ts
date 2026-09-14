import type { ComponentKind, LabComponent } from './lab-types';

export interface ComponentDefinition {
  type: string;
  label: string;
  short: string;
  kind: ComponentKind;
  description: string;
  pins: string[];
  defaults: Record<string, string>;
}

export const COMPONENT_REGISTRY: ComponentDefinition[] = [
  { type: 'arduino-uno', label: 'Arduino Uno R3', short: 'MCU board', kind: 'board', description: 'ATmega328P · 16 MHz', pins: ['D13', 'GND', '5V'], defaults: { board: 'Arduino Uno R3', port: 'Virtual USB' } },
  { type: 'breadboard', label: 'Half-size Breadboard', short: '830 tie points', kind: 'basic', description: 'Solderless prototyping', pins: ['rail+', 'rail-', 'row-a', 'row-b'], defaults: { rows: '30', rails: '2' } },
  { type: 'resistor', label: 'Resistor', short: 'Passive', kind: 'basic', description: 'Current limiting', pins: ['1', '2'], defaults: { resistance: '220 Ω', tolerance: '5%' } },
  { type: 'led', label: 'LED · 5mm', short: 'Actuator', kind: 'actuator', description: 'Red indicator diode', pins: ['A', 'K'], defaults: { color: 'Red', forwardVoltage: '2.0 V' } },
  { type: 'pushbutton', label: 'Push Button', short: 'Input', kind: 'sensor', description: 'Momentary switch', pins: ['1', '2'], defaults: { state: 'Open' } },
  { type: 'potentiometer', label: 'Potentiometer', short: 'Analog input', kind: 'sensor', description: '10 kΩ variable', pins: ['VCC', 'SIG', 'GND'], defaults: { resistance: '10 kΩ' } },
];

export const getDefinition = (type: string) => COMPONENT_REGISTRY.find((item) => item.type === type);

export const makeComponent = (type: string, x: number, y: number, sequence: number): LabComponent => {
  const definition = getDefinition(type) ?? COMPONENT_REGISTRY[0];
  return { id: `${type}-${sequence}`, type, name: definition.label, kind: definition.kind, x, y, rotation: 0, properties: { ...definition.defaults } };
};