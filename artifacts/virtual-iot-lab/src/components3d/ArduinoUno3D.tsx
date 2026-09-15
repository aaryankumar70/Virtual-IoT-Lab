import { Pin3D } from './Pin3D';
import type { Component3DProps } from './types';
import { getPinDefinition3D } from '../lib/component-registry';

const headers = Array.from({ length: 8 }, (_, index) => index);

export function ArduinoUno3D({ component, selected, wireStart, onSelect, onPinSelect }: Component3DProps) {
  const pin = (id: string) => getPinDefinition3D(component.type, id);
  return (
    <group onClick={(event) => { event.stopPropagation(); onSelect(event.shiftKey || event.metaKey || event.ctrlKey); }}>
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.9, 0.18, 3.9]} />
        <meshStandardMaterial color="#299090" roughness={0.72} />
      </mesh>
      <mesh position={[-4.05, 0.28, 0]} castShadow>
        <boxGeometry args={[0.38, 0.52, 1.25]} />
        <meshStandardMaterial color="#b7c4c2" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[-0.5, 0.28, 0]} castShadow>
        <boxGeometry args={[1.75, 0.38, 1.05]} />
        <meshStandardMaterial color="#193e43" roughness={0.5} />
      </mesh>
      {headers.map((index) => (
        <mesh key={`top-${index}`} position={[1.95 + index * 0.36, 0.38, -2.02]} castShadow>
          <boxGeometry args={[0.11, 0.42, 0.14]} />
          <meshStandardMaterial color="#d6a53d" metalness={0.6} />
        </mesh>
      ))}
      {headers.slice(0, 7).map((index) => (
        <mesh key={`bottom-${index}`} position={[2.15 + index * 0.36, 0.38, 2.02]} castShadow>
          <boxGeometry args={[0.11, 0.42, 0.14]} />
          <meshStandardMaterial color="#d6a53d" metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.75, 0.205, 0.02]}>
        <boxGeometry args={[1.05, 0.025, 0.42]} />
        <meshStandardMaterial color="#1a4e51" />
      </mesh>
      {['D13', 'GND', '5V'].map((id) => {
        const definition = pin(id);
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
      {selected && <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[8.25, 0.035, 4.25]} />
        <meshBasicMaterial color="#e3a62f" wireframe transparent opacity={0.65} />
      </mesh>}
    </group>
  );
}