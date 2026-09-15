import { Pin3D } from './Pin3D';
import { getPinDefinition3D } from '../lib/component-registry';
import type { Component3DProps } from './types';

const holes = Array.from({ length: 60 }, (_, index) => ({
  x: -3.2 + (index % 30) * 0.22,
  z: index < 30 ? -0.72 : 0.72,
}));

export function Breadboard3D({ component, selected, wireStart, onSelect, onPinSelect }: Component3DProps) {
  return (
    <group onClick={(event) => { event.stopPropagation(); onSelect(event.shiftKey || event.metaKey || event.ctrlKey); }}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.2, 0.24, 4.5]} />
        <meshStandardMaterial color="#e8d9c6" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <boxGeometry args={[0.12, 0.04, 3.85]} />
        <meshStandardMaterial color="#b9aaa0" />
      </mesh>
      <mesh position={[0, 0.275, -1.8]}>
        <boxGeometry args={[8.1, 0.045, 0.12]} />
        <meshStandardMaterial color="#cf7770" />
      </mesh>
      <mesh position={[0, 0.275, 1.8]}>
        <boxGeometry args={[8.1, 0.045, 0.12]} />
        <meshStandardMaterial color="#4e99a1" />
      </mesh>
      {holes.map((hole, index) => (
        <mesh key={index} position={[hole.x, 0.27, hole.z]}>
          <cylinderGeometry args={[0.035, 0.035, 0.035, 8]} />
          <meshStandardMaterial color="#9f8b79" />
        </mesh>
      ))}
      {['rail+', 'rail-', 'row-a', 'row-b'].map((id) => {
        const definition = getPinDefinition3D(component.type, id);
        return (
          <Pin3D
            key={id}
            position={definition.position}
            type={definition.type}
            active={wireStart?.componentId === component.id && wireStart.pin === id}
            onSelect={() => onPinSelect(id)}
          />
        );
      })}
      {selected && <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[9.5, 0.04, 4.8]} />
        <meshBasicMaterial color="#e3a62f" wireframe transparent opacity={0.65} />
      </mesh>}
    </group>
  );
}