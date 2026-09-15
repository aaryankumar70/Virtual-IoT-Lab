import { Cpu, GripVertical, Lightbulb, Plus, Settings2, Waves } from 'lucide-react';

export type PaletteItem = { label: string; description: string; icon?: 'cpu' | 'breadboard' | 'led' | 'pot' | 'settings' };
export type PaletteGroup = { label: string; items: PaletteItem[] };

const iconFor = (icon: PaletteItem['icon']) => {
  if (icon === 'cpu') return <Cpu size={15} />;
  if (icon === 'breadboard') return <GripVertical size={15} />;
  if (icon === 'led') return <Lightbulb size={15} />;
  if (icon === 'pot') return <Waves size={15} />;
  return <Settings2 size={15} />;
};

export function ComponentPalette({ groups = [
  { label: 'Boards', items: [{ label: 'Arduino Uno R3', description: 'ATmega328P · 16 MHz', icon: 'cpu' }] },
  { label: 'Basic', items: [{ label: 'Half-size Breadboard', description: 'Solderless prototyping', icon: 'breadboard' }, { label: 'Resistor', description: 'Current limiting', icon: 'settings' }] },
  { label: 'Actuators', items: [{ label: 'LED · 5mm', description: 'Red indicator diode', icon: 'led' }] },
  { label: 'Sensors', items: [{ label: 'Potentiometer', description: '10 kΩ variable', icon: 'pot' }] },
] }: { groups?: PaletteGroup[] }) {
  return (
    <aside className="vil-palette">
      <div className="vil-panel-header"><span>Component palette</span><span className="vil-subtle">{groups.reduce((count, group) => count + group.items.length, 0).toString().padStart(2, '0')} parts</span></div>
      <div className="vil-palette-list">
        {groups.map((group) => (
          <div className="vil-palette-group" key={group.label}>
            <div className="vil-palette-label">{group.label}</div>
            {group.items.map((item) => (
              <button className="vil-palette-item" type="button" key={item.label}>
                <span className="vil-palette-icon">{iconFor(item.icon)}</span>
                <span className="vil-palette-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
                <Plus size={13} className="vil-add-icon" />
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="vil-example-card"><strong>Example project</strong><span>Blink Demo · 4 parts · 3 wires</span><button type="button">Load example</button></div>
    </aside>
  );
}