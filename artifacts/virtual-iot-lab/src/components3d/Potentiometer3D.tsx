import { Pin3D } from './Pin3D';
import { getPinDefinition3D } from '../lib/component-registry';
import type { Component3DProps } from './types';

export function Potentiometer3D({ component, selected, wireStart, onSelect, onPinSelect }: Component3DProps) {
  return (
    <group onClick={(event) => { event.stopPropagation(); onSelect(event.shiftKey || event.metaKey || event.ctrlKey); }}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[2.2, 0.5, 1.6]} />
        <meshStandardMaterial color="#aec1bf" />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.68, 0.68, 0.4, 24]} />
        <meshStandardMaterial color="#d0d9d5" />
      </mesh>
      <mesh position={[0, 1.01, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.38]} />
        <meshStandardMaterial color="#507073" />
      </mesh>
      {['VCC', 'SIG', 'GND'].map((id) => {
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