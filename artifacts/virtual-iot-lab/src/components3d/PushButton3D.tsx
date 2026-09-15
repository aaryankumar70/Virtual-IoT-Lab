import { Pin3D } from './Pin3D';
import { getPinDefinition3D } from '../lib/component-registry';
import type { Component3DProps } from './types';

export function PushButton3D({ component, selected, wireStart, onSelect, onPinSelect }: Component3DProps) {
  return (
    <group onClick={(event) => { event.stopPropagation(); onSelect(event.shiftKey || event.metaKey || event.ctrlKey); }}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[2.2, 0.42, 1.6]} />
        <meshStandardMaterial color="#aec1bf" />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.45, 20]} />
        <meshStandardMaterial color="#d5dfdc" />
      </mesh>
      {['1', '2'].map((id) => {
        const definition = getPinDefinition3D(component.type, id);
        return <Pin3D key={id} position={definition.position} type={definition.type} active={wireStart?.componentId === component.id && wireStart.pin === id} onSelect={() => onPinSelect(id)} />;
      })}
      {selected && <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[2.5, 0.04, 1.9]} />
        <meshBasicMaterial color="#e3a62f" wireframe transparent opacity={0.7} />
      </mesh>}
    </group>
  );
}