import { Pin3D } from './Pin3D';
import { getPinDefinition3D } from '../lib/component-registry';
import type { Component3DProps } from './types';

export function LED3D({ component, ledOn, selected, wireStart, onSelect, onPinSelect }: Component3DProps) {
  return (
    <group onClick={(event) => { event.stopPropagation(); onSelect(event.shiftKey || event.metaKey || event.ctrlKey); }}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.58, 0.68, 0.5, 20]} />
        <meshStandardMaterial color={ledOn ? '#eac03e' : '#aebbb9'} emissive={ledOn ? '#e3a62f' : '#000000'} emissiveIntensity={ledOn ? 1.25 : 0} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.54, 0]} castShadow>
        <sphereGeometry args={[0.61, 20, 12]} />
        <meshStandardMaterial color={ledOn ? '#ffd556' : '#c3cfcd'} transparent opacity={0.92} emissive={ledOn ? '#e3a62f' : '#000000'} emissiveIntensity={ledOn ? 1.65 : 0} roughness={0.22} />
      </mesh>
      <mesh position={[-0.14, -0.26, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.7, 8]} />
        <meshStandardMaterial color="#9a5d49" metalness={0.5} />
      </mesh>
      <mesh position={[0.14, -0.26, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.7, 8]} />
        <meshStandardMaterial color="#9a5d49" metalness={0.5} />
      </mesh>
      {ledOn && <pointLight position={[0, 0.65, 0]} color="#e3a62f" intensity={1.6} distance={2.8} />}
      {['A', 'K'].map((id) => {
        const definition = getPinDefinition3D(component.type, id);
        return <Pin3D key={id} position={definition.position} type={definition.type} active={wireStart?.componentId === component.id && wireStart.pin === id} onSelect={() => onPinSelect(id)} />;
      })}
      {selected && <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.06, 24]} />
        <meshBasicMaterial color="#e3a62f" wireframe transparent opacity={0.7} />
      </mesh>}
    </group>
  );
}