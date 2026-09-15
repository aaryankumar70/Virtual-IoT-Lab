import { Pin3D } from './Pin3D';
import { getPinDefinition3D } from '../lib/component-registry';
import type { Component3DProps } from './types';

export function Resistor3D({ component, selected, wireStart, onSelect, onPinSelect }: Component3DProps) {
  return (
    <group onClick={(event) => { event.stopPropagation(); onSelect(event.shiftKey || event.metaKey || event.ctrlKey); }}>
      <mesh position={[0, 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 1.45, 16]} />
        <meshStandardMaterial color="#e5c5a5" roughness={0.6} />
      </mesh>
      {[-0.38, -0.1, 0.18].map((x, index) => (
        <mesh key={index} position={[x, 0.45, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.13, 0.05, 0.78]} />
          <meshStandardMaterial color={index === 0 ? '#8f4938' : index === 1 ? '#d1a22e' : '#8f4938'} />
        </mesh>
      ))}
      <mesh position={[-1.05, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.9, 8]} />
        <meshStandardMaterial color="#88979a" metalness={0.5} />
      </mesh>
      <mesh position={[1.05, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.9, 8]} />
        <meshStandardMaterial color="#88979a" metalness={0.5} />
      </mesh>
      {['1', '2'].map((id) => {
        const definition = getPinDefinition3D(component.type, id);
        return <Pin3D key={id} position={definition.position} type={definition.type} active={wireStart?.componentId === component.id && wireStart.pin === id} onSelect={() => onPinSelect(id)} />;
      })}
      {selected && <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[2.45, 0.04, 0.95]} />
        <meshBasicMaterial color="#e3a62f" wireframe transparent opacity={0.7} />
      </mesh>}
    </group>
  );
}